// طبقة fetch موحّدة تفرّق بين "فاضي فعلاً" و"فشل الشبكة" (بند 24 مراجعة
// DevelBot_review.md) -- عشرات مواضع catch {} بالموقع كانت تعامل الاثنين
// نفس المعاملة (state فاضي)، فمستخدم يشوف "ما فيه بيانات" بدون أي تفسير
// حتى لو السبب فشل شبكة حقيقي قابل لإعادة المحاولة.
//
// النطاق الحالي: أُضيفت هنا + طُبّقت على أهم موضع بالموقع (إشارات الداشبورد،
// أكبر قيمة منتج وأول شي يشوفه أي مشترك). باقي المواضع (~17 ملف آخر) لسا
// تستخدم catch {} القديم -- ميزتها إنها widgets ثانوية (توب كوينز، أخبار،
// رابحين/خاسرين) يستاهل إصلاحها بنفس النمط لاحقاً، مو خطر فوري بنفس درجة
// الإشارات نفسها.

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/** fetch + parse JSON بنتيجة واحدة واضحة (ok/data أو ok:false/error) بدل
 * رمي استثناء يحتاج try/catch بكل موقع استدعاء. error رسالة قصيرة صالحة
 * للعرض مباشرة للمستخدم (مو stack trace ولا تفاصيل تقنية). */
export async function apiFetch<T = unknown>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, init)
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` }
    }
    const data = (await res.json()) as T
    return { ok: true, data }
  } catch {
    return { ok: false, error: 'network' }
  }
}
