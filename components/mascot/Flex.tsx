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

/* ---------- palette (chrome android) ---------- */
const SCRUBS = '#15151f' // black scrubs
const SCRUBS_DK = '#0c0c14'
const STETHO = '#7DD3FC' // light-blue stethoscope
const SKY = '#38BDF8'
const EYE_BRIGHT = '#FDE68A'
const EYE_AMBER = '#F59E0B'
const METAL_DARK = '#475569'

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

/* ---------- glowing amber eyes ---------- */
function Eyes({ mood, glowId, eyeGradId }: { mood: FlexMood; glowId: string; eyeGradId: string }) {
  const fill = `url(#${eyeGradId})`
  const glow = { filter: `url(#${glowId})` }

  // closed / arc shapes draw with amber stroke; round shapes fill with gradient
  const arc = (d: string) => (
    <path d={d} stroke={EYE_AMBER} strokeWidth={5} strokeLinecap="round" fill="none" style={glow} />
  )

  switch (mood) {
    case 'happy':
    case 'waving':
      // upward squint arcs ^ ^
      return (
        <g>
          {arc('M74 64 q9 -11 18 0')}
          {arc('M108 64 q9 -11 18 0')}
        </g>
      )
    case 'excited':
    case 'celebrating':
      // large bright eyes with sparkle
      return (
        <g style={glow}>
          <ellipse cx={84} cy={61} rx={11} ry={12} fill={fill} />
          <ellipse cx={116} cy={61} rx={11} ry={12} fill={fill} />
          <circle cx={80} cy={56} r={2.5} fill="#FFFFFF" />
          <circle cx={112} cy={56} r={2.5} fill="#FFFFFF" />
        </g>
      )
    case 'thinking':
      // glance up-right
      return (
        <g style={glow}>
          <ellipse cx={87} cy={57} rx={8} ry={9} fill={fill} />
          <ellipse cx={119} cy={57} rx={8} ry={9} fill={fill} />
        </g>
      )
    case 'sad':
      // droopy downward arcs, lowered, with a glowing tear
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
      // narrowed determined slits
      return (
        <g style={glow}>
          <ellipse cx={84} cy={62} rx={10} ry={4.5} fill={fill} />
          <ellipse cx={116} cy={62} rx={10} ry={4.5} fill={fill} />
        </g>
      )
    case 'surprised':
      // wide round bright eyes
      return (
        <g style={glow}>
          <circle cx={84} cy={61} r={11.5} fill={fill} />
          <circle cx={116} cy={61} r={11.5} fill={fill} />
        </g>
      )
    case 'sleeping':
      // dim closed lines — —
      return (
        <g opacity={0.5} style={glow}>
          {arc('M74 63 q9 4 18 0')}
          {arc('M108 63 q9 4 18 0')}
        </g>
      )
    case 'idle':
    default:
      // standard glowing ovals with a soft brightness pulse
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

/* ---------- metallic brow plates (subtle expression) ---------- */
function Brows({ mood }: { mood: FlexMood }) {
  const base = { stroke: METAL_DARK, strokeWidth: 4, strokeLinecap: 'round' as const, opacity: 0.85 }
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
    case 'sleeping':
      return null
    default:
      return null
  }
}

/* ---------- glowing grille mouth ---------- */
function Mouth({ mood, glowId }: { mood: FlexMood; glowId: string }) {
  const glow = { filter: `url(#${glowId})` }
  const line = (d: string) => (
    <path d={d} stroke={EYE_AMBER} strokeWidth={4} fill="none" strokeLinecap="round" style={glow} />
  )

  switch (mood) {
    case 'happy':
    case 'waving':
      return (
        <g>
          {line('M80 80 q20 16 40 0')}
          <g stroke={SCRUBS_DK} strokeWidth={2} opacity={0.5}>
            <line x1={92} y1={84} x2={92} y2={90} />
            <line x1={100} y1={86} x2={100} y2={92} />
            <line x1={108} y1={84} x2={108} y2={90} />
          </g>
        </g>
      )
    case 'excited':
    case 'celebrating':
      // open grin
      return (
        <g style={glow}>
          <path d="M80 78 q20 24 40 0 z" fill={EYE_AMBER} opacity={0.9} />
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
          <ellipse cx={100} cy={86} rx={8} ry={10} fill={EYE_AMBER} opacity={0.85} />
        </g>
      )
    case 'sleeping':
      return line('M92 86 q8 5 16 0')
    case 'idle':
    default:
      return line('M84 82 q16 11 32 0')
  }
}

/* ---------- robotic arms ---------- */
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
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={`url(#${gradId})`} strokeWidth={16} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={METAL_DARK} strokeWidth={16} strokeLinecap="round" opacity={0.18} />
      {/* elbow joint */}
      <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={5} fill="#64748B" stroke="#334155" strokeWidth={1.5} />
    </g>
  )
}

