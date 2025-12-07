This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Configuração do GitHub API

Para que a funcionalidade de criar novos modelos via Pull Request funcione, você precisa configurar as seguintes variáveis de ambiente no arquivo `.env.local`:

```env
# Token do GitHub com permissões para criar branches, commits e PRs
# Crie um Personal Access Token em: https://github.com/settings/tokens
# Permissões necessárias: repo (acesso completo ao repositório)
GITHUB_TOKEN=your_github_token_here

# Informações do repositório (opcional, usa valores padrão se não especificado)
GITHUB_REPO_OWNER=dalmasjunior
GITHUB_REPO_NAME=curriculo
GITHUB_BASE_BRANCH=main
```

### Como criar um Personal Access Token no GitHub:

1. Acesse [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Clique em "Generate new token (classic)"
3. Dê um nome descritivo (ex: "Curriculo App PR Creator")
4. Selecione a permissão `repo` (acesso completo ao repositório)
5. Clique em "Generate token"
6. Copie o token e adicione no arquivo `.env.local`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
