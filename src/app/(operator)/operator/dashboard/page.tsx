'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Bus, Users, TrendingUp, Star, AlertTriangle, CheckCircle, X, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'

// ─── Types ────────────────────────────────────────────────────────────────────

type VehicleStatus = 'en_route' | 'at_stop' | 'completed' | 'offline' | 'scheduled'

interface FleetVehicle {
  id: string
  plate: string
  driver_name: string
  status: VehicleStatus
  route_name: string
  trip_id: string | null
}

interface RouteRevenue {
  route_name: string
  revenue: number
}

interface FleetAlert {
  id: string
  type: 'warning' | 'success'
  message: string
  created_at: string
}

interface AnalyticsData {
  active_vehicles: number
  passengers_today: number
  revenue_today: number
  avg_driver_rating: number
  fleet: FleetVehicle[]
  revenue_by_route: RouteRevenue[]
  alerts: FleetAlert[]
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchAnalytics(): Promise<AnalyticsData> {
  try {
    const res = await fetch('/api/operator/analytics')
    if (!res.ok) throw new Error('failed')
    const data = await res.json()
    if (!data || !data.fleet) throw new Error('empty')
    return data
  } catch {
    return {
      active_vehicles: 5,
      passengers_today: 234,
      revenue_today: 12450,
      avg_driver_rating: 4.3,
      fleet: [
        { id: '1', plate: 'MZ-10-3421', driver_name: 'António J.', status: 'en_route',  route_name: 'Baixa → Museu',        trip_id: null },
        { id: '2', plate: 'MZ-10-5809', driver_name: 'José M.',    status: 'en_route',  route_name: 'Machava → J.N.',       trip_id: null },
        { id: '3', plate: 'MZ-10-2201', driver_name: 'Pedro C.',   status: 'at_stop',   route_name: 'Costa Sol → Praça',    trip_id: null },
        { id: '4', plate: 'MZ-10-8821', driver_name: 'Clara N.',   status: 'offline',   route_name: '—',                    trip_id: null },
        { id: '5', plate: 'MZ-10-4410', driver_name: 'Samuel T.',  status: 'completed', route_name: 'Benfica → Baixa',      trip_id: null },
      ],
      revenue_by_route: [
        { route_name: 'Baixa → Museu',      revenue: 4200 },
        { route_name: 'Machava → J.N.',     revenue: 3100 },
        { route_name: 'Costa Sol → Praça',  revenue: 2800 },
        { route_name: 'Benfica → Baixa',    revenue: 1450 },
        { route_name: 'Zimpeto → J.N.',     revenue: 900  },
      ],
      alerts: [
        { id: '1', type: 'warning', message: 'MZ-10-8821 offline há 45 min', created_at: new Date().toISOString() },
        { id: '2', type: 'success', message: '4 viagens concluídas com sucesso hoje', created_at: new Date().toISOString() },
      ],
    }
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const statusConfig: Record<VehicleStatus, { label: string; dot: string; badge: string }> = {
  en_route:  { label: 'Em rota',      dot: 'bg-[#1A6B3C]', badge: 'bg-[#E8F4ED] text-[#0D4A2B]' },
  at_stop:   { label: 'Na paragem',   dot: 'bg-[#F5A623]', badge: 'bg-[#FFF8E7] text-amber-800' },
  completed: { label: 'Concluída',    dot: 'bg-gray-400',  badge: 'bg-gray-100 text-gray-600' },
  offline:   { label: 'Offline',      dot: 'bg-[#D32F2F]', badge: 'bg-red-50 text-red-700' },
  scheduled: { label: 'Agendado',     dot: 'bg-blue-400',  badge: 'bg-blue-50 text-blue-700' },
}

interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: string
  bg: string
}

function KpiCard({ icon, label, value, bg }: KpiCardProps) {
  return (
    <div className={`rounded-2xl p-5 ${bg}`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">{icon}</div>
      <p className="text-[28px] font-bold leading-tight">{value}</p>
      <p className="text-[13px] mt-1 opacity-60">{label}</p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OperatorDashboardPage() {
  const { user, setUser } = useUserStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const supabase = createClient()
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const handleLogout = async () => {
    document.cookie = 'smartchapa_guest_role=;path=/;max-age=0'
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['operator-analytics'],
    queryFn: fetchAnalytics,
    refetchInterval: 30_000,
  })

  // Live fleet updates via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('operator-fleet-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'trips' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['operator-analytics'] })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [queryClient, supabase])

  const fleet: FleetVehicle[] = data?.fleet ?? []
  const revenueByRoute: RouteRevenue[] = data?.revenue_by_route ?? []
  const alerts: FleetAlert[] = (data?.alerts ?? []).filter(
    (a) => !dismissedAlerts.has(a.id)
  )

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'OP'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-[#0D4A2B] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-[18px]">SmartChapa</span>
          <span className="text-[#A8D5B8] text-[13px]">Operador</span>
          <span className="flex items-center gap-1.5 bg-[#1A6B3C] text-[#A8D5B8] text-[12px] font-medium px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
            Ao vivo
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-[14px]">{user?.name ?? 'Operador'}</span>
          <div className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-[13px]">
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium px-3 py-2 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Bus size={20} className="text-[#1A6B3C]" />}
            label="Chapas activos agora"
            value={String(data?.active_vehicles ?? 0)}
            bg="bg-[#E8F4ED] text-[#0D4A2B]"
          />
          <KpiCard
            icon={<Users size={20} className="text-blue-600" />}
            label="Passageiros hoje"
            value={String(data?.passengers_today ?? 0)}
            bg="bg-blue-50 text-blue-900"
          />
          <KpiCard
            icon={<TrendingUp size={20} className="text-amber-600" />}
            label="Receita hoje"
            value={`${data?.revenue_today ?? 0} MT`}
            bg="bg-[#FFF8E7] text-amber-900"
          />
          <KpiCard
            icon={<Star size={20} className="text-purple-600" />}
            label="Avaliação média"
            value={`${(data?.avg_driver_rating ?? 0).toFixed(1)} ★`}
            bg="bg-purple-50 text-purple-900"
          />
        </div>

        {/* Fleet + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fleet live */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-[16px]">Frota ao vivo</h2>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#1A6B3C] animate-spin" />
              </div>
            ) : fleet.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Bus size={32} className="mb-2 opacity-30" />
                <p className="text-[13px]">Sem veículos activos</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {fleet.map((v) => {
                  const cfg = statusConfig[v.status] ?? statusConfig.offline
                  return (
                    <div
                      key={v.id}
                      className="flex items-center gap-4 px-5 py-3.5"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                      <span className="font-mono text-[13px] text-gray-700 w-24 shrink-0">
                        {v.plate}
                      </span>
                      <span className="text-[13px] text-gray-600 flex-1 truncate">
                        {v.driver_name}
                      </span>
                      <span className="text-[12px] text-gray-400 flex-1 truncate hidden sm:block">
                        {v.route_name}
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Revenue chart */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-[16px]">Receita por rota (hoje)</h2>
            </div>
            <div className="p-5">
              {revenueByRoute.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <TrendingUp size={28} className="mb-2 opacity-30" />
                  <p className="text-[13px]">Sem dados de receita</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={revenueByRoute}
                    layout="vertical"
                    margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${v} MT`}
                    />
                    <YAxis
                      type="category"
                      dataKey="route_name"
                      width={120}
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} MT`, 'Receita']}
                      contentStyle={{
                        borderRadius: 10,
                        border: '0.5px solid #E5E7EB',
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                      {revenueByRoute.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i === 0 ? '#1A6B3C' : i === 1 ? '#F5A623' : '#60A5FA'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-semibold text-gray-700 text-[14px]">Alertas</h2>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-[13px] ${
                  alert.type === 'warning'
                    ? 'bg-[#FFF8E7] border-[#F5A623]/40 text-amber-800'
                    : 'bg-[#E8F4ED] border-[#1A6B3C]/40 text-[#0D4A2B]'
                }`}
              >
                {alert.type === 'warning' ? (
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                )}
                <span className="flex-1">{alert.message}</span>
                <button
                  onClick={() =>
                    setDismissedAlerts((prev) => new Set([...prev, alert.id]))
                  }
                  className="shrink-0 opacity-50 hover:opacity-100"
                  aria-label="Dispensar alerta"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
