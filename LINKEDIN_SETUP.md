# Configuração do LinkedIn OAuth

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
LINKEDIN_CLIENT_ID=77k9wnqhp0sk14
LINKEDIN_CLIENT_SECRET=WPL_AP1.Sj70oehETyEeJYyj.OuSVCw==

# Para desenvolvimento
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
FRONTEND_URL=http://localhost:3000

# Para produção (atualize com suas URLs reais)
# LINKEDIN_REDIRECT_URI=https://seudominio.com/api/auth/linkedin/callback
# FRONTEND_URL=https://seudominio.com
```

## Configuração no LinkedIn Developer Portal

1. Acesse: https://www.linkedin.com/developers/apps
2. Selecione seu app
3. Vá em **Auth** → **Redirect URLs**
4. Adicione as URLs:
   - `http://localhost:3000/api/auth/linkedin/callback` (desenvolvimento)
   - `https://seudominio.com/api/auth/linkedin/callback` (produção)

## Como Funciona

1. Usuário clica em "Importar do LinkedIn"
2. É redirecionado para `/api/auth/linkedin`
3. A API redireciona para o LinkedIn OAuth
4. Usuário autoriza o app
5. LinkedIn redireciona para `/api/auth/linkedin/callback`
6. A API troca o código por um access token
7. A API busca os dados do usuário
8. Redireciona de volta para `/curriculo` com os dados

## Endpoints Criados

- `GET /api/auth/linkedin` - Inicia o fluxo OAuth
- `GET /api/auth/linkedin/callback` - Recebe o callback e processa os dados

## Dados Retornados

Os dados do LinkedIn são retornados via query parameter `data` na URL após o callback. O componente `curriculo/page.tsx` processa esses dados automaticamente.

## Troubleshooting

- **Erro "invalid_state"**: O state não corresponde. Verifique se os cookies estão habilitados.
- **Erro "token_failed"**: Verifique se o Client ID e Secret estão corretos.
- **Erro "userinfo_failed"**: O scope pode não ter permissão. Verifique se `w_member_social` foi aprovado.

