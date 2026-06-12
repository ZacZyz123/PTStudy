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
        'bg-base': '#080D18',
        'bg-card': '#0F1829',
        'bg-panel': '#0A1020',
        'accent-sky': '#38BDF8',
        'accent-violet': '#7C3AED',
        'accent-emerald': '#10B981',
        'accent-amber': '#F59E0B',
        'accent-red': '#EF4444',
        'accent-pink': '#EC4899',
        'text-primary': '#F0F9FF',
        'text-secondary': '#94A3B8',
        'text-tertiary': '#3D5470',
      },
      borderColor: {
        DEFAULT: 'rgba(56,189,248,0.12)',
        glass: 'rgba(255,255,255,0.08)',
        hover: 'rgba(56,189,248,0.35)',
      },
      boxShadow: {
        'glow-sky': '0 0 30px rgba(56,189,248,0.25), 0 0 60px rgba(56,189,248,0.1)',
        'glow-violet': '0 0 30px rgba(124,58,237,0.25), 0 0 60px rgba(124,58,237,0.1)',
        'glow-emerald': '0 0 30px rgba(16,185,129,0.25)',
        'glow-amber': '0 0 30px rgba(245,158,11,0.25)',
        'glow-card': '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.08)',
        'glow-card-hover':
          '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.2), 0 0 40px rgba(56,189,248,0.1)',
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
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        float: 'float 3s ease-in-out infinite alternate',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        shake: 'shake 0.45s ease-in-out',
        'pulse-glow': 'pulse-glow 1.2s ease-in-out',
        'spin-once': 'spin-once 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float-z': 'float-z 2s ease-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
