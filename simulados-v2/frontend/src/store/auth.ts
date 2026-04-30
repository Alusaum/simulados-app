// src/store/auth.ts
// Estado global de autenticação com Zustand.
// Persiste o usuário em cookie e sincroniza entre abas.

import { create } from 'zustand'
import Cookies from 'js-cookie'
import { User } from '@/types'

interface AuthState {
  user:    User | null
  isAuth:  boolean
  setAuth: (user: User, access: string, refresh: string) => void
  logout:  () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user:   null,
  isAuth: false,

  setAuth: (user, access, refresh) => {
    // Armazena tokens em cookies httpOnly-like (secure em produção)
    Cookies.set('access_token',  access,  { expires: 1/96,  secure: true, sameSite: 'strict' }) // 15min
    Cookies.set('refresh_token', refresh, { expires: 7,      secure: true, sameSite: 'strict' }) // 7d
    Cookies.set('user_data',     JSON.stringify(user), { expires: 7, secure: true })
    set({ user, isAuth: true })
  },

  logout: () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    Cookies.remove('user_data')
    set({ user: null, isAuth: false })
  },

  // Recupera sessão ao recarregar a página
  hydrate: () => {
    const raw = Cookies.get('user_data')
    if (raw) {
      try {
        const user = JSON.parse(raw) as User
        set({ user, isAuth: true })
      } catch {
        Cookies.remove('user_data')
      }
    }
  },
}))
