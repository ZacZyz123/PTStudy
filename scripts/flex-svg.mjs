// Shared static-SVG builder for Dr. Flex + the app palette. Mirrors
// components/mascot/Flex.tsx and app/globals.css so the offline screenshots
// (flex / dashboard / landing) faithfully represent the real app.

export const P = {
  base: '#0C1322', panel: '#0F1828', card: '#141E33',
  sky: '#38BDF8', indigo: '#6366F1', periwinkle: '#818CF8',
  emerald: '#10B981', amber: '#F59E0B', red: '#EF4444',
  txt: '#F1F5F9', txt2: '#A6B4C6', txt3: '#64748B',
  glass: 'rgba(255,255,255,0.04)', border: 'rgba(148,163,184,0.14)',
  glassBorder: 'rgba(255,255,255,0.10)',
}

const STETHO = '#67E8F9'
const SKY = '#38BDF8'
const EYE_BRIGHT = '#BAE6FD'
const EYE_CORE = '#38BDF8'
const COLLAR = '#2B3344'
const SOLE = '#CBD5E1'

function eyes(mood, g, eg) {
  const glow = `filter="url(#${g})"`
  const arc = (d) => `<path d="${d}" stroke="${EYE_BRIGHT}" stroke-width="5" stroke-linecap="round" fill="none" ${glow}/>`
  switch (mood) {
    case 'happy':
    case 'waving':
      return `<g>${arc('M74 64 q9 -11 18 0')}${arc('M108 64 q9 -11 18 0')}</g>`
    case 'excited':
    case 'celebrating':
      return `<g ${glow}><ellipse cx="84" cy="61" rx="11" ry="12" fill="url(#${eg})"/><ellipse cx="116" cy="61" rx="11" ry="12" fill="url(#${eg})"/><circle cx="80" cy="56" r="2.5" fill="#fff"/><circle cx="112" cy="56" r="2.5" fill="#fff"/></g>`
    case 'thinking':
      return `<g ${glow}><ellipse cx="87" cy="57" rx="8" ry="9" fill="url(#${eg})"/><ellipse cx="119" cy="57" rx="8" ry="9" fill="url(#${eg})"/></g>`
    case 'sad':
      return `<g>${arc('M74 60 q9 9 18 2')}${arc('M108 62 q9 7 18 -2')}<circle cx="84" cy="80" r="3" fill="${STETHO}"/></g>`
    case 'surprised':
      return `<g ${glow}><circle cx="84" cy="61" r="11.5" fill="url(#${eg})"/><circle cx="116" cy="61" r="11.5" fill="url(#${eg})"/></g>`
    case 'focused':
      return `<g ${glow}><ellipse cx="84" cy="62" rx="10" ry="4.5" fill="url(#${eg})"/><ellipse cx="116" cy="62" rx="10" ry="4.5" fill="url(#${eg})"/></g>`
    case 'sleeping':
      return `<g opacity="0.5" ${glow}>${arc('M74 63 q9 4 18 0')}${arc('M108 63 q9 4 18 0')}</g>`
    default: // idle
      return `<g ${glow}><ellipse cx="84" cy="61" rx="9" ry="10" fill="url(#${eg})"/><ellipse cx="116" cy="61" rx="9" ry="10" fill="url(#${eg})"/><circle cx="81" cy="57" r="2" fill="#fff" opacity="0.85"/><circle cx="113" cy="57" r="2" fill="#fff" opacity="0.85"/></g>`
  }
}

function brows(mood) {
  const b = `stroke="#7DD3FC" stroke-width="3.5" stroke-linecap="round" opacity="0.55"`
  switch (mood) {
    case 'thinking':
      return `<g ${b}><line x1="75" y1="45" x2="93" y2="42"/><line x1="108" y1="47" x2="125" y2="47"/></g>`
    case 'focused':
      return `<g ${b}><line x1="75" y1="45" x2="93" y2="51"/><line x1="108" y1="51" x2="126" y2="45"/></g>`
    case 'sad':
      return `<g ${b}><line x1="75" y1="50" x2="93" y2="45"/><line x1="108" y1="45" x2="126" y2="50"/></g>`
    case 'surprised':
      return `<g ${b}><line x1="76" y1="41" x2="93" y2="41"/><line x1="108" y1="41" x2="125" y2="41"/></g>`
    default:
      return ''
  }
}

