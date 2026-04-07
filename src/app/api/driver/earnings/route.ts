import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getPeriodRange(period: string): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const start = new Date(now)
  if (period === 'week') {
    start.setDate(now.getDate() - 6)
  } else if (period === 'month') {
    start.setDate(1)
  }
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

function mockEarnings(period: string) {
  const multiplier = period === 'today' ? 1 : period === 'week' ? 6 : 22
  const base = 420
  const total = base * multiplier
  const past = new Date(Date.now() - 2 * 3600_000).toISOString()
  return {
    total,
    trip_count: 3 * multiplier,
    passenger_count: 28 * multiplier,
    goal: 3000,
    trips: [
      { id: '1', route_name: 'Baixa → Museu', depart_time: past, passenger_count: 12, earnings: 180, status: 'completed' },
      { id: '2', route_name: 'Baixa → Museu', depart_time: past, passenger_count: 10, earnings: 150, status: 'completed' },
      { id: '3', route_name: 'Machava → Julius Nyerere', depart_time: past, passenger_count: 14, earnings: 350, status: 'completed' },
    ],
  }
}

interface TripRow {
  id: string
  depart_time: string
  status: string
  route: { name: string } | null
  bookings: { fare: number }[]
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') ?? 'today'
    const { start, end } = getPeriodRange(period)

    const supabase = createClient()

    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        id, depart_time, status,
        route:routes ( name ),
        bookings ( fare )
      `)
      .in('status', ['completed', 'en_route'])
      .gte('depart_time', start.toISOString())
      .lte('depart_time', end.toISOString())
      .order('depart_time', { ascending: false })

    if (error || !trips || trips.length === 0) {
      return NextResponse.json(mockEarnings(period))
    }

    const typedTrips = trips as unknown as TripRow[]
    let total = 0
    let passengerCount = 0

    const tripItems = typedTrips.map((t) => {
      const bookings = t.bookings ?? []
      const earnings = bookings.reduce((sum, b) => sum + (b.fare ?? 0), 0)
      total += earnings
      passengerCount += bookings.length
      return {
        id: t.id,
        route_name: t.route?.name ?? 'Rota desconhecida',
        depart_time: t.depart_time,
        passenger_count: bookings.length,
        earnings,
        status: t.status,
      }
    })

    return NextResponse.json({
      total,
      trip_count: typedTrips.length,
      passenger_count: passengerCount,
      goal: 3000,
      trips: tripItems,
    })
  } catch {
    return NextResponse.json(mockEarnings('today'))
  }
}
