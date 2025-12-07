# Contributing Guide

Thank you for considering contributing to the project! This document provides guidelines and information on how to contribute.

## 🤝 How to Contribute

There are several ways to contribute:

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🎨 Create new resume templates
- 💻 Add new features
- 🔧 Fix bugs

## 🚀 Getting Started

1. **Fork the repository**
   - Click the "Fork" button at the top of the GitHub page

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/curriculo.git
   cd curriculo
   ```

3. **Create a branch for your contribution**
   ```bash
   git checkout -b my-contribution
   ```

4. **Follow the installation guide**
   - Check [INSTALL.md](./INSTALL.md) to set up the environment

## 📝 Contribution Process

### 1. Create a New Resume Template

The easiest way to contribute is by creating a new resume template:

1. Go to `/editor` in the application
2. Fill in the template information
3. Create the JSON structure of the template
4. Create the Markdown template
5. Use the "Preview" button to test
6. Submit via Pull Request

#### Template Structure

**JSON (`template.json`):**
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

**Markdown (`template.md`):**
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

### 2. Report Bugs

When reporting a bug, include:

- Clear description of the problem
- Steps to reproduce
- Expected behavior vs. actual behavior
- Screenshots (if applicable)
- Environment (browser, operating system, Node.js version)

### 3. Suggest Features

When suggesting a new feature:

- Clearly describe the feature
- Explain the use case
- Discuss possible implementations (if you have ideas)

### 4. Contribute Code

#### Code Standards

- Use TypeScript
- Follow the configured ESLint conventions
- Write clean and readable code
- Add comments when necessary
- Keep functions small and focused

#### Commit Structure

Use descriptive commit messages:

```
feat: add new export functionality
fix: fix PDF generation bug
docs: update installation documentation
style: adjust code formatting
refactor: reorganize component structure
test: add tests for new feature
```

#### Pull Request Process

1. **Make sure your code works**
   ```bash
   npm run build
   npm run lint
   ```

2. **Test locally**
   - Run `npm run dev`
   - Test all related functionality

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: description of change"
   ```

4. **Push to your fork**
   ```bash
   git push origin my-contribution
   ```

5. **Open a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Clearly describe your changes

## 📋 Pull Request Checklist

Before submitting a PR, make sure:

- [ ] Code compiles without errors (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] Functionality tested locally
- [ ] Documentation updated (if necessary)
- [ ] Descriptive commit messages
- [ ] PR clearly described

## 🎨 Creating Resume Templates

### Template Guidelines

1. **ATS Compatibility**
   - Use simple and clear formatting
   - Avoid complex tables
   - Use relevant keywords

2. **Professional Design**
   - Keep layout clean
   - Use clear visual hierarchy
   - Ensure good readability

3. **Flexibility**
   - Allow optional fields
   - Support different amounts of experience
   - Be adaptable to different profiles

### Supported Fields

- **Simple fields**: `name`, `headline`, `location`, `summary`, `education`
- **Objects**: `contact` (email, phone, linkedin, github), `skills` (dynamic)
- **Arrays**: `experience` (company, role, location, period, description)
- **Custom fields**: Any additional field is automatically supported

### Custom Field Example

```json
{
  "certifications": "{{certifications}}",
  "languages": {
    "portuguese": "{{languages_portuguese}}",
    "english": "{{languages_english}}"
  }
}
```

## 🧪 Testing

Before submitting a PR:

1. Test all related functionality
2. Check in different browsers (Chrome, Firefox, Safari)
3. Test PDF generation
4. Verify mobile responsiveness

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Markdown Guide](https://www.markdownguide.org/)

## 💬 Communication

- Use Issues for discussions about bugs and features
- Be respectful and constructive
- Help other contributors when possible

## 🙏 Acknowledgments

All contributions are valuable! Thank you for helping make this project better.

---

**Questions?** Open an Issue or contact the project maintainers.
