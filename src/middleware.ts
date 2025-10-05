import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { nextUrl } = request
  
  // Check if this is a bot/crawler (including Googlebot)
  const userAgent = request.headers.get('user-agent') || ''
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent)
  
  // Check for session token in cookies (both development and production)
  const sessionToken = request.cookies.get('authjs.session-token') || 
                      request.cookies.get('__Secure-authjs.session-token') ||
                      request.cookies.get('next-auth.session-token') ||
                      request.cookies.get('__Secure-next-auth.session-token')
  
  const isLoggedIn = !!sessionToken

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/sitemap.xml', '/robots.txt', '/privacy', '/terms', '/support', '/pro']
  const authRoutes = ['/auth']
  
  // API routes that should be public (webhooks, health checks, etc.)
  const publicApiRoutes = ['/api/gumroad/webhook', '/api/gumroad/simple-webhook', '/api/health', '/api/interests']
  
  // Check if this is a public API route
  const isPublicApiRoute = publicApiRoutes.some(route => nextUrl.pathname.startsWith(route))
  
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.some(route => nextUrl.pathname.startsWith(route))
  
  // Create response
  let response: NextResponse
  
  // Allow access to public routes and public API routes
  if (isPublicRoute || isPublicApiRoute) {
    response = NextResponse.next()
  }
  // If this is a bot, allow access to all pages without redirects
  else if (isBot) {
    response = NextResponse.next()
  }
  // If on auth page and logged in, redirect to chat (not home)
  else if (isAuthRoute && isLoggedIn) {
    response = NextResponse.redirect(new URL('/chat', nextUrl))
  }
  // If not logged in and trying to access protected route, redirect to auth
  else if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    response = NextResponse.redirect(new URL('/auth', nextUrl))
  }
  else {
    response = NextResponse.next()
  }
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  
  // Content Security Policy for better security
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.googleadservices.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.google.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.googletagmanager.com https://www.google.com/ccm/ https://www.google.com/ccm/collect https://bondly-websocket.onrender.com wss: ws:",
    "frame-src 'self' https://accounts.google.com https://www.googletagmanager.com https://www.google.com https://googleads.g.doubleclick.net",
    "child-src 'self' https://www.googletagmanager.com https://www.google.com https://googleads.g.doubleclick.net",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
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