'use client'
// src/app/(app)/ranking/page.tsx

import { useQuery } from '@tanstack/react-query'
import { resultadosApi } from '@/lib/api'
import type { RankingItem } from '@/types'

const medals = ['🥇','🥈','🥉']

export default function RankingPage() {
  const { data: ranking, isLoading } = useQuery<RankingItem[]>({
    queryKey: ['ranking'],
    queryFn:  () => resultadosApi.ranking().then((r) => r.data),
  })

  return (
    <div className="animate-fade-up">
      <h1 className="font-serif text-3xl mb-2">🏆 Ranking Global</h1>
      <p className="text-gray-500 mb-8">Desempenho médio de todos os usuários.</p>

      {isLoading && (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => <div key={i} className="card h-16 animate-pulse bg-white/[0.03]" />)}
        </div>
      )}

      {ranking?.length === 0 && (
        <div className="card text-center py-16 text-gray-600">
          <p className="text-3xl mb-3">🏆</p>
          <p>O ranking está vazio.<br />Seja o primeiro a aparecer aqui!</p>
        </div>
      )}

      <div className="space-y-2">
        {ranking?.map((item, i) => (
          <div
            key={item.user_id}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border transition-all
              ${i === 0
                ? 'border-gold/30 bg-gold/5'
                : 'border-white/[0.07] bg-[#141720]'}`}
          >
            {/* Posição */}
            <div className={`w-8 text-right font-mono text-sm flex-shrink-0
                             ${i === 0 ? 'text-gold' : 'text-gray-600'}`}>
              {medals[i] ?? `#${item.position}`}
            </div>

            {/* Avatar */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center
                             font-bold text-sm flex-shrink-0
                             ${i === 0 ? 'bg-gold text-ink' : 'bg-white/10 text-gray-400'}`}>
              {item.user_name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{item.user_name}</p>
              <p className="text-xs text-gray-600">
                {item.total_attempts} simulado(s) · {item.total_correct} acertos no total
              </p>
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0">
              <div className="font-mono text-sm font-semibold">
                {item.avg_percentage}%
              </div>
              <div className="text-xs text-gray-600">média</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
