import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge, Button, Card, CardBody, CardHeader, Page, PageHeader, Select } from '../components/ui'
import { EmptyState } from '../components/EmptyState'
import { SkeletonList } from '../components/Skeleton'
import { useToast } from '../components/ToastProvider'
import { pushNotification } from '../services/notificationHelpers'
import { haversineDistanceMeters, searchNearbyMedicalPOI, type OsmPlace } from '../services/osmOverpass'

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

type GeoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; lng: number; lat: number }
  | { status: 'error'; message: string }

function formatDistance(m?: number) {
  if (!m && m !== 0) return ''
  if (m < 1000) return `${Math.round(m)}m`
  return `${(m / 1000).toFixed(1)}km`
}

function poiLabel(t: OsmPlace['type']) {
  switch (t) {
    case 'hospital':
      return '医院'
    case 'clinic':
      return '诊所'
    case 'doctors':
      return '门诊'
  }
}

function markerTone(t: OsmPlace['type']): string {
  switch (t) {
    case 'hospital':
      return '#2563eb'
    case 'clinic':
      return '#d97706'
    case 'doctors':
      return '#059669'
  }
}

function makeDotIcon(color: string) {
  const html = `<div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid rgba(255,255,255,.9);box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`
  return L.divIcon({
    className: '',
    html,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default function NearbyHospitals() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const [geo, setGeo] = useState<GeoState>({ status: 'idle' })
  const [radius, setRadius] = useState<3000 | 5000 | 10000>(5000)
  const [query, setQuery] = useState<'all' | 'hospital' | 'clinic' | 'doctors'>('all')

  const [loading, setLoading] = useState(false)
  const [places, setPlaces] = useState<Array<OsmPlace & { distanceMeters: number }>>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const canSearch = geo.status === 'ready'

  const mapElRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('nearby:lastQuery')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          if (parsed.radius === 3000 || parsed.radius === 5000 || parsed.radius === 10000) setRadius(parsed.radius)
          if (parsed.query === 'all' || parsed.query === 'hospital' || parsed.query === 'clinic' || parsed.query === 'doctors') {
            setQuery(parsed.query)
          }
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('nearby:lastQuery', JSON.stringify({ radius, query }))
    } catch {
      // ignore
    }
  }, [radius, query])

  const origin = useMemo(() => {
    if (geo.status !== 'ready') return null
    return { lat: geo.lat, lng: geo.lng }
  }, [geo])

  const filteredSorted = useMemo(() => {
    let arr = [...places]
    if (query !== 'all') arr = arr.filter((p) => p.type === query)
    arr.sort((a, b) => a.distanceMeters - b.distanceMeters)
    return arr
  }, [places, query])

  const active = useMemo(() => {
    if (!activeId) return null
    return filteredSorted.find((p) => p.id === activeId) ?? null
  }, [activeId, filteredSorted])

  useEffect(() => {
    if (!mapElRef.current) return
    if (mapRef.current) return

    const map = L.map(mapElRef.current, {
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const markers = L.layerGroup().addTo(map)
    markersLayerRef.current = markers

    map.setView([39.9042, 116.4074], 10)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersLayerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!origin) return
    map.flyTo([origin.lat, origin.lng], Math.max(map.getZoom(), 14), { duration: 0.6 })
  }, [origin])

  useEffect(() => {
    const map = mapRef.current
    const layer = markersLayerRef.current
    if (!map || !layer) return

    layer.clearLayers()

    if (origin) {
      L.marker([origin.lat, origin.lng]).addTo(layer).bindPopup('当前位置')
    }

    filteredSorted.slice(0, 200).forEach((p) => {
      const icon = makeDotIcon(markerTone(p.type))
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(layer)

      marker.bindPopup(
        `<div style="min-width:180px">
          <div style="font-weight:600;margin-bottom:4px">${escapeHtml(p.name)}</div>
          <div style="font-size:12px;opacity:.8">${poiLabel(p.type)} · ${formatDistance(p.distanceMeters)}</div>
          ${p.address ? `<div style="font-size:12px;opacity:.8;margin-top:4px">${escapeHtml(p.address)}</div>` : ''}
        </div>`
      )

      marker.on('click', () => {
        setActiveId(p.id)
      })
    })

    setTimeout(() => {
      map.invalidateSize()
    }, 0)
  }, [filteredSorted, origin])

  async function locate() {
    if (!('geolocation' in navigator)) {
      setGeo({ status: 'error', message: '当前设备不支持定位' })
      return
    }
    setGeo({ status: 'loading' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ status: 'ready', lng: pos.coords.longitude, lat: pos.coords.latitude })
        toast({ tone: 'success', message: '定位成功' })
      },
      (err) => {
        const msg = err.code === err.PERMISSION_DENIED ? '定位权限被拒绝，请在系统设置中开启' : '定位失败，请稍后重试'
        setGeo({ status: 'error', message: msg })
        toast({ tone: 'warning', message: msg })
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 }
    )
  }

  async function search() {
    if (geo.status !== 'ready') return

    setLoading(true)
    setActiveId(null)

    try {
      const raw = await searchNearbyMedicalPOI({ lat: geo.lat, lng: geo.lng, radiusMeters: radius })
      const withDistance = raw
        .map((p) => ({
          ...p,
          distanceMeters: haversineDistanceMeters({ lat: geo.lat, lng: geo.lng }, { lat: p.lat, lng: p.lng }),
        }))
        .filter((p) => Number.isFinite(p.distanceMeters))

      setPlaces(withDistance)
      toast({ tone: 'success', message: `找到 ${withDistance.length} 个结果` })
      pushNotification({
        type: 'system',
        title: '就医导航',
        description: `已更新附近可就医地点（${radius / 1000}km）`,
        unread: false,
      })

      const map = mapRef.current
      if (map) {
        map.invalidateSize()
      }
    } catch {
      toast({ tone: 'error', message: '搜索失败，请稍后重试' })
    } finally {
      setLoading(false)
    }
  }

  function openNavigation(dest: { lat: number; lng: number; name: string }) {
    const from = origin ? `&from=${origin.lng},${origin.lat},${encodeURIComponent('我的位置')}` : ''
    const amap = `https://uri.amap.com/navigation?to=${dest.lng},${dest.lat},${encodeURIComponent(dest.name)}${from}&mode=car&policy=1&src=health-assistant&coordinate=gaode&callnative=1`
    window.open(amap, '_blank', 'noopener,noreferrer')
  }

  function focusPlace(p: { lat: number; lng: number }) {
    const map = mapRef.current
    if (!map) return
    map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 15), { duration: 0.6 })
  }

  const locationText =
    geo.status === 'idle'
      ? '尚未获取位置'
      : geo.status === 'loading'
      ? '正在获取位置…'
      : geo.status === 'ready'
      ? '已获取位置'
      : geo.message

  return (
    <Page>
      <PageHeader 
        title="就医导航" 
        subtitle="快速找到附近可就医的地点，并一键导航"
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
        <CardHeader title="开始" subtitle="定位仅用于本机查找，不会上传" />
        <CardBody>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px]">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">位置</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{locationText}</div>
            </div>

            <Button variant="secondary" onClick={locate} disabled={geo.status === 'loading'}>
              {geo.status === 'ready' ? '更新位置' : '获取位置'}
            </Button>

            <div className="w-40">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">距离</label>
              <Select value={radius} onChange={(e) => setRadius(Number(e.target.value) as any)}>
                <option value={3000}>3 公里</option>
                <option value={5000}>5 公里</option>
                <option value={10000}>10 公里</option>
              </Select>
            </div>

            <div className="w-44">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">类型</label>
              <Select value={query} onChange={(e) => setQuery(e.target.value as any)}>
                <option value="all">全部</option>
                <option value="hospital">医院</option>
                <option value="clinic">诊所</option>
                <option value="doctors">门诊</option>
              </Select>
            </div>

            <Button onClick={search} disabled={!canSearch || loading}>
              {loading ? '搜索中…' : '开始搜索'}
            </Button>

            <div className="w-full text-xs text-gray-500 dark:text-gray-400">
              如果没有结果，可以试试扩大距离或稍后再试。
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="地图" subtitle={origin ? '点击标记查看详情' : '请先获取位置'} />
          <CardBody>
            <div ref={mapElRef} className="h-[520px] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="列表" subtitle={loading ? '搜索中…' : `共 ${filteredSorted.length} 个`} />
          <CardBody>
            {loading ? (
              <SkeletonList rows={5} />
            ) : filteredSorted.length === 0 ? (
              <EmptyState
                tone="blue"
                title="暂无结果"
                description={canSearch ? '请调整距离或类型后重试。' : '先获取位置，再开始搜索。'}
                action={<Button onClick={canSearch ? search : locate}>{canSearch ? '开始搜索' : '获取位置'}</Button>}
              />
            ) : (
              <div className="space-y-3">
                {filteredSorted.slice(0, 30).map((p) => {
                  const expanded = activeId === p.id
                  return (
                    <div
                      key={p.id}
                      className={`rounded-lg border transition-colors ${
                        expanded
                          ? 'border-blue-200 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-950/30'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900/60'
                      }`}
                    >
                      <button
                        className="w-full text-left px-4 py-3"
                        onClick={() => {
                          setActiveId(expanded ? null : p.id)
                          focusPlace({ lat: p.lat, lng: p.lng })
                          pushNotification({
                            type: 'system',
                            title: '查看地点',
                            description: p.name,
                            unread: false,
                          })

                          window.setTimeout(() => {
                            const el = document.getElementById(`poi-${p.id}`)
                            el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
                          }, 0)
                        }}
                      >
                        <div id={`poi-${p.id}`} className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{p.name}</div>
                              <Badge tone={p.type === 'hospital' ? 'blue' : p.type === 'clinic' ? ('amber' as any) : ('green' as any)}>
                                {poiLabel(p.type)}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{formatDistance(p.distanceMeters)}</span>
                            </div>
                            {p.address ? <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{p.address}</div> : null}
                            {p.phone ? <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">电话：{p.phone}</div> : null}
                          </div>
                          <div className="text-xs text-gray-400">{expanded ? '收起' : '查看'}</div>
                        </div>
                      </button>

                      {expanded ? (
                        <div className="px-4 pb-4">
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button onClick={() => openNavigation({ lat: p.lat, lng: p.lng, name: p.name })}>去高德导航</Button>
                            {p.phone ? (
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  window.open(`tel:${p.phone}`, '_self')
                                }}
                              >
                                拨打电话
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        提示：如果跳转到高德网页后没有自动显示起点，请在高德页面选择“我的位置”。
      </div>
    </Page>
  )
}
