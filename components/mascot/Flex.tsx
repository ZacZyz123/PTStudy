'use client'

import { useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type FlexMood =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'sad'
  | 'celebrating'
  | 'focused'
  | 'surprised'
  | 'waving'
  | 'sleeping'

export interface FlexProps {
  mood: FlexMood
  size?: number
  animate?: boolean
  speechBubble?: string
  onClick?: () => void
  className?: string
}

/* ---------- palette ---------- */
const STETHO = '#67E8F9' // light-cyan stethoscope
const SKY = '#38BDF8'
const EYE_BRIGHT = '#BAE6FD'
const EYE_CORE = '#38BDF8' // calm cyan eyes (controlled, professional)
const METAL_DARK = '#475569'
const COLLAR = '#2B3344' // scrub seam / collar trim
const SOLE = '#CBD5E1'

/* ---------- per-mood body animation for the whole character ---------- */
function bodyAnimation(mood: FlexMood, animate: boolean) {
  if (!animate) return {}
  switch (mood) {
    case 'idle':
      return { animate: { y: [0, -4, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
    case 'happy':
      return { animate: { y: [0, -6, 0] }, transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } }
    case 'excited':
    case 'celebrating':
      return {
        animate: { y: [0, -14, 0], rotate: [0, -2, 2, 0] },
        transition: { duration: 0.7, repeat: Infinity, ease: 'easeOut' },
      }
    case 'thinking':
      return { animate: { rotate: [0, 1.5, 0, -1.5, 0] }, transition: { duration: 4, repeat: Infinity } }
    case 'sad':
      return { animate: { rotate: [-2, -2], y: [0, 2, 0] }, transition: { duration: 3, repeat: Infinity } }
    case 'focused':
      return { animate: { x: [0, 1, 0] }, transition: { duration: 2, repeat: Infinity } }
    case 'surprised':
      return { animate: { scale: [1, 1.04, 1] }, transition: { duration: 0.5, repeat: Infinity } }
    case 'waving':
      return { animate: { rotate: [0, 2, 0, -2, 0] }, transition: { duration: 1.6, repeat: Infinity } }
    case 'sleeping':
      return { animate: { y: [0, 2, 0] }, transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }
    default:
      return {}
  }
}

/* ---------- glowing eyes ---------- */
function Eyes({ mood, glowId, eyeGradId }: { mood: FlexMood; glowId: string; eyeGradId: string }) {
  const fill = `url(#${eyeGradId})`
  const glow = { filter: `url(#${glowId})` }

  const arc = (d: string) => (
    <path d={d} stroke={EYE_BRIGHT} strokeWidth={5} strokeLinecap="round" fill="none" style={glow} />
  )

  switch (mood) {
    case 'happy':
    case 'waving':
      return (
        <g>
          {arc('M74 64 q9 -11 18 0')}
          {arc('M108 64 q9 -11 18 0')}
        </g>
      )
    case 'excited':
    case 'celebrating':
      return (
        <g style={glow}>
          <ellipse cx={84} cy={61} rx={11} ry={12} fill={fill} />
          <ellipse cx={116} cy={61} rx={11} ry={12} fill={fill} />
          <circle cx={80} cy={56} r={2.5} fill="#FFFFFF" />
          <circle cx={112} cy={56} r={2.5} fill="#FFFFFF" />
        </g>
      )
    case 'thinking':
      return (
        <g style={glow}>
          <ellipse cx={87} cy={57} rx={8} ry={9} fill={fill} />
          <ellipse cx={119} cy={57} rx={8} ry={9} fill={fill} />
        </g>
      )
    case 'sad':
      return (
        <g>
          {arc('M74 60 q9 9 18 2')}
          {arc('M108 62 q9 7 18 -2')}
          <motion.circle
            cx={84}
            cy={74}
            r={3}
            fill={STETHO}
            animate={{ cy: [74, 86], opacity: [0.9, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeIn' }}
          />
        </g>
      )
    case 'focused':
      return (
        <g style={glow}>
          <ellipse cx={84} cy={62} rx={10} ry={4.5} fill={fill} />
          <ellipse cx={116} cy={62} rx={10} ry={4.5} fill={fill} />
        </g>
      )
    case 'surprised':
      return (
        <g style={glow}>
          <circle cx={84} cy={61} r={11.5} fill={fill} />
          <circle cx={116} cy={61} r={11.5} fill={fill} />
        </g>
      )
    case 'sleeping':
      return (
        <g opacity={0.5} style={glow}>
          {arc('M74 63 q9 4 18 0')}
          {arc('M108 63 q9 4 18 0')}
        </g>
      )
    case 'idle':
    default:
      return (
        <motion.g
          style={glow}
          animate={{ opacity: [1, 0.78, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx={84} cy={61} rx={9} ry={10} fill={fill} />
          <ellipse cx={116} cy={61} rx={9} ry={10} fill={fill} />
          <circle cx={81} cy={57} r={2} fill="#FFFFFF" opacity={0.85} />
          <circle cx={113} cy={57} r={2} fill="#FFFFFF" opacity={0.85} />
        </motion.g>
      )
  }
}

/* ---------- brow plates (subtle expression on the visor) ---------- */
function Brows({ mood }: { mood: FlexMood }) {
  const base = { stroke: '#7DD3FC', strokeWidth: 3.5, strokeLinecap: 'round' as const, opacity: 0.55 }
  switch (mood) {
    case 'thinking':
      return (
        <g {...base}>
          <line x1={75} y1={45} x2={93} y2={42} />
          <line x1={108} y1={47} x2={125} y2={47} />
        </g>
      )
    case 'focused':
      return (
        <g {...base}>
          <line x1={75} y1={45} x2={93} y2={51} />
          <line x1={108} y1={51} x2={126} y2={45} />
        </g>
      )
    case 'sad':
      return (
        <g {...base}>
          <line x1={75} y1={50} x2={93} y2={45} />
          <line x1={108} y1={45} x2={126} y2={50} />
        </g>
      )
    case 'surprised':
      return (
        <g {...base}>
          <line x1={76} y1={41} x2={93} y2={41} />
          <line x1={108} y1={41} x2={125} y2={41} />
        </g>
      )
    default:
      return null
  }
}

/* ---------- glowing grille mouth ---------- */
function Mouth({ mood, glowId }: { mood: FlexMood; glowId: string }) {
  const glow = { filter: `url(#${glowId})` }
  const line = (d: string) => (
    <path d={d} stroke={EYE_BRIGHT} strokeWidth={4} fill="none" strokeLinecap="round" style={glow} />
  )

  switch (mood) {
    case 'happy':
    case 'waving':
      return (
        <g>
          {line('M80 80 q20 16 40 0')}
          <g stroke="#0B0E16" strokeWidth={2} opacity={0.5}>
            <line x1={92} y1={84} x2={92} y2={90} />
            <line x1={100} y1={86} x2={100} y2={92} />
            <line x1={108} y1={84} x2={108} y2={90} />
          </g>
        </g>
      )
    case 'excited':
    case 'celebrating':
      return (
        <g style={glow}>
          <path d="M80 78 q20 24 40 0 z" fill={EYE_CORE} opacity={0.9} />
          <path d="M80 78 q20 24 40 0" stroke={EYE_BRIGHT} strokeWidth={3} fill="none" />
        </g>
      )
    case 'thinking':
      return line('M88 86 q8 -4 16 2')
    case 'sad':
      return line('M84 90 q16 -12 32 0')
    case 'focused':
      return line('M86 86 h28')
    case 'surprised':
      return (
        <g style={glow}>
          <ellipse cx={100} cy={86} rx={8} ry={10} fill={EYE_CORE} opacity={0.85} />
        </g>
      )
    case 'sleeping':
      return line('M92 86 q8 5 16 0')
    case 'idle':
    default:
      return line('M84 82 q16 11 32 0')
  }
}

/* ---------- robotic arms (tapered, two-tone, less clip-art) ---------- */
function Limb({
  x1,
  y1,
  x2,
  y2,
  gradId,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  gradId: string
}) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <g>
      {/* soft cast shadow */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#05070C" strokeWidth={17} strokeLinecap="round" opacity={0.3} />
      {/* brushed-metal shaft */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={`url(#${gradId})`} strokeWidth={14} strokeLinecap="round" />
      {/* specular highlight */}
      <line x1={x1} y1={y1} x2={mx} y2={my} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.25} />
      {/* elbow servo */}
      <circle cx={mx} cy={my} r={4.5} fill="#64748B" stroke="#334155" strokeWidth={1.2} />
    </g>
  )
}

function Hand({ cx, cy, gradId }: { cx: number; cy: number; gradId: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill={`url(#${gradId})`} stroke="#334155" strokeWidth={1.2} />
      <circle cx={cx - 2.5} cy={cy - 2.5} r={2.6} fill="#FFFFFF" opacity={0.4} />
    </g>
  )
}

/* short scrub sleeve that rides the shoulder end of an arm, so it always
   follows the limb direction (incl. the animated wave) */
function SleeveCap({ x1, y1, x2, y2, scrubId }: { x1: number; y1: number; x2: number; y2: number; scrubId: string }) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const ex = x1 + ux * 25
  const ey = y1 + uy * 25
  const px = -uy
  const py = ux
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={`url(#${scrubId})`} strokeWidth={22} strokeLinecap="round" />
      <line x1={ex + px * 9} y1={ey + py * 9} x2={ex - px * 9} y2={ey - py * 9} stroke="#000" strokeWidth={1.5} opacity={0.35} strokeLinecap="round" />
    </g>
  )
}

interface ArmSpec {
  x1: number
  y1: number
  x2: number
  y2: number
  hx: number
  hy: number
}

function ArmUnit({ x1, y1, x2, y2, hx, hy, gradId, scrubId }: ArmSpec & { gradId: string; scrubId: string }) {
  return (
    <g>
      <Limb x1={x1} y1={y1} x2={x2} y2={y2} gradId={gradId} />
      <Hand cx={hx} cy={hy} gradId={gradId} />
      <SleeveCap x1={x1} y1={y1} x2={x2} y2={y2} scrubId={scrubId} />
    </g>
  )
}

function Arms({ mood, gradId, scrubId }: { mood: FlexMood; gradId: string; scrubId: string }) {
  const A = (s: ArmSpec) => <ArmUnit {...s} gradId={gradId} scrubId={scrubId} />
  switch (mood) {
    case 'celebrating':
    case 'excited':
      return (
        <g>
          {A({ x1: 68, y1: 124, x2: 38, y2: 88, hx: 36, hy: 84 })}
          {A({ x1: 132, y1: 124, x2: 162, y2: 88, hx: 164, hy: 84 })}
        </g>
      )
    case 'thinking':
      return (
        <g>
          {A({ x1: 66, y1: 126, x2: 52, y2: 170, hx: 51, hy: 176 })}
          {A({ x1: 134, y1: 126, x2: 122, y2: 102, hx: 120, hy: 97 })}
        </g>
      )
    case 'waving':
      return (
        <g>
          {A({ x1: 66, y1: 126, x2: 52, y2: 170, hx: 51, hy: 176 })}
          <motion.g
            animate={{ rotate: [0, 18, 0, 18, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '132px', originY: '122px' }}
          >
            {A({ x1: 132, y1: 122, x2: 160, y2: 88, hx: 162, hy: 83 })}
          </motion.g>
        </g>
      )
    case 'surprised':
      return (
        <g>
          {A({ x1: 68, y1: 124, x2: 70, y2: 100, hx: 70, hy: 95 })}
          {A({ x1: 132, y1: 124, x2: 130, y2: 100, hx: 130, hy: 95 })}
        </g>
      )
    case 'sad':
      return (
        <g>
          {A({ x1: 64, y1: 128, x2: 58, y2: 176, hx: 57, hy: 182 })}
          {A({ x1: 136, y1: 128, x2: 142, y2: 176, hx: 143, hy: 182 })}
        </g>
      )
    case 'focused':
    default:
      return (
        <g>
          {A({ x1: 64, y1: 126, x2: 50, y2: 168, hx: 49, hy: 174 })}
          {A({ x1: 136, y1: 126, x2: 150, y2: 168, hx: 151, hy: 174 })}
        </g>
      )
  }
}

/* ---------- mood extras: confetti, z's ---------- */
function Extras({ mood }: { mood: FlexMood }) {
  if (mood === 'celebrating') {
    const confetti = [
      { x: 30, y: 30, c: '#38BDF8' },
      { x: 170, y: 26, c: '#6366F1' },
      { x: 20, y: 80, c: '#22D3EE' },
      { x: 180, y: 70, c: '#10B981' },
      { x: 50, y: 14, c: '#818CF8' },
      { x: 150, y: 10, c: '#38BDF8' },
    ]
    return (
      <g>
        {confetti.map((p, i) => (
          <motion.rect
            key={i}
            x={p.x}
            y={p.y}
            width={7}
            height={7}
            rx={2}
            fill={p.c}
            animate={{ y: [0, 14, 0], rotate: [0, 180, 360], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.4 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </g>
    )
  }
  if (mood === 'sleeping') {
    return (
      <g fill={SKY} fontFamily="monospace" fontWeight="bold">
        {[0, 1, 2].map((i) => (
          <motion.text
            key={i}
            x={140 + i * 14}
            y={50 - i * 12}
            fontSize={14 + i * 4}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-2, -10] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7 }}
          >
            z
          </motion.text>
        ))}
      </g>
    )
  }
  return null
}

/**
 * Flex — the PT Study mascot. A sleek android in fitted black medical scrubs:
 * brushed-chrome head with a dark glass visor + glowing cyan eyes, a draped
 * stethoscope, an embroidered "DPT" badge, a chest pocket, segmented arms, and
 * white sneakers. Pure SVG, zero image files.
 */
export default function Flex({
  mood,
  size = 120,
  animate = true,
  speechBubble,
  onClick,
  className = '',
}: FlexProps) {
  const anim = bodyAnimation(mood, animate)
  const headTilt = mood === 'sleeping' ? 'rotate(8 100 70)' : undefined

  // unique ids so multiple Flex instances don't share gradients/filters
  const uid = useId().replace(/:/g, '')
  const headGradId = `flexHead-${uid}`
  const eyeGradId = `flexEye-${uid}`
  const armGradId = `flexArm-${uid}`
  const glowId = `flexGlow-${uid}`
  const antennaGlowId = `flexAntenna-${uid}`
  const scrubGradId = `flexScrub-${uid}`
  const scrubDarkId = `flexScrubDk-${uid}`
  const visorGradId = `flexVisor-${uid}`

  const antennaLit = mood === 'excited' || mood === 'celebrating' || mood === 'happy'

  return (
    <div
      className={`relative inline-flex flex-col items-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <AnimatePresence>
        {speechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 8, scale: 0.9, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[min(220px,68vw)] rounded-2xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(56,189,248,0.3))' }}
          >
            {speechBubble}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.svg
        viewBox="0 0 200 240"
        width={size}
        height={size * 1.2}
        {...anim}
        aria-label={`Flex the android mascot, ${mood}`}
      >
        <defs>
          {/* brushed-chrome head */}
          <radialGradient id={headGradId} cx="38%" cy="26%" r="82%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="42%" stopColor="#D5DEE9" />
            <stop offset="78%" stopColor="#9AA9BC" />
            <stop offset="100%" stopColor="#5B6B80" />
          </radialGradient>
          {/* glowing cyan eye */}
          <radialGradient id={eyeGradId} cx="50%" cy="38%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor={EYE_BRIGHT} />
            <stop offset="100%" stopColor={EYE_CORE} />
          </radialGradient>
          {/* brushed-metal arm */}
          <linearGradient id={armGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8EEF5" />
            <stop offset="45%" stopColor="#9FB0C3" />
            <stop offset="100%" stopColor="#5B6B80" />
          </linearGradient>
          {/* matte-black scrub fabric (front) */}
          <linearGradient id={scrubGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A3140" />
            <stop offset="50%" stopColor="#171C28" />
            <stop offset="100%" stopColor="#0B0E16" />
          </linearGradient>
          {/* darker scrub fabric (sleeves / neckline / pants) */}
          <linearGradient id={scrubDarkId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B212E" />
            <stop offset="100%" stopColor="#080A11" />
          </linearGradient>
          {/* dark glass visor */}
          <linearGradient id={visorGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#13243E" />
            <stop offset="50%" stopColor="#0A1525" />
            <stop offset="100%" stopColor="#05080F" />
          </linearGradient>
          {/* eye/mouth glow */}
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={EYE_CORE} floodOpacity="0.8" />
          </filter>
          <filter id={antennaGlowId} x="-150%" y="-150%" width="400%" height="400%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={SKY} floodOpacity="0.9" />
          </filter>
        </defs>

        <Extras mood={mood} />

        {/* ===== legs (scrub pants) + sneakers ===== */}
        <rect x={77} y={196} width={17} height={18} rx={7} fill={`url(#${scrubDarkId})`} />
        <rect x={106} y={196} width={17} height={18} rx={7} fill={`url(#${scrubDarkId})`} />
        <g>
          <rect x={68} y={210} width={32} height={16} rx={7} fill="#F8FAFC" />
          <rect x={104} y={210} width={32} height={16} rx={7} fill="#F8FAFC" />
          <rect x={68} y={221} width={32} height={6} rx={3} fill={SOLE} />
          <rect x={104} y={221} width={32} height={6} rx={3} fill={SOLE} />
          <path d="M75 215 l11 3" stroke={SKY} strokeWidth={2} strokeLinecap="round" />
          <path d="M111 215 l11 3" stroke={SKY} strokeWidth={2} strokeLinecap="round" />
        </g>

        {/* ===== torso: fitted scrub top ===== */}
        <path
          d="M58 124 Q66 116 78 115 Q100 112 122 115 Q134 116 142 124 L149 190 Q149 208 130 208 L70 208 Q51 208 51 190 Z"
          fill={`url(#${scrubGradId})`}
          stroke="#05070C"
          strokeWidth={1}
        />
        {/* side form shadows */}
        <path d="M58 124 L51 190 Q51 201 59 206 L63 150 Z" fill="#000" opacity={0.2} />
        <path d="M142 124 L149 190 Q149 201 141 206 L137 150 Z" fill="#000" opacity={0.2} />
        {/* fabric fold hints */}
        <path d="M72 150 Q90 168 78 198" stroke="#000" strokeWidth={2} fill="none" opacity={0.18} strokeLinecap="round" />
        <path d="M128 150 Q110 168 122 198" stroke="#000" strokeWidth={2} fill="none" opacity={0.18} strokeLinecap="round" />
        {/* center placket */}
        <line x1={100} y1={140} x2={100} y2={204} stroke="#000" strokeWidth={1.5} opacity={0.25} />

        {/* V-neck opening + collar trim */}
        <path d="M86 116 L100 141 L114 116 Q100 121 86 116 Z" fill={`url(#${scrubDarkId})`} />
        <path d="M85 116 L100 140" stroke={COLLAR} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d="M115 116 L100 140" stroke={COLLAR} strokeWidth={2.5} fill="none" strokeLinecap="round" />

        {/* chest pocket (viewer-right) */}
        <path d="M106 158 h38 v20 q0 3 -3 3 h-32 q-3 0 -3 -3 Z" fill={`url(#${scrubGradId})`} stroke={COLLAR} strokeWidth={1.4} />
        <line x1={106} y1={163} x2={144} y2={163} stroke={COLLAR} strokeWidth={1.4} />

        {/* stethoscope draped over the shirt */}
        <path d="M82 118 Q72 150 96 170" stroke={STETHO} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        <path d="M118 118 Q128 150 104 170" stroke={STETHO} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        <circle cx={100} cy={174} r={7} fill={STETHO} />
        <circle cx={100} cy={174} r={3.5} fill="#0A1525" />

        {/* embroidered name on the pocket (above the stethoscope so it stays legible) */}
        <text x={128} y={176} textAnchor="middle" fontSize={7.5} fontWeight="bold" fill={SKY} fontFamily="sans-serif">
          DPT Flex
        </text>

        {/* arms last so the scrub sleeves sit on the shoulders and track the limbs */}
        <Arms mood={mood} gradId={armGradId} scrubId={scrubDarkId} />

        {/* ===== head ===== */}
        <g transform={headTilt}>
          {/* antenna */}
          <line x1={100} y1={28} x2={100} y2={15} stroke="#7C8BA3" strokeWidth={2.5} strokeLinecap="round" />
          <circle
            cx={100}
            cy={12}
            r={4}
            fill={antennaLit ? SKY : '#9FB0C3'}
            style={antennaLit ? { filter: `url(#${antennaGlowId})` } : undefined}
          />

          {/* side ear cans */}
          <rect x={43} y={56} width={12} height={28} rx={6} fill="#8696AC" stroke="#475569" strokeWidth={1.2} />
          <rect x={145} y={56} width={12} height={28} rx={6} fill="#8696AC" stroke="#475569" strokeWidth={1.2} />
          <circle cx={49} cy={70} r={2} fill="#475569" />
          <circle cx={151} cy={70} r={2} fill="#475569" />

          {/* chrome dome */}
          <ellipse cx={100} cy={68} rx={48} ry={50} fill={`url(#${headGradId})`} stroke="#3E4A5C" strokeWidth={2} />
          {/* specular highlights */}
          <ellipse cx={84} cy={42} rx={22} ry={12} fill="#FFFFFF" opacity={0.45} />
          <ellipse cx={120} cy={50} rx={6} ry={11} fill="#FFFFFF" opacity={0.15} />
          {/* cool rim light (futuristic edge) */}
          <path d="M147 80 A48 50 0 0 1 116 115" stroke={SKY} strokeWidth={2.5} fill="none" opacity={0.45} strokeLinecap="round" />
          {/* panel seams */}
          <line x1={100} y1={19} x2={100} y2={40} stroke="#9FB0C3" strokeWidth={1.5} opacity={0.6} />
          <path d="M60 62 Q57 82 68 98" stroke="#94A3B8" strokeWidth={1} fill="none" opacity={0.35} />

          {/* dark glass visor */}
          <rect x={60} y={46} width={80} height={36} rx={18} fill={`url(#${visorGradId})`} stroke="#0A1626" strokeWidth={1.5} />
          {/* visor gloss + accent rim */}
          <path d="M68 52 Q100 46 132 52" stroke="#FFFFFF" strokeWidth={3} opacity={0.12} fill="none" strokeLinecap="round" />
          <path d="M70 80 Q100 86 130 80" stroke={SKY} strokeWidth={1.5} opacity={0.4} fill="none" strokeLinecap="round" />

          <Brows mood={mood} />
          <Eyes mood={mood} glowId={glowId} eyeGradId={eyeGradId} />
          <Mouth mood={mood} glowId={glowId} />

          {/* cheek rivets */}
          <circle cx={62} cy={92} r={1.8} fill="#64748B" />
          <circle cx={138} cy={92} r={1.8} fill="#64748B" />
        </g>
      </motion.svg>
    </div>
  )
}
