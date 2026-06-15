import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0C1322',
        'bg-card': '#141E33',
        'bg-panel': '#0F1828',
        'accent-sky': '#38BDF8',
        'accent-violet': '#6366F1',
        'accent-emerald': '#10B981',
        'accent-amber': '#F59E0B',
        'accent-red': '#EF4444',
        'accent-pink': '#818CF8',
        'text-primary': '#F1F5F9',
        'text-secondary': '#A6B4C6',
        'text-tertiary': '#64748B',
      },
      borderColor: {
        DEFAULT: 'rgba(148,163,184,0.14)',
        glass: 'rgba(255,255,255,0.10)',
        hover: 'rgba(56,189,248,0.42)',
      },
      boxShadow: {
        'glow-sky': '0 0 24px rgba(56,189,248,0.18), 0 0 48px rgba(56,189,248,0.08)',
        'glow-violet': '0 0 24px rgba(99,102,241,0.18), 0 0 48px rgba(99,102,241,0.08)',
        'glow-emerald': '0 0 24px rgba(16,185,129,0.18)',
        'glow-amber': '0 0 24px rgba(245,158,11,0.18)',
        'glow-card': '0 8px 30px rgba(0,0,0,0.45), 0 0 0 1px rgba(148,163,184,0.08)',
        'glow-card-hover':
          '0 16px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(56,189,248,0.18), 0 0 28px rgba(56,189,248,0.07)',
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-10px)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.3)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-6px)' },
          '80%': { transform: 'translateX(6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16,185,129,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(16,185,129,0.6)' },
        },
        'spin-once': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'float-z': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '20%': { opacity: '1' },
          '100%': { transform: 'translateY(-24px) scale(1.4)', opacity: '0' },
        },
        'aurora-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(8%, -6%) scale(1.15)' },
          '66%': { transform: 'translate(-6%, 8%) scale(0.92)' },
        },
        'aurora-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-10%, 6%) scale(0.9)' },
          '66%': { transform: 'translate(7%, -8%) scale(1.18)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'border-glow': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        float: 'float 3s ease-in-out infinite alternate',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        shake: 'shake 0.45s ease-in-out',
        'pulse-glow': 'pulse-glow 1.2s ease-in-out',
        'spin-once': 'spin-once 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float-z': 'float-z 2s ease-out infinite',
        'aurora-1': 'aurora-1 22s ease-in-out infinite',
        'aurora-2': 'aurora-2 28s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 6s ease infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
export default config
