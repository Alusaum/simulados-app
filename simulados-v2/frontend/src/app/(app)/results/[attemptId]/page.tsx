'use client'
// src/app/(app)/results/[attemptId]/page.tsx

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { resultadosApi } from '@/lib/api'
import type { AttemptResult } from '@/types'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Home, ClipboardList } from 'lucide-react'

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${String(sec).padStart(2, '0')}s`
}

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const router        = useRouter()
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const { data: result, isLoading } = useQuery<AttemptResult>({
    queryKey: ['result', attemptId],
    queryFn:  () => resultadosApi.detail(attemptId).then((r) => r.data),
  })

  if (isLoading || !result) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const pct   = result.percentage
  const color = pct >= 70 ? '#34d399' : pct >= 50 ? '#c8922a' : '#f87171'
  const circ  = 2 * Math.PI * 52
  const [emoji, msg] =
    pct >= 90 ? ['🌟', 'Excelente! Desempenho extraordinário!']
    : pct >= 70 ? ['🎯', 'Muito bom! Continue assim!']
    : pct >= 50 ? ['📚', 'Bom esforço! Ainda há espaço para melhorar.']
    : ['💪', 'Continue estudando! Você vai se superar.']

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">

      {/* Score card */}
      <div className="card text-center mb-5">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="-rotate-90 w-full h-full">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#252a3a" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-2xl" style={{ color }}>{pct}%</span>
            <span className="text-xs text-gray-500">{result.score}/{result.total}</span>
          </div>
        </div>

        <div className="text-2xl mb-1">{emoji}</div>
        <p className="text-gray-400 text-sm">{msg}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Acertos', value: result.score,                   color: 'text-emerald-400' },
          { label: 'Erros',   value: result.total - result.score,    color: 'text-red-400'     },
          { label: 'Tempo',   value: formatTime(result.time_taken),  color: 'text-blue-400'    },
        ].map((s) => (
          <div key={s.label} className="card text-center py-4">
            <div className={`font-serif text-2xl ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-8">
        <button onClick={() => router.push('/dashboard')} className="btn-primary flex-1 justify-center">
          <Home size={15} /> Voltar ao início
        </button>
        <button onClick={() => router.push('/history')} className="btn-ghost flex-1 justify-center">
          <ClipboardList size={15} /> Histórico
        </button>
      </div>

      {/* Review */}
      <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-3">
        Revisão das questões
      </p>

      <div className="space-y-2">
        {result.answers.map((a, i) => (
          <div key={a.question_id} className="border border-white/[0.07] rounded-xl overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/[0.03] transition-colors"
            >
              {a.is_correct
                ? <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                : <XCircle     size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mb-0.5">Questão {i + 1}</p>
                <p className="text-sm text-gray-300 leading-snug">{a.statement}</p>
              </div>
              {openIdx === i
                ? <ChevronUp   size={15} className="text-gray-600 flex-shrink-0 mt-1" />
                : <ChevronDown size={15} className="text-gray-600 flex-shrink-0 mt-1" />
              }
            </button>

            {/* Body (expandido) */}
            {openIdx === i && (
              <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
                {(['a','b','c','d'] as const).map((k) => {
                  const text = a[`option_${k}` as keyof typeof a] as string
                  const isCorrect  = k === a.correct_option
                  const isChosen   = k === a.chosen_option
                  return (
                    <div key={k}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1.5 text-sm
                        ${isCorrect ? 'bg-emerald-400/10 border border-emerald-400/25 text-emerald-300'
                          : isChosen ? 'bg-red-400/10 border border-red-400/25 text-red-300'
                          : 'bg-white/[0.03] border border-white/[0.05] text-gray-500'}`}
                    >
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold flex-shrink-0
                        ${isCorrect ? 'bg-emerald-400 text-ink'
                          : isChosen ? 'bg-red-400 text-white'
                          : 'bg-white/10'}`}>
                        {k.toUpperCase()}
                      </span>
                      {text}
                      {isChosen && !isCorrect && <span className="ml-auto text-xs opacity-60">(sua resposta)</span>}
                    </div>
                  )
                })}
                {a.explanation && (
                  <div className="mt-3 p-3 bg-white/[0.03] rounded-lg border-l-2 border-gold text-sm text-gray-400 leading-relaxed">
                    💡 {a.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
