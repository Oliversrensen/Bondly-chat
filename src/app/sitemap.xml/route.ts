import { NextResponse } from 'next/server'

export async function GET() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bondly.chat/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://bondly.chat/chat</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bondly.chat/pro</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://bondly.chat/profile</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://bondly.chat/auth</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://bondly.chat/privacy</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://bondly.chat/terms</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://bondly.chat/support</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
