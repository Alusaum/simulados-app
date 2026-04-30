'use client'
// src/app/(auth)/login/page.tsx

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
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await authApi.login(data)
      const { access, refresh, user } = res.data as AuthTokens
      setAuth(user, access, refresh)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Credenciais inválidas.')
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Entrar na conta</h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">E-mail</label>
          <input
            {...register('email')}
            type="email"
            placeholder="seu@email.com"
            className="input"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Senha</label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="input"
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {isSubmitting ? 'Entrando...' : 'Entrar →'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Não tem conta?{' '}
        <Link href="/register" className="text-gold hover:underline">Criar conta grátis</Link>
      </p>
    </div>
  )
}
