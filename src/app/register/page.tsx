'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, User, Bus, BarChart2, Shield, Phone, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import type { User as UserType, UserRole } from '@/types/database'

function SmartChapaLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="SmartChapa">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useUserStore()
  const supabase = createClient()

  const [mode, setMode] = useState<'phone' | 'email'>('phone')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('passenger')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyExists, setAlreadyExists] = useState(false)

  const resolveEmail = () => {
    if (mode === 'email') return email.trim()
    const digits = phone.replace(/\D/g, '')
    const full = digits.startsWith('258') ? digits : `258${digits}`
    return `p${full}@smartchapa.app`
  }

  const resolvePhone = () => {
    if (mode === 'phone') {
      const digits = phone.replace(/\D/g, '')
      return `+${digits.startsWith('258') ? digits : `258${digits}`}`
    }
    return ''
  }

  const handleRegister = async () => {
    setError(null)
    setAlreadyExists(false)

    const identifier = mode === 'phone' ? phone : email
    if (!name || !identifier || !password) {
      setError('Preencha todos os campos.')
      return
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setIsLoading(true)
    try {
      const loginEmail = resolveEmail()

      const { data, error: signUpError } = await supabase.auth.signUp({ email: loginEmail, password })

      if (signUpError) {
        const msg = signUpError.message.toLowerCase()
        if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('user already')) {
          setAlreadyExists(true)
          setError('Esta conta já existe. Por favor entre em vez de registar.')
        } else {
          setError(`Erro ao criar conta: ${signUpError.message}`)
        }
        return
      }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setAlreadyExists(true)
        setError('Esta conta já existe. Por favor entre em vez de registar.')
        return
      }

      if (!data.user) {
        setError('Erro inesperado. Tente novamente.')
        return
      }

      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        name,
        phone: resolvePhone(),
        role,
        wallet_balance: 0,
        preferred_language: 'pt',
      })

      if (insertError) {
        if (!insertError.message.includes('duplicate') && !insertError.message.includes('unique')) {
          setError(`Erro ao guardar perfil: ${insertError.message}`)
          return
        }
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (signInError || !signInData.user) {
        router.push('/login')
        return
      }

      const newUser: UserType = {
        id: signInData.user.id,
        name,
        phone: resolvePhone(),
        role,
        wallet_balance: 0,
        preferred_language: 'pt',
        created_at: new Date().toISOString(),
      }
      setUser(newUser)

      if (role === 'driver') router.push('/driver')
      else if (role === 'operator') router.push('/operator/dashboard')
      else if (role === 'admin') router.push('/admin/dashboard')
      else router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const roles: { value: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'passenger', label: 'Passageiro',    icon: <User size={22} />,      desc: 'Reservar e rastrear chapas' },
    { value: 'driver',    label: 'Capitão',       icon: <Bus size={22} />,       desc: 'Gerir viagens e passageiros' },
    { value: 'operator',  label: 'Operador',      icon: <BarChart2 size={22} />, desc: 'Gerir frota e capitães' },
    { value: 'admin',     label: 'Administrador', icon: <Shield size={22} />,    desc: 'Gestão total do sistema' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#1A6B3C] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <SmartChapaLogo size={26} />
          </div>
          <h1 className="text-[24px] font-bold text-gray-900">Criar conta</h1>
          <p className="text-gray-400 text-[13px] mt-0.5">Junte-se ao SmartChapa hoje.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Nome completo</label>
            <input
              type="text"
              placeholder="Ana Matola"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#1A6B3C] transition-colors"
            />
          </div>

          {/* Phone / Email toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden p-1 gap-1 bg-gray-50">
            <button
              onClick={() => { setMode('phone'); setError(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                mode === 'phone'
                  ? 'bg-white text-[#1A6B3C] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Phone size={14} />
              Telemóvel
            </button>
            <button
              onClick={() => { setMode('email'); setError(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                mode === 'email'
                  ? 'bg-white text-[#1A6B3C] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Mail size={14} />
              Email
            </button>
          </div>

          {/* Phone or Email input */}
          {mode === 'phone' ? (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-700">Número de telemóvel</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1A6B3C] transition-colors">
                <span className="px-3 py-3 bg-gray-50 text-gray-500 text-[13px] border-r border-gray-200 shrink-0 font-medium">
                  +258
                </span>
                <input
                  type="tel"
                  placeholder="84 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  autoComplete="tel"
                  className="flex-1 px-3 py-3 text-[15px] outline-none bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-700">Endereço de email</label>
              <input
                type="email"
                placeholder="ana@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#1A6B3C] transition-colors"
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Senha</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1A6B3C] transition-colors">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                autoComplete="new-password"
                className="flex-1 px-4 py-3 text-[15px] outline-none bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Sou um...</label>
            <div className="grid grid-cols-2 gap-2.5">
              {roles.map((r) => {
                const active = role === r.value
                return (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      active
                        ? 'border-[#1A6B3C] bg-[#E8F4ED]'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className={active ? 'text-[#1A6B3C]' : 'text-gray-400'}>
                      {r.icon}
                    </span>
                    <span className={`text-[13px] font-semibold ${active ? 'text-[#0D4A2B]' : 'text-gray-700'}`}>
                      {r.label}
                    </span>
                    <span className={`text-[11px] text-center leading-tight ${active ? 'text-[#1A6B3C]' : 'text-gray-400'}`}>
                      {r.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 space-y-2">
              <p className="text-red-600 text-[13px]">{error}</p>
              {alreadyExists && (
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-[#1A6B3C] text-white text-[13px] font-semibold py-2 rounded-lg"
                >
                  Ir para login →
                </button>
              )}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full bg-[#1A6B3C] text-white font-semibold py-3.5 rounded-xl text-[15px] flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity active:scale-[0.98]"
          >
            {isLoading ? (
              <><Loader2 size={18} className="animate-spin" />A criar conta...</>
            ) : 'Criar conta'}
          </button>

          <p className="text-center text-[13px] text-gray-500">
            Já tem conta?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-[#1A6B3C] font-semibold hover:underline"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
