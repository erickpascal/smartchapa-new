import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface PaymentRow { status: string }
interface PassengerRow { id: string; name: string; phone: string }
interface BookingRow {
  id: string
  seat_number: number
  status: string
  payments: PaymentRow[]
  passenger: PassengerRow
}
interface RouteRow { name: string }
interface VehicleRow { plate: string }
interface TripRow {
  id: string
  status: string
  depart_time: string
  total_seats: number
  route: RouteRow
  vehicle: VehicleRow
  bookings: BookingRow[]
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('trips')
    .select(`
      id, status, depart_time, total_seats,
      route:routes ( name ),
      vehicle:vehicles ( plate ),
      bookings (
        id, seat_number, status,
        payments ( status ),
        passenger:users ( id, name, phone )
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const trip = data as unknown as TripRow

  const passengers = trip.bookings
    .filter((b) => b.status === 'confirmed')
    .map((b) => ({
      id: b.id,
      seat_number: b.seat_number,
      payment_status: b.payments[0]?.status ?? 'pending',
      passenger: b.passenger,
    }))

  return NextResponse.json({
    id: trip.id,
    status: trip.status,
    depart_time: trip.depart_time,
    route_name: trip.route.name,
    vehicle_plate: trip.vehicle.plate,
    confirmed_count: passengers.length,
    total_seats: trip.total_seats,
    passengers,
  })
}
