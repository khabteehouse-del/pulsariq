import * as cheerio from 'cheerio';
import Papa from 'papaparse';

export function parseTXT(buffer: Buffer): string {
  return buffer.toString('utf-8').trim();
}

export function parseCSV(buffer: Buffer): string {
  try {
    const raw = buffer.toString('utf-8');
    const result = Papa.parse(raw, { header: true, skipEmptyLines: true });
    return (result.data as unknown[]).map(r => JSON.stringify(r)).join('\n');
  } catch {
    return buffer.toString('utf-8').trim();
  }
}

export function parseHTML(buffer: Buffer): string {
  try {
    const $ = cheerio.load(buffer.toString('utf-8'));
    $('script, style, nav, footer, head').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
  } catch {
    return buffer.toString('utf-8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
