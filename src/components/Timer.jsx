import { useEffect, useRef, useState } from 'react'

function formatDuration(ms) {
  const safe = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function Timer({
  targetTime,
  label = 'Time remaining',
  accentClass = 'text-amber-300',
  onExpire,
}) {
  const [remaining, setRemaining] = useState(() => new Date(targetTime).getTime() - Date.now())
  const firedRef = useRef(false)

  useEffect(() => {
    firedRef.current = false

    const tick = () => {
      const nextRemaining = new Date(targetTime).getTime() - Date.now()
      setRemaining(nextRemaining)

      if (nextRemaining <= 0 && !firedRef.current && onExpire) {
        firedRef.current = true
        onExpire()
      }
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [targetTime, onExpire])

  const progress = Math.max(0, Math.min(100, (remaining / (30 * 60 * 1000)) * 100))
  const urgent = remaining <= 60 * 1000

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur">
      <div className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">{label}</div>
      <div className={`font-mono text-3xl font-semibold tabular-nums ${urgent ? 'text-rose-300' : accentClass}`}>
        {formatDuration(remaining)}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-rose-400' : 'bg-cyan-300'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
