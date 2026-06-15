// Static render of the PT Study landing hero + feature cards via sharp.
// Mirrors the real design tokens + Flex. Live page adds: mouse-parallax Flex,
// drifting blobs, animated gradient headline, count-ups, scroll-progress bar.
import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { flexSVG, P } from './flex-svg.mjs'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const T = (x, y, t, { size = 14, fill = P.txt, w = 400, anchor = 'start', mono = false } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}" font-family="${mono ? 'monospace' : 'sans-serif'}">${esc(t)}</text>`
function glass(x, y, w, h, r = 20) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${P.glass}" stroke="${P.glassBorder}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#hi)" opacity="0.5"/>`
}

const W = 1400, H = 900
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="hi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0.10"/><stop offset="30%" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${P.sky}"/><stop offset="50%" stop-color="${P.periwinkle}"/><stop offset="100%" stop-color="${P.sky}"/></linearGradient>
  <radialGradient id="b1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${P.sky}" stop-opacity="0.16"/><stop offset="100%" stop-color="${P.sky}" stop-opacity="0"/></radialGradient>
  <radialGradient id="b2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${P.indigo}" stop-opacity="0.16"/><stop offset="100%" stop-color="${P.indigo}" stop-opacity="0"/></radialGradient>
  <radialGradient id="ped" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${P.sky}" stop-opacity="0.28"/><stop offset="100%" stop-color="${P.sky}" stop-opacity="0"/></radialGradient>
  <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#05070C" stop-opacity="0"/><stop offset="100%" stop-color="#05070C" stop-opacity="1"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="#05070C"/>
<!-- cinematic video backdrop (representation of the looping hero video) -->
<rect x="0" y="0" width="${W}" height="620" fill="#0A0F1C"/>
<ellipse cx="420" cy="180" rx="320" ry="260" fill="url(#b1)"/>
<ellipse cx="1050" cy="320" rx="380" ry="300" fill="url(#b2)"/>
<g opacity="0.5">
  <circle cx="300" cy="120" r="60" fill="${P.sky}" opacity="0.05"/>
  <circle cx="700" cy="90" r="40" fill="${P.periwinkle}" opacity="0.06"/>
  <circle cx="1180" cy="160" r="80" fill="${P.indigo}" opacity="0.05"/>
  <circle cx="540" cy="430" r="50" fill="${P.sky}" opacity="0.04"/>
  <circle cx="980" cy="500" r="70" fill="${P.indigo}" opacity="0.04"/>
</g>
<!-- cinematic overlays: darken + bottom fade into the page -->
<rect x="0" y="0" width="${W}" height="620" fill="#05070C" opacity="0.45"/>
<rect x="0" y="380" width="${W}" height="240" fill="url(#fade)"/>
<rect x="0" y="0" width="${W}" height="2" fill="url(#grad)"/>`

// nav
svg += `<rect x="0" y="0" width="${W}" height="64" fill="rgba(12,19,34,0.6)"/><line x1="0" y1="64" x2="${W}" y2="64" stroke="${P.border}"/>`
svg += `<rect x="40" y="18" width="30" height="30" rx="9" fill="${P.sky}" opacity="0.15"/><polygon points="53,26 49,35 54,35 52,42 60,32 54,32" fill="${P.sky}"/>`
svg += T(80, 40, 'PT', { size: 17, w: 700 }) + T(104, 40, 'Study', { size: 17, w: 700, fill: P.sky })
svg += T(W - 200, 40, 'Log in', { size: 14, fill: P.txt2 })
svg += `<rect x="${W - 150}" y="20" width="110" height="32" rx="16" fill="${P.sky}"/>` + T(W - 95, 40, 'Get started', { size: 13, w: 600, fill: P.base, anchor: 'middle' })

// hero left
const lx = 80
svg += `<rect x="${lx}" y="150" width="300" height="32" rx="16" fill="${P.sky}" opacity="0.10" stroke="${P.sky}" stroke-opacity="0.3"/>`
svg += `<circle cx="${lx + 22}" cy="166" r="4" fill="${P.sky}"/>` + T(lx + 36, 171, 'Built for Mayo Clinic DPT students', { size: 12, w: 600, fill: P.sky })
svg += T(lx, 250, 'PT school is brutal.', { size: 58, w: 700 })
svg += T(lx, 318, 'Studying shouldn’t be.', { size: 58, w: 700, fill: 'url(#grad)' })
svg += T(lx, 372, 'Drop in a lecture — get an AI study guide, 3D flashcards, and a', { size: 18, fill: P.txt2 })
svg += T(lx, 400, 'clinical-reasoning quiz in seconds. Then challenge your', { size: 18, fill: P.txt2 })
svg += T(lx, 428, 'classmates and fight for the top of the leaderboard.', { size: 18, fill: P.txt2 })
// CTAs
svg += `<rect x="${lx}" y="464" width="270" height="54" rx="27" fill="${P.sky}"/>` + T(lx + 135, 497, 'Start studying — $25/mo →', { size: 16, w: 700, fill: P.base, anchor: 'middle' })
svg += T(lx + 300, 497, 'See what’s inside ↓', { size: 14, fill: P.txt2 })
// stats band (sentence-case sublabels)
const stats = [['60s', 'Lecture → study kit'], ['15', 'Flashcards per lecture'], ['100 XP', 'Per challenge win']]
stats.forEach((s, i) => {
  const sx = lx + i * 170
  svg += T(sx, 575, s[0], { size: 30, w: 700, fill: P.sky, mono: true }) + T(sx, 598, s[1], { size: 12, fill: P.txt2 })
})

// hero right — Flex on pedestal
svg += `<ellipse cx="1080" cy="375" rx="220" ry="220" fill="url(#ped)"/>`
svg += `<svg x="905" y="150" width="350" height="420" viewBox="0 0 200 240">${flexSVG('excited', 'hero')}</svg>`
svg += `<ellipse cx="1080" cy="585" rx="120" ry="16" fill="${P.sky}" opacity="0.18"/>`

// feature cards strip
const feats = [
  [P.sky, 'AI study guides', 'Every lecture distilled into a clean, exam-focused guide by Flex.'],
  [P.indigo, '3D flashcards', '15 auto-generated cards per lecture with a satisfying physical flip.'],
  [P.emerald, 'Adaptive quizzes', 'Scenario-based clinical reasoning with instant explanations + XP.'],
]
const fy = 680, fw = 400, gap = 30
feats.forEach((f, i) => {
  const fx = 80 + i * (fw + gap)
  svg += glass(fx, fy, fw, 170)
  svg += `<rect x="${fx + 28}" y="${fy + 28}" width="48" height="48" rx="14" fill="${f[0]}" opacity="0.14"/>`
  svg += `<circle cx="${fx + 52}" cy="${fy + 52}" r="10" fill="none" stroke="${f[0]}" stroke-width="2.5"/>`
  svg += T(fx + 28, fy + 110, f[1], { size: 19, w: 700 })
  svg += T(fx + 28, fy + 138, f[2].slice(0, 48), { size: 13, fill: P.txt2 })
  svg += T(fx + 28, fy + 156, f[2].slice(48), { size: 13, fill: P.txt2 })
})

svg += `</svg>`
writeFileSync('landing-preview.svg', svg)
await sharp(Buffer.from(svg)).png().toFile('landing-preview.png')
console.log('wrote landing-preview.png')
