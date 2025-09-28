import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/chat', '/profile', '/admin', '/api/', '/_next/', '/ws/'],
      },
    ],
    sitemap: 'https://bondly.chat/sitemap.xml',
  }
}
