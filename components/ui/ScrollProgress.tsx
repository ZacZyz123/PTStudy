'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * Slim scroll-progress bar pinned to the top of the viewport. The fill is
 * spring-smoothed so it glides rather than snaps as the user scrolls.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-accent-sky via-accent-violet to-accent-pink"
    />
  )
}
