// أصل الـ API الموحّد -- نقطة وحيدة بدل كل صفحة تبني الرابط بنفسها.
//
// القاعدة: NEXT_PUBLIC_API_URL هو المصدر الوحيد المسموح بالإنتاج. ممنوع نهائياً
// أي رابط Railway (أو أي دومين غير localhost) كقيمة احتياطية -- هذا بالضبط كان
// سبب مشكلة الكوكي cross-site (Safari ITP/Brave/Chrome Incognito/Firefox strict
// كانت تحظر كوكي SameSite=None لأن الموقع devel-bot.space كان يكلّم دومين
// Railway مختلف). الحل: دومين مخصص على نفس النطاق المسجّل (api.devel-bot.space)
// يُمرَّر عبر NEXT_PUBLIC_API_URL بالإنتاج -- بدون أي حالة خاصة بالكود لهذه القيمة.
//
// - Production ومعه NEXT_PUBLIC_API_URL: يُستخدم كما هو.
// - Production بدون NEXT_PUBLIC_API_URL: خطأ فادح فوراً عند تحميل الموديول (لا
//   رجوع صامت لأي دومين). بما إن NEXT_PUBLIC_* تُحقن وقت البناء، هذا يعني: لو
//   البناء نفسه يحاول يولّد صفحة تستورد هذا الموديول (SSG لصفحات client
//   component وقت `next build`) البناء يفشل فوراً بخطأ واضح. ولو لأي سبب توزّعت
//   نسخة مبنية بدون المتغير أصلاً، أول تحميل للصفحة بالمتصفح يرمي نفس الخطأ.
// - Development بدون NEXT_PUBLIC_API_URL: رجوع آمن لـ localhost:8000 (إشارة تطوير
//   محلي حقيقية عبر NODE_ENV، مو تخمين).
// - Development ومعه NEXT_PUBLIC_API_URL: يُستخدم كما هو (يسمح بتجربة بيئة
//   بعيدة أثناء التطوير لو احتاج المطوّر).

const envValue = process.env.NEXT_PUBLIC_API_URL?.trim()
const isDev = process.env.NODE_ENV !== 'production'

function resolveApiOrigin(): string {
  if (envValue) return envValue.replace(/\/+$/, '')
  if (isDev) return 'http://localhost:8000'
  throw new Error(
    'NEXT_PUBLIC_API_URL غير معرّف بالإنتاج -- ما فيه قيمة احتياطية. ' +
    'لازم يتحدد بمتغيرات بيئة Vercel (مثلاً https://api.devel-bot.space) ' +
    'وتعاد عملية البناء.\n' +
    '[EN] NEXT_PUBLIC_API_URL is not set in production and there is no ' +
    'fallback. Set it in the Vercel project environment variables ' +
    '(e.g. https://api.devel-bot.space) and rebuild.'
  )
}

/** أصل الـ API الموحّد لكل طلبات fetch بالموقع (بدون / بالنهاية). */
export const API_ORIGIN = resolveApiOrigin()
