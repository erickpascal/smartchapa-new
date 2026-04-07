'use client'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Circle, RefreshCw } from 'lucide-react'
import TopHeader from '@/components/layout/TopHeader'
import { LoadingSpinner } from '@/components/shared/LoadingScreen'

interface Vehicle {
  id: string
  plate: string
  driver_name: string
  status: string
  route_name: string
  trip_id?: string
}

async function fetchFleet(): Promise<Vehicle[]> {
  const res = await fetch('/api/operator/analytics')
  if (!res.ok) return []
  const data = await res.json()
  return data.fleet ?? []
}

const statusConfig: Record<string, { label: string; color: string; dotClass: string }> = {
  en_route:  { label: 'Em rota',    color: 'bg-[#E8F4ED] text-[#0D4A2B]', dotClass: 'text-[#1A6B3C]' },
  at_stop:   { label: 'Na paragem', color: 'bg-[#FFF8E7] text-amber-800',  dotClass: 'text-[#F5A623]'  },
  scheduled: { label: 'Agendado',   color: 'bg-blue-50 text-blue-700',     dotClass: 'text-blue-400'   },
  completed: { label: 'Concluído',  color: 'bg-gray-100 text-gray-500',    dotClass: 'text-gray-300'   },
  offline:   { label: 'Offline',    color: 'bg-red-50 text-red-700',       dotClass: 'text-red-400'    },
}

export default function MapPage() {
  const { data: fleet = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['fleet-map'],
    queryFn: fetchFleet,
    refetchInterval: 10_000,
  })

  const active = fleet.filter((v) => v.status === 'en_route' || v.status === 'at_stop')
  const other  = fleet.filter((v) => v.status !== 'en_route' && v.status !== 'at_stop')

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <TopHeader title="Mapa ao vivo" />

      {/* Map placeholder */}
      <div className="bg-[#C8E0CC] h-44 flex flex-col items-center justify-center relative shrink-0">
        <MapPin size={32} className="text-[#1A6B3C] mb-2" />
        <p className="text-[#1A6B3C] font-semibold text-[14px]">Chapas ao vivo em Maputo</p>
        <p className="text-[#1A6B3C]/60 text-[12px] mt-1">
          {active.length} {active.length === 1 ? 'chapa activo' : 'chapas activos'} agora
        </p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/70 text-[#1A6B3C] hover:bg-white transition-colors"
          aria-label="Actualizar"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        )}

        {!isLoading && active.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Em movimento ({active.length})
            </p>
            <div className="space-y-2">
              {active.map((v) => {
                const cfg = statusConfig[v.status] ?? statusConfig.offline
                return (
                  <div key={v.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Circle size={10} className={`shrink-0 fill-current ${cfg.dotClass}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-[14px] truncate">{v.route_name}</p>
                      <p className="text-gray-400 text-[12px]">Cap. {v.driver_name} · {v.plate}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!isLoading && other.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Outros ({other.length})
            </p>
            <div className="space-y-2">
              {other.map((v) => {
                const cfg = statusConfig[v.status] ?? statusConfig.offline
                return (
                  <div key={v.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 opacity-60">
                    <Circle size={10} className={`shrink-0 fill-current ${cfg.dotClass}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-700 text-[13px] truncate">{v.route_name}</p>
                      <p className="text-gray-400 text-[12px]">{v.plate}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!isLoading && fleet.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <MapPin size={40} className="mb-3 text-gray-200" />
            <p className="font-medium text-[15px] text-gray-500">Sem chapas activos</p>
            <p className="text-[13px] mt-1">Nenhum chapa em serviço agora.</p>
          </div>
        )}
      </div>
    </div>
  )
}
