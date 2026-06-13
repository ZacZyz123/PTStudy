'use client'

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

const SKIN = '#FDDCB5'
const SCRUBS = '#1a1a2e'
const STETHO = '#9CA3AF'
const SKY = '#38BDF8'

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

/* ---------- eyes ---------- */
function Eyes({ mood }: { mood: FlexMood }) {
  switch (mood) {
    case 'happy':
    case 'waving':
      // curved-up "^ ^" eyes
      return (
        <g stroke="#1F2937" strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M76 62 q8 -10 16 0" />
          <path d="M108 62 q8 -10 16 0" />
        </g>
      )
    case 'excited':
    case 'celebrating':
      // star eyes
      return (
        <g fill="#F59E0B">
          <Star cx={84} cy={62} r={9} />
          <Star cx={116} cy={62} r={9} />
        </g>
      )
    case 'thinking':
      // looking up-right
      return (
        <g>
          <circle cx={84} cy={60} r={8} fill="white" />
          <circle cx={116} cy={60} r={8} fill="white" />
          <circle cx={87} cy={57} r={3.5} fill="#1F2937" />
          <circle cx={119} cy={57} r={3.5} fill="#1F2937" />
        </g>
      )
    case 'sad':
      // droopy T_T eyes
      return (
        <g stroke="#1F2937" strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M76 60 q8 8 16 0" />
          <path d="M108 60 q8 8 16 0" />
          <path d="M84 70 v6" stroke={SKY} strokeWidth={2.5} />
          <path d="M116 70 v6" stroke={SKY} strokeWidth={2.5} />
        </g>
      )
    case 'focused':
      return (
        <g>
          <circle cx={84} cy={62} r={7} fill="white" />
          <circle cx={116} cy={62} r={7} fill="white" />
          <circle cx={84} cy={63} r={3.5} fill="#1F2937" />
          <circle cx={116} cy={63} r={3.5} fill="#1F2937" />
        </g>
      )
    case 'surprised':
      return (
        <g>
          <circle cx={84} cy={61} r={10} fill="white" stroke="#1F2937" strokeWidth={2} />
          <circle cx={116} cy={61} r={10} fill="white" stroke="#1F2937" strokeWidth={2} />
          <circle cx={84} cy={61} r={4} fill="#1F2937" />
          <circle cx={116} cy={61} r={4} fill="#1F2937" />
        </g>
      )
    case 'sleeping':
      // closed "— —" eyes
      return (
        <g stroke="#1F2937" strokeWidth={4} strokeLinecap="round">
          <line x1={76} y1={62} x2={92} y2={62} />
          <line x1={108} y1={62} x2={124} y2={62} />
        </g>
      )
    case 'idle':
    default:
      return (
        <g>
          <circle cx={84} cy={61} r={8} fill="white" />
          <circle cx={116} cy={61} r={8} fill="white" />
          <motion.g
            animate={{ x: [0, 2, -2, 1, 0], y: [0, 1, 0, -1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx={84} cy={61} r={3.5} fill="#1F2937" />
            <circle cx={116} cy={61} r={3.5} fill="#1F2937" />
          </motion.g>
        </g>
      )
  }
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points: string[] = []
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 2
    const radius = i % 2 === 0 ? r : r * 0.45
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`)
  }
  return <polygon points={points.join(' ')} />
}

/* ---------- eyebrows ---------- */
function Eyebrows({ mood }: { mood: FlexMood }) {
  const base = { stroke: '#1F2937', strokeWidth: 4, strokeLinecap: 'round' as const }
  switch (mood) {
    case 'thinking':
      // one raised
      return (
        <g {...base}>
          <line x1={75} y1={46} x2={92} y2={43} />
          <line x1={108} y1={48} x2={124} y2={48} />
        </g>
      )
    case 'focused':
      // furrowed down toward center
      return (
        <g {...base}>
          <line x1={75} y1={46} x2={92} y2={51} />
          <line x1={108} y1={51} x2={125} y2={46} />
        </g>
      )
    case 'sad':
      // tilted up toward center
      return (
        <g {...base}>
          <line x1={75} y1={50} x2={92} y2={45} />
          <line x1={108} y1={45} x2={125} y2={50} />
        </g>
      )
    case 'surprised':
      return (
        <g {...base}>
          <line x1={76} y1={42} x2={92} y2={42} />
          <line x1={108} y1={42} x2={124} y2={42} />
        </g>
      )
    case 'sleeping':
      return null
    default:
      return (
        <g {...base}>
          <line x1={76} y1={47} x2={92} y2={47} />
          <line x1={108} y1={47} x2={124} y2={47} />
        </g>
      )
  }
}

/* ---------- mouth ---------- */
function Mouth({ mood }: { mood: FlexMood }) {
  switch (mood) {
    case 'happy':
    case 'waving':
      return <path d="M82 78 q18 16 36 0" stroke="#1F2937" strokeWidth={4} fill="none" strokeLinecap="round" />
    case 'excited':
    case 'celebrating':
      return <path d="M80 76 q20 22 40 0 z" fill="#7F1D1D" stroke="#1F2937" strokeWidth={3} />
    case 'thinking':
      return <path d="M88 84 q8 -4 16 2" stroke="#1F2937" strokeWidth={4} fill="none" strokeLinecap="round" />
    case 'sad':
      return <path d="M84 88 q16 -12 32 0" stroke="#1F2937" strokeWidth={4} fill="none" strokeLinecap="round" />
    case 'focused':
      return <line x1={86} y1={84} x2={114} y2={84} stroke="#1F2937" strokeWidth={4} strokeLinecap="round" />
    case 'surprised':
      return <ellipse cx={100} cy={84} rx={9} ry={11} fill="#7F1D1D" stroke="#1F2937" strokeWidth={3} />
    case 'sleeping':
      return <path d="M92 84 q8 5 16 0" stroke="#1F2937" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    case 'idle':
    default:
      return <path d="M86 80 q14 10 28 0" stroke="#1F2937" strokeWidth={4} fill="none" strokeLinecap="round" />
  }
}

/* ---------- arms ---------- */
function Limb({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={SCRUBS} strokeWidth={18} strokeLinecap="round" />
}

function Hand({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={8.5} fill={SKIN} />
}

function Arms({ mood }: { mood: FlexMood }) {
  switch (mood) {
    case 'celebrating':
    case 'excited':
      // both arms raised in a V
      return (
        <g>
          <Limb x1={68} y1={124} x2={38} y2={88} />
          <Hand cx={36} cy={84} />
          <Limb x1={132} y1={124} x2={162} y2={88} />
          <Hand cx={164} cy={84} />
        </g>
      )
    case 'thinking':
      // left arm down, right hand up near chin
      return (
        <g>
          <Limb x1={66} y1={126} x2={52} y2={170} />
          <Hand cx={51} cy={176} />
          <Limb x1={134} y1={126} x2={122} y2={102} />
          <Hand cx={120} cy={97} />
        </g>
      )
    case 'waving':
      // right arm waving above shoulder
      return (
        <g>
          <Limb x1={66} y1={126} x2={52} y2={170} />
          <Hand cx={51} cy={176} />
          <motion.g
            animate={{ rotate: [0, 18, 0, 18, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '132px', originY: '122px' }}
          >
            <Limb x1={132} y1={122} x2={160} y2={88} />
            <Hand cx={162} cy={83} />
          </motion.g>
        </g>
      )
    case 'surprised':
      // both hands up to the cheeks
      return (
        <g>
          <Limb x1={68} y1={124} x2={70} y2={100} />
          <Hand cx={70} cy={95} />
          <Limb x1={132} y1={124} x2={130} y2={100} />
          <Hand cx={130} cy={95} />
        </g>
      )
    case 'sad':
      // arms hang straight down
      return (
        <g>
          <Limb x1={64} y1={128} x2={58} y2={176} />
          <Hand cx={57} cy={182} />
          <Limb x1={136} y1={128} x2={142} y2={176} />
          <Hand cx={143} cy={182} />
        </g>
      )
    case 'focused':
    default:
      // relaxed at the sides
      return (
        <g>
          <Limb x1={64} y1={126} x2={50} y2={168} />
          <Hand cx={49} cy={174} />
          <Limb x1={136} y1={126} x2={150} y2={168} />
          <Hand cx={151} cy={174} />
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
 * Flex — the PT Study mascot. A chubby toy-like character in black scrubs
 * with a PT patch, stethoscope, and white sneakers. Pure SVG, zero images.
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
        aria-label={`Flex the mascot, ${mood}`}
      >
        <Extras mood={mood} />

        <Arms mood={mood} />

        {/* body — black scrubs */}
        <rect x={52} y={104} width={96} height={100} rx={44} fill={SCRUBS} />

        {/* sneakers */}
        <rect x={66} y={196} width={30} height={16} rx={8} fill="white" />
        <rect x={104} y={196} width={30} height={16} rx={8} fill="white" />
        <rect x={66} y={206} width={30} height={6} rx={3} fill="#CBD5E1" />
        <rect x={104} y={206} width={30} height={6} rx={3} fill="#CBD5E1" />

        {/* stethoscope around neck */}
        <path
          d="M76 112 q24 22 48 0"
          stroke={STETHO}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
        <path d="M76 112 q-4 14 2 26" stroke={STETHO} strokeWidth={4} fill="none" strokeLinecap="round" />
        <circle cx={80} cy={142} r={7} fill={STETHO} />
        <circle cx={80} cy={142} r={4} fill="#6B7280" />

        {/* PT patch */}
        <rect x={108} y={132} width={26} height={18} rx={5} fill="#0F1829" stroke={SKY} strokeWidth={1.5} />
        <text x={121} y={145} textAnchor="middle" fontSize={11} fontWeight="bold" fill={SKY} fontFamily="sans-serif">
          PT
        </text>

        {/* head */}
        <g transform={headTilt}>
          <circle cx={100} cy={70} r={48} fill={SKIN} />
          <Eyebrows mood={mood} />
          <Eyes mood={mood} />
          <Mouth mood={mood} />
          {/* blush for happy moods */}
          {(mood === 'happy' || mood === 'celebrating' || mood === 'excited' || mood === 'waving') && (
            <g fill="#FCA5A5" opacity={0.6}>
              <ellipse cx={68} cy={74} rx={7} ry={4} />
              <ellipse cx={132} cy={74} rx={7} ry={4} />
            </g>
          )}
        </g>
      </motion.svg>
    </div>
  )
}