function Hand({ cx, cy, gradId }: { cx: number; cy: number; gradId: string }) {
  return <circle cx={cx} cy={cy} r={9} fill={`url(#${gradId})`} stroke="#334155" strokeWidth={1.5} />
}

function Arms({ mood, gradId }: { mood: FlexMood; gradId: string }) {
  switch (mood) {
    case 'celebrating':
    case 'excited':
      return (
        <g>
          <Limb x1={68} y1={124} x2={38} y2={88} gradId={gradId} />
          <Hand cx={36} cy={84} gradId={gradId} />
          <Limb x1={132} y1={124} x2={162} y2={88} gradId={gradId} />
          <Hand cx={164} cy={84} gradId={gradId} />
        </g>
      )
    case 'thinking':
      return (
        <g>
          <Limb x1={66} y1={126} x2={52} y2={170} gradId={gradId} />
          <Hand cx={51} cy={176} gradId={gradId} />
          <Limb x1={134} y1={126} x2={122} y2={102} gradId={gradId} />
          <Hand cx={120} cy={97} gradId={gradId} />
        </g>
      )
    case 'waving':
      return (
        <g>
          <Limb x1={66} y1={126} x2={52} y2={170} gradId={gradId} />
          <Hand cx={51} cy={176} gradId={gradId} />
          <motion.g
            animate={{ rotate: [0, 18, 0, 18, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '132px', originY: '122px' }}
          >
            <Limb x1={132} y1={122} x2={160} y2={88} gradId={gradId} />
            <Hand cx={162} cy={83} gradId={gradId} />
          </motion.g>
        </g>
      )
    case 'surprised':
      return (
        <g>
          <Limb x1={68} y1={124} x2={70} y2={100} gradId={gradId} />
          <Hand cx={70} cy={95} gradId={gradId} />
          <Limb x1={132} y1={124} x2={130} y2={100} gradId={gradId} />
          <Hand cx={130} cy={95} gradId={gradId} />
        </g>
      )
    case 'sad':
      return (
        <g>
          <Limb x1={64} y1={128} x2={58} y2={176} gradId={gradId} />
          <Hand cx={57} cy={182} gradId={gradId} />
          <Limb x1={136} y1={128} x2={142} y2={176} gradId={gradId} />
          <Hand cx={143} cy={182} gradId={gradId} />
        </g>
      )
    case 'focused':
    default:
      return (
        <g>
          <Limb x1={64} y1={126} x2={50} y2={168} gradId={gradId} />
          <Hand cx={49} cy={174} gradId={gradId} />
          <Limb x1={136} y1={126} x2={150} y2={168} gradId={gradId} />
          <Hand cx={151} cy={174} gradId={gradId} />
        </g>
      )
  }
}

/* ---------- mood extras: confetti, z's ---------- */
function Extras({ mood }: { mood: FlexMood }) {
  if (mood === 'celebrating') {
    const confetti = [
      { x: 30, y: 30, c: '#38BDF8' },
      { x: 170, y: 26, c: '#EC4899' },
      { x: 20, y: 80, c: '#F59E0B' },
      { x: 180, y: 70, c: '#10B981' },
      { x: 50, y: 14, c: '#7C3AED' },
      { x: 150, y: 10, c: '#EF4444' },
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
 * Flex — the PT Study mascot. A chubby chrome android in black scrubs with
 * glowing amber eyes, a "DPT" chest patch, a light-blue stethoscope, robotic
 * arms, and white sneakers. Pure SVG, zero image files.
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
          <radialGradient id={headGradId} cx="38%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="45%" stopColor="#CBD5E1" />
            <stop offset="80%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </radialGradient>
          {/* glowing amber eye */}
          <radialGradient id={eyeGradId} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#FFFDF5" />
            <stop offset="35%" stopColor={EYE_BRIGHT} />
            <stop offset="100%" stopColor={EYE_AMBER} />
          </radialGradient>
          {/* silver arm */}
          <linearGradient id={armGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          {/* amber glow filter */}
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor={EYE_AMBER} floodOpacity="0.85" />
          </filter>
          <filter id={antennaGlowId} x="-150%" y="-150%" width="400%" height="400%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={EYE_AMBER} floodOpacity="0.9" />
          </filter>
        </defs>

        <Extras mood={mood} />

        <Arms mood={mood} gradId={armGradId} />

        {/* body — black scrubs */}
        <rect x={52} y={104} width={96} height={100} rx={44} fill={SCRUBS} />
        {/* scrub collar V */}
        <path d="M84 106 L100 124 L116 106" stroke={SCRUBS_DK} strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* short sleeve caps */}
        <ellipse cx={58} cy={120} rx={14} ry={16} fill={SCRUBS_DK} />
        <ellipse cx={142} cy={120} rx={14} ry={16} fill={SCRUBS_DK} />

        {/* sneakers */}
        <rect x={66} y={196} width={30} height={16} rx={8} fill="white" />
        <rect x={104} y={196} width={30} height={16} rx={8} fill="white" />
        <rect x={66} y={206} width={30} height={6} rx={3} fill="#CBD5E1" />
        <rect x={104} y={206} width={30} height={6} rx={3} fill="#CBD5E1" />

        {/* stethoscope around neck */}
        <path d="M76 112 q24 22 48 0" stroke={STETHO} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M76 112 q-4 14 2 26" stroke={STETHO} strokeWidth={4} fill="none" strokeLinecap="round" />
        <circle cx={80} cy={142} r={7} fill={STETHO} />
        <circle cx={80} cy={142} r={4} fill="#38BDF8" />

        {/* DPT patch */}
        <rect x={104} y={132} width={34} height={18} rx={5} fill="#0F1829" stroke={SKY} strokeWidth={1.5} />
        <text
          x={121}
          y={145}
          textAnchor="middle"
          fontSize={11}
          fontWeight="bold"
          fill={SKY}
          fontFamily="sans-serif"
        >
          DPT
        </text>

        {/* head */}
        <g transform={headTilt}>
          {/* antenna */}
          <line x1={100} y1={26} x2={100} y2={14} stroke="#64748B" strokeWidth={3} strokeLinecap="round" />
          <circle
            cx={100}
            cy={11}
            r={4.5}
            fill={antennaLit ? EYE_AMBER : '#94A3B8'}
            style={antennaLit ? { filter: `url(#${antennaGlowId})` } : undefined}
          />

          {/* side ear cans */}
          <rect x={44} y={58} width={12} height={26} rx={6} fill="#94A3B8" stroke="#475569" strokeWidth={1.5} />
          <rect x={144} y={58} width={12} height={26} rx={6} fill="#94A3B8" stroke="#475569" strokeWidth={1.5} />

          {/* chrome dome */}
          <ellipse cx={100} cy={68} rx={48} ry={50} fill={`url(#${headGradId})`} stroke="#475569" strokeWidth={2} />
          {/* top highlight */}
          <ellipse cx={86} cy={44} rx={20} ry={12} fill="#FFFFFF" opacity={0.35} />
          {/* faceplate seam */}
          <line x1={100} y1={24} x2={100} y2={40} stroke="#94A3B8" strokeWidth={2} opacity={0.6} />
          {/* dark visor recess behind eyes */}
          <rect x={62} y={48} width={76} height={34} rx={17} fill="#0B1220" opacity={0.28} />

          <Brows mood={mood} />
          <Eyes mood={mood} glowId={glowId} eyeGradId={eyeGradId} />
          <Mouth mood={mood} glowId={glowId} />

          {/* cheek rivets */}
          <circle cx={62} cy={88} r={2.2} fill="#64748B" />
          <circle cx={138} cy={88} r={2.2} fill="#64748B" />
        </g>
      </motion.svg>
    </div>
  )
}
