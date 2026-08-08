import type { MetadataRoute } from 'next'

const SITE_URL = 'https://devel-bot.space'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard', '/scanner', '/strategy-builder', '/paper-trading',
        '/coin-tracker', '/ai-assistant', '/settings', '/admin', '/subscribe',
        '/login', '/register', '/forgot-password', '/reset-password', '/activate', '/auth/tg',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
