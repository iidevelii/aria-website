// Sentry للموقع -- يعمل فقط لو NEXT_PUBLIC_SENTRY_DSN مضبوط (لا شيء محلياً).
export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return
  const Sentry = await import('@sentry/nextjs')
  Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, environment: process.env.VERCEL_ENV || 'development', tracesSampleRate: 0.05, sendDefaultPii: false })
}
