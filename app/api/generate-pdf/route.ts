import { NextRequest, NextResponse } from 'next/server';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

export async function POST(request: NextRequest) {
  try {
    const { markdown } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: 'Markdown é obrigatório' },
        { status: 400 }
      );
    }

    // Dynamic import para evitar problemas no build do Next.js
    const { mdpdfmake } = await import('mdpdfmake');
    const PdfPrinter = (await import('pdfmake')).default;

    // Converter markdown para definição de documento do pdfmake
    const docDefinition = await mdpdfmake(markdown, {
      headingFontSizes: [24, 13, 11], // Tamanhos de fonte para h1, h2, h3
      headingUnderline: true, // Sublinhar títulos
    });

    // Configurar estilos personalizados para o PDF (tudo em preto)
    const customDocDefinition: TDocumentDefinitions = {
      ...docDefinition,
      defaultStyle: {
        font: 'Helvetica',
        fontSize: 11,
        color: '#000000',
        lineHeight: 1.5,
      },
      styles: {
        h1: {
          fontSize: 24,
          bold: true,
          color: '#000000',
          marginBottom: 4,
          marginTop: 0,
        },
        h2: {
          fontSize: 13,
          bold: true,
          color: '#000000',
          marginTop: 16,
          marginBottom: 8,
          decoration: 'underline',
        },
        h3: {
          fontSize: 11,
          bold: true,
          color: '#000000',
          marginTop: 12,
          marginBottom: 4,
        },
        p: {
          fontSize: 11,
          color: '#000000',
          marginBottom: 6,
          lineHeight: 1.5,
        },
        strong: {
          bold: true,
          color: '#000000',
        },
        link: {
          color: '#000000',
        },
      },
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 20], // [left, top, right, bottom] em mm
    };

    // Configurar fontes do pdfmake
    // Usar fontes padrão do PDF (Helvetica) que não requerem arquivos
    const printer = new PdfPrinter({});

    // Gerar PDF
    const pdfDoc = printer.createPdfKitDocument(customDocDefinition);
    
    // Converter para buffer
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });

    // Retornar PDF como resposta
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="curriculo.pdf"',
      },
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Stack trace:', errorStack);
    return NextResponse.json(
      { 
        error: 'Erro ao gerar PDF', 
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
