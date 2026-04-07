import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { withTimeout } from '@/lib/supabase/timeout'

export const dynamic = 'force-dynamic'

const now = () => new Date()
const plus = (min: number) => new Date(Date.now() + min * 60_000).toISOString()

function mockDashboard() {
  return {
    trips_today: 3,
    passengers_today: 28,
    earnings_today: 420,
    trips: [
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        route_name: 'Baixa → Museu',
        depart_time: plus(10),
        arrive_time: plus(25),
        status: 'scheduled',
        available_seats: 12,
        total_seats: 14,
        plate: 'MZ-10-3421',
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        route_name: 'Baixa → Museu',
        depart_time: plus(40),
        arrive_time: plus(55),
        status: 'scheduled',
        available_seats: 8,
        total_seats: 14,
        plate: 'MZ-10-3421',
      },
      {
        id: 'e0000000-0000-0000-0000-000000000003',
        route_name: 'Machava → Julius Nyerere',
        depart_time: now().toISOString(),
        arrive_time: plus(25),
        status: 'en_route',
        available_seats: 0,
        total_seats: 14,
        plate: 'MZ-10-3421',
      },
    ],
  }
}

interface TripRow {
  id: string
  depart_time: string
  arrive_time: string
  status: string
  available_seats: number
  total_seats: number
  route: { name: string } | null
  vehicle: { plate: string } | null
  bookings: { fare: number }[]
}

export async function GET() {
  try {
    const supabase = createClient()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const { data: trips, error } = await withTimeout(
      supabase
        .from('trips')
        .select(`
          id, depart_time, arrive_time, status,
          available_seats, total_seats,
          route:routes ( name ),
          vehicle:vehicles ( plate ),
          bookings ( fare )
        `)
        .gte('depart_time', todayStart.toISOString())
        .lte('depart_time', todayEnd.toISOString())
        .order('depart_time'),
      { data: null, error: null },
      3000
    )

    if (error || !trips || trips.length === 0) {
      return NextResponse.json(mockDashboard())
    }

    const typedTrips = trips as unknown as TripRow[]
    let earningsToday = 0
    let passengersToday = 0

    const tripItems = typedTrips.map((t) => {
      const bookings = t.bookings ?? []
      if (t.status === 'completed') {
        earningsToday += bookings.reduce((s, b) => s + (b.fare ?? 0), 0)
        passengersToday += bookings.length
      }
      return {
        id: t.id,
        route_name: t.route?.name ?? 'Rota',
        depart_time: t.depart_time,
        arrive_time: t.arrive_time,
        status: t.status,
        available_seats: t.available_seats,
        total_seats: t.total_seats,
        plate: t.vehicle?.plate ?? '',
      }
    })

    return NextResponse.json({
      trips_today: typedTrips.length,
      passengers_today: passengersToday,
      earnings_today: earningsToday,
      trips: tripItems,
    })
  } catch {
    return NextResponse.json(mockDashboard())
  }
}
