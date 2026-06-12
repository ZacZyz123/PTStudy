'use client'

export default function OnlineIndicator({ online }: { online: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
      <span
        className={`h-2 w-2 rounded-full ${online ? 'animate-pulse-dot bg-accent-emerald' : 'bg-text-tertiary'}`}
      />
      {online ? 'Online' : 'Offline'}
    </span>
  )
}
