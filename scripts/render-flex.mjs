// Renders Dr. Flex (static) across moods to a PNG contact sheet, mirroring
// components/mascot/Flex.tsx via the shared builder. Uses sharp (already a dep).
import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { flexSVG, P } from './flex-svg.mjs'

const moods = ['idle', 'happy', 'excited', 'thinking', 'focused', 'celebrating', 'surprised', 'sad', 'sleeping']
const cellW = 220, cellH = 280, cols = 3
const rows = Math.ceil(moods.length / cols)
const W = cellW * cols, H = cellH * rows + 60

let cells = ''
moods.forEach((mood, i) => {
  const cx = (i % cols) * cellW
  const cy = Math.floor(i / cols) * cellH + 50
  cells += `<g transform="translate(${cx},${cy})">
    <svg x="${(cellW - 180) / 2}" y="10" width="180" height="216" viewBox="0 0 200 240">${flexSVG(mood, i)}</svg>
    <text x="${cellW / 2}" y="250" text-anchor="middle" font-size="15" font-weight="600" fill="${P.txt2}" font-family="sans-serif">${mood}</text>
  </g>`
})

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${P.base}"/>
  <text x="${W / 2}" y="34" text-anchor="middle" font-size="20" font-weight="700" fill="${P.sky}" font-family="sans-serif">Dr. Flex — android mascot in black scrubs</text>
  ${cells}
</svg>`

writeFileSync('flex-preview.svg', svg)
await sharp(Buffer.from(svg)).png().toFile('flex-preview.png')
console.log('wrote flex-preview.png')
