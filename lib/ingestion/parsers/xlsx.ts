import * as XLSX from 'xlsx';

export interface XLSXResult {
  text: string;
  sheetNames: string[];
}

export function parseXLSX(buffer: Buffer): XLSXResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    const parts: string[] = [];

    for (const name of sheetNames) {
      const sheet = workbook.Sheets[name];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      parts.push('Sheet: ' + name + '\n' + csv);
    }

    return { text: parts.join('\n\n'), sheetNames };
  } catch (err) {
    throw new Error('XLSX parse failed: ' + String(err));
  }
}
