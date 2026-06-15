// Static render of the PT Study dashboard (three-column layout) with sample
// data, rasterized to PNG via sharp. Mirrors the real design tokens + Flex.
// Live app adds parallax, glare, aurora drift, count-ups.
import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { flexSVG, P } from './flex-svg.mjs'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const T = (x, y, t, { size = 14, fill = P.txt, w = 400, anchor = 'start', mono = false } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}" font-family="${mono ? 'monospace' : 'sans-serif'}">${esc(t)}</text>`

function glass(x, y, w, h, r = 16, { border = P.glassBorder, fill = P.glass } = {}) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${border}" stroke-width="1"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#glassHi)" opacity="0.5"/>`
}

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

function stat(x, y, w, color, glyphKey, value, label) {
  const top = `<rect x="${x + 16}" y="${y}" width="${w - 32}" height="2" fill="${color}" opacity="0.5" rx="1"/>`
  return glass(x, y, w, 86) + top +
    iconChip(x + 18, y + 21, color, icon(glyphKey, color)) +
    T(x + 78, y + 40, value, { size: 24, w: 700, mono: true }) +
    T(x + 78, y + 62, label, { size: 12, fill: P.txt2 })
}

function guide(x, y, w, accent, cls, title, topic) {
  const h = 116
  return glass(x, y, w, h, 16) +
    `<rect x="${x}" y="${y}" width="${w}" height="38" rx="16" fill="${accent}" opacity="0.12"/>
     <rect x="${x}" y="${y + 22}" width="${w}" height="16" fill="${accent}" opacity="0.12"/>` +
    `<rect x="${x + 18}" y="${y + 14}" width="${Math.min(120, 8 + cls.length * 7)}" height="22" rx="11" fill="${accent}" opacity="0.18"/>` +
    T(x + 28, y + 29, cls, { size: 11, fill: accent, w: 600 }) +
    T(x + 18, y + 66, title, { size: 16, w: 700 }) +
    T(x + 18, y + 90, topic, { size: 13, fill: P.txt2 }) +
    `<g transform="translate(${x + w - 30},${y + h - 26})" stroke="${accent}" stroke-width="2" fill="none" stroke-linecap="round"><path d="M-4,-5 L1,0 L-4,5"/></g>`
}

function nav(x, y, w, glyphKey, label, active) {
  return (active ? `<rect x="${x}" y="${y}" width="${w}" height="40" rx="12" fill="${P.sky}" opacity="0.12"/>
    <rect x="${x}" y="${y + 9}" width="3" height="22" rx="2" fill="${P.sky}"/>` : '') +
    `<g transform="translate(${x + 22},${y + 20})" stroke="${active ? P.sky : P.txt2}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">${icon(glyphKey, active ? P.sky : P.txt2)}</g>` +
    T(x + 42, y + 25, label, { size: 14, fill: active ? P.txt : P.txt2, w: active ? 600 : 400 })
}

const W = 1400, H = 940
const S = 220, RP = 300, mainX = S + 56, mainW = W - S - RP - 112

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="glassHi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.10"/><stop offset="30%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
  <linearGradient id="xpfill" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${P.sky}"/><stop offset="100%" stop-color="${P.indigo}"/></linearGradient>
  <radialGradient id="aur1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${P.sky}" stop-opacity="0.11"/><stop offset="100%" stop-color="${P.sky}" stop-opacity="0"/></radialGradient>
  <radialGradient id="aur2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${P.indigo}" stop-opacity="0.11"/><stop offset="100%" stop-color="${P.indigo}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="${P.base}"/>
<ellipse cx="120" cy="40" rx="380" ry="300" fill="url(#aur1)"/>
<ellipse cx="${W - 120}" cy="${H}" rx="420" ry="320" fill="url(#aur2)"/>`

