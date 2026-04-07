'use client'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

type Category = 'all' | 'chapa' | 'metro' | 'expresso'

interface Route {
  id: string
  name: string
  base_fare: number
  category: 'chapa' | 'metro' | 'expresso'
  availableSeats: number
  nextDeparture: string
  durationMinutes: number
}

const ROUTES: Route[] = [
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'Baixa → Museu', base_fare: 15, category: 'chapa', availableSeats: 12, nextDeparture: '8 min', durationMinutes: 13 },
  { id: 'a0000000-0000-0000-0000-000000000002', name: 'Machava → Julius Nyerere', base_fare: 25, category: 'chapa', availableSeats: 8, nextDeparture: '15 min', durationMinutes: 32 },
  { id: 'a0000000-0000-0000-0000-000000000003', name: 'Costa do Sol → Praça', base_fare: 30, category: 'chapa', availableSeats: 0, nextDeparture: '35 min', durationMinutes: 46 },
  { id: 'a0000000-0000-0000-0000-000000000004', name: 'Benfica → Baixa', base_fare: 20, category: 'metro', availableSeats: 6, nextDeparture: '20 min', durationMinutes: 20 },
  { id: 'a0000000-0000-0000-0000-000000000005', name: 'Zimpeto → Julius Nyerere', base_fare: 25, category: 'expresso', availableSeats: 14, nextDeparture: '5 min', durationMinutes: 38 },
]

const categoryLabels: Record<Category, string> = {
  all: 'Todos',
  chapa: 'Chapa',
  metro: 'Metro Bus',
  expresso: 'Expresso',
}

const categoryStyles: Record<string, string> = {
  chapa: 'bg-[#E8F4ED] text-[#0D4A2B]',
  metro: 'bg-blue-50 text-blue-800',
  expresso: 'bg-[#FFF8E7] text-amber-800',
}

export default function PassengerHomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [routes, setRoutes] = useState<Route[]>(ROUTES)
  const [greeting, setGreeting] = useState('Bom dia')

  useEffect(() => {
    const h = new Date().getHours()
    if (h >= 12 && h < 18) setGreeting('Boa tarde')
    else if (h >= 18) setGreeting('Boa noite')

    // Load real data silently in background — never blocks render
    const t = setTimeout(() => {
      fetch('/api/routes')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setRoutes(data)
        })
        .catch(() => {})
    }, 100)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(
    () =>
      routes.filter((r) => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
        const matchCat = category === 'all' || r.category === category
        return matchSearch && matchCat
      }),
    [routes, search, category]
  )

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-[#0D4A2B] px-4 pt-12 pb-6">
        <p className="text-[#A8D5B8] text-[13px] mb-0.5">{greeting}!</p>
        <h1 className="text-white text-[20px] font-bold mb-4">
          Para onde vai hoje?
        </h1>
        <div className="flex items-center gap-3 bg-white/15 rounded-2xl px-4 py-3">
          <Search size={18} className="text-white/60 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar rota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-white/50 text-[15px] outline-none"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="px-4 pt-3 pb-2 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(categoryLabels) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                category === cat
                  ? 'bg-[#1A6B3C] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Route cards */}
      <div className="px-4 pt-4 pb-6 space-y-3">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Rotas disponíveis
        </p>
        {filtered.map((route) => (
          <button
            key={route.id}
            onClick={() => router.push(`/trips/${route.id}`)}
            className="w-full text-left bg-white border border-gray-100 rounded-xl p-4 active:scale-[0.98] transition-transform shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-[15px] truncate">
                  {route.name}
                </p>
                <p className="text-gray-400 text-[13px] mt-0.5">
                  {route.durationMinutes} min · {route.nextDeparture} ·{' '}
                  {route.availableSeats > 0
                    ? `${route.availableSeats} lugares`
                    : 'Lotado'}
                </p>
                <span
                  className={`inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryStyles[route.category]}`}
                >
                  {route.category === 'metro'
                    ? 'Metro Bus'
                    : route.category === 'expresso'
                      ? 'Expresso'
                      : 'Chapa'}
                </span>
              </div>
              <div className="shrink-0">
                {route.availableSeats > 0 ? (
                  <span className="font-bold text-[#1A6B3C] text-[17px]">
                    {route.base_fare} MT
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold px-2 py-1 rounded-lg">
                    LOTADO
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
