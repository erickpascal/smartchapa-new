'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import TopHeader from '@/components/layout/TopHeader'
import StatCard from '@/components/shared/StatCard'
import EmptyState from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingScreen'

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'today' | 'week' | 'month'

interface TripEarning {
  id: string
  route_name: string
  depart_time: string
  passenger_count: number
  earnings: number
  status: string
}

interface EarningsData {
  total: number
  trip_count: number
  passenger_count: number
  goal: number
  trips: TripEarning[]
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchEarnings(period: Period): Promise<EarningsData> {
  const res = await fetch(`/api/driver/earnings?period=${period}`)
  if (!res.ok) throw new Error('Erro ao carregar ganhos')
  return res.json()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const periodLabels: Record<Period, string> = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mês',
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-MZ', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const tripStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  completed: {
    label: 'Concluída',
    className: 'bg-[#E8F4ED] text-[#0D4A2B]',
  },
  en_route: {
    label: 'Em progresso',
    className: 'bg-[#FFF8E7] text-amber-800',
  },
  scheduled: {
    label: 'Agendada',
    className: 'bg-gray-100 text-gray-600',
  },
  cancelled: {
    label: 'Cancelada',
    className: 'bg-red-50 text-red-700',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EarningsPage() {
  const [period, setPeriod] = useState<Period>('today')

  const { data, isLoading, error } = useQuery<EarningsData>({
    queryKey: ['earnings', period],
    queryFn: () => fetchEarnings(period),
  })

  const total = data?.total ?? 0
  const tripCount = data?.trip_count ?? 0
  const passengerCount = data?.passenger_count ?? 0
  const goal = data?.goal ?? 3000
  const trips: TripEarning[] = data?.trips ?? []

  const progressPct = goal > 0 ? Math.min((total / goal) * 100, 100) : 0

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <TopHeader title="Os meus ganhos" />

      <div className="px-4 pt-4 pb-6 space-y-5">
        {/* Period tabs */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
          {(Object.keys(periodLabels) as Period[]).map((p, i) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2.5 text-[13px] font-medium transition-colors ${
                i !== 0 ? 'border-l border-gray-200' : ''
              } ${
                period === p
                  ? 'bg-[#1A6B3C] text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
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

        {!isLoading && (
          <>
            {/* Total earnings card */}
            <div className="bg-[#E8F4ED] rounded-2xl p-5 text-center">
              <p className="text-[38px] font-bold text-[#0D4A2B] leading-tight">
                {total} MT
              </p>
              <p className="text-[#1A6B3C] text-[13px] mt-1">
                Total{' '}
                {period === 'today'
                  ? 'hoje'
                  : period === 'week'
                  ? 'esta semana'
                  : 'este mês'}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                value={tripCount}
                label="Viagens concluídas"
                variant="default"
              />
              <StatCard
                value={passengerCount}
                label="Passageiros"
                variant="info"
              />
            </div>

            {/* Daily goal (only shown for today) */}
            {period === 'today' && (
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-gray-700 text-[14px]">
                    Meta do dia
                  </p>
                  <p className="font-bold text-[#1A6B3C] text-[14px]">
                    {goal} MT
                  </p>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1A6B3C] rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-gray-400 text-[12px] mt-1.5">
                  {progressPct >= 100
                    ? '🎉 Meta atingida!'
                    : `Faltam ${goal - total} MT para a meta`}
                </p>
              </div>
            )}

            {/* Trip history */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Histórico de viagens
              </p>

              {trips.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="Sem viagens"
                  description="Nenhuma viagem registada para este período."
                />
              ) : (
                <div className="space-y-2">
                  {trips.map((trip) => {
                    const statusCfg =
                      tripStatusConfig[trip.status] ??
                      tripStatusConfig.scheduled
                    return (
                      <div
                        key={trip.id}
                        className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-800 text-[14px]">
                            {trip.route_name}
                          </p>
                          <p className="text-gray-400 text-[12px] mt-0.5">
                            {formatTime(trip.depart_time)} ·{' '}
                            {trip.passenger_count} passageiros
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold text-[#1A6B3C] text-[15px]">
                            +{trip.earnings} MT
                          </span>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
