import { NextRequest, NextResponse } from 'next/server';
import { marked } from 'marked';

export async function POST(request: NextRequest) {
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
    const html = await marked(markdown);

    // HTML completo com estilos para PDF (baseado no exemplo fornecido)
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.5;
      color: #24292f;
      font-size: 16px;
      max-width: 800px;
      margin: 0 auto;
      padding: 20mm 15mm;
    }
    h1 {
      font-size: 2em;
      font-weight: 600;
      color: #24292f;
      margin: 0.67em 0;
      padding-bottom: 0.3em;
      border-bottom: 1px solid hsla(210, 18%, 87%, 1);
      line-height: 1.25;
    }
    h2 {
      font-size: 1.5em;
      font-weight: 600;
      color: #24292f;
      margin-top: 24px;
      margin-bottom: 16px;
      padding-bottom: 0.3em;
      border-bottom: 1px solid hsla(210, 18%, 87%, 1);
      line-height: 1.25;
    }
    h3 {
      font-size: 1.25em;
      font-weight: 600;
      color: #24292f;
      margin-top: 24px;
      margin-bottom: 16px;
      line-height: 1.25;
    }
    p {
      margin-top: 0;
      margin-bottom: 10px;
      line-height: 1.5;
      font-size: 16px;
      color: #24292f;
    }
    strong {
      font-weight: 600;
      color: #24292f;
    }
    hr {
      box-sizing: content-box;
      overflow: hidden;
      background: transparent;
      border-bottom: 1px solid hsla(210, 18%, 87%, 1);
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: #d0d7de;
      border: 0;
    }
    a {
      color: #0969da;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    ul {
      margin-top: 0;
      margin-bottom: 0;
      padding-left: 2em;
      list-style-type: disc;
    }
    li {
      margin-top: 0;
      margin-bottom: 0;
      line-height: 1.5;
    }
    li > p {
      margin-top: 16px;
    }
    li + li {
      margin-top: 0.25em;
    }
    /* Primeiro parágrafo após h1 (headline e contato) */
    body > h1 + p {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
      line-height: 1.5;
    }
    /* Espaçamento após HR */
    hr + h2 {
      margin-top: 24px;
    }
    /* Parágrafo com período em negrito após h3 */
    h3 + p {
      margin-top: 0;
      margin-bottom: 10px;
    }
    /* Lista após parágrafo de período */
    h3 + p + ul {
      margin-top: 0;
      margin-bottom: 16px;
    }
    @media print {
      body {
        padding: 15mm;
      }
      h1, h2, h3 {
        page-break-after: avoid;
      }
      h2 + h3 {
        page-break-before: avoid;
      }
      ul {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
    `;

    // Enviar HTML para o serviço externo markdowntopdf.com
    const response = await fetch('https://www.markdowntopdf.com/api/guest/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: fullHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao gerar PDF no serviço externo:', response.status, errorText);
      return NextResponse.json(
        { 
          error: 'Erro ao gerar PDF no serviço externo', 
          details: `Status: ${response.status}, ${errorText}` 
        },
        { status: 500 }
      );
    }

    // Obter o PDF como buffer
    const pdfBuffer = await response.arrayBuffer();

    // Retornar PDF como resposta
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="curriculo.pdf"',
      },
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao gerar PDF', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}
