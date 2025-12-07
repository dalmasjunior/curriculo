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

    // Converter markdown para HTML (apenas o conteúdo, sem DOCTYPE/head/body)
    const html = marked.parse(markdown);

    // Enviar apenas o HTML do conteúdo para o serviço externo markdowntopdf.com
    const response = await fetch('https://www.markdowntopdf.com/api/guest/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: html,
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
