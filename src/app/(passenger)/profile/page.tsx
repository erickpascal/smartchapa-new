'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, X, Globe } from 'lucide-react'
import TopHeader from '@/components/layout/TopHeader'
import { useUserStore } from '@/store/userStore'
import { createClient } from '@/lib/supabase/client'

interface EmergencyContact {
  name: string
  phone: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser } = useUserStore()
  const supabase = createClient()

  const [language, setLanguage] = useState<'pt' | 'en'>(user?.preferred_language ?? 'pt')
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

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

  const handleAddContact = () => {
    if (!newName.trim() || !newPhone.trim()) return
    if (contacts.length >= 3) return
    setContacts([...contacts, { name: newName.trim(), phone: newPhone.trim() }])
    setNewName('')
    setNewPhone('')
    setShowAddContact(false)
  }

  const removeContact = (i: number) => {
    setContacts(contacts.filter((_, idx) => idx !== i))
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <TopHeader title="Perfil" />

      <div className="px-4 pt-4 pb-24 space-y-5">
        {/* Avatar + name */}
        <div className="bg-[#1A6B3C] rounded-2xl px-5 py-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[20px] shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-white font-bold text-[18px]">{user?.name ?? '—'}</p>
            <p className="text-white/70 text-[13px] mt-0.5">{user?.phone ?? '—'}</p>
          </div>
        </div>

        {/* Wallet balance */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Saldo da carteira</p>
            <p className="text-[28px] font-bold text-[#1A6B3C] mt-0.5">
              {user?.wallet_balance ?? 0} MT
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#E8F4ED] flex items-center justify-center text-[22px]">
            💳
          </div>
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
                {lang === 'pt' ? '🇲🇿 Português' : '🇬🇧 English'}
              </button>
            ))}
          </div>
        </div>

        {/* Emergency contacts */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">
              Contactos de emergência
            </p>
            {contacts.length < 3 && (
              <button
                onClick={() => setShowAddContact(!showAddContact)}
                className="flex items-center gap-1 text-[#1A6B3C] text-[12px] font-semibold"
              >
                <Plus size={14} />
                Adicionar
              </button>
            )}
          </div>

          {contacts.length === 0 && !showAddContact && (
            <p className="text-gray-400 text-[13px]">Nenhum contacto adicionado.</p>
          )}

          {contacts.map((c, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
              <div className="flex-1">
                <p className="text-[14px] font-medium text-gray-800">{c.name}</p>
                <p className="text-[12px] text-gray-400">{c.phone}</p>
              </div>
              <button onClick={() => removeContact(i)} className="text-gray-300 hover:text-red-500">
                <X size={16} />
              </button>
            </div>
          ))}

          {showAddContact && (
            <div className="space-y-2 pt-1">
              <input
                type="text"
                placeholder="Nome do contacto"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#1A6B3C]"
              />
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1A6B3C]">
                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-[13px] border-r border-gray-200 shrink-0">
                  +258
                </span>
                <input
                  type="tel"
                  placeholder="84 000 0000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-2.5 text-[14px] outline-none bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddContact}
                  className="flex-1 bg-[#1A6B3C] text-white text-[13px] font-semibold py-2.5 rounded-xl"
                >
                  Guardar
                </button>
                <button
                  onClick={() => { setShowAddContact(false); setNewName(''); setNewPhone('') }}
                  className="px-4 text-gray-400 text-[13px] border border-gray-200 rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

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
