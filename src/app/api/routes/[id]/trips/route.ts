import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ROUTE_NAMES: Record<string, string> = {
  'a0000000-0000-0000-0000-000000000001': 'Baixa → Museu',
  'a0000000-0000-0000-0000-000000000002': 'Machava → Julius Nyerere',
  'a0000000-0000-0000-0000-000000000003': 'Costa do Sol → Praça',
  'a0000000-0000-0000-0000-000000000004': 'Benfica → Baixa',
  'a0000000-0000-0000-0000-000000000005': 'Zimpeto → Julius Nyerere',
}

function plus(min: number) { return new Date(Date.now() + min * 60_000).toISOString() }

function mockTripsForRoute(routeId: string) {
  const name = ROUTE_NAMES[routeId] ?? 'Rota'
  return {
    route_name: name,
    stops: [
      { id: 'stop-1', name: 'Paragem Início', lat: -25.969, lng: 32.573, route_id: routeId, sequence_order: 1 },
      { id: 'stop-2', name: 'Paragem Meio', lat: -25.967, lng: 32.570, route_id: routeId, sequence_order: 2 },
      { id: 'stop-3', name: 'Paragem Fim', lat: -25.965, lng: 32.567, route_id: routeId, sequence_order: 3 },
    ],
    trips: [
      { id: 'e0000000-0000-0000-0000-000000000001', status: 'scheduled', depart_time: plus(10), arrive_time: plus(25), available_seats: 12, total_seats: 14, plate: 'MZ-10-3421', driver_name: 'António Joaquim', driver_rating: 4 },
      { id: 'e0000000-0000-0000-0000-000000000002', status: 'scheduled', depart_time: plus(40), arrive_time: plus(55), available_seats: 8,  total_seats: 14, plate: 'MZ-10-3421', driver_name: 'António Joaquim', driver_rating: 4 },
    ],
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    const { data: routeData } = await supabase
      .from('routes')
      .select('name')
      .eq('id', params.id)
      .single()

    const { data: stopsData } = await supabase
      .from('stops')
      .select('*')
      .eq('route_id', params.id)
      .order('sequence_order')

    const { data: tripsData } = await supabase
      .from('trips')
      .select(`
        id, status, depart_time, arrive_time,
        available_seats, total_seats,
        vehicle:vehicles ( plate ),
        driver:users ( name )
      `)
      .eq('route_id', params.id)
      .in('status', ['scheduled', 'en_route'])
      .gte('depart_time', new Date().toISOString())
      .order('depart_time')

    interface TripRow {
      id: string
      status: string
      depart_time: string
      arrive_time: string
      available_seats: number
      total_seats: number
      vehicle: { plate: string } | null
      driver: { name: string } | null
    }

    const trips = ((tripsData ?? []) as unknown as TripRow[]).map((t) => ({
      id: t.id,
      status: t.status,
      depart_time: t.depart_time,
      arrive_time: t.arrive_time,
      available_seats: t.available_seats,
      total_seats: t.total_seats,
      plate: t.vehicle?.plate ?? '',
      driver_name: t.driver?.name ?? 'Capitão',
      driver_rating: 4,
    }))

    if (trips.length === 0) {
      return NextResponse.json(mockTripsForRoute(params.id))
    }

    return NextResponse.json({
      route_name: routeData?.name ?? '',
      stops: stopsData ?? [],
      trips,
    })
  } catch {
    return NextResponse.json(mockTripsForRoute(params.id))
  }
}
