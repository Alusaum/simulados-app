'use client'
// src/app/(auth)/register/page.tsx

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { AuthTokens } from '@/types'

const schema = z.object({
  name:     z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await authApi.register(data)
      const { access, refresh, user } = res.data as AuthTokens
      setAuth(user, access, refresh)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Criar conta grátis</h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Nome completo</label>
          <input {...register('name')} type="text" placeholder="Seu nome" className="input" />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">E-mail</label>
          <input {...register('email')} type="email" placeholder="seu@email.com" className="input" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Senha</label>
          <input {...register('password')} type="password" placeholder="Mín. 6 caracteres" className="input" />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {isSubmitting ? 'Criando conta...' : 'Criar conta →'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Já tem conta?{' '}
        <Link href="/login" className="text-gold hover:underline">Entrar</Link>
      </p>
    </div>
  )
}
