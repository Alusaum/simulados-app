// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#0d0f14]">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl mb-2">
            Simula<span className="text-gold">Aí</span>
          </h1>
          <p className="text-gray-500 text-sm">Plataforma de Simulados Online</p>
        </div>
        {children}
      </div>
    </main>
  )
}
