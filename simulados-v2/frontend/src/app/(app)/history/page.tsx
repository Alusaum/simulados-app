'use client'
// src/app/(app)/history/page.tsx

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { resultadosApi } from '@/lib/api'
import type { AttemptHistory } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function formatTime(s: number) {
  return `${Math.floor(s/60)}m ${String(s%60).padStart(2,'0')}s`
}

export default function HistoryPage() {
  const router = useRouter()
  const { data: attempts, isLoading } = useQuery<AttemptHistory[]>({
    queryKey: ['history'],
    queryFn:  () => resultadosApi.history().then((r) => r.data),
  })

  return (
    <div className="animate-fade-up">
      <h1 className="font-serif text-3xl mb-2">Histórico</h1>
      <p className="text-gray-500 mb-8">Suas tentativas anteriores.</p>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="card h-20 animate-pulse bg-white/[0.03]" />)}
        </div>
      )}

      {attempts?.length === 0 && (
        <div className="card text-center py-16 text-gray-600">
          <p className="text-3xl mb-3">📋</p>
          <p>Nenhuma tentativa ainda.<br />Faça seu primeiro simulado!</p>
        </div>
      )}

      <div className="space-y-3">
        {attempts?.map((a) => {
          const color = a.percentage >= 70 ? 'text-emerald-400' : a.percentage >= 50 ? 'text-gold' : 'text-red-400'
          const border = a.percentage >= 70 ? 'border-emerald-400' : a.percentage >= 50 ? 'border-gold' : 'border-red-400'
          return (
            <div
              key={a.id}
              onClick={() => router.push(`/results/${a.id}`)}
              className="card flex items-center gap-4 cursor-pointer hover:border-white/[0.14] hover:bg-[#191e2e] transition-all"
            >
              <div className="flex-1">
                <p className="font-semibold mb-1">{a.simulado_title}</p>
                <p className="text-xs text-gray-600">
                  {a.completed_at
                    ? format(new Date(a.completed_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })
                    : '—'}
                  {' · '}
                  {a.score}/{a.total_questions} acertos · {formatTime(a.time_taken)}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-full border-2 ${border} flex items-center justify-center
                              font-mono text-sm font-semibold ${color} flex-shrink-0`}>
                {a.percentage}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
