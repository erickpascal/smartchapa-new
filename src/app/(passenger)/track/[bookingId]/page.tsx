'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ChapaMap from '@/components/maps/ChapaMap'
import SOSButton from '@/components/shared/SOSButton'
import { LoadingSpinner } from '@/components/shared/LoadingScreen'

interface BookingDetail {
  id: string
  seat_number: number
  fare: number
  trip_id: string
  status: string
  trip: {
    status: string
    route: { name: string }
    vehicle: { plate: string }
    driver: { name: string; rating: number }
    depart_time: string
    arrive_time: string
  }
}

async function fetchBooking(bookingId: string): Promise<BookingDetail> {
  const res = await fetch(`/api/bookings/${bookingId}`)
  if (!res.ok) throw new Error('Erro ao carregar reserva')
  return res.json()
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'text-[#F5A623]' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

export default function LiveTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string
  const supabase = createClient()

  const [eta] = useState('...')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>()
  const [showRating, setShowRating] = useState(false)

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => fetchBooking(bookingId),
    refetchInterval: 10_000,
  })

  // Get user location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }, [])

  // Subscribe to trip status changes
  useEffect(() => {
    if (!booking?.trip_id) return
    const channel = supabase
      .channel(`trip-status-${booking.trip_id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'trips', filter: `id=eq.${booking.trip_id}` },
        (payload) => {
          if (payload.new.status === 'completed') {
            setTimeout(() => setShowRating(true), 2000)
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [booking?.trip_id, supabase])

  const formatTime = (iso?: string) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
  }

  const driver = booking?.trip?.driver
  const vehicle = booking?.trip?.vehicle
  const route = booking?.trip?.route

  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Map */}
      {booking?.trip_id ? (
        <ChapaMap
          tripId={booking.trip_id}
          userLocation={userLocation}
          eta={eta}
          height="240px"
        />
      ) : (
        <div className="h-60 bg-[#C8E0CC] flex items-center justify-center">
          <LoadingSpinner className="w-8 h-8" />
        </div>
      )}

      <div className="px-4 pt-4 pb-24 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        ) : booking ? (
          <>
            {/* Driver card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8F4ED] flex items-center justify-center text-[#1A6B3C] font-bold text-[15px] shrink-0">
                  {driver?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ?? 'M'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-[15px]">{driver?.name ?? '—'}</p>
                  <StarRating rating={driver?.rating ?? 0} />
                </div>
                <p className="font-mono text-[12px] text-gray-400">{vehicle?.plate ?? '—'}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: `${eta} min`, label: 'Chegada' },
                { value: route?.name?.split('→')[0]?.trim() ?? '—', label: 'Origem' },
                { value: formatTime(booking.trip?.arrive_time), label: 'Destino' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-[#E8F4ED] rounded-xl p-3 text-center">
                  <p className="font-semibold text-[#0D4A2B] text-[14px] leading-tight truncate">{value}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Confirmation banner */}
            <div className="bg-[#E8F4ED] rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-[16px]">✅</span>
              <p className="text-[#0D4A2B] text-[13px] font-medium">
                Pagamento confirmado · Assento {booking.seat_number}
              </p>
            </div>

            {/* Call driver button */}
            <button
              className="w-full border-2 border-[#1A6B3C] text-[#1A6B3C] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-[14px]"
              onClick={() => {}}
            >
              <Phone size={18} />
              Ligar ao capitão
            </button>
          </>
        ) : null}
      </div>

      {/* SOS floating button */}
      <SOSButton />

      {/* Rating modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full p-6">
            <h2 className="text-[20px] font-bold text-gray-900 mb-1">Como foi a viagem?</h2>
            <p className="text-gray-400 text-[14px] mb-5">Avalie o capitão {driver?.name}</p>
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="text-[40px] text-gray-200 hover:text-[#F5A623] transition-colors">
                  ★
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowRating(false); router.push('/') }}
              className="w-full bg-[#1A6B3C] text-white font-semibold py-4 rounded-xl text-[16px]"
            >
              Submeter avaliação
            </button>
            <button
              onClick={() => { setShowRating(false); router.push('/') }}
              className="w-full mt-2 text-gray-400 text-[14px] py-2"
            >
              Saltar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
