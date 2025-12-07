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
      margin: 10mm 10mm;
    }

    html, body {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
      margin: 0;
      color: #24292f;
      background-color: #ffffff;
      font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
      font-size: 16px;
      line-height: 1.5;
      word-wrap: break-word
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
      margin: .67em 0;
      font-weight: 600;
      padding-bottom: .3em;
      font-size: 2em;
      border-bottom: 1px solid hsla(210,18%,87%,1);
    }

    p {
      margin: 0 0 8px 0;
      font-size: 11.2pt;
    }

    /* Subtítulos e seções */
    h2 {
      font-weight: 600;
      padding-bottom: .3em;
      font-size: 1.5em;
      border-bottom: 1px solid hsla(210,18%,87%,1)
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
      background-color: transparent;
      color: #0969da;
      text-decoration: none;
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
      box-sizing: content-box;
      overflow: hidden;
      background: transparent;
      border-bottom: 1px solid hsla(210,18%,87%,1);
      height: .25em;
      padding: 0;
      margin: 24px 0;
      background-color: #d0d7de;
      border: 0
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
      margin: 0;
      padding: 0 1em;
      color: #57606a;
      border-left: .25em solid #d0d7de
    }

    /* Imagens (ex.: avatar) — se houver, deixá-las discretas */
    img {
      max-width: 120px;
      height: auto;
      display: block;
      margin: 6px 0;
      border-radius: 6px;
    }

    h6 {
      font-weight: 600;
      font-size: .85em;
      color: #57606a;
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