// Sidebar
svg += `<rect x="0" y="0" width="${S}" height="${H}" fill="${P.panel}"/><line x1="${S}" y1="0" x2="${S}" y2="${H}" stroke="${P.border}"/>`
svg += `<rect x="24" y="26" width="32" height="32" rx="10" fill="${P.sky}" opacity="0.15"/><g transform="translate(40,42)" fill="${P.sky}">${icon('bolt', P.sky)}</g>`
svg += T(66, 47, 'PT', { size: 18, w: 700 }) + T(92, 47, 'Study', { size: 18, w: 700, fill: P.sky })
const navs = [['target', 'Dashboard', true], ['book', 'Study Guides', false], ['book', 'Flashcards', false], ['brain', 'Quiz', false], ['flame', 'Challenge', false], ['target', 'Leaderboard', false], ['brain', 'Friends', false], ['book', 'Profile', false]]
navs.forEach((n, i) => { svg += nav(16, 90 + i * 48, S - 32, n[0], n[1], n[2]) })
svg += glass(16, H - 90, S - 32, 64, 14)
svg += `<circle cx="48" cy="${H - 58}" r="18" fill="${P.indigo}" opacity="0.9"/>` + T(48, H - 53, 'JZ', { size: 13, w: 700, anchor: 'middle' })
svg += T(76, H - 62, 'Jordan Z.', { size: 13, w: 600 }) + T(76, H - 44, 'Level 7 · Clinician', { size: 11, fill: P.txt2 })

// Main column
let y = 40
svg += T(mainX, y + 6, 'Welcome back,', { size: 26, w: 700 }) + T(mainX + 232, y + 6, 'Jordan', { size: 26, w: 700, fill: P.sky }) + T(mainX + 338, y + 6, '👋', { size: 24 })
svg += T(mainX, y + 32, 'An exam is coming up — time to lock in.', { size: 14, fill: P.txt2 })
y += 58

// XP card
svg += glass(mainX, y, mainW, 70)
svg += `<g transform="translate(${mainX + 18},${y + 26})" fill="${P.sky}">${icon('bolt', P.sky)}</g>`
svg += T(mainX + 36, y + 31, 'Level 7 — Clinician', { size: 14, w: 600 })
svg += T(mainX + mainW - 18, y + 31, '2,140 / 2,600 XP', { size: 12, fill: P.txt2, anchor: 'end', mono: true })
svg += `<rect x="${mainX + 18}" y="${y + 44}" width="${mainW - 36}" height="12" rx="6" fill="rgba(255,255,255,0.05)"/>`
svg += `<rect x="${mainX + 18}" y="${y + 44}" width="${(mainW - 36) * 0.62}" height="12" rx="6" fill="url(#xpfill)"/>`
svg += `<rect x="${mainX + 18 + (mainW - 36) * 0.42}" y="${y + 44}" width="60" height="12" rx="6" fill="#fff" opacity="0.16"/>`
y += 90

// exam banner
svg += glass(mainX, y, mainW, 76, 16, { border: 'rgba(245,158,11,0.35)' })
svg += iconChip(mainX + 18, y + 18, P.amber, icon('cal', P.amber), 44)
svg += T(mainX + 78, y + 34, 'Musculoskeletal Practical', { size: 15, w: 600 })
svg += T(mainX + 78, y + 56, 'Friday, June 19 — Shoulder, Knee, Gait', { size: 13, fill: P.txt2 })
svg += T(mainX + mainW - 30, y + 40, '4', { size: 26, w: 700, fill: P.amber, anchor: 'end', mono: true })
svg += T(mainX + mainW - 18, y + 58, 'days left', { size: 11, fill: P.txt3, anchor: 'end' })
y += 96

// stats row
const sw = (mainW - 36) / 4
svg += stat(mainX, y, sw, P.sky, 'bolt', '2,140', 'Total XP')
svg += stat(mainX + (sw + 12), y, sw, P.amber, 'flame', '7', 'Day Streak')
svg += stat(mainX + (sw + 12) * 2, y, sw, P.indigo, 'brain', '34', 'Quizzes Taken')
svg += stat(mainX + (sw + 12) * 3, y, sw, P.emerald, 'target', '88%', 'Avg Score')
y += 110

