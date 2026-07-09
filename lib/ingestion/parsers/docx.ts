import mammoth from 'mammoth';

export interface DOCXResult {
  text: string;
}

export async function parseDOCX(buffer: Buffer): Promise<DOCXResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value.trim() };
  } catch (err) {
    throw new Error('DOCX parse failed: ' + String(err));
  }
}
