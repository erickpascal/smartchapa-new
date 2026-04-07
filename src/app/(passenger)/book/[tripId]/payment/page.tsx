'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import TopHeader from '@/components/layout/TopHeader'
import PaymentMethodCard from '@/components/passenger/PaymentMethodCard'
import { LoadingSpinner } from '@/components/shared/LoadingScreen'
import { useBookingStore } from '@/store/bookingStore'
import { useUserStore } from '@/store/userStore'
import type { PaymentProvider } from '@/types/database'

interface TripFare {
  fare: number
  route_name: string
  depart_time: string
}

async function fetchTripFare(tripId: string): Promise<TripFare> {
  const res = await fetch(`/api/trips/${tripId}`)
  if (!res.ok) throw new Error('Erro')
  return res.json()
}

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.tripId as string

  const { user } = useUserStore()
  const { selectedSeat, pickupStop, dropoffStop, setPaymentMethod } = useBookingStore()
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('mpesa')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: tripData } = useQuery({
    queryKey: ['trip-fare', tripId],
    queryFn: () => fetchTripFare(tripId),
  })

  const fare = tripData?.fare ?? 0
  const routeName = tripData?.route_name ?? '...'

  const formatTime = (iso?: string) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
  }

  const handlePay = async () => {
    if (!selectedSeat || !pickupStop || !dropoffStop) {
      setError('Dados incompletos. Volte e selecione novamente.')
      return
    }
    setIsProcessing(true)
    setError(null)

    try {
      // 1. Create booking
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: tripId,
          pickup_stop_id: pickupStop.id,
          dropoff_stop_id: dropoffStop.id,
          seat_number: selectedSeat,
          payment_method: selectedProvider,
        }),
      })
      if (!bookingRes.ok) {
        const err = await bookingRes.json()
        throw new Error(err.error ?? 'Erro ao criar reserva')
      }
      const booking = await bookingRes.json()

      // 2. Initiate payment
      const payRes = await fetch(`/api/bookings/${booking.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          phone: user?.phone ?? '',
        }),
      })
      if (!payRes.ok) throw new Error('Erro ao processar pagamento')

      setPaymentMethod(selectedProvider)
      router.prefetch(`/track/${booking.id}`)
      router.push(`/track/${booking.id}`)
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Erro desconhecido. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const maskedPhone = user?.phone
    ? user.phone.replace(/(\+258\d{2})\d{3}(\d{4})/, '$1 *** $2')
    : '+258 8* *** ****'

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <TopHeader title="Pagamento" showBack />

      <div className="px-4 pt-6 pb-32 space-y-5">
        {/* Fare summary */}
        <div className="bg-[#E8F4ED] rounded-2xl p-5 text-center">
          <p className="text-[36px] font-bold text-[#0D4A2B] leading-tight">{fare} MT</p>
          <p className="text-[13px] text-[#1A6B3C] mt-1">
            {routeName} · Assento {selectedSeat} · {formatTime(tripData?.depart_time)}
          </p>
        </div>

        {/* Payment methods */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Escolher método
          </p>
          <div className="space-y-3">
            <PaymentMethodCard
              provider="mpesa"
              phone={maskedPhone}
              isSelected={selectedProvider === 'mpesa'}
              onSelect={() => setSelectedProvider('mpesa')}
            />
            <PaymentMethodCard
              provider="emola"
              phone={maskedPhone.replace('84', '86')}
              isSelected={selectedProvider === 'emola'}
              onSelect={() => setSelectedProvider('emola')}
            />
            <PaymentMethodCard
              provider="wallet"
              walletBalance={user?.wallet_balance ?? 0}
              isSelected={selectedProvider === 'wallet'}
              onSelect={() => setSelectedProvider('wallet')}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-[13px]">
            {error}
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 pb-4 bg-gradient-to-t from-gray-50 to-transparent pt-6">
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full bg-[#1A6B3C] disabled:bg-[#1A6B3C]/70 text-white font-semibold py-4 rounded-xl text-[16px] flex items-center justify-center gap-2 transition-colors"
        >
          {isProcessing ? (
            <>
              <LoadingSpinner className="w-5 h-5 border-white/30 border-t-white" />
              A processar...
            </>
          ) : (
            `Pagar ${fare} MT via ${selectedProvider === 'mpesa' ? 'M-Pesa' : selectedProvider === 'emola' ? 'eMola' : 'Carteira'} →` 
          )}
        </button>
        <p className="text-center text-[12px] text-gray-400 mt-2">
          {selectedProvider !== 'wallet'
            ? 'Receberá um PIN no seu telemóvel'
            : 'O saldo será debitado imediatamente'}
        </p>
      </div>
    </div>
  )
}
