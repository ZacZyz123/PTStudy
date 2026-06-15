'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, useState, type MouseEvent } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children?: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-sky text-bg-base shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)]',
  secondary:
    'bg-accent-violet text-text-primary shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]',
  success:
    'bg-accent-emerald text-bg-base shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]',
  danger:
    'bg-accent-red text-text-primary shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]',
  ghost:
    'bg-transparent text-text-secondary border border-glass hover:text-text-primary hover:border-hover',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, className = '', children, disabled, onClick, ...props },
  ref
) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  // glow ring sits behind solid accent buttons for that premium halo
  const glowRing = variant === 'primary' || variant === 'secondary' || variant === 'success'

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      const rect = e.currentTarget.getBoundingClientRect()
      const dim = Math.max(rect.width, rect.height)
      const id = Date.now()
      setRipples((r) => [
        ...r,
        { id, x: e.clientX - rect.left - dim / 2, y: e.clientY - rect.top - dim / 2, size: dim },
      ])
      setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600)
    }
    onClick?.(e)
  }

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || loading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold
        transition-shadow duration-300 disabled:cursor-not-allowed disabled:opacity-50
        ${glowRing ? 'glow-ring' : ''} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute animate-[ripple_0.6s_ease-out] rounded-full bg-white/40"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            animation: 'ripple 0.6s ease-out forwards',
          }}
        />
      ))}
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.button>
  )
})

export default Button
