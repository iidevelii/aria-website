import type { MetadataRoute } from 'next'

const SITE_URL = 'https://devel-bot.space'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1, changeFrequency: 'daily' },
    { path: '/features', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/backtest-results', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/academy', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/risk-disclaimer', priority: 0.3, changeFrequency: 'yearly' },
  ]
  return pages.map(({path, priority, changeFrequency}) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
