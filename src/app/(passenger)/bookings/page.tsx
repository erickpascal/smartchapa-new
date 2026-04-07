'use client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import TopHeader from '@/components/layout/TopHeader'
import EmptyState from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingScreen'
import { createClient } from '@/lib/supabase/client'

interface BookingSummary {
  id: string
  fare: number
  seat_number: number
  status: string
  created_at: string
  trip: {
    depart_time: string
    route: { name: string }
    vehicle: { plate: string }
  }
}

const MOCK_BOOKINGS: BookingSummary[] = [
  {
    id: 'mock-1',
    fare: 15,
    seat_number: 5,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    trip: { depart_time: new Date(Date.now() + 15 * 60_000).toISOString(), route: { name: 'Baixa → Museu' }, vehicle: { plate: 'MZ-10-3421' } },
  },
  {
    id: 'mock-2',
    fare: 25,
    seat_number: 2,
    status: 'completed',
    created_at: new Date(Date.now() - 86_400_000).toISOString(),
    trip: { depart_time: new Date(Date.now() - 86_400_000).toISOString(), route: { name: 'Machava → Julius Nyerere' }, vehicle: { plate: 'MZ-10-8812' } },
  },
]

async function fetchBookings(): Promise<BookingSummary[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return MOCK_BOOKINGS
  const { data } = await supabase
    .from('bookings')
    .select('id, fare, seat_number, status, created_at, trip:trips(depart_time, route:routes(name), vehicle:vehicles(plate))')
    .eq('passenger_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)
  const rows = (data as unknown as BookingSummary[]) ?? []
  return rows.length > 0 ? rows : MOCK_BOOKINGS
}

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmada', className: 'bg-[#E8F4ED] text-[#0D4A2B]' },
  pending:   { label: 'Pendente',   className: 'bg-[#FFF8E7] text-amber-800' },
  completed: { label: 'Concluída',  className: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Cancelada',  className: 'bg-red-50 text-red-700' },
}

export default function BookingsPage() {
  const router = useRouter()
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: fetchBookings,
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' })

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <TopHeader title="As minhas reservas" />

      <div className="px-4 pt-4 pb-4">
        {isLoading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        )}

        {!isLoading && bookings?.length === 0 && (
          <EmptyState
            icon="🎫"
            title="Sem reservas ainda"
            description="As suas reservas aparecerão aqui depois de fazer a primeira viagem."
            actionLabel="Explorar rotas"
            onAction={() => router.push('/')}
          />
        )}

        <div className="space-y-3">
          {bookings?.map((b) => {
            const status = statusConfig[b.status] ?? statusConfig.pending
            return (
              <button
                key={b.id}
                onClick={() => {
                  if (b.status === 'confirmed') router.push(`/track/${b.id}`)
                }}
                className={`w-full text-left bg-white border border-gray-100 rounded-xl p-4 transition-transform ${b.status === 'confirmed' ? 'active:scale-[0.98]' : 'opacity-80'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-900 text-[15px]">
                    {b.trip?.route?.name ?? '—'}
                  </p>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-lg ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-gray-400 space-y-0.5">
                    <p>{formatDate(b.created_at)} · {formatTime(b.trip?.depart_time)}</p>
                    <p>Assento {b.seat_number} · {b.trip?.vehicle?.plate ?? '—'}</p>
                  </div>
                  <p className="font-bold text-[#1A6B3C] text-[16px]">{b.fare} MT</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
