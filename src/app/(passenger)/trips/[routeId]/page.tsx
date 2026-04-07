'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import TopHeader from '@/components/layout/TopHeader'
import TripCard from '@/components/passenger/TripCard'
import EmptyState from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingScreen'
import { useBookingStore } from '@/store/bookingStore'
import type { Trip, Stop } from '@/types/database'

interface TripWithDriver extends Trip {
  driver_name: string
  driver_rating: number
  plate: string
  route_name: string
  stops: Stop[]
}

async function fetchTrips(routeId: string): Promise<{ route_name: string; stops: Stop[]; trips: TripWithDriver[] }> {
  const res = await fetch(`/api/routes/${routeId}/trips`)
  if (!res.ok) throw new Error('Erro ao carregar viagens')
  const json = await res.json()
  if (Array.isArray(json)) return { route_name: '', stops: [], trips: json }
  return { route_name: json.route_name ?? '', stops: json.stops ?? [], trips: json.trips ?? json }
}

export default function TripSelectionPage() {
  const router = useRouter()
  const params = useParams()
  const routeId = params.routeId as string

  const { setSelectedTrip, setPickupStop, setDropoffStop } = useBookingStore()
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [pickupStopId, setPickupStopId] = useState<string>('')
  const [dropoffStopId, setDropoffStopId] = useState<string>('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['trips', routeId],
    queryFn: () => fetchTrips(routeId),
    refetchInterval: 15_000,
  })

  const trips: TripWithDriver[] = data?.trips ?? []
  const stops: Stop[] = data?.stops ?? []
  const routeName: string = data?.route_name ?? 'Selecionar viagem'

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })

  const handleContinue = () => {
    const trip = trips.find((t) => t.id === selectedTripId)
    if (!trip) return
    setSelectedTrip(trip)
    const pickup = stops.find((s) => s.id === pickupStopId)
    const dropoff = stops.find((s) => s.id === dropoffStopId)
    if (pickup) setPickupStop(pickup)
    if (dropoff) setDropoffStop(dropoff)
    router.prefetch(`/book/${selectedTripId}/seats`)
    router.push(`/book/${selectedTripId}/seats`)
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <TopHeader title={routeName} showBack />

      <div className="px-4 pt-4 pb-24 space-y-3">
        {/* Stop selectors */}
        <div className="bg-white rounded-xl p-4 space-y-3 border border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Paragens
          </p>
          <div className="relative">
            <select
              value={pickupStopId}
              onChange={(e) => setPickupStopId(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-700 pr-10 outline-none focus:border-[#1A6B3C]"
            >
              <option value="">📍 Paragem de embarque</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={dropoffStopId}
              onChange={(e) => setDropoffStopId(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-700 pr-10 outline-none focus:border-[#1A6B3C]"
            >
              <option value="">🏁 Paragem de destino</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Section label */}
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Próximas chapas
        </p>

        {isLoading && (
          <div className="flex justify-center py-10">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        )}

        {error && (
          <EmptyState
            icon="📡"
            title="Erro ao carregar"
            description="Não foi possível carregar as viagens. Tente novamente."
          />
        )}

        {!isLoading && trips.length === 0 && (
          <EmptyState
            icon="🚌"
            title="Sem viagens disponíveis"
            description="Não há chapas disponíveis nesta rota agora. Tente mais tarde."
          />
        )}

        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            id={trip.id}
            departTime={formatTime(trip.depart_time)}
            arriveTime={formatTime(trip.arrive_time)}
            driverName={trip.driver_name}
            driverRating={trip.driver_rating}
            plate={trip.plate}
            availableSeats={trip.available_seats}
            fare={0}
            isSelected={selectedTripId === trip.id}
            onSelect={() => setSelectedTripId(trip.id)}
          />
        ))}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-gray-50 to-transparent pt-6 max-w-md mx-auto">
        <button
          onClick={handleContinue}
          disabled={!selectedTripId}
          className="w-full bg-[#1A6B3C] disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl text-[16px] transition-colors"
        >
          Reservar agora →
        </button>
      </div>
    </div>
  )
}
