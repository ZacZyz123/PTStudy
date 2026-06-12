'use client'

type BadgeVariant = 'sky' | 'violet' | 'emerald' | 'amber' | 'red' | 'pink'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  sky: 'bg-accent-sky/15 text-accent-sky border-accent-sky/30',
  violet: 'bg-accent-violet/15 text-accent-violet border-accent-violet/30',
  emerald: 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30',
  amber: 'bg-accent-amber/15 text-accent-amber border-accent-amber/30',
  red: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  pink: 'bg-accent-pink/15 text-accent-pink border-accent-pink/30',
}

export default function Badge({ children, variant = 'sky', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
