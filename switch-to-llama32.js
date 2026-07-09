// PulsarIQ — switch-to-llama32.js
// Updates OLLAMA_MODEL in .env.local from tinyllama to llama3.2:3b
// (already installed — no download needed)
// Run: node switch-to-llama32.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

const envPath = path.join(root, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('\n  \u26a0\ufe0f  .env.local not found at ' + envPath);
  console.log('  Make sure you are running this from C:\\pulsariq\n');
  process.exit(1);
}

let env = fs.readFileSync(envPath, 'utf8');
const before = env;

if (/^OLLAMA_MODEL=.*/m.test(env)) {
  env = env.replace(/^OLLAMA_MODEL=.*/m, 'OLLAMA_MODEL=llama3.2:3b');
} else {
  env += (env.endsWith('\n') ? '' : '\n') + 'OLLAMA_MODEL=llama3.2:3b\n';
}

fs.writeFileSync(envPath, env, 'utf8');

console.log('\n  PulsarIQ \u2014 Switched to llama3.2:3b\n');
if (before !== env) {
  console.log('  \u2713 .env.local updated: OLLAMA_MODEL=llama3.2:3b');
} else {
  console.log('  \u2713 .env.local already set to llama3.2:3b (no change needed)');
}
console.log('\n  No pull needed \u2014 you already have it installed.');
console.log('  Restart your dev server:\n');
console.log('  rmdir /s /q .next');
console.log('  npm run dev\n');
console.log('  Open Chat, select your document, and ask the same question again.');
console.log('  llama3.2:3b should give noticeably better, more coherent answers');
console.log('  than tinyllama.\n');
