const fs   = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'lib', 'ingestion', 'index.ts');
let content = fs.readFileSync(filePath, 'utf8');

const OLD = "const chunks = chunkText(text, 512, 64);";
const NEW = [
  "// Strip control characters that break pgvector",
  "const cleaned = text",
  "  .replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]/g, ' ')",
  "  .replace(/\\uFFFD/g, ' ')",
  "  .replace(/\\s+/g, ' ')",
  "  .trim();",
  "const chunks = chunkText(cleaned, 512, 64);",
].join('\n    ');

if (content.includes(OLD)) {
  content = content.replace(OLD, NEW);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('  \u2713 Unicode fix applied to lib/ingestion/index.ts');
} else {
  console.log('  \u26A0 Could not find target line - showing current content around chunkText:');
  const lines = content.split('\n');
  const idx = lines.findIndex(l => l.includes('chunkText'));
  console.log(lines.slice(Math.max(0, idx - 2), idx + 4).join('\n'));
}
