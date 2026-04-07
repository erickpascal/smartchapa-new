import Link from 'next/link'
import BottomNav from '@/components/layout/BottomNav'

export default function PassengerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* Left sidebar — lg+ only */}
      <div className="hidden lg:flex flex-col w-64 bg-[#0D4A2B] min-h-screen p-6 sticky top-0 h-screen shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">
            🚌
          </div>
          <div>
            <p className="text-white font-bold text-[16px]">SmartChapa</p>
            <p className="text-white/60 text-[11px]">Maputo, Moçambique</p>
          </div>
        </div>
        <nav className="space-y-1">
          {[
            { icon: '🏠', label: 'Início', path: '/' },
            { icon: '🗺️', label: 'Mapa', path: '/map' },
            { icon: '📋', label: 'Reservas', path: '/bookings' },
            { icon: '👤', label: 'Perfil', path: '/profile' },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors text-[14px]"
            >
              <span className="text-[18px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-white/30 text-[11px] text-center mt-auto pt-4">
          SmartChapa © 2025
        </p>
      </div>

      {/* Phone frame */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-xl relative">
        <main className="flex-1 pb-16">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
