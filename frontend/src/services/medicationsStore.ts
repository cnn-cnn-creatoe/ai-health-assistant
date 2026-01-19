export type MedicationFrequency = 'once' | 'daily' | 'weekly'

export type MedicationItem = {
  id: string
  name: string
  dose: string
  frequency: MedicationFrequency
  timeOfDay: string
  startDate: string
  notes: string
  active: boolean
}

const STORAGE_KEY = 'medications:v1'

const seed: MedicationItem[] = [
  {
    id: 'm1',
    name: '阿司匹林',
    dose: '100mg',
    frequency: 'daily',
    timeOfDay: '08:00',
    startDate: '2024-01-01',
    notes: '饭后服用',
    active: true,
  },
]

export function readMedications(): MedicationItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seed
    return parsed as MedicationItem[]
  } catch {
    return seed
  }
}

export function writeMedications(items: MedicationItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('medications:changed'))
}

export function addMedication(input: Omit<MedicationItem, 'id'>) {
  const current = readMedications()
  const item: MedicationItem = {
    ...input,
    id: `m-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  }
  writeMedications([item, ...current].slice(0, 100))
  return item
}

export function toggleMedicationActive(id: string) {
  const items = readMedications().map((m) => (m.id === id ? { ...m, active: !m.active } : m))
  writeMedications(items)
}

export function removeMedication(id: string) {
  const items = readMedications().filter((m) => m.id !== id)
  writeMedications(items)
}
