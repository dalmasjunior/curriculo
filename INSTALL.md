# Guia de Instalação

Este guia irá ajudá-lo a configurar e executar o projeto localmente.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn** ou **pnpm** ou **bun**
- **Git**

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/dalmasjunior/curriculo.git
cd curriculo
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Token do GitHub (opcional - necessário apenas para criar modelos via PR)
# Crie um Personal Access Token em: https://github.com/settings/tokens
# Permissões necessárias: repo (acesso completo ao repositório)
GITHUB_TOKEN=your_github_token_here

# Informações do repositório (opcional, usa valores padrão se não especificado)
GITHUB_REPO_OWNER=dalmasjunior
GITHUB_REPO_NAME=curriculo
GITHUB_BASE_BRANCH=main
```

> **Nota**: As variáveis de ambiente são opcionais. O projeto funciona sem elas, mas a funcionalidade de criar novos modelos via Pull Request requer o `GITHUB_TOKEN`.

### 4. Execute o servidor de desenvolvimento

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

### 5. Acesse a aplicação

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🛠️ Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev
```

Inicia o servidor de desenvolvimento na porta 3000.

### Build de Produção

```bash
npm run build
```

Cria uma versão otimizada da aplicação para produção.

### Iniciar em Produção

```bash
npm run start
```

Inicia o servidor de produção (requer build prévio).

### Linting

```bash
npm run lint
```

Executa o linter para verificar problemas no código.

## 🔧 Configuração do GitHub Token (Opcional)

Se você quiser usar a funcionalidade de criar modelos via Pull Request:

1. Acesse [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Clique em "Generate new token (classic)"
3. Dê um nome descritivo (ex: "Curriculo App PR Creator")
4. Selecione a permissão `repo` (acesso completo ao repositório)
5. Clique em "Generate token"
6. Copie o token e adicione no arquivo `.env.local`:

```env
GITHUB_TOKEN=seu_token_aqui
```

## 🐛 Solução de Problemas

### Erro ao instalar dependências

Se encontrar erros durante a instalação:

```bash
# Limpe o cache do npm
npm cache clean --force

# Delete node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Erro ao gerar PDF

A geração de PDF requer o Puppeteer. Se houver problemas:

- Certifique-se de que todas as dependências do sistema estão instaladas
- O Puppeteer baixa automaticamente o Chromium necessário

### Porta 3000 já em uso

Se a porta 3000 estiver ocupada, você pode usar outra porta:

```bash
PORT=3001 npm run dev
```

## 📦 Estrutura do Projeto

```
curriculo/
├── app/                    # Aplicação Next.js
│   ├── api/               # Rotas da API
│   ├── curriculo/         # Página de criação de currículo
│   ├── editor/            # Editor de modelos
│   └── page.tsx           # Página inicial
├── public/                # Arquivos estáticos
│   └── models/            # Modelos de currículo
├── .env.local             # Variáveis de ambiente (criar)
└── package.json           # Dependências do projeto
```

## 🚀 Deploy

### Vercel (Recomendado)

O projeto está otimizado para deploy na Vercel:

1. Faça push do código para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático!

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- AWS
- Google Cloud Platform
- Azure

## 📝 Próximos Passos

Após a instalação, você pode:

- Explorar os modelos disponíveis em `/curriculo`
- Criar um novo modelo em `/editor`
- Verificar o [guia de contribuição](./CONTRIBUTING.md) para contribuir com o projeto

## ❓ Precisa de Ajuda?

Se você encontrar problemas ou tiver dúvidas:

1. Verifique os [Issues](https://github.com/dalmasjunior/curriculo/issues) existentes
2. Crie um novo Issue descrevendo o problema
3. Consulte a documentação do [Next.js](https://nextjs.org/docs)

