'use client'
// src/components/quiz/Timer.tsx
// Timer regressivo com anel SVG animado e aviso visual quando próximo do fim.

import { useState, useEffect } from 'react'

interface TimerProps {
  totalSeconds: number
  onTimeUp:    () => void
}

export default function Timer({ totalSeconds, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onTimeUp])

  const pct         = remaining / totalSeconds
  const isWarning   = pct < 0.2
  const circ        = 2 * Math.PI * 28   // r=28
  const dashOffset  = circ * (1 - pct)

  const min = String(Math.floor(remaining / 60)).padStart(2, '0')
  const sec = String(remaining % 60).padStart(2, '0')

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg viewBox="0 0 64 64" className="-rotate-90 w-full h-full">
        <circle cx="32" cy="32" r="28" fill="none" stroke="#252a3a" strokeWidth="4" />
        <circle
          cx="32" cy="32" r="28"
          fill="none"
          stroke={isWarning ? '#f87171' : '#c8922a'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.95s linear' }}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center
                       font-mono text-xs font-semibold
                       ${isWarning ? 'text-red-400' : 'text-gray-300'}`}>
        {min}:{sec}
      </div>
    </div>
  )
}
