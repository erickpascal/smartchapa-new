import { NextResponse } from 'next/server'
import { withTimeout } from '@/lib/supabase/timeout'

export const dynamic = 'force-dynamic'

const MOCK_ROUTES = [
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'Baixa → Museu', distance_km: 5.2, base_fare: 15, category: 'chapa', is_active: true, availableSeats: 12, nextDeparture: '8 min', durationMinutes: 13 },
  { id: 'a0000000-0000-0000-0000-000000000002', name: 'Machava → Julius Nyerere', distance_km: 12.8, base_fare: 25, category: 'chapa', is_active: true, availableSeats: 8, nextDeparture: '15 min', durationMinutes: 32 },
  { id: 'a0000000-0000-0000-0000-000000000003', name: 'Costa do Sol → Praça', distance_km: 18.5, base_fare: 30, category: 'chapa', is_active: true, availableSeats: 0, nextDeparture: '35 min', durationMinutes: 46 },
  { id: 'a0000000-0000-0000-0000-000000000004', name: 'Benfica → Baixa', distance_km: 8.1, base_fare: 20, category: 'metro', is_active: true, availableSeats: 6, nextDeparture: '20 min', durationMinutes: 20 },
  { id: 'a0000000-0000-0000-0000-000000000005', name: 'Zimpeto → Julius Nyerere', distance_km: 15.3, base_fare: 25, category: 'expresso', is_active: true, availableSeats: 14, nextDeparture: '5 min', durationMinutes: 38 },
]

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    const result = await withTimeout(
      supabase.from('routes').select('*').eq('is_active', true).order('name'),
      { data: null, error: null },
      3000
    )

    if (result.data && result.data.length > 0) {
      const routes = result.data.map((r) => ({
        ...r,
        availableSeats: 14,
        nextDeparture: '10 min',
        durationMinutes: Math.round((r.distance_km ?? 5) * 2.5),
      }))
      return NextResponse.json(routes)
    }
    return NextResponse.json(MOCK_ROUTES)
  } catch {
    return NextResponse.json(MOCK_ROUTES)
  }
}
