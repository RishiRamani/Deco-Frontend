import { useState, useEffect } from 'react'

export default function Timer({ startedAt, timeLimit, onExpire }) {
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    if (!startedAt || !timeLimit) return
    const tick = () => {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      const left = timeLimit - elapsed
      setRemaining(Math.max(0, left))
      if (left <= 0 && onExpire) onExpire()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt, timeLimit, onExpire])

  if (remaining === null) return null

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pct = timeLimit ? (remaining / timeLimit) * 100 : 100
  const urgent = remaining <= 60 && remaining > 0
  const done = remaining === 0

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className={`font-mono text-2xl font-bold tabular-nums ${done ? 'text-red-400' : urgent ? 'text-orange-400 timer-active' : 'text-white'}`}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${done ? 'bg-red-500' : urgent ? 'bg-orange-500' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {done && <span className="text-xs text-red-400 font-medium">Time's up!</span>}
    </div>
  )
}
