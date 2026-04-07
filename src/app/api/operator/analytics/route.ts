import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { withTimeout } from '@/lib/supabase/timeout'

export const dynamic = 'force-dynamic'

// ─── Row shapes ───────────────────────────────────────────────────────────────

interface RouteRow { name: string }
interface VehicleRow { plate: string }
interface DriverRow { name: string }

interface TripRow {
  id: string
  status: string
  route: RouteRow
  vehicle: VehicleRow
  driver: DriverRow
}

interface BookingRow {
  fare: number
  trip: { route: RouteRow }
}

// ─── Mock data ────────────────────────────────────────────────────────────────

function mockAnalytics() {
  return {
    active_vehicles: 3,
    passengers_today: 47,
    revenue_today: 1175,
    avg_driver_rating: 4.3,
    fleet: [
      { id: '1', plate: 'MZ-10-3421', driver_name: 'António Joaquim', status: 'en_route', route_name: 'Baixa → Museu', trip_id: 'e0000000-0000-0000-0000-000000000001' },
      { id: '2', plate: 'MZ-10-8812', driver_name: 'Carlos Matola',   status: 'scheduled', route_name: 'Machava → Julius Nyerere', trip_id: null },
      { id: '3', plate: 'MZ-10-5533', driver_name: 'Fátima Cossa',    status: 'completed', route_name: 'Benfica → Baixa', trip_id: null },
    ],
    revenue_by_route: [
      { route_name: 'Baixa → Museu', revenue: 450 },
      { route_name: 'Machava → Julius Nyerere', revenue: 350 },
      { route_name: 'Costa do Sol → Praça', revenue: 210 },
      { route_name: 'Benfica → Baixa', revenue: 165 },
    ],
    alerts: [
      { id: 'demo-1', type: 'success', message: '3 viagens concluídas com sucesso hoje.', created_at: new Date().toISOString() },
    ],
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET() {
  const supabase = createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  try {
  // Active trips (fleet)
  const tripsResult = await withTimeout(
    supabase
      .from('trips')
      .select('id, status, route:routes(name), vehicle:vehicles(plate), driver:users(name)')
      .in('status', ['scheduled', 'en_route', 'at_stop', 'completed'])
      .gte('depart_time', todayISO),
    { data: null, error: null },
    3000
  )

  const trips = ((tripsResult.data ?? []) as unknown as TripRow[])

  const fleet = trips.map((t) => ({
    id: t.id,
    plate: t.vehicle?.plate ?? '',
    driver_name: t.driver?.name ?? '',
    status: t.status,
    route_name: t.route?.name ?? '',
    trip_id: t.id,
  }))

  // Revenue by route
  const bookingsResult = await withTimeout(
    supabase
      .from('bookings')
      .select('fare, trip:trips(route:routes(name))')
      .eq('status', 'confirmed')
      .gte('created_at', todayISO),
    { data: null, error: null },
    3000
  )

  const bookings = ((bookingsResult.data ?? []) as unknown as BookingRow[])

  const revenueMap: Record<string, number> = {}
  for (const b of bookings) {
    const name = b.trip?.route?.name ?? 'Outras'
    revenueMap[name] = (revenueMap[name] ?? 0) + (b.fare ?? 0)
  }

  const revenue_by_route = Object.entries(revenueMap)
    .map(([route_name, revenue]) => ({ route_name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const revenue_today = bookings.reduce((sum, b) => sum + (b.fare ?? 0), 0)

  // Alerts (basic rules)
  const alerts: { id: string; type: string; message: string; created_at: string }[] = []
  const offlineVehicles = fleet.filter((v) => v.status === 'offline')
  for (const v of offlineVehicles) {
    alerts.push({
      id: `offline-${v.id}`,
      type: 'warning',
      message: `${v.plate} offline · Capitão: ${v.driver_name}`,
      created_at: new Date().toISOString(),
    })
  }
  if (fleet.filter((v) => v.status === 'completed').length > 0) {
    alerts.push({
      id: 'completed-batch',
      type: 'success',
      message: `${fleet.filter((v) => v.status === 'completed').length} viagens concluídas com sucesso hoje.`,
      created_at: new Date().toISOString(),
    })
  }

  // Use mock data if DB returned nothing
  if (fleet.length === 0 && revenue_by_route.length === 0) {
    return NextResponse.json(mockAnalytics())
  }

  return NextResponse.json({
    active_vehicles: fleet.filter((v) => ['en_route', 'at_stop'].includes(v.status)).length,
    passengers_today: bookings.length,
    revenue_today,
    avg_driver_rating: 4.3,
    fleet,
    revenue_by_route,
    alerts,
  })
  } catch {
    return NextResponse.json(mockAnalytics())
  }
}
