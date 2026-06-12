'use client'

interface CountdownRingProps {
  secondsLeft: number
  totalSeconds: number
  size?: number
}

/**
 * Circular SVG progress ring that depletes in real time,
 * shifting blue → amber → red as time runs out.
 */
export default function CountdownRing({ secondsLeft, totalSeconds, size = 72 }: CountdownRingProps) {
  const fraction = Math.max(secondsLeft / totalSeconds, 0)
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius

  const color = fraction > 0.5 ? '#38BDF8' : fraction > 0.25 ? '#F59E0B' : '#EF4444'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <span
        className="mono absolute inset-0 flex items-center justify-center text-lg font-bold"
        style={{ color }}
      >
        {Math.ceil(secondsLeft)}
      </span>
    </div>
  )
}
