import { useMemo } from 'react'
import { useState } from 'react'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function normalizePoints(values: number[], width: number, height: number, padding = 2) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const innerW = width - padding * 2
  const innerH = height - padding * 2

  return values.map((v, i) => {
    const x = padding + (innerW * i) / Math.max(1, values.length - 1)
    const y = padding + innerH - ((v - min) / range) * innerH
    return { x, y }
  })
}

function toPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return ''
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
}

function toAreaPath(points: Array<{ x: number; y: number }>, height: number) {
  if (points.length === 0) return ''
  const first = points[0]
  const last = points[points.length - 1]
  return `${toPath(points)} L ${last.x.toFixed(2)} ${height} L ${first.x.toFixed(2)} ${height} Z`
}

export function Sparkline({
  values,
  width = 260,
  height = 64,
  color = '#2563eb',
  fillOpacity = 0.1,
  showAverage = true,
  className,
}: {
  values: number[]
  width?: number
  height?: number
  color?: string
  fillOpacity?: number
  showAverage?: boolean
  className?: string
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const safe = useMemo(() => {
    if (!values || values.length < 2) return [0, 0]
    const cleaned = values.map((v) => (Number.isFinite(v) ? v : 0))
    return cleaned
  }, [values])

  const points = useMemo(() => normalizePoints(safe, width, height, 4), [safe, width, height])
  const d = useMemo(() => toPath(points), [points])
  const areaD = useMemo(() => toAreaPath(points, height), [points, height])

  const last = safe[safe.length - 1]
  const first = safe[0]
  const delta = last - first
  const pct = first === 0 ? 0 : (delta / first) * 100

  const trend = clamp(pct, -999, 999)
  const avg = safe.reduce((s, v) => s + v, 0) / safe.length
  const avgY = ((height - 4) - ((avg - Math.min(...safe)) / (Math.max(...safe) - Math.min(...safe) || 1)) * (height - 8)) + 2

  return (
    <div className={className}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" role="img" aria-label="趋势图">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2={height}>
            <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showAverage && (
          <line
            x1={0}
            x2={width}
            y1={avgY}
            y2={avgY}
            stroke="#e5e7eb"
            strokeDasharray="4 3"
            strokeWidth="1"
          />
        )}
        <path d={areaD} fill="url(#sparkFill)" />
        <path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 4 : 3}
              fill={color}
              opacity={hoverIndex === i ? 0.9 : 0.5}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <title>{`第 ${i + 1} 天：${safe[i]}`}</title>
            </circle>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 8 : 6}
              fill={color}
              opacity={0.12}
              pointerEvents="none"
            />
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-gray-500">趋势</span>
        <span className={`font-medium ${trend >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
          {trend >= 0 ? '+' : ''}
          {trend.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

