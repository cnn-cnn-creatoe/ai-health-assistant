export type AMapPlace = {
  id: string
  name: string
  address: string
  location: {
    lng: number
    lat: number
  }
  distanceMeters?: number
  tel?: string
}

type AMapTextSearchResponse = {
  status: '0' | '1'
  info: string
  infocode: string
  count: string
  pois?: Array<{
    id: string
    name: string
    address: string
    location: string
    distance?: string
    tel?: string
  }>
}

function parseLocation(loc: string) {
  const [lngStr, latStr] = (loc ?? '').split(',')
  const lng = Number(lngStr)
  const lat = Number(latStr)
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
  return { lng, lat }
}

export function getAmapWebKey(): string {
  const key = (import.meta as any).env?.VITE_AMAP_WEB_KEY
  if (!key || typeof key !== 'string') {
    throw new Error('missing_amap_key')
  }
  return key
}

export async function searchNearbyHospitals(input: {
  lng: number
  lat: number
  radiusMeters: number
  keywords?: string
}) {
  const key = getAmapWebKey()
  const keywords = input.keywords?.trim() || '医院'

  const url = new URL('https://restapi.amap.com/v3/place/around')
  url.searchParams.set('key', key)
  url.searchParams.set('location', `${input.lng},${input.lat}`)
  url.searchParams.set('radius', `${input.radiusMeters}`)
  url.searchParams.set('keywords', keywords)
  url.searchParams.set('types', '090100')
  url.searchParams.set('offset', '20')
  url.searchParams.set('page', '1')
  url.searchParams.set('extensions', 'base')

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error('amap_http_error')
  }
  const data = (await res.json()) as AMapTextSearchResponse
  if (data.status !== '1') {
    throw new Error(`amap_error:${data.info || data.infocode}`)
  }

  const places: AMapPlace[] = (data.pois ?? [])
    .map((p) => {
      const loc = parseLocation(p.location)
      if (!loc) return null
      return {
        id: p.id,
        name: p.name,
        address: p.address,
        location: loc,
        distanceMeters: p.distance ? Number(p.distance) : undefined,
        tel: p.tel,
      } satisfies AMapPlace
    })
    .filter(Boolean) as any

  return places
}
