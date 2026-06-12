'use client'

import { useEffect, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { ISourceOptions } from '@tsparticles/engine'

let enginePromise: Promise<void> | null = null

export default function ParticleBackground() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!enginePromise) {
      enginePromise = initParticlesEngine(async (engine) => {
        await loadSlim(engine)
      })
    }
    enginePromise.then(() => setReady(true))
  }, [])

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      background: { color: { value: 'transparent' } },
      particles: {
        number: { value: 45, density: { enable: true, width: 1400, height: 900 } },
        color: { value: ['#38BDF8', '#7C3AED', '#60A5FA'] },
        shape: { type: 'circle' },
        opacity: {
          value: { min: 0.1, max: 0.45 },
          animation: { enable: true, speed: 0.6, sync: false },
        },
        size: { value: { min: 1, max: 3.5 } },
        move: {
          enable: true,
          speed: 0.4,
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'out' },
        },
        links: {
          enable: true,
          distance: 140,
          color: '#38BDF8',
          opacity: 0.06,
          width: 1,
        },
      },
      interactivity: {
        events: { onHover: { enable: false }, onClick: { enable: false } },
      },
    }),
    []
  )

  if (!ready) return null

  return (
    <Particles
      id="pt-particles"
      options={options}
      className="pointer-events-none absolute inset-0 -z-10"
    />
  )
}
