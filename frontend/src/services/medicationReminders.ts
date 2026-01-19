import { pushNotification } from './notificationHelpers'
import { readMedications, type MedicationItem } from './medicationsStore'

type ReminderState = {
  timeouts: Map<string, number>
  started: boolean
}

const state: ReminderState = {
  timeouts: new Map(),
  started: false,
}

function clearAll() {
  for (const id of state.timeouts.values()) {
    window.clearTimeout(id)
  }
  state.timeouts.clear()
}

export function getPermissionState(): NotificationPermission {
  return Notification.permission
}

export async function requestPermission(): Promise<NotificationPermission> {
  return await Notification.requestPermission()
}

function parseTimeOfDay(timeOfDay: string) {
  const [h, m] = timeOfDay.split(':').map((x) => Number(x))
  return {
    hour: Number.isFinite(h) ? h : 8,
    minute: Number.isFinite(m) ? m : 0,
  }
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function toDateOnly(s: string) {
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  return startOfDay(d)
}

function nextWeeklyFrom(startDate: Date, candidate: Date) {
  const targetDow = startDate.getDay()
  const next = new Date(candidate)
  while (next.getDay() !== targetDow) {
    next.setDate(next.getDate() + 1)
  }
  return next
}

export function getNextReminderAt(med: MedicationItem, now: Date = new Date()): Date | null {
  if (!med.active) return null

  const start = toDateOnly(med.startDate)
  if (!start) return null

  const { hour, minute } = parseTimeOfDay(med.timeOfDay)
  const next = new Date(now)
  next.setHours(hour, minute, 0, 0)

  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }

  // Not before start date
  if (next.getTime() < start.getTime()) {
    next.setTime(start.getTime())
    next.setHours(hour, minute, 0, 0)
  }

  if (med.frequency === 'weekly') {
    const adjusted = nextWeeklyFrom(start, next)
    adjusted.setHours(hour, minute, 0, 0)
    return adjusted
  }

  if (med.frequency === 'once') {
    // Once: only remind on startDate at timeOfDay
    const onceAt = new Date(start)
    onceAt.setHours(hour, minute, 0, 0)
    if (onceAt.getTime() <= now.getTime()) return null
    return onceAt
  }

  return next
}

function notify(med: MedicationItem) {
  const title = `用药提醒：${med.name}`
  const body = `请服用 ${med.dose}。${med.notes ? `备注：${med.notes}` : ''}`

  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `med-${med.id}`,
        renotify: true,
      })
    }
  } catch {
    // ignore
  }

  pushNotification({
    type: 'medication',
    title,
    description: body,
  })
}

function scheduleOne(med: MedicationItem) {
  const nextAt = getNextReminderAt(med, new Date())
  if (!nextAt) return

  const delay = nextAt.getTime() - Date.now()
  if (delay <= 0) return

  const timeoutId = window.setTimeout(() => {
    // re-read latest medication state to avoid notifying for deleted/paused items
    const latest = readMedications().find((x) => x.id === med.id)
    if (!latest || !latest.active) return

    notify(latest)

    // schedule next occurrence
    scheduleAll()
  }, delay)

  state.timeouts.set(med.id, timeoutId)
}

export function scheduleAll() {
  clearAll()

  if (Notification.permission !== 'granted') return

  const meds = readMedications().filter((m) => m.active)

  // Keep it safe: cap to avoid too many timers
  for (const med of meds.slice(0, 200)) {
    scheduleOne(med)
  }
}

export function start() {
  if (state.started) return
  state.started = true

  const reschedule = () => scheduleAll()
  window.addEventListener('medications:changed', reschedule)
  window.addEventListener('storage', (e) => {
    if ((e as StorageEvent).key === 'medications:v1') reschedule()
  })

  scheduleAll()
}

export function stop() {
  clearAll()
  state.started = false
}

export function testNotification() {
  if (Notification.permission !== 'granted') {
    throw new Error('permission_not_granted')
  }

  try {
    new Notification('用药提醒（测试）', {
      body: '这是一条测试通知。若你能看到它，说明系统通知已启用。',
      icon: '/favicon.ico',
      tag: 'med-test',
      renotify: true,
    })
  } finally {
    pushNotification({
      type: 'medication',
      title: '用药提醒（测试）',
      description: '系统通知已触发（测试）。',
      unread: false,
    })
  }
}
