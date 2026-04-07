'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Globe, Phone, Mail, User, Bus, BarChart2, Shield, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import type { User as UserType, UserRole } from '@/types/database'

const T = {
  pt: {
    tagline: 'O seu transporte, digitalizado.',
    title: 'Bem-vindo',
    subtitle: 'Entre ou crie a sua conta numa única etapa.',
    phone: 'Número de telemóvel',
    email: 'Endereço de email',
    emailPlaceholder: 'ana@exemplo.com',
    password: 'Senha',
    passwordHint: 'Mínimo 8 caracteres',
    cta: 'Entrar / Criar conta',
    ctaLoading: 'A entrar...',
    guest: 'Continuar sem conta',
    orWith: 'ou continuar com',
    errFill: 'Preencha todos os campos.',
    errPassword: 'A senha deve ter pelo menos 8 caracteres.',
    errGeneric: 'Erro ao autenticar. Verifique os dados e tente novamente.',
    google: 'Google',
    apple: 'Apple',
  },
  en: {
    tagline: 'Your transport, digitalised.',
    title: 'Welcome',
    subtitle: 'Sign in or create your account in one step.',
    phone: 'Phone number',
    email: 'Email address',
    emailPlaceholder: 'ana@example.com',
    password: 'Password',
    passwordHint: 'Minimum 8 characters',
    cta: 'Sign in / Create account',
    ctaLoading: 'Signing in...',
    guest: 'Continue without account',
    orWith: 'or continue with',
    errFill: 'Please fill in all fields.',
    errPassword: 'Password must be at least 8 characters.',
    errGeneric: 'Authentication failed. Check your details and try again.',
    google: 'Google',
    apple: 'Apple',
  },
}

function SmartChapaLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="SmartChapa">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 383.8 30 297.1 30 210.4c0-137.9 89.7-210.6 174.5-210.6 46.9 0 86.1 30.8 114.9 30.8 28.8 0 73.5-32.1 125.9-32.1 20.7 0 103.7 2 165.9 76.5zm-237.9-166c25.9-30.8 44.7-73.5 44.7-116.2 0-5.8-.6-11.6-1.3-17.4-42.2 1.9-91.2 28.2-121.4 63-22.5 25.3-45.7 68-45.7 111.4 0 6.4.6 12.8 1.3 15.4 2.6.6 6.5 1.3 10.3 1.3 37.9 0 85.5-25.3 112.1-57.5z" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useUserStore()
  const supabase = createClient()

  const [lang, setLang] = useState<'pt' | 'en'>('pt')
  const [mode, setMode] = useState<'phone' | 'email'>('phone')
  const [showGuestSheet, setShowGuestSheet] = useState(false)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const t = T[lang]

  useEffect(() => {
    const saved = localStorage.getItem('smartchapa_lang')
    if (saved === 'en' || saved === 'pt') setLang(saved)
    // Delay ping so it never blocks first paint
    const t = setTimeout(() => { fetch('/api/ping').catch(() => {}) }, 2000)
    return () => clearTimeout(t)
  }, [])

  const toggleLang = () => {
    const next = lang === 'pt' ? 'en' : 'pt'
    setLang(next)
    localStorage.setItem('smartchapa_lang', next)
  }

  const resolveEmail = () => {
    if (mode === 'email') return email.trim()
    const digits = phone.replace(/\D/g, '')
    const full = digits.startsWith('258') ? digits : `258${digits}`
    return `p${full}@smartchapa.app`
  }

  const redirectByRole = (role: string) => {
    if (role === 'driver') router.push('/driver')
    else if (role === 'operator') router.push('/operator/dashboard')
    else if (role === 'admin') router.push('/admin/dashboard')
    else router.push('/')
  }

  const handleAuth = async () => {
    setError(null)
    const identifier = mode === 'phone' ? phone : email
    if (!identifier || !password) { setError(t.errFill); return }
    if (password.length < 8) { setError(t.errPassword); return }

    setIsLoading(true)
    try {
      const loginEmail = resolveEmail()

      // Step 1: try sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (!signInError && signInData.user) {
        // Clear guest cookie on real login
        document.cookie = 'smartchapa_guest_role=;path=/;max-age=0'
        // Existing user — fetch profile and redirect
        fetch('/api/routes').catch(() => {})
        const { data: profile } = await supabase.from('users').select('*').eq('id', signInData.user.id).single()
        if (profile) {
          setUser(profile as UserType)
          redirectByRole((profile as UserType).role)
        } else {
          router.push('/')
        }
        return
      }

      // Step 2: sign in failed — try to create account automatically
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: loginEmail,
        password,
      })

      if (signUpError) {
        setError(t.errGeneric)
        return
      }

      // Already exists (email confirmation ON, identities empty)
      if (signUpData.user && signUpData.user.identities?.length === 0) {
        setError(t.errGeneric)
        return
      }

      if (!signUpData.user) {
        setError(t.errGeneric)
        return
      }

      // Clear guest cookie on new account creation
      document.cookie = 'smartchapa_guest_role=;path=/;max-age=0'
      // New account created — insert a default passenger profile
      const defaultName = mode === 'phone' ? `Utilizador ${phone.slice(-4)}` : email.split('@')[0]
      const phoneValue = mode === 'phone'
        ? `+${phone.replace(/\D/g, '').replace(/^258/, '258')}`
        : ''

      await supabase.from('users').insert({
        id: signUpData.user.id,
        name: defaultName,
        phone: phoneValue,
        role: 'passenger',
        wallet_balance: 0,
        preferred_language: lang,
      })

      // Sign in with the new credentials
      const { data: finalSignIn, error: finalError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (finalError || !finalSignIn.user) {
        setError(t.errGeneric)
        return
      }

      fetch('/api/routes').catch(() => {})
      setUser({
        id: finalSignIn.user.id,
        name: defaultName,
        phone: phoneValue,
        role: 'passenger',
        wallet_balance: 0,
        preferred_language: lang,
        created_at: new Date().toISOString(),
      })
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuest = (role: UserRole) => {
    const names: Record<UserRole, string> = {
      passenger: 'Convidado',
      driver: 'Capitão Convidado',
      operator: 'Operador Convidado',
      admin: 'Admin Convidado',
    }
    // Set a cookie so middleware lets the guest through protected routes
    document.cookie = `smartchapa_guest_role=${role};path=/;max-age=86400`
    setUser({
      id: `guest-${role}`,
      name: names[role],
      phone: '',
      role,
      wallet_balance: 0,
      preferred_language: lang,
      created_at: new Date().toISOString(),
    } as UserType)
    if (role === 'driver') router.push('/driver')
    else if (role === 'operator') router.push('/operator/dashboard')
    else if (role === 'admin') router.push('/admin/dashboard')
    else router.push('/')
  }

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider)
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/` },
    })
    setOauthLoading(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-[#1A6B3C] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#E8F4ED]"
            aria-label="Change language"
          >
            <Globe size={14} />
            {lang === 'pt' ? 'PT · EN' : 'EN · PT'}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#1A6B3C] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <SmartChapaLogo size={28} />
          </div>
          <h1 className="text-[26px] font-bold text-gray-900">SmartChapa</h1>
          <p className="text-gray-400 text-[13px] mt-1">{t.tagline}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900">{t.title}</h2>
            <p className="text-gray-400 text-[13px] mt-0.5">{t.subtitle}</p>
          </div>

          {/* Phone / Email toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden p-1 gap-1 bg-gray-50">
            <button
              onClick={() => { setMode('phone'); setError(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                mode === 'phone' ? 'bg-white text-[#1A6B3C] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Phone size={14} />
              {lang === 'pt' ? 'Telemóvel' : 'Phone'}
            </button>
            <button
              onClick={() => { setMode('email'); setError(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                mode === 'email' ? 'bg-white text-[#1A6B3C] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Mail size={14} />
              Email
            </button>
          </div>

          {/* Identifier input */}
          {mode === 'phone' ? (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-700">{t.phone}</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1A6B3C] transition-colors">
                <span className="px-3 py-3 bg-gray-50 text-gray-500 text-[13px] border-r border-gray-200 shrink-0 font-medium">
                  +258
                </span>
                <input
                  type="tel"
                  placeholder="84 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                  inputMode="numeric"
                  autoComplete="tel"
                  className="flex-1 px-3 py-3 text-[15px] outline-none bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-700">{t.email}</label>
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                autoComplete="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#1A6B3C] transition-colors"
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">{t.password}</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1A6B3C] transition-colors">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t.passwordHint}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                autoComplete="current-password"
                className="flex-1 px-4 py-3 text-[15px] outline-none bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-[13px]">
              {error}
            </div>
          )}

          {/* Primary CTA */}
          <button
            onClick={handleAuth}
            disabled={isLoading}
            className="w-full bg-[#1A6B3C] text-white font-semibold py-3.5 rounded-xl text-[15px] flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity active:scale-[0.98]"
          >
            {isLoading
              ? <><Loader2 size={18} className="animate-spin" />{t.ctaLoading}</>
              : t.cta}
          </button>

          {/* Guest access */}
          <button
            onClick={() => setShowGuestSheet(true)}
            className="w-full py-3 text-[14px] text-gray-400 hover:text-[#1A6B3C] transition-colors font-medium"
          >
            {t.guest} →
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-[12px]">{t.orWith}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {oauthLoading === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
              {t.google}
            </button>
            <button
              onClick={() => handleOAuth('apple')}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {oauthLoading === 'apple' ? <Loader2 size={16} className="animate-spin" /> : <AppleIcon />}
              {t.apple}
            </button>
          </div>
        </div>
      </div>

      {/* Guest role sheet */}
      {showGuestSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowGuestSheet(false)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-sm px-5 pt-5 pb-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[18px] font-bold text-gray-900">
                  {lang === 'pt' ? 'Entrar como...' : 'Continue as...'}
                </h3>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {lang === 'pt' ? 'Sem conta — apenas exploração' : 'No account — browse only'}
                </p>
              </div>
              <button
                onClick={() => setShowGuestSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([
                { role: 'passenger' as UserRole, label: lang === 'pt' ? 'Passageiro' : 'Passenger', icon: <User size={24} />, desc: lang === 'pt' ? 'Explorar rotas e viagens' : 'Explore routes & trips', color: 'border-[#1A6B3C] bg-[#E8F4ED]', iconColor: 'text-[#1A6B3C]', textColor: 'text-[#0D4A2B]' },
                { role: 'driver' as UserRole,    label: lang === 'pt' ? 'Capitão' : 'Captain',      icon: <Bus size={24} />,  desc: lang === 'pt' ? 'Ver painel do capitão' : 'View captain dashboard', color: 'border-blue-300 bg-blue-50', iconColor: 'text-blue-600', textColor: 'text-blue-800' },
                { role: 'operator' as UserRole,  label: lang === 'pt' ? 'Operador' : 'Operator',    icon: <BarChart2 size={24} />, desc: lang === 'pt' ? 'Ver painel da frota' : 'View fleet dashboard', color: 'border-amber-300 bg-amber-50', iconColor: 'text-amber-600', textColor: 'text-amber-800' },
                { role: 'admin' as UserRole,     label: lang === 'pt' ? 'Administrador' : 'Admin',  icon: <Shield size={24} />, desc: lang === 'pt' ? 'Ver painel de admin' : 'View admin dashboard', color: 'border-purple-300 bg-purple-50', iconColor: 'text-purple-600', textColor: 'text-purple-800' },
              ]).map(({ role, label, icon, desc, color, iconColor, textColor }) => (
                <button
                  key={role}
                  onClick={() => handleGuest(role)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${color}`}
                >
                  <span className={iconColor}>{icon}</span>
                  <span className={`text-[14px] font-bold ${textColor}`}>{label}</span>
                  <span className={`text-[11px] text-center leading-tight ${textColor} opacity-70`}>{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
