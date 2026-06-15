'use client'

import { motion } from 'framer-motion'
import { use3DTilt } from '@/lib/use3DTilt'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  tilt?: boolean
  hover?: boolean
}

/**
 * Glassmorphism card — frosted glass floating above the dark background,
 * with 3D tilt + a soft light glare that tracks the cursor across the surface.
 */
export default function GlassCard({
  children,
  className = '',
  onClick,
  tilt = true,
  hover = true,
}: GlassCardProps) {
  const { rotateX, rotateY, glareBackground, handleMouseMove, handleMouseLeave } = use3DTilt()

  return (
    <motion.div
      style={
        tilt
          ? { rotateX, rotateY, transformPerspective: 1000, transformStyle: 'preserve-3d' }
          : undefined
      }
      onMouseMove={tilt ? handleMouseMove : undefined}
      onMouseLeave={tilt ? handleMouseLeave : undefined}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : undefined}
      className={`glass-card ${tilt ? 'tilt-card' : ''} ${hover ? '' : 'glass-card-static'} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {tilt && (
        <motion.span aria-hidden className="tilt-glare" style={{ background: glareBackground }} />
      )}
      {tilt ? <div style={{ transform: 'translateZ(35px)', transformStyle: 'preserve-3d' }}>{children}</div> : children}
    </motion.div>
  )
}
