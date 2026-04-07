'use client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Clock, Users, ChevronRight } from 'lucide-react'
import TopHeader from '@/components/layout/TopHeader'
import { LoadingSpinner } from '@/components/shared/LoadingScreen'
import EmptyState from '@/components/shared/EmptyState'

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
  trips: DriverTrip[]
}

async function fetchTrips(): Promise<DriverDashData> {
  const res = await fetch('/api/driver/dashboard')
  if (!res.ok) throw new Error('Erro ao carregar viagens')
  return res.json()
}

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Agendada',  className: 'bg-gray-100 text-gray-600' },
  en_route:  { label: 'Em rota',   className: 'bg-[#E8F4ED] text-[#0D4A2B]' },
  completed: { label: 'Concluída', className: 'bg-blue-50 text-blue-700' },
  cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-700' },
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
}

export default function ManifestListPage() {
  const router = useRouter()
  const { data, isLoading, error } = useQuery<DriverDashData>({
    queryKey: ['driver-dashboard'],
    queryFn: fetchTrips,
  })

  const trips = data?.trips ?? []

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <TopHeader title="Manifestos" />

      <div className="px-4 pt-4 pb-24 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        )}

        {error instanceof Error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-[13px]">
            {error.message}
          </div>
        )}

        {!isLoading && trips.length === 0 && (
          <EmptyState
            icon="📋"
            title="Sem viagens"
            description="Não tem viagens agendadas para hoje."
          />
        )}

        {!isLoading && trips.map((trip) => {
          const cfg = statusConfig[trip.status] ?? statusConfig.scheduled
          const boarded = trip.total_seats - trip.available_seats
          return (
            <button
              key={trip.id}
              onClick={() => router.push(`/driver/manifest/${trip.id}`)}
              className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-[15px]">{trip.route_name}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-gray-400 text-[12px]">
                    <Clock size={12} />
                    {formatTime(trip.depart_time)} → {formatTime(trip.arrive_time)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.className}`}>
                    {cfg.label}
                  </span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                  <Users size={14} />
                  <span>{boarded} / {trip.total_seats} passageiros</span>
                </div>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1A6B3C] rounded-full"
                    style={{ width: `${trip.total_seats > 0 ? (boarded / trip.total_seats) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
