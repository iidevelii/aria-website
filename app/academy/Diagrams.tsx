'use client'

const GREEN = '#00e664'
const RED = '#ff4455'
const CYAN = '#00c4ef'
const MUTED = 'var(--dim)'

type CandleSpec = { bodyTop: number; bodyBottom: number; wickTop: number; wickBottom: number; bull: boolean }

function CandleSet({ candles }: { candles: CandleSpec[] }) {
  const W = 100, H = 100
  const slot = W / candles.length
  const bodyW = Math.min(20, slot * 0.5)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }}>
      {candles.map((c, i) => {
        const cx = slot * i + slot / 2
        const color = c.bull ? GREEN : RED
        return (
          <g key={i}>
            <line x1={cx} y1={c.wickTop} x2={cx} y2={c.wickBottom} stroke={color} strokeWidth="2.5" />
            <rect x={cx - bodyW / 2} y={c.bodyTop} width={bodyW} height={Math.max(3, c.bodyBottom - c.bodyTop)} fill={color} rx="1.5" />
          </g>
        )
      })}
    </svg>
  )
}

function PatternLine({ points, refLines = [], fillDir }: {
  points: [number, number][]; refLines?: { y: number; color?: string }[]; fillDir?: 'up' | 'down'
}) {
  const W = 160, H = 100
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }}>
      {refLines.map((r, i) => (
        <line key={i} x1={0} y1={r.y} x2={W} y2={r.y} stroke={r.color || MUTED} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
      ))}
      <path d={path} fill="none" stroke={CYAN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {fillDir && (
        <path d={`${path} L ${points[points.length - 1][0]} ${fillDir === 'up' ? 0 : H} L ${points[0][0]} ${fillDir === 'up' ? 0 : H} Z`}
          fill={fillDir === 'up' ? GREEN : RED} opacity="0.08" />
      )}
    </svg>
  )
}

const CANDLE_DIAGRAMS: Record<string, CandleSpec[]> = {
  'hammer':       [{ bodyTop: 25, bodyBottom: 38, wickTop: 25, wickBottom: 85, bull: true }],
  'inv-hammer':   [{ bodyTop: 60, bodyBottom: 73, wickTop: 15, wickBottom: 60, bull: true }],
  'hanging-man':  [{ bodyTop: 25, bodyBottom: 38, wickTop: 25, wickBottom: 85, bull: false }],
  'shooting-star':[{ bodyTop: 60, bodyBottom: 73, wickTop: 15, wickBottom: 60, bull: false }],
  'doji':         [{ bodyTop: 48, bodyBottom: 52, wickTop: 15, wickBottom: 85, bull: true }],
  'marubozu-bull':[{ bodyTop: 15, bodyBottom: 85, wickTop: 15, wickBottom: 85, bull: true }],
  'marubozu-bear':[{ bodyTop: 15, bodyBottom: 85, wickTop: 15, wickBottom: 85, bull: false }],
  'piercing': [
    { bodyTop: 20, bodyBottom: 55, wickTop: 15, wickBottom: 60, bull: false },
    { bodyTop: 35, bodyBottom: 75, wickTop: 30, wickBottom: 80, bull: true },
  ],
  'dark-cloud': [
    { bodyTop: 45, bodyBottom: 80, wickTop: 40, wickBottom: 85, bull: true },
    { bodyTop: 25, bodyBottom: 60, wickTop: 20, wickBottom: 65, bull: false },
  ],
  'engulf-bull': [
    { bodyTop: 35, bodyBottom: 55, wickTop: 30, wickBottom: 60, bull: false },
    { bodyTop: 25, bodyBottom: 70, wickTop: 20, wickBottom: 75, bull: true },
  ],
  'engulf-bear': [
    { bodyTop: 35, bodyBottom: 55, wickTop: 30, wickBottom: 60, bull: true },
    { bodyTop: 25, bodyBottom: 70, wickTop: 20, wickBottom: 75, bull: false },
  ],
  'harami-bull': [
    { bodyTop: 20, bodyBottom: 70, wickTop: 15, wickBottom: 75, bull: false },
    { bodyTop: 38, bodyBottom: 52, wickTop: 35, wickBottom: 55, bull: true },
  ],
  'harami-bear': [
    { bodyTop: 20, bodyBottom: 70, wickTop: 15, wickBottom: 75, bull: true },
    { bodyTop: 38, bodyBottom: 52, wickTop: 35, wickBottom: 55, bull: false },
  ],
  'tweezers-bottom': [
    { bodyTop: 45, bodyBottom: 70, wickTop: 40, wickBottom: 82, bull: false },
    { bodyTop: 35, bodyBottom: 60, wickTop: 30, wickBottom: 82, bull: true },
  ],
  'tweezers-top': [
    { bodyTop: 30, bodyBottom: 55, wickTop: 18, wickBottom: 60, bull: true },
    { bodyTop: 40, bodyBottom: 65, wickTop: 18, wickBottom: 70, bull: false },
  ],
  'star-morning': [
    { bodyTop: 20, bodyBottom: 55, wickTop: 15, wickBottom: 60, bull: false },
    { bodyTop: 60, bodyBottom: 65, wickTop: 55, wickBottom: 72, bull: false },
    { bodyTop: 20, bodyBottom: 58, wickTop: 15, wickBottom: 63, bull: true },
  ],
  'star-evening': [
    { bodyTop: 45, bodyBottom: 80, wickTop: 40, wickBottom: 85, bull: true },
    { bodyTop: 30, bodyBottom: 35, wickTop: 22, wickBottom: 42, bull: true },
    { bodyTop: 42, bodyBottom: 78, wickTop: 37, wickBottom: 83, bull: false },
  ],
  'three-up': [
    { bodyTop: 65, bodyBottom: 85, wickTop: 62, wickBottom: 87, bull: true },
    { bodyTop: 42, bodyBottom: 65, wickTop: 40, wickBottom: 68, bull: true },
    { bodyTop: 18, bodyBottom: 42, wickTop: 16, wickBottom: 45, bull: true },
  ],
  'three-down': [
    { bodyTop: 15, bodyBottom: 35, wickTop: 13, wickBottom: 38, bull: false },
    { bodyTop: 35, bodyBottom: 58, wickTop: 32, wickBottom: 60, bull: false },
    { bodyTop: 58, bodyBottom: 82, wickTop: 55, wickBottom: 85, bull: false },
  ],
}

