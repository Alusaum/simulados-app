'use client'
// src/app/(app)/layout.tsx
// Layout do app autenticado — inclui Navbar e guarda de rota.

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import Navbar from '@/components/layout/Navbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuth = useAuthStore((s) => s.isAuth)

  // Redireciona para login se não autenticado
  useEffect(() => {
    if (!isAuth) router.push('/login')
  }, [isAuth, router])

  if (!isAuth) return null

  return (
    <div className="min-h-screen bg-[#0d0f14]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-5 pt-20 pb-16">
        {children}
      </main>
    </div>
  )
}
