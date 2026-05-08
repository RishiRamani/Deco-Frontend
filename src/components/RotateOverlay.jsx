import { useEffect, useState } from 'react'

export default function RotateOverlay() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const check = () => {
      const isMobile = window.innerWidth < 1024   // covers phones & small tablets
      const isPortrait = window.innerHeight > window.innerWidth
      setShow(isMobile && isPortrait)
    }
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.96)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.25rem',
      }}
    >
      {/* Rotating phone icon */}
      <div style={{ animation: 'rotateHint 2.4s ease-in-out infinite' }}>
        <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
          <rect x="16" y="8" width="32" height="48" rx="6"
            stroke="#2DFF9A" strokeWidth="2.5" fill="none" />
          <circle cx="32" cy="49" r="2.5" fill="#2DFF9A" opacity="0.7" />
          {/* Arrow arc hinting rotation */}
          <path d="M52 22 A24 24 0 0 0 12 22" stroke="#2DFF9A" strokeWidth="2"
            fill="none" strokeLinecap="round"
            strokeDasharray="5 3" />
          <polyline points="9,19 12,24 17,20" stroke="#2DFF9A"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>

      <p style={{
        color: '#2DFF9A',
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.78rem',
        letterSpacing: '0.14em',
        textAlign: 'center',
        margin: 0,
        opacity: 0.9,
      }}>
        ROTATE YOUR DEVICE
      </p>

      <p style={{
        color: 'rgba(255,255,255,0.35)',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '0.7rem',
        letterSpacing: '0.06em',
        textAlign: 'center',
        margin: 0,
      }}>
        This experience requires landscape mode
      </p>

      <style>{`
        @keyframes rotateHint {
          0%   { transform: rotate(0deg) scale(1); }
          30%  { transform: rotate(-90deg) scale(1.08); }
          55%  { transform: rotate(-90deg) scale(1.08); }
          80%  { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(0deg) scale(1); }
        }
      `}</style>
    </div>
  )
}