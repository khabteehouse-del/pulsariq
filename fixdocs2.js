// Run: node fixdocs2.js
const fs   = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'app', '(dashboard)', 'documents', 'page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace the entire fetchDocs function with a bulletproof version
const oldStart = '  const fetchDocs = useCallback(async () => {';
const oldEnd   = '  }, []);';

const startIdx = content.indexOf(oldStart);
const endIdx   = content.indexOf(oldEnd, startIdx) + oldEnd.length;

if (startIdx === -1) {
  console.log('ERROR: fetchDocs not found in file');
  process.exit(1);
}

const newFetch = `  const fetchDocs = useCallback(async () => {
    try {
      const r = await fetch('/api/documents');
      const text = await r.text();
      if (!text || text.trim() === '' || text.trim() === 'null') {
        setDocs([]); setError(''); return;
      }
      let data: any;
      try { data = JSON.parse(text); } catch { setError('Server error'); return; }
      const arr = Array.isArray(data) ? data
                : Array.isArray(data?.data) ? data.data
                : [];
      setDocs(arr);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Network error');
    }
  }, []);`;

content = content.slice(0, startIdx) + newFetch + content.slice(endIdx);
fs.writeFileSync(file, content, 'utf8');
console.log('Done - fetchDocs replaced with bulletproof version');
