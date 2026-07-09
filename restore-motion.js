// PulsarIQ — restore-motion.js
// Instantly reverts app/(dashboard)/layout.tsx back to whatever it was
// BEFORE add-motion.js ran. Use this if the ambient motion looks wrong
// or causes any issue.
// Run: node restore-motion.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

const layoutPath = path.join(root, 'app', '(dashboard)', 'layout.tsx');
const backupPath = layoutPath + '.bak';

if (!fs.existsSync(backupPath)) {
  console.log('\n  \u26a0\ufe0f  No backup found at layout.tsx.bak');
  console.log('  Nothing to restore \u2014 either add-motion.js was never run,');
  console.log('  or this restore was already used once before.\n');
  process.exit(1);
}

fs.copyFileSync(backupPath, layoutPath);
console.log('\n  \u2705 Restored app/(dashboard)/layout.tsx to its previous version.\n');
console.log('  Run: rmdir /s /q .next && npm run dev\n');
