'use client'
// src/components/layout/Navbar.tsx

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { LogOut, LayoutDashboard, Trophy, ClipboardList } from 'lucide-react'

export default function Navbar() {
  const router  = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0f14]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="font-serif text-xl font-semibold">
          Simula<span className="text-gold">Aí</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/dashboard" icon={<LayoutDashboard size={15}/>}>Início</NavLink>
          <NavLink href="/history"   icon={<ClipboardList   size={15}/>}>Histórico</NavLink>
          <NavLink href="/ranking"   icon={<Trophy          size={15}/>}>Ranking</NavLink>
        </nav>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-ink font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-400 hidden sm:block">
                {user.name.split(' ')[0]}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400
                 hover:text-white hover:bg-white/5 transition-colors"
    >
      {icon}
      {children}
    </Link>
  )
}
