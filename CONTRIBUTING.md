# Guia de Contribuição

Obrigado por considerar contribuir com o projeto! Este documento fornece diretrizes e informações sobre como contribuir.

## 🤝 Como Contribuir

Existem várias formas de contribuir:

- 🐛 Reportar bugs
- 💡 Sugerir novas funcionalidades
- 📝 Melhorar a documentação
- 🎨 Criar novos modelos de currículo
- 💻 Adicionar novas funcionalidades
- 🔧 Corrigir bugs

## 🚀 Primeiros Passos

1. **Fork o repositório**
   - Clique no botão "Fork" no topo da página do GitHub

2. **Clone seu fork**
   ```bash
   git clone https://github.com/SEU_USUARIO/curriculo.git
   cd curriculo
   ```

3. **Crie uma branch para sua contribuição**
   ```bash
   git checkout -b minha-contribuicao
   ```

4. **Siga o guia de instalação**
   - Consulte o [INSTALL.md](./INSTALL.md) para configurar o ambiente

## 📝 Processo de Contribuição

### 1. Criar um Novo Modelo de Currículo

A forma mais fácil de contribuir é criando um novo modelo de currículo:

1. Acesse `/editor` na aplicação
2. Preencha as informações do modelo
3. Crie a estrutura JSON do modelo
4. Crie o template Markdown
5. Use o botão "Visualizar" para testar
6. Envie via Pull Request

#### Estrutura de um Modelo

**JSON (`modelo.json`):**
```json
{
  "name": "{{name}}",
  "headline": "{{headline}}",
  "location": "{{location}}",
  "contact": {
    "email": "{{email}}",
    "phone": "{{phone}}"
  },
  "summary": "{{summary}}",
  "experience": [
    {
      "company": "{{exp1_company}}",
      "role": "{{exp1_role}}",
      "period": "{{exp1_period}}",
      "description": "{{exp1_description}}"
    }
  ],
  "education": "{{education}}"
}
```

**Markdown (`modelo.md`):**
```markdown
# {{name}}
{{headline}}
{{location}}

Email: {{email}}
Phone: {{phone}}

## Summary
{{summary}}

## Experience
### {{exp1_company}} — {{exp1_role}}
{{exp1_period}}
{{exp1_description}}

## Education
{{education}}
```

### 2. Reportar Bugs

Ao reportar um bug, inclua:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. comportamento atual
- Screenshots (se aplicável)
- Ambiente (navegador, sistema operacional, versão do Node.js)

### 3. Sugerir Funcionalidades

Ao sugerir uma nova funcionalidade:

- Descreva claramente a funcionalidade
- Explique o caso de uso
- Discuta possíveis implementações (se tiver ideias)

### 4. Contribuir com Código

#### Padrões de Código

- Use TypeScript
- Siga as convenções do ESLint configuradas
- Escreva código limpo e legível
- Adicione comentários quando necessário
- Mantenha funções pequenas e focadas

#### Estrutura de Commits

Use mensagens de commit descritivas:

```
feat: adiciona nova funcionalidade de exportação
fix: corrige bug na geração de PDF
docs: atualiza documentação de instalação
style: ajusta formatação do código
refactor: reorganiza estrutura de componentes
test: adiciona testes para nova funcionalidade
```

#### Processo de Pull Request

1. **Certifique-se de que seu código funciona**
   ```bash
   npm run build
   npm run lint
   ```

2. **Teste localmente**
   - Execute `npm run dev`
   - Teste todas as funcionalidades relacionadas

3. **Commit suas mudanças**
   ```bash
   git add .
   git commit -m "feat: descrição da mudança"
   ```

4. **Push para seu fork**
   ```bash
   git push origin minha-contribuicao
   ```

5. **Abra um Pull Request**
   - Vá para o repositório original no GitHub
   - Clique em "New Pull Request"
   - Selecione sua branch
   - Descreva suas mudanças claramente

## 📋 Checklist para Pull Requests

Antes de enviar um PR, certifique-se de:

- [ ] Código compila sem erros (`npm run build`)
- [ ] Não há erros de lint (`npm run lint`)
- [ ] Funcionalidade testada localmente
- [ ] Documentação atualizada (se necessário)
- [ ] Mensagens de commit descritivas
- [ ] PR descrito claramente

## 🎨 Criando Modelos de Currículo

### Diretrizes para Modelos

1. **Compatibilidade ATS**
   - Use formatação simples e clara
   - Evite tabelas complexas
   - Use palavras-chave relevantes

2. **Design Profissional**
   - Mantenha o layout limpo
   - Use hierarquia visual clara
   - Garanta boa legibilidade

3. **Flexibilidade**
   - Permita campos opcionais
   - Suporte diferentes quantidades de experiência
   - Seja adaptável a diferentes perfis

### Campos Suportados

- **Campos simples**: `name`, `headline`, `location`, `summary`, `education`
- **Objetos**: `contact` (email, phone, linkedin, github), `skills` (dinâmico)
- **Arrays**: `experience` (company, role, location, period, description)
- **Campos customizados**: Qualquer campo adicional é suportado automaticamente

### Exemplo de Campo Customizado

```json
{
  "certifications": "{{certifications}}",
  "languages": {
    "portuguese": "{{languages_portuguese}}",
    "english": "{{languages_english}}"
  }
}
```

## 🧪 Testando

Antes de enviar um PR:

1. Teste todas as funcionalidades relacionadas
2. Verifique em diferentes navegadores (Chrome, Firefox, Safari)
3. Teste a geração de PDF
4. Verifique a responsividade em mobile

## 📚 Recursos Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Markdown Guide](https://www.markdownguide.org/)

## 💬 Comunicação

- Use Issues para discussões sobre bugs e funcionalidades
- Seja respeitoso e construtivo
- Ajude outros contribuidores quando possível

## 🙏 Agradecimentos

Todas as contribuições são valiosas! Obrigado por ajudar a tornar este projeto melhor.

---

**Dúvidas?** Abra uma Issue ou entre em contato com os mantenedores do projeto.

