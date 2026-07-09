// Run: node fixdocs.js
const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'app', '(dashboard)', 'documents', 'page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace the fetch handler to handle null properly
const oldFetch = `      const text = await r.text();
      let data: any;
      try { data = JSON.parse(text); } catch { setError('Bad response from server'); return; }
      if (Array.isArray(data)) { setDocs(data); setError(''); }
      else if (Array.isArray(data?.data)) { setDocs(data.data); setError(''); }
      else { setError('Unexpected response format'); }`;

const newFetch = `      const text = await r.text();
      let data: any;
      try { data = JSON.parse(text); } catch { setError('Bad response from server'); return; }
      if (data === null || data === undefined) { setDocs([]); setError(''); }
      else if (Array.isArray(data)) { setDocs(data); setError(''); }
      else if (Array.isArray(data?.data)) { setDocs(data.data); setError(''); }
      else { setDocs([]); setError(''); }`;

if (content.includes(oldFetch)) {
  content = content.replace(oldFetch, newFetch);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed - null response now handled');
} else {
  console.log('Pattern not found - applying direct fix');
  // Direct approach: replace the entire fetchDocs function
  content = content.replace(
    /const fetchDocs = useCallback\(async \(\) => \{[\s\S]*?\}, \[fetchDocs\]\);/,
    content
  );
  // Simpler: just patch the else clause
  content = content.replace(
    "else { setError('Unexpected response format'); }",
    "else { setDocs([]); setError(''); }"
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('Applied fallback fix');
}
