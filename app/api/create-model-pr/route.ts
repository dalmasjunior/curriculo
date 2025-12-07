import { NextRequest, NextResponse } from 'next/server';

interface CreatePRRequest {
  modelName: string;
  description: string;
  creatorName: string;
  creatorLinkedIn: string;
  jsonContent: string;
  markdownContent: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePRRequest = await request.json();

    // Validações
    if (!body.modelName || !body.description || !body.creatorName || !body.jsonContent || !body.markdownContent) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      );
    }

    // Validar JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(body.jsonContent);
    } catch {
      return NextResponse.json(
        { error: 'JSON inválido' },
        { status: 400 }
      );
    }

    // Obter token do GitHub das variáveis de ambiente
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('GITHUB_TOKEN não configurado');
      return NextResponse.json(
        { error: 'Configuração do GitHub não encontrada' },
        { status: 500 }
      );
    }

    // Obter informações do repositório
    const repoOwner = process.env.GITHUB_REPO_OWNER || 'dalmasjunior';
    const repoName = process.env.GITHUB_REPO_NAME || 'curriculo';
    const baseBranch = process.env.GITHUB_BASE_BRANCH || 'main';

    // Normalizar nome do modelo (sem espaços, lowercase)
    const normalizedModelName = body.modelName.toLowerCase().replace(/\s+/g, '-');
    const fileName = `${normalizedModelName}.json`;
    const mdFileName = `${normalizedModelName}.md`;

    // Criar branch name
    const branchName = `model/${normalizedModelName}-${Date.now()}`;

    // 1. Criar branch
    const createBranchResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: await getLatestCommitSha(githubToken, repoOwner, repoName, baseBranch),
        }),
      }
    );

    if (!createBranchResponse.ok) {
      const error = await createBranchResponse.text();
      console.error('Erro ao criar branch:', error);
      return NextResponse.json(
        { error: 'Erro ao criar branch no GitHub' },
        { status: 500 }
      );
    }

    // 2. Criar arquivo JSON
    const jsonFileContent = Buffer.from(body.jsonContent).toString('base64');
    await createFile(
      githubToken,
      repoOwner,
      repoName,
      branchName,
      `public/models/${fileName}`,
      jsonFileContent,
      `Add model ${normalizedModelName} JSON`
    );

    // 3. Criar arquivo Markdown
    const mdFileContent = Buffer.from(body.markdownContent).toString('base64');
    await createFile(
      githubToken,
      repoOwner,
      repoName,
      branchName,
      `public/models/${mdFileName}`,
      mdFileContent,
      `Add model ${normalizedModelName} Markdown template`
    );

    // 4. Atualizar list.json
    const listJsonPath = 'public/models/list.json';
    const currentListJson = await getFileContent(
      githubToken,
      repoOwner,
      repoName,
      baseBranch,
      listJsonPath
    );

    const listData = JSON.parse(currentListJson);
    const today = new Date().toISOString().split('T')[0];
    
    listData.models.push({
      name: normalizedModelName,
      description: body.description,
      file: fileName,
      created_at: today,
      created_by: body.creatorName,
      creator_url: body.creatorLinkedIn || '',
    });

    const updatedListJson = JSON.stringify(listData, null, 4);
    const updatedListContent = Buffer.from(updatedListJson).toString('base64');
    
    await updateFile(
      githubToken,
      repoOwner,
      repoName,
      branchName,
      listJsonPath,
      updatedListContent,
      await getFileSha(githubToken, repoOwner, repoName, baseBranch, listJsonPath),
      `Add ${normalizedModelName} to models list`
    );

    // 5. Criar Pull Request
    const prResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Adicionar modelo: ${body.modelName}`,
          body: `## Novo Modelo de Currículo\n\n**Descrição:** ${body.description}\n\n**Criado por:** ${body.creatorName}${body.creatorLinkedIn ? `\n**LinkedIn:** ${body.creatorLinkedIn}` : ''}\n\nEste PR adiciona um novo modelo de currículo ao sistema.`,
          head: branchName,
          base: baseBranch,
        }),
      }
    );

    if (!prResponse.ok) {
      const error = await prResponse.text();
      console.error('Erro ao criar PR:', error);
      return NextResponse.json(
        { error: 'Erro ao criar Pull Request no GitHub' },
        { status: 500 }
      );
    }

    const prData = await prResponse.json();

    return NextResponse.json({
      success: true,
      prUrl: prData.html_url,
      prNumber: prData.number,
    });

  } catch (error) {
    console.error('Erro ao criar PR:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar Pull Request', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// Função auxiliar para obter SHA do último commit
async function getLatestCommitSha(token: string, owner: string, repo: string, branch: string): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao obter SHA do commit');
  }

  const data = await response.json();
  return data.object.sha;
}

// Função auxiliar para obter conteúdo de arquivo
async function getFileContent(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  path: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao obter conteúdo do arquivo ${path}`);
  }

  const data = await response.json();
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

// Função auxiliar para obter SHA de arquivo
async function getFileSha(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  path: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao obter SHA do arquivo ${path}`);
  }

  const data = await response.json();
  return data.sha;
}

// Função auxiliar para criar arquivo
async function createFile(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  path: string,
  content: string,
  message: string
): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content,
        branch,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao criar arquivo ${path}: ${error}`);
  }
}

// Função auxiliar para atualizar arquivo
async function updateFile(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  path: string,
  content: string,
  sha: string,
  message: string
): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content,
        branch,
        sha,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao atualizar arquivo ${path}: ${error}`);
  }
}

