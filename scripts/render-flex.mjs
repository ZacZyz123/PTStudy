// Renders the new chrome-android Dr. Flex (static) across moods to a PNG
// contact sheet, mirroring components/mascot/Flex.tsx. Uses sharp (already a dep).
import sharp from 'sharp'
import { writeFileSync } from 'fs'

const SCRUBS = '#15151f'
const SCRUBS_DK = '#0c0c14'
const STETHO = '#7DD3FC'
const SKY = '#38BDF8'
const EYE_BRIGHT = '#FDE68A'
const EYE_AMBER = '#F59E0B'
const METAL_DARK = '#475569'

function eyes(mood, g, eg) {
  const glow = `filter="url(#${g})"`
  const arc = (d) => `<path d="${d}" stroke="${EYE_AMBER}" stroke-width="5" stroke-linecap="round" fill="none" ${glow}/>`
  switch (mood) {
    case 'happy':
    case 'waving':
      return `<g>${arc('M74 64 q9 -11 18 0')}${arc('M108 64 q9 -11 18 0')}</g>`
    case 'excited':
    case 'celebrating':
      return `<g ${glow}><ellipse cx="84" cy="61" rx="11" ry="12" fill="url(#${eg})"/><ellipse cx="116" cy="61" rx="11" ry="12" fill="url(#${eg})"/><circle cx="80" cy="56" r="2.5" fill="#fff"/><circle cx="112" cy="56" r="2.5" fill="#fff"/></g>`
    case 'thinking':
      return `<g ${glow}><ellipse cx="87" cy="57" rx="8" ry="9" fill="url(#${eg})"/><ellipse cx="119" cy="57" rx="8" ry="9" fill="url(#${eg})"/></g>`
    case 'surprised':
      return `<g ${glow}><circle cx="84" cy="61" r="11.5" fill="url(#${eg})"/><circle cx="116" cy="61" r="11.5" fill="url(#${eg})"/></g>`
    case 'focused':
      return `<g ${glow}><ellipse cx="84" cy="62" rx="10" ry="4.5" fill="url(#${eg})"/><ellipse cx="116" cy="62" rx="10" ry="4.5" fill="url(#${eg})"/></g>`
    default: // idle
      return `<g ${glow}><ellipse cx="84" cy="61" rx="9" ry="10" fill="url(#${eg})"/><ellipse cx="116" cy="61" rx="9" ry="10" fill="url(#${eg})"/><circle cx="81" cy="57" r="2" fill="#fff" opacity="0.85"/><circle cx="113" cy="57" r="2" fill="#fff" opacity="0.85"/></g>`
  }
}

function mouth(mood, g) {
  const glow = `filter="url(#${g})"`
  const line = (d) => `<path d="${d}" stroke="${EYE_AMBER}" stroke-width="4" fill="none" stroke-linecap="round" ${glow}/>`
  switch (mood) {
    case 'happy':
    case 'waving':
      return line('M80 80 q20 16 40 0')
    case 'excited':
    case 'celebrating':
      return `<g ${glow}><path d="M80 78 q20 24 40 0 z" fill="${EYE_AMBER}" opacity="0.9"/><path d="M80 78 q20 24 40 0" stroke="${EYE_BRIGHT}" stroke-width="3" fill="none"/></g>`
    case 'thinking':
      return line('M88 86 q8 -4 16 2')
    case 'surprised':
      return `<g ${glow}><ellipse cx="100" cy="86" rx="8" ry="10" fill="${EYE_AMBER}" opacity="0.85"/></g>`
    case 'focused':
      return line('M86 86 h28')
    default:
      return line('M84 82 q16 11 32 0')
  }
}

function limb(x1, y1, x2, y2, ag) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  return `<g><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#${ag})" stroke-width="16" stroke-linecap="round"/><circle cx="${mx}" cy="${my}" r="5" fill="#64748B" stroke="#334155" stroke-width="1.5"/></g>`
}
function hand(cx, cy, ag) {
  return `<circle cx="${cx}" cy="${cy}" r="9" fill="url(#${ag})" stroke="#334155" stroke-width="1.5"/>`
}
function arms(mood, ag) {
  switch (mood) {
    case 'celebrating':
    case 'excited':
      return `<g>${limb(68,124,38,88,ag)}${hand(36,84,ag)}${limb(132,124,162,88,ag)}${hand(164,84,ag)}</g>`
    case 'thinking':
      return `<g>${limb(66,126,52,170,ag)}${hand(51,176,ag)}${limb(134,126,122,102,ag)}${hand(120,97,ag)}</g>`
    case 'surprised':
      return `<g>${limb(68,124,70,100,ag)}${hand(70,95,ag)}${limb(132,124,130,100,ag)}${hand(130,95,ag)}</g>`
    case 'waving':
      return `<g>${limb(66,126,52,170,ag)}${hand(51,176,ag)}${limb(132,122,160,88,ag)}${hand(162,83,ag)}</g>`
    default:
      return `<g>${limb(64,126,50,168,ag)}${hand(49,174,ag)}${limb(136,126,150,168,ag)}${hand(151,174,ag)}</g>`
  }
}

