'use client'

import { motion } from 'framer-motion'
import { use3DTilt } from '@/lib/use3DTilt'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  tilt?: boolean
}

/**
 * Base card with 3D tilt-on-hover by default. The card rotates toward the
 * cursor like a physical object being picked up.
 */
export default function Card({ children, className = '', onClick, tilt = true }: CardProps) {
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
      whileHover={{ y: -4 }}
      className={`relative rounded-[20px] border border-glass bg-bg-card shadow-glow-card
        transition-[box-shadow,border-color] duration-300 hover:border-hover hover:shadow-glow-card-hover
        ${tilt ? 'tilt-card' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {tilt && (
        <motion.span aria-hidden className="tilt-glare" style={{ background: glareBackground }} />
      )}
      {tilt ? <div style={{ transform: 'translateZ(35px)', transformStyle: 'preserve-3d' }}>{children}</div> : children}
    </motion.div>
  )
}
