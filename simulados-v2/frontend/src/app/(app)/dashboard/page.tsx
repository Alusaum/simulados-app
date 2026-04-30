'use client'
// src/app/(app)/dashboard/page.tsx

import { useQuery } from '@tanstack/react-query'
import { simuladosApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import SimuladoCard from '@/components/quiz/SimuladoCard'
import type { Simulado } from '@/types'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data: simulados, isLoading, isError } = useQuery<Simulado[]>({
    queryKey: ['simulados'],
    queryFn:  () => simuladosApi.list().then((r) => r.data),
  })

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl mb-2">
          Olá, <span className="text-gold">{user?.name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500">Escolha um simulado para começar a praticar.</p>
      </div>

      {/* Simulados */}
      <div className="mb-3">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-600">
          Simulados disponíveis
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-24 animate-pulse bg-white/[0.03]" />
          ))}
        </div>
      )}

      {isError && (
        <div className="card text-center py-12 text-gray-500">
          Erro ao carregar simulados. Verifique se o backend está rodando.
        </div>
      )}

      {simulados && (
        <div className="space-y-3">
          {simulados.map((s) => (
            <SimuladoCard key={s.id} simulado={s} />
          ))}
        </div>
      )}
    </div>
  )
}
