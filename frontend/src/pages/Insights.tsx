import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardBody, CardHeader, Page, PageHeader } from '../components/ui'

type MetricKey = 'heartRate' | 'bp' | 'temp'

type Metric = {
  key: MetricKey
  label: string
  unit: string
  color: string
  values: number[]
}

function avg(arr: number[]) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function minMax(arr: number[]) {
  if (!arr.length) return { min: 0, max: 0 }
  let min = arr[0]
  let max = arr[0]
  for (const v of arr) {
    if (v < min) min = v
    if (v > max) max = v
  }
  return { min, max }
}

function normalize(value: number, min: number, max: number) {
  if (max === min) return 0.5
  return (value - min) / (max - min)
}

export default function Insights() {
  const navigate = useNavigate()
  const series = {
    heartRate: [68, 70, 69, 72, 71, 73, 72],
    bp: [118, 120, 119, 121, 120, 122, 120],
    temp: [36.4, 36.5, 36.5, 36.6, 36.5, 36.6, 36.5].map((x) => Math.round(x * 10)),
  }

  const metrics: Metric[] = [
    {
      key: 'heartRate',
      label: '心率',
      unit: 'bpm',
      color: '#2563eb',
      values: series.heartRate,
    },
    {
      key: 'bp',
      label: '收缩压',
      unit: 'mmHg',
      color: '#059669',
      values: series.bp,
    },
    {
      key: 'temp',
      label: '体温',
      unit: '°C',
      color: '#d97706',
      values: series.temp,
    },
  ]

  const [aKey, setAKey] = useState<MetricKey>('heartRate')
  const [bKey, setBKey] = useState<MetricKey>('bp')
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const a = useMemo(() => metrics.find((m) => m.key === aKey)!, [aKey])
  const b = useMemo(() => metrics.find((m) => m.key === bKey)!, [bKey])

  const aStats = useMemo(() => {
    const mm = minMax(a.values)
    return { avg: avg(a.values), ...mm }
  }, [a.values])

  const bStats = useMemo(() => {
    const mm = minMax(b.values)
    return { avg: avg(b.values), ...mm }
  }, [b.values])

  const points = useMemo(() => {
    const n = Math.max(a.values.length, b.values.length)
    const aMM = minMax(a.values)
    const bMM = minMax(b.values)

    return Array.from({ length: n }).map((_, i) => {
      const av = a.values[i] ?? a.values[a.values.length - 1]
      const bv = b.values[i] ?? b.values[b.values.length - 1]
      return {
        i,
        ax: normalize(i, 0, n - 1),
        ay: 1 - normalize(av, aMM.min, aMM.max),
        by: 1 - normalize(bv, bMM.min, bMM.max),
        av,
        bv,
      }
    })
  }, [a, b])

  function displayValue(key: MetricKey, v: number) {
    if (key === 'temp') return (v / 10).toFixed(1)
    return `${v}`
  }

  return (
    <Page>
      <PageHeader 
        title="趋势分析" 
        subtitle="对比指标变化，帮助你发现趋势"
        leftSlot={
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="border border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-950/30"
          >
            返回首页
          </Button>
        }
      />

      <Card className="mb-10">
        <CardHeader title="对比" subtitle="选择两项指标进行趋势对比" />
        <CardBody>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">指标 A</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden dark:border-gray-700">
                {metrics.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setAKey(m.key)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      aKey === m.key
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">指标 B</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden dark:border-gray-700">
                {metrics.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setBKey(m.key)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      bKey === m.key
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{a.label}</div>
                <Badge tone="blue">均值 {aStats.avg.toFixed(1)}</Badge>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                范围 {aStats.min} - {aStats.max} {a.unit}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{b.label}</div>
                <Badge tone="green">均值 {bStats.avg.toFixed(1)}</Badge>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                范围 {bStats.min} - {bStats.max} {b.unit}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">趋势对比</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">鼠标悬停查看单点值</div>
              </div>
              {hoverIndex !== null ? (
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">第 {hoverIndex + 1} 天</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {a.label} {displayValue(a.key, points[hoverIndex].av)} {a.unit} · {b.label}{' '}
                    {displayValue(b.key, points[hoverIndex].bv)} {b.unit}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400">悬停点位显示 Tooltip</div>
              )}
            </div>

            <div className="mt-4 relative">
              <svg viewBox="0 0 600 180" className="h-44 w-full" onMouseLeave={() => setHoverIndex(null)}>
                <rect x="0" y="0" width="600" height="180" fill="transparent" />

                <polyline
                  fill="none"
                  stroke={a.color}
                  strokeWidth="2.5"
                  points={points.map((p) => `${Math.round(p.ax * 600)},${Math.round(p.ay * 180)}`).join(' ')}
                />
                <polyline
                  fill="none"
                  stroke={b.color}
                  strokeWidth="2.5"
                  points={points.map((p) => `${Math.round(p.ax * 600)},${Math.round(p.by * 180)}`).join(' ')}
                />

                {points.map((p) => {
                  const cx = Math.round(p.ax * 600)
                  const cyA = Math.round(p.ay * 180)
                  const cyB = Math.round(p.by * 180)
                  return (
                    <g key={p.i}>
                      <circle
                        cx={cx}
                        cy={cyA}
                        r={hoverIndex === p.i ? 5 : 3.5}
                        fill={a.color}
                        opacity={hoverIndex === null || hoverIndex === p.i ? 1 : 0.35}
                        onMouseEnter={() => setHoverIndex(p.i)}
                      />
                      <circle
                        cx={cx}
                        cy={cyB}
                        r={hoverIndex === p.i ? 5 : 3.5}
                        fill={b.color}
                        opacity={hoverIndex === null || hoverIndex === p.i ? 1 : 0.35}
                        onMouseEnter={() => setHoverIndex(p.i)}
                      />
                    </g>
                  )
                })}
              </svg>

              {hoverIndex !== null ? (
                <div className="pointer-events-none absolute right-4 top-4 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs text-gray-700 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/80 dark:text-gray-200">
                  <div className="font-semibold">第 {hoverIndex + 1} 天</div>
                  <div className="mt-1">
                    {a.label}：{displayValue(a.key, points[hoverIndex].av)} {a.unit}
                  </div>
                  <div>
                    {b.label}：{displayValue(b.key, points[hoverIndex].bv)} {b.unit}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="说明" subtitle="后续可接入你的真实记录数据" />
        <CardBody>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            当前为示例数据。下一步可将健康档案中的指标记录统一为时间序列，并支持区间选择与多指标叠加。
          </div>
        </CardBody>
      </Card>
    </Page>
  )
}