function flexSvg(mood, i) {
  const hg = `hg${i}`, eg = `eg${i}`, ag = `ag${i}`, g = `gl${i}`, ag2 = `an${i}`
  const lit = ['excited', 'celebrating', 'happy'].includes(mood)
  return `
  <defs>
    <radialGradient id="${hg}" cx="38%" cy="28%" r="80%">
      <stop offset="0%" stop-color="#F8FAFC"/><stop offset="45%" stop-color="#CBD5E1"/>
      <stop offset="80%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/>
    </radialGradient>
    <radialGradient id="${eg}" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#FFFDF5"/><stop offset="35%" stop-color="${EYE_BRIGHT}"/><stop offset="100%" stop-color="${EYE_AMBER}"/>
    </radialGradient>
    <linearGradient id="${ag}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E2E8F0"/><stop offset="50%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
    <filter id="${g}" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="0" stdDeviation="3.2" flood-color="${EYE_AMBER}" flood-opacity="0.85"/>
    </filter>
    <filter id="${ag2}" x="-150%" y="-150%" width="400%" height="400%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${EYE_AMBER}" flood-opacity="0.9"/>
    </filter>
  </defs>
  ${arms(mood, ag)}
  <rect x="52" y="104" width="96" height="100" rx="44" fill="${SCRUBS}"/>
  <path d="M84 106 L100 124 L116 106" stroke="${SCRUBS_DK}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="58" cy="120" rx="14" ry="16" fill="${SCRUBS_DK}"/>
  <ellipse cx="142" cy="120" rx="14" ry="16" fill="${SCRUBS_DK}"/>
  <rect x="66" y="196" width="30" height="16" rx="8" fill="#fff"/>
  <rect x="104" y="196" width="30" height="16" rx="8" fill="#fff"/>
  <rect x="66" y="206" width="30" height="6" rx="3" fill="#CBD5E1"/>
  <rect x="104" y="206" width="30" height="6" rx="3" fill="#CBD5E1"/>
  <path d="M76 112 q24 22 48 0" stroke="${STETHO}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M76 112 q-4 14 2 26" stroke="${STETHO}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="80" cy="142" r="7" fill="${STETHO}"/><circle cx="80" cy="142" r="4" fill="#38BDF8"/>
  <rect x="104" y="132" width="34" height="18" rx="5" fill="#0F1829" stroke="${SKY}" stroke-width="1.5"/>
  <text x="121" y="145" text-anchor="middle" font-size="11" font-weight="bold" fill="${SKY}" font-family="sans-serif">DPT</text>
  <g>
    <line x1="100" y1="26" x2="100" y2="14" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>
    <circle cx="100" cy="11" r="4.5" fill="${lit ? EYE_AMBER : '#94A3B8'}" ${lit ? `filter="url(#${ag2})"` : ''}/>
    <rect x="44" y="58" width="12" height="26" rx="6" fill="#94A3B8" stroke="#475569" stroke-width="1.5"/>
    <rect x="144" y="58" width="12" height="26" rx="6" fill="#94A3B8" stroke="#475569" stroke-width="1.5"/>
    <ellipse cx="100" cy="68" rx="48" ry="50" fill="url(#${hg})" stroke="#475569" stroke-width="2"/>
    <ellipse cx="86" cy="44" rx="20" ry="12" fill="#fff" opacity="0.35"/>
    <rect x="62" y="48" width="76" height="34" rx="17" fill="#0B1220" opacity="0.28"/>
    ${eyes(mood, g, eg)}
    ${mouth(mood, g)}
    <circle cx="62" cy="88" r="2.2" fill="#64748B"/><circle cx="138" cy="88" r="2.2" fill="#64748B"/>
  </g>`
}

const moods = ['idle', 'happy', 'excited', 'thinking', 'surprised', 'waving']
const cellW = 220, cellH = 280, cols = 3, rows = 2
const W = cellW * cols, H = cellH * rows + 60

let cells = ''
moods.forEach((mood, i) => {
  const cx = (i % cols) * cellW
  const cy = Math.floor(i / cols) * cellH + 50
  cells += `<g transform="translate(${cx},${cy})">
    <svg x="${(cellW - 180) / 2}" y="10" width="180" height="216" viewBox="0 0 200 240">${flexSvg(mood, i)}</svg>
    <text x="${cellW / 2}" y="250" text-anchor="middle" font-size="15" font-weight="600" fill="#94A3B8" font-family="sans-serif">${mood}</text>
  </g>`
})

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#080D18"/>
  <text x="${W / 2}" y="34" text-anchor="middle" font-size="20" font-weight="700" fill="#38BDF8" font-family="sans-serif">Dr. Flex — chrome android mascot</text>
  ${cells}
</svg>`

writeFileSync('flex-preview.svg', svg)
await sharp(Buffer.from(svg)).png().toFile('flex-preview.png')
console.log('wrote flex-preview.png')
