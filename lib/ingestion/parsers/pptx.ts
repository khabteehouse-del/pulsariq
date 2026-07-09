import JSZip from 'jszip';

export interface PPTXResult {
  text: string;
  slideCount: number;
}

export async function parsePPTX(buffer: Buffer): Promise<PPTXResult> {
  try {
    const zip = await JSZip.loadAsync(buffer);

    const slideFiles = Object.keys(zip.files)
      .filter(n => n.startsWith('ppt/slides/slide') && n.endsWith('.xml'))
      .sort((a, b) => {
        const na = parseInt(a.replace(/\D/g, ''), 10);
        const nb = parseInt(b.replace(/\D/g, ''), 10);
        return na - nb;
      });

    const slides: string[] = [];
    for (const file of slideFiles) {
      const xml = await zip.files[file].async('string');
      // Pull text from <a:t> tags
      const matches = xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) ?? [];
      const text = matches
        .map(m => m.replace(/<[^>]+>/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) slides.push(text);
    }

    return { text: slides.join('\n\n'), slideCount: slideFiles.length };
  } catch (err) {
    throw new Error('PPTX parse failed: ' + String(err));
  }
}