const PATTERN_DIAGRAMS: Record<string, { points: [number, number][]; refLines?: { y: number; color?: string }[]; fillDir?: 'up' | 'down' }> = {
  'double-top': { points: [[5, 70], [40, 20], [65, 55], [95, 20], [130, 60], [155, 90]], refLines: [{ y: 55, color: RED }] },
  'double-bottom': { points: [[5, 30], [40, 80], [65, 45], [95, 80], [130, 40], [155, 10]], refLines: [{ y: 45, color: GREEN }] },
  'head-shoulders': { points: [[5, 60], [30, 30], [55, 55], [80, 10], [105, 55], [130, 32], [155, 62]], refLines: [{ y: 56, color: RED }] },
  'flag-bull': { points: [[5, 90], [30, 20], [55, 35], [75, 25], [95, 40], [115, 30], [140, 45], [155, 8]] },
  'flag-bear': { points: [[5, 8], [30, 80], [55, 65], [75, 75], [95, 60], [115, 70], [140, 55], [155, 92]] },
  'triangle-sym': { points: [[5, 15], [35, 55], [65, 25], [90, 55], [115, 35], [135, 55], [155, 45]] },
  'triangle-asc': { points: [[5, 20], [35, 55], [65, 20], [90, 45], [115, 20], [140, 35], [155, 5]], refLines: [{ y: 20, color: RED }] },
  'triangle-desc': { points: [[5, 80], [35, 45], [65, 80], [90, 55], [115, 80], [140, 65], [155, 95]], refLines: [{ y: 80, color: GREEN }] },
  'wedge-rising': { points: [[5, 85], [30, 45], [55, 65], [80, 25], [105, 40], [130, 15], [155, 55]] },
  'wedge-falling': { points: [[5, 15], [30, 55], [55, 35], [80, 75], [105, 60], [130, 85], [155, 45]] },
  'rectangle': { points: [[5, 20], [30, 70], [55, 20], [80, 70], [105, 20], [130, 70], [155, 20]], refLines: [{ y: 20, color: RED }, { y: 70, color: GREEN }] },
  'bollinger': { points: [[5, 50], [30, 35], [55, 55], [80, 25], [105, 45], [130, 20], [155, 40]], refLines: [{ y: 15, color: CYAN }, { y: 65, color: CYAN }] },
  'support-resistance': { points: [[5, 30], [30, 70], [55, 32], [80, 68], [105, 30], [130, 65], [155, 20]], refLines: [{ y: 30, color: RED }, { y: 68, color: GREEN }] },
  'fibonacci': { points: [[5, 85], [50, 10], [80, 45], [155, 5]], refLines: [{ y: 10, color: MUTED }, { y: 28, color: CYAN }, { y: 47, color: CYAN }, { y: 66, color: MUTED }, { y: 85, color: MUTED }] },
}

export default function Diagram({ type }: { type: string }) {
  const candles = CANDLE_DIAGRAMS[type]
  if (candles) return <CandleSet candles={candles} />
  const pattern = PATTERN_DIAGRAMS[type]
  if (pattern) return <PatternLine {...pattern} />
  return null
}
