'use client'

interface AvatarProps {
  name: string | null
  color?: string
  size?: number
  online?: boolean
  className?: string
}

function initials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Avatar({ name, color = '#38BDF8', size = 40, online, className = '' }: AvatarProps) {
  return (
    <div className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        className="flex h-full w-full items-center justify-center rounded-full font-semibold text-bg-base"
        style={{ backgroundColor: color, fontSize: size * 0.38 }}
      >
        {initials(name)}
      </div>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full border-2 border-bg-panel ${
            online ? 'animate-pulse-dot bg-accent-emerald' : 'bg-text-tertiary'
          }`}
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      )}
    </div>
  )
}
