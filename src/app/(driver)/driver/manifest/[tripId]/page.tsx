'use client'
import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Bell, Play } from 'lucide-react'
import TopHeader from '@/components/layout/TopHeader'
import ManifestRow from '@/components/driver/ManifestRow'
import EmptyState from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingScreen'
import { createClient } from '@/lib/supabase/client'
import type { PaymentStatus } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManifestPassenger {
  id: string
  seat_number: number
  payment_status: PaymentStatus
  passenger: {
    id: string
    name: string
    phone: string
  }
}

interface TripManifest {
  id: string
  status: string
  depart_time: string
  route_name: string
  vehicle_plate: string
  confirmed_count: number
  total_seats: number
  passengers: ManifestPassenger[]
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchManifest(tripId: string): Promise<TripManifest> {
  const res = await fetch(`/api/driver/trips/${tripId}/manifest`)
  if (!res.ok) throw new Error('Erro ao carregar manifesto')
  return res.json()
}

async function alertPassengers(tripId: string): Promise<void> {
  const res = await fetch(`/api/driver/trips/${tripId}/alert`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Erro ao enviar alerta')
}

async function startTrip(tripId: string): Promise<void> {
  const res = await fetch(`/api/driver/trips/${tripId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'en_route' }),
  })
  if (!res.ok) throw new Error('Erro ao iniciar viagem')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-MZ', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManifestPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.tripId as string
  const queryClient = useQueryClient()
  const supabase = createClient()

  const {
    data: manifest,
    isLoading,
    error,
  } = useQuery<TripManifest>({
    queryKey: ['manifest', tripId],
    queryFn: () => fetchManifest(tripId),
    refetchInterval: 15_000,
  })

  // ── Realtime payment updates ───────────────────────────────────────────────

  useEffect(() => {
    const channel = supabase
      .channel(`manifest-payments-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['manifest', tripId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tripId, queryClient, supabase])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAlert = async () => {
    try {
      await alertPassengers(tripId)
    } catch {
      // Silently fail — notification is best-effort
    }
  }

  const handleStart = async () => {
    try {
      await startTrip(tripId)
      queryClient.invalidateQueries({ queryKey: ['driver-today'] })
      router.push('/driver')
    } catch {
      // Error handled silently — user stays on page
    }
  }

  const confirmedCount = manifest?.confirmed_count ?? 0
  const totalSeats = manifest?.total_seats ?? 0

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <TopHeader title="Lista de passageiros" showBack />

      {/* Trip summary chip */}
      {manifest && (
        <div className="mx-4 mt-4 bg-[#E8F4ED] rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#0D4A2B] text-[14px]">
              {formatTime(manifest.depart_time)} · {manifest.route_name}
            </p>
            <p className="text-[#1A6B3C] text-[12px] mt-0.5">
              {manifest.vehicle_plate}
            </p>
          </div>
          <span className="bg-[#1A6B3C] text-white text-[12px] font-semibold px-3 py-1 rounded-full">
            {confirmedCount}/{totalSeats}
          </span>
        </div>
      )}

      {/* Passenger list */}
      <div className="px-4 mt-4 flex-1">
        {isLoading && (
          <div className="flex justify-center py-10">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        )}

        {error instanceof Error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-[13px]">
            {error.message}
          </div>
        )}

        {!isLoading && manifest?.passengers?.length === 0 && (
          <EmptyState
            icon="👥"
            title="Sem passageiros"
            description="Ainda não há reservas confirmadas para esta viagem."
          />
        )}

        {manifest?.passengers && manifest.passengers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 px-4 divide-y divide-gray-50">
            {manifest.passengers.map((p) => (
              <ManifestRow
                key={p.id}
                passengerName={p.passenger.name}
                seatNumber={p.seat_number}
                paymentStatus={p.payment_status}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-6 pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAlert}
            className="flex items-center justify-center gap-2 border-2 border-[#1A6B3C] text-[#1A6B3C] font-semibold py-3 rounded-xl text-[14px] active:scale-[0.98] transition-transform"
          >
            <Bell size={18} />
            Alertar passageiros
          </button>
          <button
            onClick={handleStart}
            className="flex items-center justify-center gap-2 bg-[#1A6B3C] text-white font-semibold py-3 rounded-xl text-[14px] active:scale-[0.98] transition-transform"
          >
            <Play size={18} />
            Iniciar viagem
          </button>
        </div>
      </div>
    </div>
  )
}
