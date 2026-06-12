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
 * with 3D tilt following the cursor.
 */
export default function GlassCard({
  children,
  className = '',
  onClick,
  tilt = true,
  hover = true,
}: GlassCardProps) {
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = use3DTilt()

  return (
    <motion.div
      style={tilt ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
      onMouseMove={tilt ? handleMouseMove : undefined}
      onMouseLeave={tilt ? handleMouseLeave : undefined}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : undefined}
      className={`glass-card ${hover ? '' : 'glass-card-static'} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