function mouth(mood, g) {
  const glow = `filter="url(#${g})"`
  const line = (d) => `<path d="${d}" stroke="${EYE_BRIGHT}" stroke-width="4" fill="none" stroke-linecap="round" ${glow}/>`
  switch (mood) {
    case 'happy':
    case 'waving':
      return `<g>${line('M80 80 q20 16 40 0')}<g stroke="#0B0E16" stroke-width="2" opacity="0.5"><line x1="92" y1="84" x2="92" y2="90"/><line x1="100" y1="86" x2="100" y2="92"/><line x1="108" y1="84" x2="108" y2="90"/></g></g>`
    case 'excited':
    case 'celebrating':
      return `<g ${glow}><path d="M80 78 q20 24 40 0 z" fill="${EYE_CORE}" opacity="0.9"/><path d="M80 78 q20 24 40 0" stroke="${EYE_BRIGHT}" stroke-width="3" fill="none"/></g>`
    case 'thinking':
      return line('M88 86 q8 -4 16 2')
    case 'sad':
      return line('M84 90 q16 -12 32 0')
    case 'surprised':
      return `<g ${glow}><ellipse cx="100" cy="86" rx="8" ry="10" fill="${EYE_CORE}" opacity="0.85"/></g>`
    case 'focused':
      return line('M86 86 h28')
    case 'sleeping':
      return line('M92 86 q8 5 16 0')
    default:
      return line('M84 82 q16 11 32 0')
  }
}

function limb(x1, y1, x2, y2, ag) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  return `<g>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#05070C" stroke-width="17" stroke-linecap="round" opacity="0.3"/>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#${ag})" stroke-width="14" stroke-linecap="round"/>
    <line x1="${x1}" y1="${y1}" x2="${mx}" y2="${my}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.25"/>
    <circle cx="${mx}" cy="${my}" r="4.5" fill="#64748B" stroke="#334155" stroke-width="1.2"/></g>`
}
function hand(cx, cy, ag) {
  return `<g><circle cx="${cx}" cy="${cy}" r="9" fill="url(#${ag})" stroke="#334155" stroke-width="1.2"/><circle cx="${cx - 2.5}" cy="${cy - 2.5}" r="2.6" fill="#fff" opacity="0.4"/></g>`
}
function arms(mood, ag) {
  switch (mood) {
    case 'celebrating':
    case 'excited':
      return `<g>${limb(68, 124, 38, 88, ag)}${hand(36, 84, ag)}${limb(132, 124, 162, 88, ag)}${hand(164, 84, ag)}</g>`
    case 'thinking':
      return `<g>${limb(66, 126, 52, 170, ag)}${hand(51, 176, ag)}${limb(134, 126, 122, 102, ag)}${hand(120, 97, ag)}</g>`
    case 'surprised':
      return `<g>${limb(68, 124, 70, 100, ag)}${hand(70, 95, ag)}${limb(132, 124, 130, 100, ag)}${hand(130, 95, ag)}</g>`
    case 'waving':
      return `<g>${limb(66, 126, 52, 170, ag)}${hand(51, 176, ag)}${limb(132, 122, 160, 88, ag)}${hand(162, 83, ag)}</g>`
    case 'sad':
      return `<g>${limb(64, 128, 58, 176, ag)}${hand(57, 182, ag)}${limb(136, 128, 142, 176, ag)}${hand(143, 182, ag)}</g>`
    default:
      return `<g>${limb(64, 126, 50, 168, ag)}${hand(49, 174, ag)}${limb(136, 126, 150, 168, ag)}${hand(151, 174, ag)}</g>`
  }
}

