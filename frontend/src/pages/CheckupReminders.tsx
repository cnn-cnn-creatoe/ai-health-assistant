import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardBody, CardHeader, Input, Page, PageHeader, Select } from '../components/ui'
import { useToast } from '../components/ToastProvider'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  readReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  getNextReminderDate,
  shouldRemind,
  getDueReminders,
  type CheckupReminder,
} from '../services/checkupReminders'
import { pushNotification } from '../services/notificationHelpers'
import { Calendar, Bell, Trash2, Edit2 } from 'lucide-react'

export default function CheckupReminders() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [reminders, setReminders] = useState(() => readReminders())
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    lastCheckupDate: '',
    reminderCycle: '1year' as CheckupReminder['reminderCycle'],
    customDays: 365,
    enabled: true,
    notes: '',
  })

  useEffect(() => {
    // 检查到期的提醒
    const due = getDueReminders()
    if (due.length > 0) {
      due.forEach((reminder) => {
        const nextDate = getNextReminderDate(reminder)
        pushNotification({
          type: 'system',
          title: '体检提醒',
          description: `您设置的体检提醒已到期，上次体检日期：${reminder.lastCheckupDate}，建议尽快安排体检。`,
        })
      })
    }
  }, [])

  const handleSubmit = () => {
    if (!form.lastCheckupDate) {
      toast({ tone: 'error', title: '请填写上次体检日期' })
      return
    }

    if (editingId) {
      updateReminder(editingId, form)
      toast({ tone: 'success', title: '更新成功', message: '体检提醒已更新' })
      setEditingId(null)
    } else {
      addReminder(form)
      toast({ tone: 'success', title: '添加成功', message: '体检提醒已添加' })
    }

    setReminders(readReminders())
    setForm({
      lastCheckupDate: '',
      reminderCycle: '1year',
      customDays: 365,
      enabled: true,
      notes: '',
    })
  }

  const handleEdit = (reminder: CheckupReminder) => {
    setEditingId(reminder.id)
    setForm({
      lastCheckupDate: reminder.lastCheckupDate,
      reminderCycle: reminder.reminderCycle,
      customDays: reminder.customDays || 365,
      enabled: reminder.enabled,
      notes: reminder.notes || '',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm({
      lastCheckupDate: '',
      reminderCycle: '1year',
      customDays: 365,
      enabled: true,
      notes: '',
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getCycleLabel = (cycle: CheckupReminder['reminderCycle']) => {
    switch (cycle) {
      case '6months':
        return '每6个月'
      case '1year':
        return '每年'
      case 'custom':
        return '自定义'
    }
  }

  return (
    <Page>
      <PageHeader
        title="体检提醒"
        subtitle="设置体检提醒，定期关注健康"
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
      />

      <Card className="mb-6">
        <CardHeader title={editingId ? '编辑体检提醒' : '添加体检提醒'} />
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  上次体检日期 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={form.lastCheckupDate}
                  onChange={(e) => setForm((p) => ({ ...p, lastCheckupDate: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  提醒周期
                </label>
                <Select
                  value={form.reminderCycle}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reminderCycle: e.target.value as CheckupReminder['reminderCycle'] }))
                  }
                >
                  <option value="6months">每6个月</option>
                  <option value="1year">每年</option>
                  <option value="custom">自定义</option>
                </Select>
              </div>
              {form.reminderCycle === 'custom' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    自定义天数
                  </label>
                  <Input
                    type="number"
                    value={form.customDays}
                    onChange={(e) => setForm((p) => ({ ...p, customDays: parseInt(e.target.value) || 365 }))}
                    min="1"
                    placeholder="例如：365"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">备注</label>
              <Input
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="例如：年度体检、专项检查等"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">启用提醒</span>
              </label>
              <div className="flex gap-2">
                <Button onClick={handleSubmit}>
                  {editingId ? '更新' : '添加'}
                </Button>
                {editingId && (
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    取消
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="体检提醒列表" subtitle={`共 ${reminders.length} 条提醒`} />
        <CardBody>
          {reminders.length === 0 ? (
            <EmptyState
              tone="blue"
              title="暂无提醒"
              description="添加体检提醒，系统会在到期时通知您"
            />
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => {
                const nextDate = getNextReminderDate(reminder)
                const isDue = shouldRemind(reminder)
                return (
                  <div
                    key={reminder.id}
                    className={`rounded-lg border px-5 py-4 transition-colors ${
                      isDue
                        ? 'border-red-200 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/30'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            上次体检：{formatDate(reminder.lastCheckupDate)}
                          </span>
                          {isDue && (
                            <Badge tone="red">到期提醒</Badge>
                          )}
                          {!reminder.enabled && (
                            <Badge tone="gray">已禁用</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Bell className="h-4 w-4" />
                            {getCycleLabel(reminder.reminderCycle)}
                            {reminder.reminderCycle === 'custom' && reminder.customDays && ` (${reminder.customDays}天)`}
                          </span>
                          {nextDate && (
                            <span>
                              下次提醒：{formatDate(nextDate.toISOString().split('T')[0])}
                            </span>
                          )}
                        </div>
                        {reminder.notes && (
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{reminder.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(reminder)}
                          className="text-blue-600 hover:bg-blue-50 dark:text-blue-200 dark:hover:bg-blue-950/30"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ open: true, id: reminder.id })}
                          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="确认删除"
        message="确定要删除这条体检提醒吗？删除后无法恢复。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm.id) {
            deleteReminder(deleteConfirm.id)
            setReminders(readReminders())
            toast({ tone: 'success', title: '删除成功', message: '体检提醒已删除' })
            setDeleteConfirm({ open: false, id: null })
          }
        }}
        onCancel={() => {
          setDeleteConfirm({ open: false, id: null })
        }}
      />
    </Page>
  )
}
