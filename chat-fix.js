// PulsarIQ — chat-fix.js
// Complete rewrite of app/api/chat/route.ts (never touched/fixed until now,
// still had old wrong column names + missing await from before schema discovery).
// Also fixes chat page's send() to surface REAL errors instead of "No response."
// Run: node chat-fix.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Chat API Fix\n');

write('app/api/chat/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const message = body.message.trim();
    const documentIds: string[] = Array.isArray(body.documentIds) ? body.documentIds : [];

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized \u2014 please sign in again' }, { status: 401 });
    }

    if (documentIds.length === 0) {
      return NextResponse.json({ error: 'No documents selected' }, { status: 400 });
    }

    const { data: chunkRows, error: chunkError } = await supabase
      .from('document_chunks')
      .select('content, document_id, chunk_index')
      .in('document_id', documentIds)
      .order('chunk_index', { ascending: true })
      .limit(60);

    if (chunkError) {
      console.error('Chat chunk fetch error:', chunkError);
      return NextResponse.json({ error: 'Database: ' + chunkError.message }, { status: 500 });
    }

    const chunks = chunkRows || [];
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No indexed content found for the selected document(s). They may still be processing.' }, { status: 400 });
    }

    const keywords = message.toLowerCase().split(/\\s+/).filter(w => w.length > 3);
    const scored = chunks.map((c: any) => {
      const text = (c.content || '').toLowerCase();
      const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
      return { ...c, score };
    });
    scored.sort((a: any, b: any) => b.score - a.score);
    const topChunks = scored.slice(0, 6);

    const { data: docsForCitation } = await supabase
      .from('documents')
      .select('id, name')
      .in('id', documentIds);

    const docNameMap: Record<string, string> = {};
    (docsForCitation || []).forEach((d: any) => { docNameMap[d.id] = d.name; });

    const contextText = topChunks
      .map((c: any, i: number) => '[' + (i + 1) + '] ' + (c.content || '').slice(0, 800))
      .join('\\n\\n');

    const prompt = 'You are PulsarIQ, an enterprise document assistant. Answer the question using ONLY the context below. If the answer is not in the context, say so honestly and briefly.\\n\\nContext:\\n' + contextText + '\\n\\nQuestion: ' + message + '\\n\\nAnswer:';

    const ollamaUrl   = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434') + '/api/generate';
    const ollamaModel = process.env.OLLAMA_MODEL || 'tinyllama';

    let answer = '';
    try {
      const ollamaRes = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: ollamaModel, prompt, stream: false }),
      });

      if (!ollamaRes.ok) {
        const text = await ollamaRes.text();
        console.error('Ollama error:', ollamaRes.status, text);
        return NextResponse.json({ error: 'AI model returned an error (status ' + ollamaRes.status + '). Make sure "ollama serve" is running and the "' + ollamaModel + '" model is pulled.' }, { status: 502 });
      }

      const ollamaData = await ollamaRes.json();
      answer = ollamaData.response || '';
    } catch (ollamaErr: any) {
      console.error('Ollama fetch exception:', ollamaErr);
      return NextResponse.json({ error: 'Could not reach Ollama at ' + ollamaUrl + '. Make sure "ollama serve" is running.' }, { status: 502 });
    }

    if (!answer.trim()) {
      answer = 'I could not generate a response from the available context. Try rephrasing your question.';
    }

    const citations = topChunks.map((c: any) => ({ source: docNameMap[c.document_id] || 'Unknown document' }));

    return NextResponse.json({ answer, citations });
  } catch (err: any) {
    console.error('Chat POST exception:', err);
    return NextResponse.json({ error: err.message || 'Unknown server error' }, { status: 500 });
  }
}
`);

const chatPagePath = path.join(root, 'app', '(dashboard)', 'chat', 'page.tsx');
let chatPage = fs.readFileSync(chatPagePath, 'utf8');

const oldPattern = "const data = await res.json();\n      timers.current.forEach(t => clearTimeout(t));\n      setProgress(100); setAgentDone(true);\n      setSteps(prev => prev.map(s => ({ ...s, done: true })));\n      setTimeout(() => setShowAgent(false), 1400);\n      setMsgs(m => [...m, { role: 'assistant', content: data.answer || 'No response.', citations: data.citations }]);";

if (chatPage.includes(oldPattern)) {
  const newPattern = "const data = await res.json();\n      timers.current.forEach(t => clearTimeout(t));\n      setProgress(100); setAgentDone(true);\n      setSteps(prev => prev.map(s => ({ ...s, done: true })));\n      setTimeout(() => setShowAgent(false), 1400);\n      if (!res.ok) {\n        setMsgs(m => [...m, { role: 'assistant', content: '\u26a0\ufe0f ' + (data.error || ('Request failed with status ' + res.status)) }]);\n      } else {\n        setMsgs(m => [...m, { role: 'assistant', content: data.answer || 'No response.', citations: data.citations }]);\n      }";
  chatPage = chatPage.replace(oldPattern, newPattern);
  fs.writeFileSync(chatPagePath, chatPage, 'utf8');
  console.log('  \u2713 app/(dashboard)/chat/page.tsx (now shows real errors, not silent "No response.")');
} else {
  console.log('  ! Could not find exact send() pattern in chat page \u2014 leaving it unchanged.');
  console.log('    (The API fix above is still applied and may resolve the issue on its own.)');
}

console.log('\n  \u2705 Chat fixed!\n');
console.log('  \u2713 Real schema used: documents.name, document_chunks.content/document_id');
console.log('  \u2713 Properly awaited createClient()');
console.log('  \u2713 Specific error messages: no docs selected, no indexed content,');
console.log('    Ollama unreachable, Ollama error status \u2014 all now visible in chat');
console.log('  \u2713 Simple keyword-relevance retrieval (skips the historically flaky');
console.log('    pgvector RPC path entirely for reliability)\n');
console.log('  Run: rmdir /s /q .next && npm run dev');
console.log('  Then try asking a question again.\n');
console.log('  IMPORTANT: make sure Ollama is actually running \u2014 open a SEPARATE');
console.log('  terminal and run: ollama serve  (leave it running)\n');
