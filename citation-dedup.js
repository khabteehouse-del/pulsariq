// PulsarIQ — citation-dedup.js
// 1. Citations now deduplicated by document — selecting 1 doc never shows
//    it repeated 4x as separate chips, no matter how many chunks matched.
// 2. Tightened the prompt to reduce instruction-leakage (model repeating
//    the system prompt back as if it were the answer).
// Run: node citation-dedup.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

const content = `import { NextRequest, NextResponse } from 'next/server';
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

    const prompt = 'Answer the QUESTION below using only the CONTEXT. Do not repeat these instructions. Do not mention you are an assistant. Give a direct, factual answer in 2-4 sentences. If the context does not contain the answer, say "I could not find this in the selected document(s)."\\n\\nCONTEXT:\\n' + contextText + '\\n\\nQUESTION: ' + message + '\\n\\nANSWER:';

    const ollamaUrl   = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434') + '/api/generate';
    const ollamaModel = process.env.OLLAMA_MODEL || 'tinyllama';

    let answer = '';
    try {
      const ollamaRes = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: ollamaModel, prompt, stream: false, options: { temperature: 0.3 } }),
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

    const seen = new Set<string>();
    const citations: { source: string }[] = [];
    topChunks.forEach((c: any) => {
      const name = docNameMap[c.document_id] || 'Unknown document';
      if (!seen.has(name)) {
        seen.add(name);
        citations.push({ source: name });
      }
    });

    return NextResponse.json({ answer, citations });
  } catch (err: any) {
    console.error('Chat POST exception:', err);
    return NextResponse.json({ error: err.message || 'Unknown server error' }, { status: 500 });
  }
}
`;

const outPath = path.join(root, 'app', 'api', 'chat', 'route.ts');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, 'utf8');
console.log('\n  PulsarIQ \u2014 Citation Dedup + Tighter Prompt\n');
console.log('  \u2713 app/api/chat/route.ts \u2014 ' + content.length + ' bytes');
console.log('\n  \u2713 Citations now deduplicated \u2014 1 document = 1 chip, always.');
console.log('  \u2713 Prompt tightened to reduce instruction-leakage in answers.');
console.log('  \u2713 Lowered temperature to 0.3 for more focused, less rambly output.\n');
console.log('  NOTE: This does NOT fix model intelligence \u2014 tinyllama is still');
console.log('  a small, weak model. For meaningfully better answers, switch to');
console.log('  phi3:mini (see next steps).\n');
console.log('  Run: rmdir /s /q .next && npm run dev\n');
