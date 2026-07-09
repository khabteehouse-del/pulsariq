// PulsarIQ — test-motion-visibility.js
// TEMPORARY diagnostic: boosts the ambient orb opacity way up (40-50%)
// so we can definitively confirm whether the motion is rendering at all.
// Once confirmed, we'll dial it back to a tasteful level together.
// Run: node test-motion-visibility.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

const layoutPath = path.join(root, 'app', '(dashboard)', 'layout.tsx');

if (!fs.existsSync(layoutPath)) {
  console.log('\n  \u26a0\ufe0f  Could not find ' + layoutPath);
  process.exit(1);
}

let content = fs.readFileSync(layoutPath, 'utf8');

if (!content.includes('ambient-orb')) {
  console.log('\n  \u26a0\ufe0f  No ambient-orb elements found in layout.tsx.');
  console.log('  This means add-motion.js never actually applied, or something');
  console.log('  overwrote it since. We need to re-run add-motion.js first.\n');
  process.exit(1);
}

// Boost opacity values dramatically for visibility testing
content = content
  .replace(/rgba\(34,211,238,0\.07\)/g, 'rgba(34,211,238,0.45)')
  .replace(/rgba\(99,102,241,0\.06\)/g, 'rgba(99,102,241,0.40)')
  .replace(/rgba\(34,211,238,0\.05\)/g, 'rgba(34,211,238,0.40)');

fs.writeFileSync(layoutPath, content, 'utf8');

console.log('\n  PulsarIQ \u2014 TEMPORARY visibility test\n');
console.log('  \u2713 Orb opacity boosted to ~40-45% (very obvious, just for testing)\n');
console.log('  Run: rmdir /s /q .next && npm run dev');
console.log('  Open /dashboard \u2014 you should now see 3 clearly visible');
console.log('  colored blobs slowly drifting around the screen.\n');
console.log('  Tell me what you see, then we will dial it to a tasteful');
console.log('  level together (or run restore-motion.js to remove entirely).\n');
