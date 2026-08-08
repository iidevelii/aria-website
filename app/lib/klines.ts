// جلب شموع OHLC مع نسخة احتياطية تلقائية -- بايننس ممكن يصير غير قابل
// للوصول أحياناً (حظر IP متجدد، موثّق بـKNOWLEDGE.md بمشروع aria-bot)، وهذا
// طلب مباشر من متصفح المستخدم نفسه فأي حظر يظهر له مباشرة كـ"شارت ما يشتغل".
// لو بايننس فشل (استثناء، رد غير ناجح، أو مصفوفة فاضية)، نجرب Bybit تلقائياً.

export type Candle = { time: number; open: number; high: number; low: number; close: number }

const BINANCE_INTERVAL_TO_BYBIT: Record<string, string> = {
  '1m': '1', '5m': '5', '15m': '15', '30m': '30',
  '1h': '60', '4h': '240', '1d': 'D',
}

async function fetchBinance(symbol: string, interval: string, limit: number, market: string,
                             startTime?: number, endTime?: number): Promise<Candle[]> {
  const base = market === 'FUTURES' ? 'https://fapi.binance.com/fapi/v1' : 'https://api.binance.com/api/v3'
  let url = `${base}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  if (startTime != null) url += `&startTime=${startTime}`
  if (endTime != null) url += `&endTime=${endTime}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`binance ${res.status}`)
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) throw new Error('binance empty')
  return data.map((d: any) => ({
    time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
  }))
}

async function fetchBybit(symbol: string, interval: string, limit: number, market: string,
                           startTime?: number, endTime?: number): Promise<Candle[]> {
  const bybitInterval = BINANCE_INTERVAL_TO_BYBIT[interval] || '15'
  const category = market === 'FUTURES' ? 'linear' : 'spot'
  let url = `https://api.bybit.com/v5/market/kline?category=${category}&symbol=${symbol}&interval=${bybitInterval}&limit=${limit}`
  if (startTime != null) url += `&start=${startTime}`
  if (endTime != null) url += `&end=${endTime}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`bybit ${res.status}`)
  const data = await res.json()
  const list = data?.result?.list
  if (!Array.isArray(list) || list.length === 0) throw new Error('bybit empty')
  // Bybit يرجّع الأحدث أولاً -- نعكسها لنفس ترتيب بايننس (الأقدم أولاً)
  return list.reverse().map((d: string[]) => ({
    time: parseInt(d[0]) / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
  }))
}

/** يجيب شموع لعملة معينة -- بايننس أولاً، Bybit تلقائياً لو فشل.
 * startTime/endTime (اختياريان، ميلي-ثانية) يحصرون النطاق الزمني -- بدونهم
 * يرجع آخر `limit` شمعة لحظة الاستدعاء (سلوك قديم لأي مستدعي ما يحتاج نطاق
 * زمني ثابت، زي شارت السوق العام بالداشبورد). أي شارت صفقة فعلية *لازم*
 * يمرر النطاق، وإلا الشموع المجلوبة تكون "آخر N شمعة من الآن" اللي ممكن ما
 * تتقاطع إطلاقاً مع وقت الصفقة الفعلي لو كانت أقدم من N×الفريم (خطأ حقيقي
 * وقع فعلياً: صفقة MUBARAK عمرها يومين مع limit=150×15m=37.5 ساعة بس). */
export async function fetchKlines(symbol: string, interval: string, limit: number, market: string,
                                   startTime?: number, endTime?: number): Promise<Candle[]> {
  try {
    return await fetchBinance(symbol, interval, limit, market, startTime, endTime)
  } catch {
    return await fetchBybit(symbol, interval, limit, market, startTime, endTime)
  }
}
