import { useEffect, useState } from 'react'
import HealthCard from '../components/HealthCard'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, RecordsIcon, SearchIcon } from '../components/Icons'
import { Badge, Button, Card, CardBody, CardHeader, Page, PageHeader } from '../components/ui'
import { EmptyState } from '../components/EmptyState'
import { Sparkline } from '../components/Sparkline'
import { BookOpen, MapPin, Pill, Search, TrendingUp, Calendar } from 'lucide-react'
import { Ring } from '../components/Ring'
import { Badge as UiBadge } from '../components/ui'
import { EmergencyButton } from '../components/EmergencyButton'

interface HealthData {
  bloodPressure: string
  heartRate: number
  temperature: number
  lastUpdate: string
}

export default function Dashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'7d' | '30d'>('7d')

  useEffect(() => {
    setTimeout(() => {
      setHealthData({
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 36.5,
        lastUpdate: new Date().toLocaleDateString('zh-CN'),
      })
      setLoading(false)
    }, 800)
  }, [])

  const recentRecords = [
    { id: 'r1', title: '体检报告', date: '2024-01-15', tone: 'blue' as const },
    { id: 'r2', title: '血压记录', date: '2024-01-10', tone: 'green' as const },
    { id: 'r3', title: '症状记录', date: '2024-01-05', tone: 'amber' as const },
  ]

  const series = {
    '7d': {
      label: '近 7 天',
      heartRate: [68, 70, 69, 72, 71, 73, 72],
      bp: [118, 120, 119, 121, 120, 122, 120],
      temp: [36.4, 36.5, 36.5, 36.6, 36.5, 36.6, 36.5],
    },
    '30d': {
      label: '近 30 天',
      heartRate: [
        66, 67, 68, 69, 70, 69, 71, 70, 72, 73, 72, 71, 70, 69, 70, 71, 72, 71, 73, 72, 71, 70, 69, 70,
        71, 72, 71, 72, 73, 72,
      ],
      bp: [
        116, 117, 118, 118, 119, 120, 119, 118, 120, 121, 121, 120, 119, 118, 119, 120, 121, 120, 122, 121, 120,
        119, 118, 119, 120, 121, 120, 121, 122, 120,
      ],
      temp: [
        36.4, 36.5, 36.4, 36.5, 36.5, 36.6, 36.5, 36.4, 36.5, 36.6, 36.5, 36.5, 36.4, 36.5, 36.5, 36.6, 36.5,
        36.5, 36.6, 36.5, 36.5, 36.4, 36.5, 36.5, 36.6, 36.5, 36.5, 36.6, 36.5, 36.5,
      ],
    },
  } as const

  const active = series[range]

  const healthScore = 82
  const heartTrendDelta =
    ((active.heartRate[active.heartRate.length - 1] - active.heartRate[0]) / (active.heartRate[0] || 1)) * 100

  const quickActions = [
    {
      path: '/chat',
      label: '健康助手',
      description: '记录症状与问题，获取建议与提示',
      icon: SearchIcon,
      color: 'blue',
    },
    {
      path: '/records',
      label: '健康档案',
      description: '管理报告、图片与个人记录',
      icon: RecordsIcon,
      color: 'purple',
    },
    {
      path: '/medications',
      label: '用药提醒',
      description: '用药计划与系统提醒',
      icon: Pill as any,
      color: 'amber',
    },
    {
      path: '/nearby',
      label: '就医导航',
      description: '附近可就医地点，一键导航',
      icon: MapPin as any,
      color: 'green',
    },
    {
      path: '/knowledge',
      label: '知识库',
      description: '健康科普与自我管理建议',
      icon: BookOpen as any,
      color: 'gray',
    },
    {
      path: '/insights',
      label: '趋势分析',
      description: '查看指标变化与对比',
      icon: TrendingUp as any,
      color: 'blue2',
    },
    {
      path: '/checkup',
      label: '体检提醒',
      description: '设置体检提醒，定期关注健康',
      icon: Calendar as any,
      color: 'green',
    },
  ]

  return (
    <Page>
      <PageHeader
        title="概览"
        subtitle={`今天 · ${new Date().toLocaleDateString('zh-CN')}`}
        actions={
          <>
            <EmergencyButton variant="danger" size="sm" showLabel={false} />
            <Link to="/chat">
              <Button>
                <span className="inline-flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  打开助手
                </span>
              </Button>
            </Link>
            <Link to="/records">
              <Button variant="secondary">管理档案</Button>
            </Link>
          </>
        }
      />

      <Card className="mb-6">
        <CardHeader
          title="紧急联系"
          subtitle="紧急情况下快速拨号"
        />
        <CardBody>
          <EmergencyButton />
        </CardBody>
      </Card>

      <Card className="mb-10">
        <CardHeader
          title="关键指标"
          subtitle="最近一次记录"
          right={
            <div className="hidden md:block">
              <Ring value={healthScore} label="健康评分" description="示例：基于近30天变化" />
            </div>
          }
        />
        <CardBody>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {loading ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                  />
                ))}
              </>
            ) : healthData ? (
              <>
                <HealthCard title="血压" value={healthData.bloodPressure} unit="mmHg" status="normal" />
                <HealthCard title="心率" value={healthData.heartRate.toString()} unit="bpm" status="normal" />
                <HealthCard title="体温" value={healthData.temperature.toString()} unit="°C" status="normal" />
              </>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <Card className="mb-10">
        <CardHeader title="快捷入口" subtitle="常用功能" />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              const colorClasses: Record<string, string> = {
                blue: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900/50',
                green:
                  'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900/50',
                purple:
                  'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-900/50',
                amber: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900/50',
                gray: 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800',
                blue2: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900/50',
              }
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group rounded-xl border border-gray-200 p-5 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${
                          colorClasses[action.color]
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{action.label}</h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-gray-600" />
                  </div>
                </Link>
              )
            })}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="近期动态"
            subtitle="最近更新的条目"
            right={
              <Link to="/records" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                查看全部
              </Link>
            }
          />
          <CardBody>
            <div className="space-y-3">
              {recentRecords.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone={r.tone}>{r.title}</Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{r.date}</span>
                    </div>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="趋势"
              subtitle="关键指标变化"
              right={
                <div className="flex items-center gap-2">
                  <button
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      range === '7d'
                        ? 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setRange('7d')}
                  >
                    7 天
                  </button>
                  <button
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      range === '30d'
                        ? 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setRange('30d')}
                  >
                    30 天
                  </button>
                </div>
              }
            />
            <CardBody>
              {loading ? (
                <EmptyState tone="gray" title="正在加载" description="请稍候…" />
              ) : (
                <div className="space-y-6">
                  <UiBadge tone={heartTrendDelta >= 0 ? 'green' : 'red'}>
                    {heartTrendDelta >= 0 ? '上升' : '下降'} {heartTrendDelta >= 0 ? '+' : ''}
                    {heartTrendDelta.toFixed(1)}%（相对首日）
                  </UiBadge>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">心率</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{active.label}</span>
                    </div>
                    <Sparkline values={active.heartRate} color="#2563eb" className="mt-2" showAverage />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">血压（收缩压）</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{active.label}</span>
                    </div>
                    <Sparkline values={active.bp} color="#059669" className="mt-2" showAverage />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">体温</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{active.label}</span>
                    </div>
                    <Sparkline values={active.temp} color="#d97706" className="mt-2" showAverage />
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </Page>
  )
}
