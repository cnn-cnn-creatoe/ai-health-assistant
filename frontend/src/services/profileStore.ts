export type NotificationPreferenceKey = 'medication' | 'message' | 'lab' | 'system'

export type ProfileData = {
  fullName: string
  birthday: string
  phone: string
  email: string

  emergencyContactName: string
  emergencyContactRelation: string
  emergencyContactPhone: string

  notificationPrefs: Record<NotificationPreferenceKey, boolean>
}

const STORAGE_KEY = 'profile:v1'

const seed: ProfileData = {
  fullName: '张三',
  birthday: '1990-01-01',
  phone: '13800138000',
  email: 'zhangsan@example.com',

  emergencyContactName: '李四',
  emergencyContactRelation: '家属',
  emergencyContactPhone: '13900139000',

  notificationPrefs: {
    medication: true,
    message: true,
    lab: true,
    system: true,
  },
}

export function readProfile(): ProfileData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return seed
    return {
      ...seed,
      ...parsed,
      notificationPrefs: {
        ...seed.notificationPrefs,
        ...(parsed.notificationPrefs ?? {}),
      },
    }
  } catch {
    return seed
  }
}

export function writeProfile(next: ProfileData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('profile:changed'))
}
