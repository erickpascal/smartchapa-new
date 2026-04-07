import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { withTimeout } from '@/lib/supabase/timeout'

export const dynamic = 'force-dynamic'

function plus(min: number) { return new Date(Date.now() + min * 60_000).toISOString() }

const MOCK_TRIPS: Record<string, object> = {
  'e0000000-0000-0000-0000-000000000001': { id: 'e0000000-0000-0000-0000-000000000001', status: 'scheduled', depart_time: plus(10), arrive_time: plus(25), available_seats: 12, total_seats: 14, taken_seats: [1, 3, 7], fare: 15, route_name: 'Baixa → Museu', plate: 'MZ-10-3421' },
  'e0000000-0000-0000-0000-000000000002': { id: 'e0000000-0000-0000-0000-000000000002', status: 'scheduled', depart_time: plus(40), arrive_time: plus(55), available_seats: 8,  total_seats: 14, taken_seats: [2, 4, 5, 6, 8, 9], fare: 15, route_name: 'Baixa → Museu', plate: 'MZ-10-3421' },
  'e0000000-0000-0000-0000-000000000003': { id: 'e0000000-0000-0000-0000-000000000003', status: 'scheduled', depart_time: plus(20), arrive_time: plus(45), available_seats: 14, total_seats: 14, taken_seats: [], fare: 25, route_name: 'Machava → Julius Nyerere', plate: 'MZ-10-3421' },
}

interface TripRow {
  id: string
  status: string
  depart_time: string
  arrive_time: string
  available_seats: number
  total_seats: number
  route: { name: string; base_fare: number } | null
  vehicle: { plate: string; capacity: number } | null
}

interface BookingRow {
  seat_number: number
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    const { data: trip } = await withTimeout(
      supabase
        .from('trips')
        .select(`
          id, status, depart_time, arrive_time,
          available_seats, total_seats,
          route:routes ( name, base_fare ),
          vehicle:vehicles ( plate, capacity )
        `)
        .eq('id', params.id)
        .single(),
      { data: null, error: null },
      3000
    )

    if (!trip) {
      // Return mock trip for dev-mode trip IDs
      const mock = MOCK_TRIPS[params.id]
      if (mock) return NextResponse.json(mock)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: bookings } = await withTimeout(
      supabase
        .from('bookings')
        .select('seat_number')
        .eq('trip_id', params.id)
        .in('status', ['confirmed', 'pending']),
      { data: null, error: null },
      3000
    )

    const takenSeats = ((bookings ?? []) as BookingRow[]).map((b) => b.seat_number)
    const typedTrip = trip as unknown as TripRow

    return NextResponse.json({
      id: typedTrip.id,
      status: typedTrip.status,
      depart_time: typedTrip.depart_time,
      arrive_time: typedTrip.arrive_time,
      available_seats: typedTrip.available_seats,
      total_seats: typedTrip.vehicle?.capacity ?? 14,
      taken_seats: takenSeats,
      fare: typedTrip.route?.base_fare ?? 15,
      route_name: typedTrip.route?.name ?? '',
      plate: typedTrip.vehicle?.plate ?? '',
    })
  } catch {
    const mock = MOCK_TRIPS[params.id]
    if (mock) return NextResponse.json(mock)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
