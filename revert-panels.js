// PulsarIQ — revert-panels.js
// Removes the orbital data panels entirely. Keeps reactor core + Lorenz trails + headline + login bar.
// Run: node revert-panels.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

const pagePath = path.join(root, 'app', 'page.tsx');
let page = fs.readFileSync(pagePath, 'utf8');

// 1. Remove the carousel hook (panelRefs + RAF effect) if present
const hookStart = '  // Carousel-style panel orbit';
const hookEnd   = '  const handleLogin = async (e: React.FormEvent) => {';

const hStart = page.indexOf(hookStart);
const hEnd   = page.indexOf(hookEnd);

if (hStart !== -1 && hEnd !== -1) {
  page = page.slice(0, hStart) + page.slice(hEnd);
  console.log('  \u2713 Removed carousel panel hook (panelRefs + RAF)');
} else {
  console.log('  - Carousel hook not found, skipping (may already be clean)');
}

// 2. Remove the orbital panels render block, keep just the reactor core dot
const sceneStart = '      {/* Orbital panels';
const sceneEnd   = '      {/* Nav';

const sStart = page.indexOf(sceneStart);
const sEnd   = page.indexOf(sceneEnd);

if (sStart !== -1 && sEnd !== -1) {
  const cleanCore = `      {/* Reactor core accent \u2014 sits above canvas reactor for extra glow */}
      <div style={{ position:'absolute', inset:0, zIndex:3, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
        <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'radial-gradient(circle,#fff 0%,#A5F3FC 35%,rgba(34,211,238,0.1) 100%)', boxShadow:'0 0 30px rgba(34,211,238,0.9)', animation:'corePulse 2s ease-in-out infinite', marginTop:'-60px' }} />
      </div>

`;
  page = page.slice(0, sStart) + cleanCore + page.slice(sEnd);
  console.log('  \u2713 Removed orbital panels, kept clean reactor core glow');
} else {
  console.log('  ! Could not find panel scene markers \u2014 manual check needed');
}

// 3. Remove now-unused PANELS / MSGS / BARS consts if they're dangling and unused
// (Safe no-op if already removed; React/TS will just warn, not error, on unused consts)

fs.writeFileSync(pagePath, page, 'utf8');
console.log('\n  \u2705 Reverted. Hero is now: Lorenz trails + reactor core + headline + login bar.');
console.log('  Run: rmdir /s /q .next && npm run dev\n');
