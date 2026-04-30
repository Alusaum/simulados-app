'use client'
// src/components/quiz/QuestionCard.tsx

import type { Question } from '@/types'

const OPTIONS = ['a', 'b', 'c', 'd'] as const

interface Props {
  question: Question
  selected: string | null
  onSelect: (opt: typeof OPTIONS[number]) => void
}

export default function QuestionCard({ question, selected, onSelect }: Props) {
  const opts: Record<string, string> = {
    a: question.option_a,
    b: question.option_b,
    c: question.option_c,
    d: question.option_d,
  }

  return (
    <div className="card mb-4">
      <p className="font-mono text-[11px] text-gold/70 tracking-widest uppercase mb-3">
        Questão {String(question.order).padStart(2, '0')}
      </p>
      <p className="text-base font-medium leading-relaxed mb-6">{question.statement}</p>

      <div className="space-y-2.5">
        {OPTIONS.map((key) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm
                          text-left transition-all duration-150
                          ${isSelected
                            ? 'border-gold bg-gold/10 text-white'
                            : 'border-white/[0.07] bg-white/[0.03] text-gray-300 hover:border-white/20 hover:bg-white/[0.06]'
                          }`}
            >
              <span className={`w-6 h-6 rounded-md flex items-center justify-center
                                text-xs font-bold flex-shrink-0 transition-colors
                                ${isSelected ? 'bg-gold text-ink' : 'bg-white/10 text-gray-400'}`}>
                {key.toUpperCase()}
              </span>
              {opts[key]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
