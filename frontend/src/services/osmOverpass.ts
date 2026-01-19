export type OsmPlace = {
  id: string
  name: string
  type: 'hospital' | 'clinic' | 'doctors'
  lat: number
  lng: number
  address?: string
  phone?: string
}

type OverpassResponse = {
  elements: Array<{
    type: 'node' | 'way' | 'relation'
    id: number
    lat?: number
    lon?: number
    center?: { lat: number; lon: number }
    tags?: Record<string, string>
  }>
}

function getCenter(el: OverpassResponse['elements'][number]) {
  if (typeof el.lat === 'number' && typeof el.lon === 'number') {
    return { lat: el.lat, lng: el.lon }
  }
  if (el.center && typeof el.center.lat === 'number' && typeof el.center.lon === 'number') {
    return { lat: el.center.lat, lng: el.center.lon }
  }
  return null
}

function pickType(tags?: Record<string, string>): OsmPlace['type'] {
  const amenity = tags?.amenity
  if (amenity === 'hospital') return 'hospital'
  if (amenity === 'clinic') return 'clinic'
  if (amenity === 'doctors') return 'doctors'
  return 'hospital'
}

function buildAddress(tags?: Record<string, string>) {
  if (!tags) return undefined
  const parts = [
    tags['addr:province'],
    tags['addr:city'],
    tags['addr:district'],
    tags['addr:subdistrict'],
    tags['addr:street'],
    tags['addr:housenumber'],
    tags['addr:full'],
  ].filter(Boolean)
  const joined = parts.join('')
  return joined || undefined
}

const DEFAULT_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

export async function searchNearbyMedicalPOI(input: {
  lat: number
  lng: number
  radiusMeters: number
}) {
  const query = `
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:${input.radiusMeters},${input.lat},${input.lng});
  way["amenity"="hospital"](around:${input.radiusMeters},${input.lat},${input.lng});
  relation["amenity"="hospital"](around:${input.radiusMeters},${input.lat},${input.lng});

  node["amenity"="clinic"](around:${input.radiusMeters},${input.lat},${input.lng});
  way["amenity"="clinic"](around:${input.radiusMeters},${input.lat},${input.lng});
  relation["amenity"="clinic"](around:${input.radiusMeters},${input.lat},${input.lng});

  node["amenity"="doctors"](around:${input.radiusMeters},${input.lat},${input.lng});
  way["amenity"="doctors"](around:${input.radiusMeters},${input.lat},${input.lng});
  relation["amenity"="doctors"](around:${input.radiusMeters},${input.lat},${input.lng});
);
out center;`

  let lastErr: unknown = null

  for (const endpoint of DEFAULT_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams({ data: query }),
      })

      if (!res.ok) throw new Error('overpass_http_error')

      const data = (await res.json()) as OverpassResponse

      const places: OsmPlace[] = (data.elements ?? [])
        .map((el) => {
          const c = getCenter(el)
          if (!c) return null
          const name = el.tags?.name || el.tags?.['name:zh'] || el.tags?.['name:en']
          if (!name) return null

          return {
            id: `${el.type}-${el.id}`,
            name,
            type: pickType(el.tags),
            lat: c.lat,
            lng: c.lng,
            address: buildAddress(el.tags),
            phone: el.tags?.phone || el.tags?.['contact:phone'],
          } satisfies OsmPlace
        })
        .filter(Boolean) as any

      return places
    } catch (e) {
      lastErr = e
    }
  }

  throw lastErr ?? new Error('overpass_error')
}

export function haversineDistanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
  return R * c
}
