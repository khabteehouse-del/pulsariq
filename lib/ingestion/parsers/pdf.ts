import pdfParse from 'pdf-parse';

export interface PDFResult {
  text: string;
  pageCount: number;
}

export async function parsePDF(buffer: Buffer): Promise<PDFResult> {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text.trim(),
      pageCount: data.numpages,
    };
  } catch (err) {
    throw new Error('PDF parse failed: ' + String(err));
  }
}