// priority topics
svg += `<g transform="translate(${mainX + 8},${y + 4})" stroke="${P.amber}" stroke-width="2" fill="none">${icon('alert', P.amber)}</g>`
svg += T(mainX + 24, y + 9, 'Exam priority topics', { size: 16, w: 700 })
y += 26
const gw = (mainW - 16) / 2
svg += guide(mainX, y, gw, P.amber, 'MSK II', 'Shoulder Complex', 'Rotator cuff · Impingement')
svg += guide(mainX + gw + 16, y, gw, P.amber, 'MSK II', 'Knee Biomechanics', 'ACL · Patellofemoral')
y += 136

// recent lectures
svg += `<g transform="translate(${mainX + 8},${y + 2})" stroke="${P.sky}" stroke-width="2" fill="none">${icon('book', P.sky)}</g>`
svg += T(mainX + 24, y + 9, 'Recent lectures', { size: 16, w: 700 })
svg += T(mainX + mainW - 18, y + 9, 'View all ›', { size: 13, fill: P.sky, anchor: 'end', w: 600 })
y += 26
svg += guide(mainX, y, gw, P.sky, 'Neuro', 'Gait Analysis', 'Phases · Deviations')
svg += guide(mainX + gw + 16, y, gw, P.indigo, 'Cardio', 'Exercise Physiology', 'VO2 · Energy systems')

// Right panel
const rx = W - RP
svg += `<rect x="${rx}" y="0" width="${RP}" height="${H}" fill="${P.panel}"/><line x1="${rx}" y1="0" x2="${rx}" y2="${H}" stroke="${P.border}"/>`
svg += T(rx + 24, 44, 'Online now', { size: 14, w: 700 })
const online = [['Maya R.', P.sky], ['Devin K.', P.indigo], ['Sara P.', P.periwinkle]]
online.forEach((o, i) => {
  const oy = 66 + i * 52
  svg += `<circle cx="${rx + 40}" cy="${oy + 16}" r="18" fill="${o[1]}" opacity="0.9"/>` + T(rx + 40, oy + 21, o[0].slice(0, 1) + o[0].split(' ')[1][0], { size: 12, w: 700, anchor: 'middle' })
  svg += `<circle cx="${rx + 54}" cy="${oy + 28}" r="5" fill="${P.emerald}" stroke="${P.panel}" stroke-width="2"/>`
  svg += T(rx + 66, oy + 14, o[0], { size: 13, w: 600 }) + T(rx + 66, oy + 30, 'Level ' + (8 - i), { size: 11, fill: P.txt2 })
})
let my = 250
svg += T(rx + 24, my, 'Messages', { size: 14, w: 700 })
my += 16
const msgs = [['Maya R.', 'gg on that quiz 🔥', 2], ['Devin K.', 'challenge me?', 0], ['Sara P.', 'sharing my notes', 1]]
msgs.forEach((m, i) => {
  const ty = my + i * 70
  svg += glass(rx + 16, ty, RP - 32, 58, 14)
  svg += `<circle cx="${rx + 44}" cy="${ty + 29}" r="16" fill="${P.indigo}" opacity="0.85"/>` + T(rx + 44, ty + 34, m[0][0] + m[0].split(' ')[1][0], { size: 11, w: 700, anchor: 'middle' })
  svg += T(rx + 68, ty + 25, m[0], { size: 13, w: 600 }) + T(rx + 68, ty + 43, m[1], { size: 12, fill: P.txt2 })
  if (m[2]) { svg += `<circle cx="${rx + RP - 32}" cy="${ty + 29}" r="10" fill="${P.sky}"/>` + T(rx + RP - 32, ty + 33, m[2], { size: 11, w: 700, anchor: 'middle', fill: P.base }) }
})

// Flex corner (idle)
svg += `<svg x="${rx - 104}" y="${H - 128}" width="92" height="110" viewBox="0 0 200 240">${flexSVG('idle', 'dash')}</svg>`

svg += `</svg>`

writeFileSync('dashboard-preview.svg', svg)
await sharp(Buffer.from(svg)).png().toFile('dashboard-preview.png')
console.log('wrote dashboard-preview.png')
