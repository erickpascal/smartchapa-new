'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Star, Phone, Globe, TrendingUp } from 'lucide-react'
import TopHeader from '@/components/layout/TopHeader'
import { useUserStore } from '@/store/userStore'
import { createClient } from '@/lib/supabase/client'

export default function DriverProfilePage() {
  const router = useRouter()
  const { user, setUser } = useUserStore()
  const supabase = createClient()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [language, setLanguage] = useState<'pt' | 'en'>(user?.preferred_language ?? 'pt')

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      document.cookie = 'smartchapa_guest_role=;path=/;max-age=0'
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
    } finally {
      setIsSigningOut(false)
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const isGuest = user?.id?.startsWith('guest')

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <TopHeader title="Perfil" />

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Avatar card */}
        <div className="bg-[#1A6B3C] rounded-2xl px-5 py-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[20px] shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-white font-bold text-[18px]">{user?.name ?? '—'}</p>
            <p className="text-white/70 text-[13px] mt-0.5">
              {user?.phone ? user.phone : (isGuest ? 'Modo convidado' : '—')}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Star size={16} className="text-[#F5A623]" />, value: '4.8', label: 'Avaliação' },
            { icon: <TrendingUp size={16} className="text-[#1A6B3C]" />, value: '142', label: 'Viagens' },
            { icon: <Phone size={16} className="text-blue-500" />, value: user?.phone?.slice(-4) ?? '—', label: 'Telemóvel' },
          ].map(({ icon, value, label }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center gap-1">
              {icon}
              <p className="font-bold text-gray-900 text-[16px]">{value}</p>
              <p className="text-[11px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Language */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe size={13} />
            Idioma
          </p>
          <div className="flex gap-3">
            {(['pt', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold border-2 transition-colors ${
                  language === lang
                    ? 'border-[#1A6B3C] bg-[#E8F4ED] text-[#0D4A2B]'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                {lang === 'pt' ? 'Português' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Guest notice */}
        {isGuest && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <p className="text-amber-800 text-[13px] font-medium">Está em modo convidado.</p>
            <p className="text-amber-700 text-[12px] mt-0.5">Crie uma conta para guardar os seus dados.</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-2 text-[#1A6B3C] text-[13px] font-semibold hover:underline"
            >
              Criar conta →
            </button>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center gap-2 border-2 border-[#D32F2F] text-[#D32F2F] font-semibold py-3.5 rounded-xl text-[15px] hover:bg-red-50 disabled:opacity-60 transition-colors"
        >
          <LogOut size={18} />
          {isSigningOut ? 'A sair...' : 'Terminar sessão'}
        </button>
      </div>
    </div>
  )
}
