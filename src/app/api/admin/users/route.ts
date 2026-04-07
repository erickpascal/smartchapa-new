import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const role = searchParams.get('role') ?? 'all'

    const supabase = createClient()

    let query = supabase
      .from('users')
      .select('id, name, phone, role, created_at')
      .order('created_at', { ascending: false })

    if (role !== 'all') {
      query = query.eq('role', role)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: users } = await query.limit(50)

    const usersWithStatus = ((users ?? []) as {
      id: string
      name: string
      phone: string
      role: string
      created_at: string
    }[]).map((u) => ({
      ...u,
      status: 'active' as const,
    }))

    const pendingDrivers = usersWithStatus
      .filter((u) => u.role === 'driver')
      .map((u) => ({
        id: u.id,
        name: u.name,
        phone: u.phone,
        created_at: u.created_at,
        documents: [],
      }))

    return NextResponse.json({
      pending_drivers: pendingDrivers,
      users: usersWithStatus,
      total_users: usersWithStatus.length,
      pending_count: 0,
    })
  } catch {
    return NextResponse.json({
      pending_drivers: [],
      users: [],
      total_users: 0,
      pending_count: 0,
    })
  }
}
