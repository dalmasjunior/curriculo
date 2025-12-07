import { NextRequest, NextResponse } from 'next/server';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { markdown } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: 'Markdown é obrigatório' },
        { status: 400 }
      );
    }

    // Configurar marked para renderização adequada
    marked.setOptions({
      breaks: true, // Quebras de linha viram <br>
      gfm: true, // GitHub Flavored Markdown
    });

    // Converter markdown para HTML
    const html = marked.parse(markdown);

    // HTML completo com estilos para PDF
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* Base e impressão */
    @page {
      size: A4;
      margin: 28mm 20mm;
    }

    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #111;
      background: #fff;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.22;
      font-size: 12pt;
    }

    /* Contêiner principal para leitura */
    main {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 0;
    }

    /* Cabeçalho com nome e contato */
    h1 {
      font-size: 20pt;
      margin: 0 0 6px 0;
      font-weight: 700;
      letter-spacing: -0.2px;
    }

    p {
      margin: 0 0 8px 0;
      font-size: 11.2pt;
    }

    /* Subtítulos e seções */
    h2 {
      font-size: 12.5pt;
      margin: 14px 0 8px 0;
      font-weight: 700;
      text-transform: none;
      border-bottom: 1px solid #e6e6e6;
      padding-bottom: 6px;
    }

    h3 {
      font-size: 11.5pt;
      margin: 10px 0 6px 0;
      font-weight: 600;
    }

    /* Listas - simples e legíveis para ATS */
    ul, ol {
      margin: 6px 0 10px 18px;
      padding: 0;
    }

    li {
      margin: 4px 0;
      font-size: 11pt;
    }

    /* Destaques em linha */
    strong {
      font-weight: 700;
    }

    em {
      font-style: italic;
    }

    /* Blocos de experiência (empresa, cargo, período) */
    section {
      margin: 8px 0 12px 0;
    }

    /* Estilo para linhas de metadados (local, período, link) */
    small {
      display: inline-block;
      font-size: 10pt;
      color: #374151; /* cinza escuro neutro */
      margin-left: 0;
    }

    /* Links — visíveis, porém discretos */
    a {
      color: #0b6cff;
      text-decoration: none;
      border-bottom: 1px dotted rgba(11,108,255,0.15);
      word-break: break-word;
      font-size: 11pt;
    }

    a:visited { color: #4b2b8d; }

    /* Código ou blocos pré-formatados (se houver snippets no CV) */
    pre, code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
      font-size: 10pt;
      background: #f8f8f8;
      padding: 6px 8px;
      border-radius: 4px;
      overflow-x: auto;
    }

    /* Separador visual final */
    hr {
      border: none;
      border-top: 1px solid #e6e6e6;
      margin: 14px 0;
    }

    /* Footer menor com páginas (útil ao gerar PDF multi-page) */
    footer {
      display: block;
      text-align: center;
      font-size: 9pt;
      color: #6b7280;
      margin-top: 12px;
    }

    /* Forçar que seções não quebrem de forma ruim no PDF */
    h2, h3 {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    section, p, ul, ol {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* Pequenos ajustes tipográficos para uma leitura densa */
    blockquote {
      margin: 8px 0;
      padding-left: 12px;
      border-left: 3px solid #e6e6e6;
      color: #374151;
    }

    /* Imagens (ex.: avatar) — se houver, deixá-las discretas */
    img {
      max-width: 120px;
      height: auto;
      display: block;
      margin: 6px 0;
      border-radius: 6px;
    }

    /* Ajustes para impressão em preto e branco (fallback) */
    @media print {
      a { color: #111; text-decoration: underline; }
      img { -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    // Gerar PDF usando Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // Gerar PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '28mm',
        right: '20mm',
        bottom: '28mm',
        left: '20mm',
      },
      printBackground: true,
    });

    await browser.close();

    // Retornar PDF como resposta
    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="curriculo.pdf"',
      },
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    if (browser) {
      await browser.close();
    }
    return NextResponse.json(
      { 
        error: 'Erro ao gerar PDF', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}
