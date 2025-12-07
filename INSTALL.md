# Installation Guide

This guide will help you set up and run the project locally.

## 📋 Prerequisites

Before you begin, make sure you have installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** or **pnpm** or **bun**
- **Git**

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/dalmasjunior/curriculo.git
cd curriculo
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# GitHub Token (optional - required only for creating models via PR)
# Create a Personal Access Token at: https://github.com/settings/tokens
# Required permissions: repo (full repository access)
GITHUB_TOKEN=your_github_token_here

# Repository information (optional, uses default values if not specified)
GITHUB_REPO_OWNER=dalmasjunior
GITHUB_REPO_NAME=curriculo
GITHUB_BASE_BRANCH=main
```

> **Note**: Environment variables are optional. The project works without them, but the functionality to create new models via Pull Request requires `GITHUB_TOKEN`.

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### 5. Access the application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Available Scripts

### Development

```bash
npm run dev
```

Starts the development server on port 3000.

### Production Build

```bash
npm run build
```

Creates an optimized version of the application for production.

### Start Production Server

```bash
npm run start
```

Starts the production server (requires previous build).

### Linting

```bash
npm run lint
```

Runs the linter to check for code issues.

## 🔧 GitHub Token Configuration (Optional)

If you want to use the functionality to create models via Pull Request:

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Curriculo App PR Creator")
4. Select the `repo` permission (full repository access)
5. Click "Generate token"
6. Copy the token and add it to the `.env.local` file:

```env
GITHUB_TOKEN=your_token_here
```

## 🐛 Troubleshooting

### Error installing dependencies

If you encounter errors during installation:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error generating PDF

PDF generation requires Puppeteer. If there are issues:

- Make sure all system dependencies are installed
- Puppeteer automatically downloads the required Chromium

### Port 3000 already in use

If port 3000 is occupied, you can use another port:

```bash
PORT=3001 npm run dev
```

## 📦 Project Structure

```
curriculo/
├── app/                    # Next.js application
│   ├── api/               # API routes
│   ├── curriculo/         # Resume creation page
│   ├── editor/            # Template editor
│   └── page.tsx           # Home page
├── public/                # Static files
│   └── models/           # Resume templates
├── .env.local             # Environment variables (create)
└── package.json          # Project dependencies
```

## 🚀 Deployment

### Vercel (Recommended)

The project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Configure environment variables
4. Automatic deployment!

### Other Platforms

The project can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- AWS
- Google Cloud Platform
- Azure

## 📝 Next Steps

After installation, you can:

- Explore available templates at `/curriculo`
- Create a new template at `/editor`
- Check the [contributing guide](./CONTRIBUTING.md) to contribute to the project

## ❓ Need Help?

If you encounter problems or have questions:

1. Check existing [Issues](https://github.com/dalmasjunior/curriculo/issues)
2. Create a new Issue describing the problem
3. Consult the [Next.js documentation](https://nextjs.org/docs)
