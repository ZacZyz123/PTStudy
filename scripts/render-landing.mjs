// Static render of the PT Study landing hero + feature cards via sharp.
// Live page adds: mouse-parallax Flex pedestal, drifting blobs, animated
// gradient headline, count-up stats, scroll-progress bar, 3D card glare.
import sharp from 'sharp'
import { writeFileSync } from 'fs'

const C = {
  base: '#080D18', card: '#0F1829', sky: '#38BDF8', violet: '#7C3AED',
  emerald: '#10B981', amber: '#F59E0B', pink: '#EC4899',
  txt: '#F0F9FF', txt2: '#94A3B8', txt3: '#3D5470',
  glass: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const T = (x, y, t, { size = 14, fill = C.txt, w = 400, anchor = 'start', mono = false } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}" font-family="${mono ? 'monospace' : 'sans-serif'}">${esc(t)}</text>`
function glass(x, y, w, h, r = 20) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${C.glass}" stroke="${C.border}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#hi)" opacity="0.5"/>`
}

function flexExcited(scale = 1) {
  const A = '#F59E0B'
  return `<g transform="scale(${scale})">
    <defs>
      <radialGradient id="fhg" cx="38%" cy="28%" r="80%"><stop offset="0%" stop-color="#F8FAFC"/><stop offset="45%" stop-color="#CBD5E1"/><stop offset="80%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/></radialGradient>
      <radialGradient id="feg" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#FFFDF5"/><stop offset="35%" stop-color="#FDE68A"/><stop offset="100%" stop-color="${A}"/></radialGradient>
      <linearGradient id="fag" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="50%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/></linearGradient>
      <filter id="fgl" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="3.2" flood-color="${A}" flood-opacity="0.9"/></filter>
      <filter id="fan" x="-150%" y="-150%" width="400%" height="400%"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${A}" flood-opacity="0.9"/></filter>
    </defs>
    <g><line x1="68" y1="124" x2="38" y2="88" stroke="url(#fag)" stroke-width="16" stroke-linecap="round"/><circle cx="36" cy="84" r="9" fill="url(#fag)" stroke="#334155" stroke-width="1.5"/>
       <line x1="132" y1="124" x2="162" y2="88" stroke="url(#fag)" stroke-width="16" stroke-linecap="round"/><circle cx="164" cy="84" r="9" fill="url(#fag)" stroke="#334155" stroke-width="1.5"/></g>
    <rect x="52" y="104" width="96" height="100" rx="44" fill="#15151f"/>
    <rect x="66" y="196" width="30" height="16" rx="8" fill="#fff"/><rect x="104" y="196" width="30" height="16" rx="8" fill="#fff"/>
    <path d="M76 112 q24 22 48 0" stroke="#7DD3FC" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="104" y="132" width="34" height="18" rx="5" fill="#0F1829" stroke="${C.sky}" stroke-width="1.5"/>
    <text x="121" y="145" text-anchor="middle" font-size="11" font-weight="bold" fill="${C.sky}" font-family="sans-serif">DPT</text>
    <line x1="100" y1="26" x2="100" y2="14" stroke="#64748B" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="11" r="4.5" fill="${A}" filter="url(#fan)"/>
    <rect x="44" y="58" width="12" height="26" rx="6" fill="#94A3B8" stroke="#475569" stroke-width="1.5"/><rect x="144" y="58" width="12" height="26" rx="6" fill="#94A3B8" stroke="#475569" stroke-width="1.5"/>
    <ellipse cx="100" cy="68" rx="48" ry="50" fill="url(#fhg)" stroke="#475569" stroke-width="2"/>
    <ellipse cx="86" cy="44" rx="20" ry="12" fill="#fff" opacity="0.35"/>
    <g filter="url(#fgl)"><ellipse cx="84" cy="61" rx="11" ry="12" fill="url(#feg)"/><ellipse cx="116" cy="61" rx="11" ry="12" fill="url(#feg)"/><circle cx="80" cy="56" r="2.5" fill="#fff"/><circle cx="112" cy="56" r="2.5" fill="#fff"/></g>
    <g filter="url(#fgl)"><path d="M80 78 q20 24 40 0 z" fill="${A}" opacity="0.9"/><path d="M80 78 q20 24 40 0" stroke="#FDE68A" stroke-width="3" fill="none"/></g>
  </g>`
}

const W = 1400, H = 900
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="hi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0.10"/><stop offset="30%" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${C.sky}"/><stop offset="50%" stop-color="${C.violet}"/><stop offset="100%" stop-color="${C.pink}"/></linearGradient>
  <radialGradient id="b1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${C.sky}" stop-opacity="0.22"/><stop offset="100%" stop-color="${C.sky}" stop-opacity="0"/></radialGradient>
  <radialGradient id="b2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${C.violet}" stop-opacity="0.22"/><stop offset="100%" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
  <radialGradient id="ped" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${C.sky}" stop-opacity="0.35"/><stop offset="100%" stop-color="${C.sky}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="${C.base}"/>
