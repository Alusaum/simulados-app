'use client'
// src/app/(app)/quiz/[id]/page.tsx
// Página principal do simulado — gerencia timer, navegação e envio.

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { simuladosApi, resultadosApi } from '@/lib/api'
import type { SimuladoDetail, AnswerMap } from '@/types'
import Timer from '@/components/quiz/Timer'
import QuestionCard from '@/components/quiz/QuestionCard'
import QuizProgress from '@/components/quiz/QuizProgress'
import { Loader2, AlertTriangle } from 'lucide-react'

export default function QuizPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()

  const [attemptId,   setAttemptId]   = useState<string | null>(null)
  const [answers,     setAnswers]      = useState<AnswerMap>({})
  const [currentIdx,  setCurrentIdx]   = useState(0)
  const [timeTaken,   setTimeTaken]    = useState(0)
  const [isFinishing, setIsFinishing]  = useState(false)
  const [started,     setStarted]      = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Carrega o simulado
  const { data: simulado, isLoading, isError } = useQuery<SimuladoDetail>({
    queryKey: ['simulado', id],
    queryFn:  () => simuladosApi.get(id).then((r) => r.data),
  })

  // Inicia a tentativa no backend assim que o simulado carrega
  useEffect(() => {
    if (simulado && !attemptId) {
      resultadosApi.start(simulado.id).then((r) => {
        setAttemptId(r.data.attempt_id)
        setStarted(true)
      })
    }
  }, [simulado, attemptId])

  // Cronômetro crescente (tempo gasto)
  useEffect(() => {
    if (!started) return
    timerRef.current = setInterval(() => setTimeTaken((t) => t + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [started])

  const selectAnswer = (questionId: string, option: 'a' | 'b' | 'c' | 'd') => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  const handleFinish = useCallback(async () => {
    if (!attemptId) return

    const unanswered = simulado!.questions.filter((q) => !answers[q.id]).length
    if (unanswered > 0) {
      const ok = confirm(`Você tem ${unanswered} questão(ões) sem resposta. Deseja finalizar mesmo assim?`)
      if (!ok) return
    }

    setIsFinishing(true)
    if (timerRef.current) clearInterval(timerRef.current)

    try {
      await resultadosApi.finish(attemptId, answers, timeTaken)
      router.push(`/results/${attemptId}`)
    } catch {
      alert('Erro ao finalizar. Tente novamente.')
      setIsFinishing(false)
    }
  }, [attemptId, answers, timeTaken, simulado, router])

  // Timeout automático
  const handleTimeUp = useCallback(() => {
    alert('⏰ Tempo esgotado! O simulado será finalizado automaticamente.')
    handleFinish()
  }, [handleFinish])

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-gold" size={32} />
    </div>
  )

  if (isError || !simulado) return (
    <div className="card text-center py-16">
      <AlertTriangle className="mx-auto mb-3 text-red-400" size={32} />
      <p className="text-gray-400">Simulado não encontrado.</p>
    </div>
  )

  const questions   = simulado.questions
  const currentQ    = questions[currentIdx]
  const isLast      = currentIdx === questions.length - 1
  const answeredCnt = Object.keys(answers).length

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="font-semibold text-lg">{simulado.title}</h2>
          <p className="text-sm text-gray-500">{questions.length} questões · {simulado.time_limit} min</p>
        </div>
        {started && (
          <Timer
            totalSeconds={simulado.time_limit * 60}
            onTimeUp={handleTimeUp}
          />
        )}
      </div>

      {/* Barra de progresso */}
      <QuizProgress
        total={questions.length}
        answered={answeredCnt}
        current={currentIdx}
      />

      {/* Questão atual */}
      <QuestionCard
        question={currentQ}
        selected={answers[currentQ.id] ?? null}
        onSelect={(opt) => selectAnswer(currentQ.id, opt)}
      />

      {/* Navegação por pontos */}
      <div className="flex flex-wrap gap-1.5 justify-center my-4">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIdx(i)}
            className={`w-8 h-8 rounded-md text-xs font-semibold transition-all ${
              i === currentIdx
                ? 'bg-gold text-ink scale-110'
                : answers[q.id]
                ? 'bg-gold/30 text-gold'
                : 'bg-white/5 text-gray-500 hover:bg-white/10'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Botões de navegação */}
      <div className="flex items-center justify-between gap-3 mt-4">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="btn-ghost"
        >
          ← Anterior
        </button>

        {isLast ? (
          <button
            onClick={handleFinish}
            disabled={isFinishing}
            className="btn-primary"
          >
            {isFinishing ? <Loader2 size={15} className="animate-spin" /> : '✓'}
            {isFinishing ? 'Finalizando...' : 'Finalizar simulado'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
            className="btn-primary"
          >
            Próxima →
          </button>
        )}
      </div>
    </div>
  )
}
