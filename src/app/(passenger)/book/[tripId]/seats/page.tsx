'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import TopHeader from '@/components/layout/TopHeader'
import SeatGrid from '@/components/passenger/SeatGrid'
import { LoadingSpinner } from '@/components/shared/LoadingScreen'
import { useBookingStore } from '@/store/bookingStore'

interface TripDetail {
  id: string
  plate: string
  total_seats: number
  taken_seats: number[]
  fare: number
  route_name: string
}

async function fetchTripDetail(tripId: string): Promise<TripDetail> {
  const res = await fetch(`/api/trips/${tripId}`)
  if (!res.ok) throw new Error('Erro ao carregar detalhes')
  return res.json()
}

export default function SeatSelectionPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.tripId as string
  const { setSelectedSeat, selectedSeat } = useBookingStore()
  const [localSeat, setLocalSeat] = useState<number | null>(selectedSeat)

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => fetchTripDetail(tripId),
  })

  const handleSeatSelect = (seat: number) => {
    setLocalSeat(seat)
  }

  const handleConfirm = () => {
    if (!localSeat) return
    setSelectedSeat(localSeat)
    router.prefetch(`/book/${tripId}/payment`)
    router.push(`/book/${tripId}/payment`)
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <TopHeader title="Escolher assento" showBack />

      <div className="px-4 pt-6 pb-32">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner className="w-9 h-9" />
          </div>
        ) : trip ? (
          <>
            <div className="text-center mb-6">
              <p className="text-[13px] text-gray-400">
                {trip.plate} · {trip.total_seats} assentos
              </p>
            </div>
            <SeatGrid
              totalSeats={trip.total_seats}
              takenSeats={trip.taken_seats ?? []}
              selectedSeat={localSeat}
              onSeatSelect={handleSeatSelect}
            />
          </>
        ) : null}
      </div>

      {/* Sticky summary + CTA */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 pb-4 bg-gradient-to-t from-gray-50 to-transparent pt-6">
        <div className="bg-white rounded-xl px-4 py-3 mb-3 flex justify-between items-center border border-gray-100">
          <span className="text-[14px] text-gray-600">
            {localSeat ? `Assento ${localSeat} selecionado` : 'Selecione um assento'}
          </span>
          <span className="font-bold text-[#1A6B3C] text-[16px]">
            {trip ? `${trip.fare} MT` : '—'}
          </span>
        </div>
        <button
          onClick={handleConfirm}
          disabled={!localSeat}
          className="w-full bg-[#1A6B3C] disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl text-[16px] transition-colors"
        >
          Confirmar reserva →
        </button>
      </div>
    </div>
  )
}
