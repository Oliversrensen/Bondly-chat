import { NextResponse } from 'next/server'

export async function GET() {
  const robots = `User-agent: *
Allow: /
Allow: /pro
Allow: /auth
Allow: /privacy
Allow: /terms
Allow: /support
Disallow: /chat
Disallow: /profile
Disallow: /admin
Disallow: /api/
Disallow: /_next/
Disallow: /ws/

# Crawl-delay for better server performance
Crawl-delay: 1

# Sitemap location
Sitemap: https://bondly.chat/sitemap.xml`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
