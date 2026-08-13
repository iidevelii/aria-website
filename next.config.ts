import type { NextConfig } from "next";

// رؤوس أمان (بند 25 مراجعة DevelBot_review.md) -- next.config.ts كان فاضي
// تماماً رغم وجود كوكي مصادقة (SameSite=None cross-site بين devel-bot.space
// وapi.devel-bot.space، انظر app/lib/api.ts). قائمة connect-src مبنية من
// فحص فعلي لكل أصل خارجي يستدعيه الموقع (grep على كل "https://" بالكود)،
// مو تخمين -- Binance/Bybit (شموع الشارت، fetchKlines)، alternative.me
// (Fear&Greed)، coingecko + rss2json (الداشبورد)، الباك اند نفسه.
//
// CSP هو الرأس الوحيد هنا اللي فيه خطر حقيقي يكسر شي لو فاتني مصدر خارجي
// نادر الاستخدام -- يستاهل فحص فعلي بعد النشر (DevTools console على أي
// صفحة، أي CSP violation تبان فوراً هناك) بدل الاعتماد على الفحص الساكن بس.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.devel-bot.space https://api.binance.com https://fapi.binance.com https://api.bybit.com https://api.alternative.me https://api.coingecko.com https://api.rss2json.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
};

export default nextConfig;
