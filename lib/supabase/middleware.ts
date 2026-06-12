import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieToSet = { name: string; value: string; options?: CookieOptions }

const PUBLIC_PATHS = ['/', '/login', '/signup', '/payment', '/paywall', '/auth', '/api/webhooks']
const STUDENT_PAID_PREFIXES = [
  '/dashboard',
  '/guides',
  '/flashcards',
  '/quiz',
  '/chat',
  '/challenge',
  '/leaderboard',
  '/friends',
  '/messages',
  '/profile',
]

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function needsSubscription(pathname: string) {
  return STUDENT_PAID_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Unauthenticated users hitting a protected route → login
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, subscription_status')
      .eq('id', user.id)
      .single()

    // Admin routes: admins only
    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }

    // Subscription gate (admins bypass)
    if (
      needsSubscription(pathname) &&
      profile?.role !== 'admin' &&
      profile?.subscription_status !== 'active'
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/paywall'
      url.search = ''
      return NextResponse.redirect(url)
    }

    // Signed-in users on auth pages → dashboard
    if (pathname === '/login' || pathname === '/signup') {
      const url = request.nextUrl.clone()
      url.pathname = profile?.role === 'admin' ? '/admin' : '/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
