'use client'
// src/components/quiz/QuizProgress.tsx

interface Props { total: number; answered: number; current: number }

export default function QuizProgress({ total, answered, current }: Props) {
  const pct = Math.round((answered / total) * 100)

  return (
    <div className="mb-5">
      <div className="flex justify-between text-xs text-gray-600 mb-2">
        <span>Questão {current + 1} de {total}</span>
        <span>{pct}% respondidas</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
