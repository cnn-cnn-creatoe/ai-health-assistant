import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardBody, CardHeader, Page, PageHeader, Select, Input } from '../components/ui'
import { markAllRead, markRead, readNotifications, deleteNotification, deleteNotificationsBySelectedDate, type NotificationType } from '../services/notificationsStore'
import { useToast } from '../components/ToastProvider'
import { ConfirmDialog } from '../components/ConfirmDialog'

type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  description: string
  time: string
  unread: boolean
}

const typeTone: Record<NotificationType, Parameters<typeof Badge>[0]['tone']> = {
  message: 'blue',
  lab: 'amber',
  medication: 'purple' as any,
  system: 'gray',
}

export default function Notifications() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'all' | NotificationType>('all')
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => readNotifications() as any)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: 'single' | 'date'; id?: string; date?: string }>({
    open: false,
    type: 'single',
  })
  const [deleteDate, setDeleteDate] = useState('')

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (tab !== 'all' && n.type !== tab) return false
      if (onlyUnread && !n.unread) return false
      return true
    })
  }, [notifications, tab, onlyUnread])

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <Page>
      <PageHeader
        title="通知中心"
        subtitle="集中查看助手提醒、用药、报告等更新"
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
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setOnlyUnread((v) => !v)}>
              {onlyUnread ? '显示全部' : '只看未读'}
            </Button>
            <Button
              onClick={() => {
                markAllRead()
                const next = notifications.map((n) => ({ ...n, unread: false }))
                setNotifications(next)
                toast({ tone: 'success', title: '已完成', message: '所有通知已标为已读' })
              }}
            >
              全部标为已读
            </Button>
          </div>
        }
      />

      <Card className="mb-6">
        <CardHeader
          title={`收件箱${unreadCount ? `（未读 ${unreadCount}）` : ''}`}
          subtitle="按类型筛选"
          right={
            <div className="w-40">
              <Select value={tab} onChange={(e) => setTab(e.target.value as any)}>
                <option value="all">全部</option>
                <option value="message">助手消息</option>
                <option value="medication">用药提醒</option>
                <option value="lab">报告/检查</option>
                <option value="system">系统</option>
              </Select>
            </div>
          }
        />
        <CardBody>
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`rounded-lg border px-5 py-4 transition-colors ${
                  n.unread
                    ? 'border-blue-200 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-950/30'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone={typeTone[n.type] ?? 'gray'}>
                        {n.type === 'message'
                          ? '助手消息'
                          : n.type === 'lab'
                          ? '报告'
                          : n.type === 'medication'
                          ? '用药'
                          : '系统'}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{n.time}</span>
                      {n.unread ? <span className="text-xs font-medium text-blue-700 dark:text-blue-300">未读</span> : null}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-gray-900">{n.title}</div>
                    <div className="mt-1 text-sm text-gray-600">{n.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      className="text-blue-600 hover:bg-blue-50 dark:text-blue-200 dark:hover:bg-blue-950/30"
                      onClick={() => {
                        // 根据通知类型跳转到相应页面
                        if (n.type === 'message') {
                          navigate('/chat')
                        } else if (n.type === 'lab') {
                          navigate('/records')
                        } else if (n.type === 'medication') {
                          navigate('/medications')
                        }
                        // system 类型不需要跳转，可以显示详情
                        if (n.type === 'system') {
                          toast({ tone: 'info', title: n.title, message: n.description })
                        }
                      }}
                    >
                      查看
                    </Button>
                    {n.unread && (
                      <Button
                        variant="ghost"
                        className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        onClick={() => {
                          markRead(n.id)
                          setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))
                          toast({ tone: 'success', message: '已标为已读' })
                        }}
                      >
                        标为已读
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      onClick={() => {
                        setDeleteConfirm({ open: true, type: 'single', id: n.id })
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="删除通知" subtitle="按日期批量删除通知" />
        <CardBody>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                选择日期
              </label>
              <Input
                type="date"
                value={deleteDate}
                onChange={(e) => setDeleteDate(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="danger"
              onClick={() => {
                if (!deleteDate) {
                  toast({ tone: 'error', title: '请选择日期', message: '请先选择要删除的日期' })
                  return
                }
                setDeleteConfirm({ open: true, type: 'date', date: deleteDate })
              }}
            >
              删除该日期通知
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            将删除指定日期的所有通知，删除后无法恢复
          </p>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={deleteConfirm.open}
        title={deleteConfirm.type === 'single' ? '确认删除' : '确认删除指定日期通知'}
        message={
          deleteConfirm.type === 'single'
            ? '确定要删除这条通知吗？删除后无法恢复。'
            : `确定要删除 ${deleteDate || deleteConfirm.date} 的所有通知吗？删除后无法恢复。`
        }
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm.type === 'single' && deleteConfirm.id) {
            deleteNotification(deleteConfirm.id)
            setNotifications(readNotifications() as any)
            toast({ tone: 'success', title: '删除成功', message: '通知已删除' })
          } else if (deleteConfirm.type === 'date' && deleteConfirm.date) {
            deleteNotificationsBySelectedDate(deleteConfirm.date)
            setNotifications(readNotifications() as any)
            toast({ tone: 'success', title: '删除成功', message: `已删除 ${deleteConfirm.date} 的所有通知` })
            setDeleteDate('')
          }
          setDeleteConfirm({ open: false, type: 'single' })
        }}
        onCancel={() => {
          setDeleteConfirm({ open: false, type: 'single' })
        }}
      />
    </Page>
  )
}
