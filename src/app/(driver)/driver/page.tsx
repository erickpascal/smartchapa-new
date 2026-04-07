'use client'
export const dynamic = 'force-dynamic'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Play, MapPin, Users, Clock, LogOut } from 'lucide-react'
import TopHeader from '@/components/layout/TopHeader'
import StatCard from '@/components/shared/StatCard'
import EmptyState from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingScreen'
import { useUserStore } from '@/store/userStore'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DriverTrip {
  id: string
  route_name: string
  depart_time: string
  arrive_time: string
  status: string
  available_seats: number
  total_seats: number
  plate: string
}

interface DriverDashData {
  trips_today: number
  passengers_today: number
  earnings_today: number
  trips: DriverTrip[]
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchDriverDash(): Promise<DriverDashData> {
  try {
    const res = await fetch('/api/driver/dashboard')
    if (!res.ok) throw new Error('failed')
    const data = await res.json()
    if (!data || !data.trips) throw new Error('empty')
    return data
  } catch {
    return {
      trips_today: 6,
      passengers_today: 84,
      earnings_today: 2350,
      trips: [
        {
          id: 'mock-trip-1',
          route_name: 'Baixa → Museu',
          depart_time: new Date(Date.now() - 10 * 60_000).toISOString(),
          arrive_time: new Date(Date.now() + 15 * 60_000).toISOString(),
          status: 'en_route',
          available_seats: 2,
          total_seats: 14,
          plate: 'MZ-10-3421',
        },
        {
          id: 'mock-trip-2',
          route_name: 'Baixa → Museu',
          depart_time: new Date(Date.now() + 40 * 60_000).toISOString(),
          arrive_time: new Date(Date.now() + 65 * 60_000).toISOString(),
          status: 'scheduled',
          available_seats: 14,
          total_seats: 14,
          plate: 'MZ-10-3421',
        },
      ],
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-gray-100 text-gray-600' },
  en_route:  { label: 'Em rota',  className: 'bg-[#E8F4ED] text-[#0D4A2B]' },
  completed: { label: 'Concluída',className: 'bg-blue-50 text-blue-700' },
  cancelled: { label: 'Cancelada',className: 'bg-red-50 text-red-700' },
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-MZ', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DriverHomePage() {
  const router = useRouter()
  const { user, setUser } = useUserStore()
  const supabase = createClient()

  const handleLogout = async () => {
    document.cookie = 'smartchapa_guest_role=;path=/;max-age=0'
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  const { data, isLoading, error } = useQuery<DriverDashData>({
    queryKey: ['driver-dashboard'],
    queryFn: fetchDriverDash,
    refetchInterval: 30_000,
  })

  const trips: DriverTrip[] = data?.trips ?? []
  const firstName = user?.name?.split(' ')[0] ?? 'Capitão'

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <TopHeader title="Início" />

      <div className="px-4 pt-4 pb-6 space-y-5">
        {/* Greeting */}
        <div className="bg-[#1A6B3C] rounded-2xl p-5 text-white relative">
          <p className="text-[13px] text-white/70">Bem-vindo de volta,</p>
          <p className="text-[22px] font-bold mt-0.5">{firstName}</p>
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-white/70 hover:text-white text-[12px] transition-colors"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            value={data?.trips_today ?? 0}
            label="Viagens"
            variant="default"
          />
          <StatCard
            value={data?.passengers_today ?? 0}
            label="Passageiros"
            variant="info"
          />
          <StatCard
            value={`${data?.earnings_today ?? 0} MT`}
            label="Ganhos"
            variant="accent"
          />
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        )}

        {error instanceof Error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-[13px]">
            {error.message}
          </div>
        )}

        {/* Today's trips */}
        {!isLoading && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Viagens de hoje
            </p>

            {trips.length === 0 ? (
              <EmptyState
                icon="🚌"
                title="Sem viagens hoje"
                description="Não tem viagens agendadas para hoje."
              />
            ) : (
              <div className="space-y-3">
                {trips.map((trip) => {
                  const cfg = statusConfig[trip.status] ?? statusConfig.scheduled
                  return (
                    <div
                      key={trip.id}
                      className="bg-white border border-gray-100 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 text-[15px]">
                            {trip.route_name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-gray-400 text-[12px]">
                            <Clock size={12} />
                            {formatTime(trip.depart_time)} → {formatTime(trip.arrive_time)}
                          </div>
                        </div>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-[13px] text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {trip.plate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={13} />
                          {trip.total_seats - trip.available_seats}/{trip.total_seats} lugares
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/driver/manifest/${trip.id}`)}
                          className="flex-1 bg-[#E8F4ED] text-[#0D4A2B] text-[13px] font-semibold py-2.5 rounded-xl"
                        >
                          Ver manifesto
                        </button>
                        {trip.status === 'scheduled' && (
                          <button className="flex items-center gap-1.5 bg-[#1A6B3C] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl">
                            <Play size={13} />
                            Iniciar
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
