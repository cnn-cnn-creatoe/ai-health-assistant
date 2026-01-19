export type NotificationType = 'message' | 'lab' | 'medication' | 'system'

export type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  description: string
  time: string
  unread: boolean
}

const STORAGE_KEY = 'notifications:v1'

const seed: NotificationItem[] = [
  {
    id: 'n2',
    type: 'lab',
    title: '已添加新报告',
    description: '你上传的文件已保存到健康档案中。',
    time: '2 小时前',
    unread: true,
  },
  {
    id: 'n3',
    type: 'message',
    title: '助手已回复',
    description: '新的建议已生成，点击查看详情。',
    time: '昨天',
    unread: false,
  },
  {
    id: 'n4',
    type: 'system',
    title: '隐私提醒',
    description: '请勿输入身份证号、住址等敏感信息。',
    time: '3 天前',
    unread: false,
  },
]

export function readNotifications(): NotificationItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seed
    return parsed as NotificationItem[]
  } catch {
    return seed
  }
}

export function writeNotifications(items: NotificationItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('notifications:changed'))
}

export function getUnreadCount(items?: NotificationItem[]) {
  const arr = items ?? readNotifications()
  return arr.filter((n) => n.unread).length
}

export function markAllRead() {
  const items = readNotifications().map((n) => ({ ...n, unread: false }))
  writeNotifications(items)
}

export function markRead(id: string) {
  const items = readNotifications().map((n) => (n.id === id ? { ...n, unread: false } : n))
  writeNotifications(items)
}

export function deleteNotification(id: string) {
  const items = readNotifications().filter((n) => n.id !== id)
  writeNotifications(items)
  return items
}

export function deleteNotificationsByDate(date: string) {
  // 解析日期字符串，支持多种格式：'刚刚', 'X 小时前', 'X 天前', '昨天', 'YYYY-MM-DD' 等
  const items = readNotifications().filter((n) => {
    // 如果时间字符串包含日期信息，进行匹配
    // 这里简化处理，实际应该解析时间字符串
    return n.time !== date && !n.time.includes(date)
  })
  writeNotifications(items)
  return items
}

// 解析时间字符串为日期（用于按日期删除）
function parseTimeToDate(timeStr: string): Date | null {
  const now = new Date()
  
  if (timeStr === '刚刚') {
    return now
  }
  
  if (timeStr === '昨天') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday
  }
  
  // 匹配 "X 小时前"
  const hoursMatch = timeStr.match(/(\d+)\s*小时前/)
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1], 10)
    const date = new Date(now)
    date.setHours(date.getHours() - hours)
    return date
  }
  
  // 匹配 "X 天前"
  const daysMatch = timeStr.match(/(\d+)\s*天前/)
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10)
    const date = new Date(now)
    date.setDate(date.getDate() - days)
    return date
  }
  
  // 匹配日期格式 YYYY-MM-DD
  const dateMatch = timeStr.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (dateMatch) {
    return new Date(parseInt(dateMatch[1], 10), parseInt(dateMatch[2], 10) - 1, parseInt(dateMatch[3], 10))
  }
  
  return null
}

// 检查两个日期是否是同一天
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// 按指定日期删除通知
export function deleteNotificationsBySelectedDate(selectedDate: string) {
  const targetDate = parseTimeToDate(selectedDate)
  if (!targetDate) {
    // 如果无法解析，使用字符串匹配
    const items = readNotifications().filter((n) => !n.time.includes(selectedDate))
    writeNotifications(items)
    return items
  }
  
  const items = readNotifications().filter((n) => {
    const notificationDate = parseTimeToDate(n.time)
    if (!notificationDate) return true // 无法解析的保留
    return !isSameDay(notificationDate, targetDate)
  })
  
  writeNotifications(items)
  return items
}
