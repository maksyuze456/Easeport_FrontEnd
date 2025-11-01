import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname === '/' ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  const role = req.cookies.get('role')?.value

  if (!role) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Route-level role checks
  if (pathname.startsWith('/dashboard/admin') && role !== 'ROLE_ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/dashboard/employee') && role !== 'ROLE_USER' && role !== 'ROLE_ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/admin/:path*',
    '/dashboard/employee/:path*',
  ],
}
