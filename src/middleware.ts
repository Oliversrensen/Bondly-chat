import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { nextUrl } = request
  const token = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token')
  const isLoggedIn = !!token

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/sitemap.xml', '/robots.txt', '/privacy', '/terms', '/support', '/pro']
  const authRoutes = ['/auth']
  
  // API routes that should be public (webhooks, health checks, etc.)
  const publicApiRoutes = ['/api/gumroad/webhook', '/api/gumroad/simple-webhook', '/api/health', '/api/interests']
  
  // Check if this is a public API route
  const isPublicApiRoute = publicApiRoutes.some(route => nextUrl.pathname.startsWith(route))
  
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.some(route => nextUrl.pathname.startsWith(route))
  
  // Allow access to public routes and public API routes
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }
  
  // If on auth page and logged in, redirect to home
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }
  
  // If not logged in and trying to access protected route, redirect to auth
  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL('/auth', nextUrl))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (NextAuth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}