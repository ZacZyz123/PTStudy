// Static render of the PT Study dashboard (three-column layout) with sample
// data, rasterized to PNG via sharp. Mirrors the real design tokens. This is a
// layout/visual mockup — live app adds parallax, glare, aurora drift, count-ups.
import sharp from 'sharp'
import { writeFileSync } from 'fs'

const C = {
  base: '#080D18', panel: '#0A1020', card: '#0F1829',
  sky: '#38BDF8', violet: '#7C3AED', emerald: '#10B981', amber: '#F59E0B',
  red: '#EF4444', pink: '#EC4899',
  txt: '#F0F9FF', txt2: '#94A3B8', txt3: '#3D5470',
  glass: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const T = (x, y, t, { size = 14, fill = C.txt, w = 400, anchor = 'start', mono = false } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}" font-family="${mono ? 'monospace' : 'sans-serif'}">${esc(t)}</text>`

// glass card with border + faint top highlight
function glass(x, y, w, h, r = 16, { border = C.border, glow = false, fill = C.glass } = {}) {
  return `
    ${glow ? `<rect x="${x - 2}" y="${y - 2}" width="${w + 4}" height="${h + 4}" rx="${r + 2}" fill="${C.sky}" opacity="0.05"/>` : ''}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${border}" stroke-width="1"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#glassHi)" opacity="0.5"/>`
}

// simple line icons (stroke) inside a tinted circle
function iconChip(x, y, color, glyph, size = 44) {
  const cx = x + size / 2, cy = y + size / 2
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="12" fill="${color}" opacity="0.12"/>
    <g transform="translate(${cx},${cy})" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>`
}
const ICON = {
  bolt: '<polygon points="-2,-9 -8,2 -1,2 -3,9 7,-3 0,-3" fill="currentfill"/>',
  flame: '<path d="M0,-9 C5,-3 7,0 4,5 C2,8 -2,8 -4,5 C-6,1 -3,-1 -2,-4 C-1,-2 1,-2 0,-9 Z"/>',
  brain: '<circle cx="0" cy="0" r="8"/><path d="M0,-8 V8 M-5,-5 H5 M-6,3 H6"/>',
  target: '<circle cx="0" cy="0" r="8"/><circle cx="0" cy="0" r="4"/><circle cx="0" cy="0" r="0.6" fill="currentfill"/>',
  book: '<path d="M-7,-8 H4 a3,3 0 0 1 3,3 V8 H-4 a3,3 0 0 0 -3,3 Z M-7,-8 V8"/>',
  cal: '<rect x="-8" y="-6" width="16" height="14" rx="2"/><path d="M-8,-1 H8 M-4,-9 V-3 M4,-9 V-3"/>',
  alert: '<path d="M0,-8 L9,8 H-9 Z"/><path d="M0,-2 V3 M0,5.5 V5.6"/>',
}
const icon = (k, color) => (ICON[k] || '').replace(/currentfill/g, color)

// stat card
function stat(x, y, w, color, glyphKey, value, label) {
  const top = `<rect x="${x + 16}" y="${y}" width="${w - 32}" height="2" fill="${color}" opacity="0.55" rx="1"/>`
  return glass(x, y, w, 86) + top +
    iconChip(x + 18, y + 21, color, icon(glyphKey, color)) +
    T(x + 78, y + 40, value, { size: 24, w: 700, mono: true }) +
    T(x + 78, y + 62, label, { size: 12, fill: C.txt2 })
}

// guide card
function guide(x, y, w, accent, cls, title, topic) {
  const h = 116
  return glass(x, y, w, h, 16, { glow: true }) +
    `<rect x="${x}" y="${y}" width="${w}" height="38" rx="16" fill="${accent}" opacity="0.12"/>
     <rect x="${x}" y="${y + 22}" width="${w}" height="16" fill="${accent}" opacity="0.12"/>` +
    `<rect x="${x + 18}" y="${y + 14}" width="${Math.min(120, 8 + cls.length * 7)}" height="22" rx="11" fill="${accent}" opacity="0.18"/>` +
    T(x + 28, y + 29, cls, { size: 11, fill: accent, w: 600 }) +
    T(x + 18, y + 66, title, { size: 16, w: 700 }) +
    T(x + 18, y + 90, topic, { size: 13, fill: C.txt2 }) +
    `<g transform="translate(${x + w - 30},${y + h - 26})" stroke="${accent}" stroke-width="2" fill="none" stroke-linecap="round"><path d="M-4,-5 L1,0 L-4,5"/></g>`
}

// nav item
function nav(x, y, w, color, glyphKey, label, active) {
  return (active ? `<rect x="${x}" y="${y}" width="${w}" height="40" rx="12" fill="${C.sky}" opacity="0.12"/>
    <rect x="${x}" y="${y + 9}" width="3" height="22" rx="2" fill="${C.sky}"/>` : '') +
    `<g transform="translate(${x + 22},${y + 20})" stroke="${active ? C.sky : C.txt2}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" transform-origin="center">${icon(glyphKey, active ? C.sky : C.txt2)}</g>` +
    T(x + 42, y + 25, label, { size: 14, fill: active ? C.txt : C.txt2, w: active ? 600 : 400 })
}

// ---- Flex (idle) compact, reused from the mascot ----
function flexIdle(scale = 1) {
  const A = '#F59E0B'
  return `<g transform="scale(${scale})">
    <defs>
      <radialGradient id="fhg" cx="38%" cy="28%" r="80%"><stop offset="0%" stop-color="#F8FAFC"/><stop offset="45%" stop-color="#CBD5E1"/><stop offset="80%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/></radialGradient>
      <radialGradient id="feg" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#FFFDF5"/><stop offset="35%" stop-color="#FDE68A"/><stop offset="100%" stop-color="${A}"/></radialGradient>
      <linearGradient id="fag" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="50%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/></linearGradient>
      <filter id="fgl" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="3.2" flood-color="${A}" flood-opacity="0.85"/></filter>
    </defs>
    <g><line x1="64" y1="126" x2="50" y2="168" stroke="url(#fag)" stroke-width="16" stroke-linecap="round"/><circle cx="49" cy="174" r="9" fill="url(#fag)" stroke="#334155" stroke-width="1.5"/>
       <line x1="136" y1="126" x2="150" y2="168" stroke="url(#fag)" stroke-width="16" stroke-linecap="round"/><circle cx="151" cy="174" r="9" fill="url(#fag)" stroke="#334155" stroke-width="1.5"/></g>
    <rect x="52" y="104" width="96" height="100" rx="44" fill="#15151f"/>
    <rect x="66" y="196" width="30" height="16" rx="8" fill="#fff"/><rect x="104" y="196" width="30" height="16" rx="8" fill="#fff"/>
    <path d="M76 112 q24 22 48 0" stroke="#7DD3FC" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="104" y="132" width="34" height="18" rx="5" fill="#0F1829" stroke="${C.sky}" stroke-width="1.5"/>
    <text x="121" y="145" text-anchor="middle" font-size="11" font-weight="bold" fill="${C.sky}" font-family="sans-serif">DPT</text>
    <line x1="100" y1="26" x2="100" y2="14" stroke="#64748B" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="11" r="4.5" fill="#94A3B8"/>
    <rect x="44" y="58" width="12" height="26" rx="6" fill="#94A3B8" stroke="#475569" stroke-width="1.5"/><rect x="144" y="58" width="12" height="26" rx="6" fill="#94A3B8" stroke="#475569" stroke-width="1.5"/>
    <ellipse cx="100" cy="68" rx="48" ry="50" fill="url(#fhg)" stroke="#475569" stroke-width="2"/>
    <ellipse cx="86" cy="44" rx="20" ry="12" fill="#fff" opacity="0.35"/>
    <g filter="url(#fgl)"><ellipse cx="84" cy="61" rx="9" ry="10" fill="url(#feg)"/><ellipse cx="116" cy="61" rx="9" ry="10" fill="url(#feg)"/></g>
    <path d="M84 82 q16 11 32 0" stroke="${A}" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#fgl)"/>
  </g>`
}

const W = 1400, H = 940
const S = 220, RP = 300, mainX = S + 56, mainW = W - S - RP - 112

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="glassHi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.10"/><stop offset="30%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
  <linearGradient id="xpfill" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${C.sky}"/><stop offset="100%" stop-color="${C.violet}"/></linearGradient>
  <radialGradient id="aur1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${C.sky}" stop-opacity="0.16"/><stop offset="100%" stop-color="${C.sky}" stop-opacity="0"/></radialGradient>
  <radialGradient id="aur2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${C.violet}" stop-opacity="0.16"/><stop offset="100%" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="${C.base}"/>
<ellipse cx="120" cy="40" rx="380" ry="300" fill="url(#aur1)"/>
<ellipse cx="${W - 120}" cy="${H}" rx="420" ry="320" fill="url(#aur2)"/>`

// ---------- Sidebar ----------
svg += `<rect x="0" y="0" width="${S}" height="${H}" fill="${C.panel}"/><line x1="${S}" y1="0" x2="${S}" y2="${H}" stroke="${C.border}"/>`
svg += `<rect x="24" y="26" width="32" height="32" rx="10" fill="${C.sky}" opacity="0.15"/><g transform="translate(40,42)" fill="${C.sky}">${icon('bolt', C.sky)}</g>`
svg += T(66, 47, 'PT', { size: 18, w: 700 }) + T(92, 47, 'Study', { size: 18, w: 700, fill: C.sky })
const navs = [['target', 'Dashboard', true], ['book', 'Study Guides', false], ['cards', 'Flashcards', false], ['brain', 'Quiz', false], ['flame', 'Challenge', false], ['target', 'Leaderboard', false], ['brain', 'Friends', false], ['book', 'Profile', false]]
navs.forEach((n, i) => { svg += nav(16, 90 + i * 48, S - 32, C.sky, n[0] === 'cards' ? 'book' : n[0], n[1], n[2]) })
// user footer
svg += glass(16, H - 90, S - 32, 64, 14)
svg += `<circle cx="48" cy="${H - 58}" r="18" fill="${C.violet}" opacity="0.9"/>` + T(48, H - 53, 'JZ', { size: 13, w: 700, anchor: 'middle' })
svg += T(76, H - 62, 'Jordan Z.', { size: 13, w: 600 }) + T(76, H - 44, 'Level 7 · Clinician', { size: 11, fill: C.txt2 })

// ---------- Main column ----------
let y = 40
svg += T(mainX, y + 6, 'Welcome back, ', { size: 26, w: 700 }) + T(mainX + 215, y + 6, 'Jordan', { size: 26, w: 700, fill: C.sky }) + T(mainX + 320, y + 6, '👋', { size: 24 })
svg += T(mainX, y + 32, 'An exam is coming up — time to lock in.', { size: 14, fill: C.txt2 })
y += 58

// XP card
svg += glass(mainX, y, mainW, 70)
svg += `<g transform="translate(${mainX + 18},${y + 26})" fill="${C.sky}">${icon('bolt', C.sky)}</g>`
svg += T(mainX + 36, y + 31, 'Level 7 — Clinician', { size: 14, w: 600 })
svg += T(mainX + mainW - 18, y + 31, '2,140 / 2,600 XP', { size: 12, fill: C.txt2, anchor: 'end', mono: true })
svg += `<rect x="${mainX + 18}" y="${y + 44}" width="${mainW - 36}" height="12" rx="6" fill="rgba(255,255,255,0.05)"/>`
svg += `<rect x="${mainX + 18}" y="${y + 44}" width="${(mainW - 36) * 0.62}" height="12" rx="6" fill="url(#xpfill)"/>`
svg += `<rect x="${mainX + 18 + (mainW - 36) * 0.42}" y="${y + 44}" width="60" height="12" rx="6" fill="#fff" opacity="0.18"/>`
y += 90

// exam banner
svg += glass(mainX, y, mainW, 76, 16, { border: 'rgba(245,158,11,0.35)' })
svg += iconChip(mainX + 18, y + 18, C.amber, icon('cal', C.amber), 44)
svg += T(mainX + 78, y + 34, 'Musculoskeletal Practical', { size: 15, w: 600 })
svg += T(mainX + 78, y + 56, 'Friday, June 19 — Shoulder, Knee, Gait', { size: 13, fill: C.txt2 })
svg += T(mainX + mainW - 30, y + 40, '4', { size: 26, w: 700, fill: C.amber, anchor: 'end', mono: true })
svg += T(mainX + mainW - 18, y + 58, 'days left', { size: 11, fill: C.txt3, anchor: 'end' })
y += 96

// stats row
const sw = (mainW - 36) / 4
svg += stat(mainX, y, sw, C.sky, 'bolt', '2,140', 'Total XP')
svg += stat(mainX + (sw + 12), y, sw, C.amber, 'flame', '7', 'Day streak')
svg += stat(mainX + (sw + 12) * 2, y, sw, C.violet, 'brain', '34', 'Quizzes taken')
svg += stat(mainX + (sw + 12) * 3, y, sw, C.emerald, 'target', '88%', 'Avg score')
y += 110

// priority topics
svg += `<g transform="translate(${mainX + 8},${y + 4})" stroke="${C.amber}" stroke-width="2" fill="none">${icon('alert', C.amber)}</g>`
svg += T(mainX + 24, y + 9, 'Exam priority topics', { size: 16, w: 700 })
y += 26
const gw = (mainW - 16) / 2
svg += guide(mainX, y, gw, C.amber, 'MSK II', 'Shoulder Complex', 'Rotator cuff · Impingement')
svg += guide(mainX + gw + 16, y, gw, C.amber, 'MSK II', 'Knee Biomechanics', 'ACL · Patellofemoral')
y += 136

// recent lectures
svg += `<g transform="translate(${mainX + 8},${y + 2})" stroke="${C.sky}" stroke-width="2" fill="none">${icon('book', C.sky)}</g>`
svg += T(mainX + 24, y + 9, 'Recent lectures', { size: 16, w: 700 })
svg += T(mainX + mainW - 18, y + 9, 'View all ›', { size: 13, fill: C.sky, anchor: 'end', w: 600 })
y += 26
svg += guide(mainX, y, gw, C.sky, 'Neuro', 'Gait Analysis', 'Phases · Deviations')
svg += guide(mainX + gw + 16, y, gw, C.violet, 'Cardio', 'Exercise Physiology', 'VO2 · Energy systems')

// ---------- Right panel ----------
const rx = W - RP
svg += `<rect x="${rx}" y="0" width="${RP}" height="${H}" fill="${C.panel}"/><line x1="${rx}" y1="0" x2="${rx}" y2="${H}" stroke="${C.border}"/>`
svg += T(rx + 24, 44, 'Online now', { size: 14, w: 700 })
const online = [['Maya R.', C.sky], ['Devin K.', C.violet], ['Sara P.', C.pink]]
online.forEach((o, i) => {
  const oy = 66 + i * 52
  svg += `<circle cx="${rx + 40}" cy="${oy + 16}" r="18" fill="${o[1]}" opacity="0.9"/>` + T(rx + 40, oy + 21, o[0].slice(0, 1) + o[0].split(' ')[1][0], { size: 12, w: 700, anchor: 'middle' })
  svg += `<circle cx="${rx + 54}" cy="${oy + 28}" r="5" fill="${C.emerald}" stroke="${C.panel}" stroke-width="2"/>`
  svg += T(rx + 66, oy + 14, o[0], { size: 13, w: 600 }) + T(rx + 66, oy + 30, 'Level ' + (8 - i), { size: 11, fill: C.txt2 })
})
let my = 250
svg += T(rx + 24, my, 'Messages', { size: 14, w: 700 })
my += 16
const msgs = [['Maya R.', 'gg on that quiz 🔥', 2], ['Devin K.', 'challenge me?', 0], ['Sara P.', 'sharing my notes', 1]]
msgs.forEach((m, i) => {
  const ty = my + i * 70
  svg += glass(rx + 16, ty, RP - 32, 58, 14)
  svg += `<circle cx="${rx + 44}" cy="${ty + 29}" r="16" fill="${C.violet}" opacity="0.85"/>` + T(rx + 44, ty + 34, m[0][0] + m[0].split(' ')[1][0], { size: 11, w: 700, anchor: 'middle' })
  svg += T(rx + 68, ty + 25, m[0], { size: 13, w: 600 }) + T(rx + 68, ty + 43, m[1], { size: 12, fill: C.txt2 })
  if (m[2]) { svg += `<circle cx="${rx + RP - 32}" cy="${ty + 29}" r="10" fill="${C.sky}"/>` + T(rx + RP - 32, ty + 33, m[2], { size: 11, w: 700, anchor: 'middle', fill: C.base }) }
})

// Flex corner
svg += `<g transform="translate(${rx - 96},${H - 120})">${flexIdle(0.42)}</g>`

svg += `</svg>`

writeFileSync('dashboard-preview.svg', svg)
await sharp(Buffer.from(svg)).png().toFile('dashboard-preview.png')
console.log('wrote dashboard-preview.png')
