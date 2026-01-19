export type CheckupReminder = {
  id: string
  lastCheckupDate: string // YYYY-MM-DD
  reminderCycle: '6months' | '1year' | 'custom' // 提醒周期
  customDays?: number // 自定义天数
  enabled: boolean
  notes?: string
}

const STORAGE_KEY = 'checkup-reminders:v1'

const seed: CheckupReminder[] = [
  {
    id: 'c1',
    lastCheckupDate: '2024-01-15',
    reminderCycle: '1year',
    enabled: true,
    notes: '年度体检',
  },
]

export function readReminders(): CheckupReminder[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seed
    return parsed
  } catch {
    return seed
  }
}

export function writeReminders(items: CheckupReminder[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('checkup-reminders:changed'))
}

export function addReminder(input: Omit<CheckupReminder, 'id'>) {
  const current = readReminders()
  const item: CheckupReminder = {
    ...input,
    id: `c-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  }
  const next = [item, ...current]
  writeReminders(next)
  return item
}

export function updateReminder(id: string, updates: Partial<CheckupReminder>) {
  const current = readReminders()
  const next = current.map((r) => (r.id === id ? { ...r, ...updates } : r))
  writeReminders(next)
  return next
}

export function deleteReminder(id: string) {
  const current = readReminders()
  const next = current.filter((r) => r.id !== id)
  writeReminders(next)
  return next
}

// 计算下次提醒日期
export function getNextReminderDate(reminder: CheckupReminder): Date | null {
  if (!reminder.enabled) return null
  
  const lastDate = new Date(reminder.lastCheckupDate)
  const nextDate = new Date(lastDate)
  
  switch (reminder.reminderCycle) {
    case '6months':
      nextDate.setMonth(nextDate.getMonth() + 6)
      break
    case '1year':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
    case 'custom':
      if (reminder.customDays) {
        nextDate.setDate(nextDate.getDate() + reminder.customDays)
      } else {
        return null
      }
      break
  }
  
  return nextDate
}

// 检查是否需要提醒
export function shouldRemind(reminder: CheckupReminder): boolean {
  if (!reminder.enabled) return false
  
  const nextDate = getNextReminderDate(reminder)
  if (!nextDate) return false
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  nextDate.setHours(0, 0, 0, 0)
  
  // 如果下次提醒日期已过或等于今天，需要提醒
  return nextDate <= today
}

// 获取所有需要提醒的
export function getDueReminders(): CheckupReminder[] {
  return readReminders().filter(shouldRemind)
}
