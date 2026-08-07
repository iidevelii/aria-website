// جلب شموع OHLC مع نسخة احتياطية تلقائية -- بايننس ممكن يصير غير قابل
// للوصول أحياناً (حظر IP متجدد، موثّق بـKNOWLEDGE.md بمشروع aria-bot)، وهذا
// طلب مباشر من متصفح المستخدم نفسه فأي حظر يظهر له مباشرة كـ"شارت ما يشتغل".
// لو بايننس فشل (استثناء، رد غير ناجح، أو مصفوفة فاضية)، نجرب Bybit تلقائياً.

export type Candle = { time: number; open: number; high: number; low: number; close: number }

const BINANCE_INTERVAL_TO_BYBIT: Record<string, string> = {
  '1m': '1', '5m': '5', '15m': '15', '30m': '30',
  '1h': '60', '4h': '240', '1d': 'D',
}

async function fetchBinance(symbol: string, interval: string, limit: number, market: string): Promise<Candle[]> {
  const base = market === 'FUTURES' ? 'https://fapi.binance.com/fapi/v1' : 'https://api.binance.com/api/v3'
  const res = await fetch(`${base}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`)
  if (!res.ok) throw new Error(`binance ${res.status}`)
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) throw new Error('binance empty')
  return data.map((d: any) => ({
    time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
  }))
}

async function fetchBybit(symbol: string, interval: string, limit: number, market: string): Promise<Candle[]> {
  const bybitInterval = BINANCE_INTERVAL_TO_BYBIT[interval] || '15'
  const category = market === 'FUTURES' ? 'linear' : 'spot'
  const res = await fetch(`https://api.bybit.com/v5/market/kline?category=${category}&symbol=${symbol}&interval=${bybitInterval}&limit=${limit}`)
  if (!res.ok) throw new Error(`bybit ${res.status}`)
  const data = await res.json()
  const list = data?.result?.list
  if (!Array.isArray(list) || list.length === 0) throw new Error('bybit empty')
  // Bybit يرجّع الأحدث أولاً -- نعكسها لنفس ترتيب بايننس (الأقدم أولاً)
  return list.reverse().map((d: string[]) => ({
    time: parseInt(d[0]) / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
  }))
}

/** يجيب شموع لعملة معينة -- بايننس أولاً، Bybit تلقائياً لو فشل. */
export async function fetchKlines(symbol: string, interval: string, limit: number, market: string): Promise<Candle[]> {
  try {
    return await fetchBinance(symbol, interval, limit, market)
  } catch {
    return await fetchBybit(symbol, interval, limit, market)
  }
}
