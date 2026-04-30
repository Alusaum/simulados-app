'use client'
// src/components/layout/Providers.tsx
// Envolve a aplicação com QueryClient e hidrata o estado de auth.

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:          60 * 1000, // 1 minuto
        retry:              1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  const hydrate = useAuthStore((s) => s.hydrate)

  // Recupera sessão salva em cookie ao montar
  useEffect(() => { hydrate() }, [hydrate])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
