// src/lib/api.ts
// Cliente HTTP centralizado com Axios.
// Interceptor automático: injeta Bearer token e renova quando expirado.

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Instância principal
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request interceptor: adiciona o Bearer token ──────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: renova token se expirado (401) ─────────────────────
let isRefreshing = false
let queue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        // Aguarda a renovação em andamento
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      isRefreshing = true
      const refreshToken = Cookies.get('refresh_token')

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh: refreshToken })
        const newAccess = data.access

        Cookies.set('access_token', newAccess, { secure: true, sameSite: 'strict' })
        queue.forEach((cb) => cb(newAccess))
        queue = []

        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch {
        // Refresh falhou — desloga o usuário
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        window.location.href = '/auth/login'
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Funções de API tipadas ────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register/', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login/', data),
  refresh: (refresh: string) =>
    api.post('/auth/refresh/', { refresh }),
  passwordReset: (email: string) =>
    api.post('/auth/password-reset/', { email }),
}

export const simuladosApi = {
  list: (params?: { subject?: string; difficulty?: string }) =>
    api.get('/simulados/', { params }),
  get: (id: string) =>
    api.get(`/simulados/${id}/`),
  answers: (id: string) =>
    api.get(`/simulados/${id}/answers/`),
}

export const resultadosApi = {
  start: (simulado_id: string) =>
    api.post('/resultados/start/', { simulado_id }),
  save: (attemptId: string, answers: Record<string, string>) =>
    api.patch(`/resultados/${attemptId}/`, { answers }),
  finish: (attemptId: string, answers: Record<string, string>, time_taken: number) =>
    api.post(`/resultados/${attemptId}/finish/`, { answers, time_taken }),
  history: () =>
    api.get('/resultados/history/'),
  detail: (attemptId: string) =>
    api.get(`/resultados/${attemptId}/`),
  ranking: () =>
    api.get('/resultados/ranking/'),
  sync: (attempts: unknown[]) =>
    api.post('/resultados/sync/', { attempts }),
}
