'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ background: '#080D18', color: '#F0F9FF', fontFamily: 'sans-serif' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            textAlign: 'center',
            padding: '16px',
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Something went very wrong</h1>
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>Even Flex couldn&apos;t save this one.</p>
          <button
            onClick={reset}
            style={{
              background: '#38BDF8',
              color: '#080D18',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 24px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
