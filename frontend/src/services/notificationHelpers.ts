import { NotificationItem, NotificationType, readNotifications, writeNotifications } from './notificationsStore'

export function pushNotification(input: {
  type: NotificationType
  title: string
  description: string
  unread?: boolean
}) {
  const current = readNotifications()
  const item: NotificationItem = {
    id: `n-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: input.type,
    title: input.title,
    description: input.description,
    time: '刚刚',
    unread: input.unread ?? true,
  }
  writeNotifications([item, ...current].slice(0, 50))
}
