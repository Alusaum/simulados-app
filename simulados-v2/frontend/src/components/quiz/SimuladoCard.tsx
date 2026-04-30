'use client'
// src/components/quiz/SimuladoCard.tsx

import { useRouter } from 'next/navigation'
import { Clock, FileText, Users, ChevronRight } from 'lucide-react'
import type { Simulado } from '@/types'

const difficultyLabel: Record<string, { label: string; color: string }> = {
  easy:   { label: 'Fácil',  color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  medium: { label: 'Médio',  color: 'text-gold bg-gold/10 border-gold/20' },
  hard:   { label: 'Difícil', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
}

export default function SimuladoCard({ simulado }: { simulado: Simulado }) {
  const router = useRouter()
  const diff   = difficultyLabel[simulado.difficulty] ?? difficultyLabel.medium

  return (
    <div
      className="card flex items-center gap-5 cursor-pointer
                 hover:border-white/[0.14] hover:bg-[#191e2e] hover:translate-x-1
                 transition-all duration-200 group"
      onClick={() => router.push(`/quiz/${simulado.id}`)}
    >
      <div className="flex-1 min-w-0">
        {/* Badge */}
        <span className={`inline-flex items-center text-[11px] font-semibold tracking-wide
                          uppercase border rounded-full px-2.5 py-0.5 mb-2 ${diff.color}`}>
          {diff.label}
        </span>

        <h3 className="font-semibold text-base mb-1 truncate">{simulado.title}</h3>
        <p className="text-sm text-gray-500 truncate">{simulado.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-2.5">
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <FileText size={12} /> {simulado.question_count} questões
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Clock size={12} /> {simulado.time_limit} min
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Users size={12} /> {simulado.attempt_count} tentativas
          </span>
        </div>
      </div>

      <button className="btn-primary flex-shrink-0">
        Iniciar
        <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )
}