<ellipse cx="160" cy="240" rx="420" ry="360" fill="url(#b1)"/>
<ellipse cx="${W - 120}" cy="${H - 120}" rx="460" ry="380" fill="url(#b2)"/>
<rect x="0" y="0" width="${W}" height="2" fill="url(#grad)"/>`

// nav
svg += `<rect x="0" y="0" width="${W}" height="64" fill="rgba(8,13,24,0.6)"/><line x1="0" y1="64" x2="${W}" y2="64" stroke="${C.border}"/>`
svg += `<rect x="40" y="18" width="30" height="30" rx="9" fill="${C.sky}" opacity="0.15"/><polygon points="53,26 49,35 54,35 52,42 60,32 54,32" fill="${C.sky}"/>`
svg += T(80, 40, 'PT', { size: 17, w: 700 }) + T(104, 40, 'Study', { size: 17, w: 700, fill: C.sky })
svg += T(W - 200, 40, 'Log in', { size: 14, fill: C.txt2 })
svg += `<rect x="${W - 150}" y="20" width="110" height="32" rx="16" fill="${C.sky}"/>` + T(W - 95, 40, 'Get started', { size: 13, w: 600, fill: C.base, anchor: 'middle' })

// hero left
const lx = 80
svg += `<rect x="${lx}" y="150" width="300" height="32" rx="16" fill="${C.sky}" opacity="0.10" stroke="${C.sky}" stroke-opacity="0.3"/>`
svg += `<circle cx="${lx + 22}" cy="166" r="4" fill="${C.sky}"/>` + T(lx + 36, 171, 'Built for Mayo Clinic DPT students', { size: 12, w: 600, fill: C.sky })
svg += T(lx, 250, 'PT school is brutal.', { size: 58, w: 700 })
svg += T(lx, 318, 'Studying shouldn’t be.', { size: 58, w: 700, fill: 'url(#grad)' })
svg += T(lx, 372, 'Drop in a lecture — get an AI study guide, 3D flashcards, and a', { size: 18, fill: C.txt2 })
svg += T(lx, 400, 'clinical-reasoning quiz in seconds. Then challenge your', { size: 18, fill: C.txt2 })
svg += T(lx, 428, 'classmates and fight for the top of the leaderboard.', { size: 18, fill: C.txt2 })
// CTAs
svg += `<rect x="${lx}" y="464" width="270" height="54" rx="27" fill="${C.sky}"/>` + T(lx + 135, 497, 'Start studying — $25/mo →', { size: 16, w: 700, fill: C.base, anchor: 'middle' })
svg += T(lx + 300, 497, 'See what’s inside ↓', { size: 14, fill: C.txt2 })
// stats band
const stats = [['60s', 'lecture → study kit'], ['15', 'flashcards per lecture'], ['100 XP', 'per challenge win']]
stats.forEach((s, i) => {
  const sx = lx + i * 160
  svg += T(sx, 575, s[0], { size: 30, w: 700, fill: C.sky, mono: true }) + T(sx, 598, s[1], { size: 12, fill: C.txt2 })
})

// hero right — Flex on pedestal
svg += `<ellipse cx="1080" cy="360" rx="220" ry="220" fill="url(#ped)"/>`
svg += `<g transform="translate(905,200)">${flexExcited(1.75)}</g>`
svg += `<ellipse cx="1080" cy="585" rx="120" ry="16" fill="${C.sky}" opacity="0.22"/>`
// speech bubble
svg += `<rect x="980" y="150" width="250" height="50" rx="16" fill="#fff"/><polygon points="1085,198 1100,198 1092,212" fill="#fff"/>`
svg += T(1105, 180, "Welcome! I'm Flex, your study buddy!", { size: 13, w: 600, fill: '#1e293b', anchor: 'middle' })

// feature cards strip
const feats = [
  [C.sky, 'AI study guides', 'Every lecture distilled into a clean, exam-focused guide by Claude.'],
  [C.violet, '3D flashcards', '15 auto-generated cards per lecture with a satisfying physical flip.'],
  [C.emerald, 'Adaptive quizzes', 'Scenario-based clinical reasoning with instant explanations + XP.'],
]
const fy = 680, fw = 400, gap = 30
feats.forEach((f, i) => {
  const fx = 80 + i * (fw + gap)
  svg += glass(fx, fy, fw, 170)
  svg += `<rect x="${fx + 28}" y="${fy + 28}" width="48" height="48" rx="14" fill="${f[0]}" opacity="0.14"/>`
  svg += `<circle cx="${fx + 52}" cy="${fy + 52}" r="10" fill="none" stroke="${f[0]}" stroke-width="2.5"/>`
  svg += T(fx + 28, fy + 110, f[1], { size: 19, w: 700 })
  svg += T(fx + 28, fy + 138, f[2].slice(0, 48), { size: 13, fill: C.txt2 })
  svg += T(fx + 28, fy + 156, f[2].slice(48), { size: 13, fill: C.txt2 })
})

svg += `</svg>`
writeFileSync('landing-preview.svg', svg)
await sharp(Buffer.from(svg)).png().toFile('landing-preview.png')
console.log('wrote landing-preview.png')
