import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Always allow in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // Skip if env vars are missing or obviously placeholder
  const isPlaceholder =
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === 'https://yourproject.supabase.co' ||
    supabaseKey.length < 100

  if (isPlaceholder) return NextResponse.next()

  // Allow guest users — they carry a cookie set on the login page
  const guestRole = request.cookies.get('smartchapa_guest_role')?.value
  if (guestRole) return NextResponse.next()

  const { pathname } = request.nextUrl
  const protectedPaths = ['/driver', '/operator', '/admin']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  try {
    const { createServerClient } = await import('@supabase/ssr')
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} },
    })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/driver/:path*', '/operator/:path*', '/admin/:path*'],
}
