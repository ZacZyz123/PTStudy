'use client'

import { useMotionValue, useTransform, useSpring, type MotionValue } from 'framer-motion'

interface Use3DTiltOptions {
  /** max rotation in degrees on each axis (default 8) */
  max?: number
  /** spring stiffness (default 300) */
  stiffness?: number
  /** spring damping (default 30) */
  damping?: number
}

export interface Tilt3D {
  rotateX: MotionValue<number>
  rotateY: MotionValue<number>
  /** glare highlight as a CSS radial-gradient string that tracks the cursor */
  glareBackground: MotionValue<string>
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
  handleMouseLeave: () => void
}

/**
 * 3D tilt-on-hover. The element rotates toward the cursor like a physical
 * object being picked up, and a soft light glare tracks the pointer across
 * the surface for a premium, award-winning feel.
 */
export function use3DTilt(options: Use3DTiltOptions = {}): Tilt3D {
  const { max = 8, stiffness = 300, damping = 30 } = options

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-0.5, 0.5], [max, -max])
  const rotateY = useTransform(x, [-0.5, 0.5], [-max, max])

  const springRotateX = useSpring(rotateX, { stiffness, damping })
  const springRotateY = useSpring(rotateY, { stiffness, damping })

  // glare follows the cursor across the surface (0–100%)
  const glareX = useTransform(x, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(y, [-0.5, 0.5], [0, 100])
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]: number[]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22), transparent 55%)`
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return {
    rotateX: springRotateX,
    rotateY: springRotateY,
    glareBackground,
    handleMouseMove,
    handleMouseLeave,
  }
}