// Returns inner SVG markup, drop inside <svg viewBox="0 0 200 240">…</svg>
export function flexSVG(mood, uid = '0') {
  const hg = `fh${uid}`, eg = `fe${uid}`, ag = `fa${uid}`, g = `fg${uid}`, an = `fan${uid}`
  const sg = `fs${uid}`, sd = `fsd${uid}`, vg = `fv${uid}`
  const lit = ['excited', 'celebrating', 'happy'].includes(mood)
  const tilt = mood === 'sleeping' ? 'transform="rotate(8 100 70)"' : ''
  return `
  <defs>
    <radialGradient id="${hg}" cx="38%" cy="26%" r="82%"><stop offset="0%" stop-color="#fff"/><stop offset="42%" stop-color="#D5DEE9"/><stop offset="78%" stop-color="#9AA9BC"/><stop offset="100%" stop-color="#5B6B80"/></radialGradient>
    <radialGradient id="${eg}" cx="50%" cy="38%" r="68%"><stop offset="0%" stop-color="#fff"/><stop offset="40%" stop-color="${EYE_BRIGHT}"/><stop offset="100%" stop-color="${EYE_CORE}"/></radialGradient>
    <linearGradient id="${ag}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8EEF5"/><stop offset="45%" stop-color="#9FB0C3"/><stop offset="100%" stop-color="#5B6B80"/></linearGradient>
    <linearGradient id="${sg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2A3140"/><stop offset="50%" stop-color="#171C28"/><stop offset="100%" stop-color="#0B0E16"/></linearGradient>
    <linearGradient id="${sd}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1B212E"/><stop offset="100%" stop-color="#080A11"/></linearGradient>
    <linearGradient id="${vg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#13243E"/><stop offset="50%" stop-color="#0A1525"/><stop offset="100%" stop-color="#05080F"/></linearGradient>
    <filter id="${g}" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${EYE_CORE}" flood-opacity="0.8"/></filter>
    <filter id="${an}" x="-150%" y="-150%" width="400%" height="400%"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${SKY}" flood-opacity="0.9"/></filter>
  </defs>
  ${arms(mood, ag)}

  <rect x="77" y="196" width="17" height="18" rx="7" fill="url(#${sd})"/>
  <rect x="106" y="196" width="17" height="18" rx="7" fill="url(#${sd})"/>
  <rect x="68" y="210" width="32" height="16" rx="7" fill="#F8FAFC"/>
  <rect x="104" y="210" width="32" height="16" rx="7" fill="#F8FAFC"/>
  <rect x="68" y="221" width="32" height="6" rx="3" fill="${SOLE}"/>
  <rect x="104" y="221" width="32" height="6" rx="3" fill="${SOLE}"/>
  <path d="M75 215 l11 3" stroke="${SKY}" stroke-width="2" stroke-linecap="round"/>
  <path d="M111 215 l11 3" stroke="${SKY}" stroke-width="2" stroke-linecap="round"/>

  <path d="M60 120 Q40 124 40 145 Q40 157 55 156 L67 149 Q60 132 71 122 Z" fill="url(#${sd})"/>
  <path d="M140 120 Q160 124 160 145 Q160 157 145 156 L133 149 Q140 132 129 122 Z" fill="url(#${sd})"/>
  <path d="M44 150 Q50 156 60 152" stroke="#000" stroke-width="1.5" fill="none" opacity="0.4"/>
  <path d="M156 150 Q150 156 140 152" stroke="#000" stroke-width="1.5" fill="none" opacity="0.4"/>

  <path d="M58 124 Q66 116 78 115 Q100 112 122 115 Q134 116 142 124 L149 190 Q149 208 130 208 L70 208 Q51 208 51 190 Z" fill="url(#${sg})" stroke="#05070C" stroke-width="1"/>
  <path d="M58 124 L51 190 Q51 201 59 206 L63 150 Z" fill="#000" opacity="0.2"/>
  <path d="M142 124 L149 190 Q149 201 141 206 L137 150 Z" fill="#000" opacity="0.2"/>
  <path d="M72 150 Q90 168 78 198" stroke="#000" stroke-width="2" fill="none" opacity="0.18" stroke-linecap="round"/>
  <path d="M128 150 Q110 168 122 198" stroke="#000" stroke-width="2" fill="none" opacity="0.18" stroke-linecap="round"/>
  <line x1="100" y1="140" x2="100" y2="204" stroke="#000" stroke-width="1.5" opacity="0.25"/>

  <path d="M86 116 L100 141 L114 116 Q100 121 86 116 Z" fill="url(#${sd})"/>
  <path d="M85 116 L100 140" stroke="${COLLAR}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M115 116 L100 140" stroke="${COLLAR}" stroke-width="2.5" fill="none" stroke-linecap="round"/>

  <path d="M62 168 h22 v16 q0 3 -3 3 h-16 q-3 0 -3 -3 Z" fill="none" stroke="${COLLAR}" stroke-width="1.5"/>
  <line x1="62" y1="172" x2="84" y2="172" stroke="${COLLAR}" stroke-width="1.5"/>

  <path d="M82 118 Q72 150 96 170" stroke="${STETHO}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M118 118 Q128 150 104 170" stroke="${STETHO}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <circle cx="100" cy="174" r="7" fill="${STETHO}"/><circle cx="100" cy="174" r="3.5" fill="#0A1525"/>

  <rect x="108" y="150" width="30" height="16" rx="5" fill="#0A1525" stroke="${SKY}" stroke-width="1.4"/>
  <text x="123" y="162" text-anchor="middle" font-size="10" font-weight="bold" fill="${SKY}" font-family="sans-serif">DPT</text>

  <g ${tilt}>
    <line x1="100" y1="28" x2="100" y2="15" stroke="#7C8BA3" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="100" cy="12" r="4" fill="${lit ? SKY : '#9FB0C3'}" ${lit ? `filter="url(#${an})"` : ''}/>
    <rect x="43" y="56" width="12" height="28" rx="6" fill="#8696AC" stroke="#475569" stroke-width="1.2"/>
    <rect x="145" y="56" width="12" height="28" rx="6" fill="#8696AC" stroke="#475569" stroke-width="1.2"/>
    <circle cx="49" cy="70" r="2" fill="#475569"/><circle cx="151" cy="70" r="2" fill="#475569"/>
    <ellipse cx="100" cy="68" rx="48" ry="50" fill="url(#${hg})" stroke="#3E4A5C" stroke-width="2"/>
    <ellipse cx="84" cy="42" rx="22" ry="12" fill="#fff" opacity="0.45"/>
    <ellipse cx="120" cy="50" rx="6" ry="11" fill="#fff" opacity="0.15"/>
    <path d="M147 80 A48 50 0 0 1 116 115" stroke="${SKY}" stroke-width="2.5" fill="none" opacity="0.45" stroke-linecap="round"/>
    <line x1="100" y1="19" x2="100" y2="40" stroke="#9FB0C3" stroke-width="1.5" opacity="0.6"/>
    <path d="M60 62 Q57 82 68 98" stroke="#94A3B8" stroke-width="1" fill="none" opacity="0.35"/>
    <rect x="60" y="46" width="80" height="36" rx="18" fill="url(#${vg})" stroke="#0A1626" stroke-width="1.5"/>
    <path d="M68 52 Q100 46 132 52" stroke="#fff" stroke-width="3" opacity="0.12" fill="none" stroke-linecap="round"/>
    <path d="M70 80 Q100 86 130 80" stroke="${SKY}" stroke-width="1.5" opacity="0.4" fill="none" stroke-linecap="round"/>
    ${brows(mood)}
    ${eyes(mood, g, eg)}
    ${mouth(mood, g)}
    <circle cx="62" cy="92" r="1.8" fill="#64748B"/><circle cx="138" cy="92" r="1.8" fill="#64748B"/>
  </g>`
}
