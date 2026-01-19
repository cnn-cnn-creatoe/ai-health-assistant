export type RecordCategory = 'exam' | 'measure' | 'consult' | 'other'

export type HealthRecordItem = {
  id: string
  date: string
  type: string
  category: RecordCategory
  summary: string
  fileData?: string // base64 编码的文件数据（用于图片显示）
  fileName?: string // 原始文件名
  fileType?: string // 文件类型（image/png, image/jpeg, application/pdf 等）
}

const STORAGE_KEY = 'records:v1'

const seed: HealthRecordItem[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: '体检报告',
    category: 'exam',
    summary: '常规体检，各项指标正常',
  },
  {
    id: '2',
    date: '2024-01-10',
    type: '血压测量',
    category: 'measure',
    summary: '血压：120/80 mmHg',
  },
  {
    id: '3',
    date: '2024-01-05',
    type: '症状记录',
    category: 'consult',
    summary: '感冒症状，已记录',
  },
]

export function readRecords(): HealthRecordItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seed
    return parsed as HealthRecordItem[]
  } catch {
    return seed
  }
}

export function writeRecords(items: HealthRecordItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function addRecord(input: Omit<HealthRecordItem, 'id'>) {
  const current = readRecords()
  const item: HealthRecordItem = {
    ...input,
    id: `r-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  }
  const next = [item, ...current]
  writeRecords(next)
  return item
}

export function deleteRecord(id: string) {
  const current = readRecords()
  const next = current.filter((r) => r.id !== id)
  writeRecords(next)
  return next
}