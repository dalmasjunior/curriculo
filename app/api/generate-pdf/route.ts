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

    // Converter markdown para HTML
    const html = await marked(markdown);

    // HTML completo com estilos para PDF (formato profissional, tudo em preto)
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      color: #000000;
      font-size: 11pt;
      max-width: 800px;
      margin: 0 auto;
      padding: 20mm 15mm;
    }
    h1 {
      font-size: 24pt;
      font-weight: 600;
      color: #000000;
      margin-bottom: 4pt;
      margin-top: 0;
      line-height: 1.2;
    }
    h2 {
      font-size: 13pt;
      font-weight: 600;
      color: #000000;
      margin-top: 16pt;
      margin-bottom: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      border-bottom: 1px solid #000000;
      padding-bottom: 2pt;
    }
    h3 {
      font-size: 11pt;
      font-weight: 600;
      margin-top: 12pt;
      margin-bottom: 4pt;
      color: #000000;
    }
    p {
      margin-bottom: 6pt;
      line-height: 1.5;
      font-size: 11pt;
      color: #000000;
    }
    strong {
      font-weight: 600;
      color: #000000;
    }
    hr {
      border: none;
      border-top: 0.5pt solid #000000;
      margin: 12pt 0;
    }
    a {
      color: #000000;
      text-decoration: none;
    }
    ul {
      margin-left: 20pt;
      margin-bottom: 6pt;
      color: #000000;
    }
    li {
      margin-bottom: 3pt;
      line-height: 1.5;
      color: #000000;
    }
    /* Estilo para informações de contato no topo */
    body > h1 + p,
    body > h1 + p + p {
      font-size: 10pt;
      margin-bottom: 2pt;
      line-height: 1.4;
    }
    /* Espaçamento entre seções */
    h2 + p,
    h2 + h3 {
      margin-top: 8pt;
    }
    /* Experiências */
    h3 + p {
      font-size: 10pt;
      margin-bottom: 4pt;
      color: #000000;
    }
    h3 + p + p {
      margin-top: 4pt;
      margin-bottom: 8pt;
    }
    @media print {
      body {
        padding: 15mm;
      }
      h2 {
        page-break-after: avoid;
        margin-top: 12pt;
      }
      h3 {
        page-break-after: avoid;
      }
      h2 + h3 {
        page-break-before: avoid;
      }
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
    `;

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
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
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
      { error: 'Erro ao gerar PDF', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
