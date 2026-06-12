'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  IconBolt,
  IconBook,
  IconCards,
  IconBrain,
  IconSwords,
  IconMessageChatbot,
  IconTrophy,
  IconCheck,
  IconArrowRight,
  IconSparkles,
} from '@tabler/icons-react'
import Flex from '@/components/mascot/Flex'
import ParticleBackground from '@/components/ui/ParticleBackground'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'

const FEATURES = [
  {
    icon: IconBook,
    color: 'text-accent-sky bg-accent-sky/10',
    title: 'AI study guides',
    desc: 'Every lecture distilled into a clean, exam-focused guide by Claude — key concepts bolded, takeaways at the end.',
  },
  {
    icon: IconCards,
    color: 'text-accent-violet bg-accent-violet/10',
    title: '3D flashcards',
    desc: '15 auto-generated cards per lecture with a satisfying physical flip. Mark known, requeue the rest.',
  },
  {
    icon: IconBrain,
    color: 'text-accent-emerald bg-accent-emerald/10',
    title: 'Adaptive quizzes',
    desc: 'Scenario-based clinical reasoning questions with instant explanations and XP for every correct answer.',
  },
  {
    icon: IconSwords,
    color: 'text-accent-amber bg-accent-amber/10',
    title: 'Live challenges',
    desc: 'Go head-to-head with classmates in real time. 20 seconds a question, winner takes 100 XP.',
  },
  {
    icon: IconMessageChatbot,
    color: 'text-accent-pink bg-accent-pink/10',
    title: 'Flex, your AI tutor',
    desc: 'Ask anything about any lecture, any time. Flex answers with clinical accuracy and relentless positivity.',
  },
  {
    icon: IconTrophy,
    color: 'text-accent-sky bg-accent-sky/10',
    title: 'XP, streaks & badges',
    desc: 'A leaderboard worth fighting for. Daily streaks, eight badges to earn, and a class crown to defend.',
  },
]

const PERKS = [
  'Unlimited AI study guides, flashcards & quizzes',
  'Real-time challenges & class leaderboard',
  'Flex AI tutor with full lecture context',
  'Friends, messaging & online presence',
  'XP, streaks, badges — the full grind',
  'Built mobile-first for studying anywhere',
]

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: 'easeOut' },
}

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-glass bg-bg-base/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <span className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-sky/15 shadow-glow-sky">
              <IconBolt size={18} className="text-accent-sky" />
            </span>
            PT <span className="-ml-1 text-accent-sky">Study</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary">
              Log in
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center px-5 pt-20">
        <ParticleBackground />
        {/* ambient glow blobs */}
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-accent-sky/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-accent-violet/10 blur-[120px]" />

        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-accent-sky/30 bg-accent-sky/10 px-4 py-1.5 text-xs font-semibold text-accent-sky"
            >
              <IconSparkles size={14} />
              Built for Mayo Clinic DPT students
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl"
            >
              PT school is brutal.
              <br />
              <span className="bg-gradient-to-r from-accent-sky via-accent-violet to-accent-pink bg-clip-text text-transparent">
                Studying shouldn&apos;t be.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mx-auto mt-5 max-w-xl text-base text-text-secondary sm:text-lg lg:mx-0"
            >
              Drop in a lecture — get an AI study guide, 3D flashcards, and a clinical-reasoning
              quiz in seconds. Then challenge your classmates and fight for the top of the
              leaderboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link href="/signup">
                <Button size="lg">
                  Start studying — $25/mo
                  <IconArrowRight size={20} />
                </Button>
              </Link>
              <a
                href="#features"
                className="text-sm font-medium text-text-secondary transition-colors hover:text-accent-sky"
              >
                See what&apos;s inside ↓
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18, delay: 0.35 }}
            className="flex justify-center"
          >
            <div className="animate-float">
              <Flex mood="excited" size={260} speechBubble="Welcome! I'm Flex, your study buddy!" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Everything you need to <span className="text-accent-sky">crush the program</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-text-secondary">
              One upload becomes a complete study kit — then the gamification keeps you coming back
              every single day.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              >
                <GlassCard className="h-full p-6">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                    <Icon size={24} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-5 py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-violet/10 blur-[100px]" />
        <div className="mx-auto max-w-4xl">
          <motion.h2 {...fadeUp} className="text-center text-3xl font-bold sm:text-4xl">
            Lecture → study kit in <span className="text-accent-violet">under a minute</span>
          </motion.h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { step: '01', title: 'Upload', desc: 'PDF, PowerPoint, or Word — your class admin drops the lecture in.' },
              { step: '02', title: 'AI does the work', desc: 'Claude writes the guide, builds 15 flashcards, and a 10-question quiz.' },
              { step: '03', title: 'Grind & compete', desc: 'Study, quiz, challenge friends, earn XP. Repeat until you own the leaderboard.' },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="text-center"
              >
                <span className="mono text-4xl font-bold text-accent-sky/30">{step}</span>
                <h3 className="mt-2 text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-sm text-text-secondary">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative px-5 py-24">
        <div className="mx-auto max-w-md">
          <motion.div {...fadeUp}>
            <GlassCard className="relative overflow-hidden p-8 text-center" tilt={false}>
              <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent-sky/20 blur-[80px]" />
              <div className="mb-3 flex justify-center">
                <Flex mood="happy" size={90} />
              </div>
              <h2 className="text-2xl font-bold">One plan. Everything in it.</h2>
              <p className="mt-4">
                <span className="mono text-5xl font-bold text-accent-sky">$25</span>
                <span className="text-text-secondary">/month</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-left">
                {PERKS.map((perk, i) => (
                  <motion.li
                    key={perk}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-2.5 text-sm text-text-secondary"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-emerald/15 text-accent-emerald">
                      <IconCheck size={12} />
                    </span>
                    {perk}
                  </motion.li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 block">
                <Button size="lg" className="w-full">
                  Join PT Study
                  <IconArrowRight size={20} />
                </Button>
              </Link>
              <p className="mt-3 text-xs text-text-tertiary">Cancel anytime from your profile.</p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-glass px-5 py-10 text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-semibold">
          <IconBolt size={16} className="text-accent-sky" />
          PT Study
        </p>
        <p className="mt-2 text-xs text-text-tertiary">
          Made with 💪 for Mayo Clinic DPT students. Not affiliated with Mayo Clinic.
        </p>
      </footer>
    </main>
  )
}
