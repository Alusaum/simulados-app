/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilita React strict mode para detectar problemas cedo
  reactStrictMode: true,

  // Variáveis de ambiente disponíveis no cliente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
}

module.exports = nextConfig
