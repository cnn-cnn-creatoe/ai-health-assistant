import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardBody, CardHeader, Input, Page, PageHeader, Select } from '../components/ui'
import { useToast } from '../components/ToastProvider'
import { pushNotification } from '../services/notificationHelpers'
import {
  addMedication,
  readMedications,
  removeMedication,
  toggleMedicationActive,
  type MedicationFrequency,
  type MedicationItem,
} from '../services/medicationsStore'
import { getPermissionState, requestPermission, start as startReminders, testNotification } from '../services/medicationReminders'

function freqLabel(f: MedicationFrequency) {
  switch (f) {
    case 'once':
      return '一次'
    case 'daily':
      return '每日'
    case 'weekly':
      return '每周'
  }
}

function permissionLabel(p: NotificationPermission) {
  switch (p) {
    case 'granted':
      return '已启用'
    case 'denied':
      return '已拒绝'
    case 'default':
      return '未设置'
  }
}

export default function Medications() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const [items, setItems] = useState<MedicationItem[]>(() => readMedications())
  const [permission, setPermission] = useState<NotificationPermission>(() => getPermissionState())

  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [frequency, setFrequency] = useState<MedicationFrequency>('daily')
  const [timeOfDay, setTimeOfDay] = useState('08:00')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const update = () => setItems(readMedications())
    update()
    window.addEventListener('medications:changed', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('medications:changed', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  useEffect(() => {
    const updatePerm = () => setPermission(getPermissionState())
    updatePerm()
    window.addEventListener('focus', updatePerm)
    return () => window.removeEventListener('focus', updatePerm)
  }, [])

  const activeCount = useMemo(() => items.filter((x) => x.active).length, [items])

  return (
    <Page>
      <PageHeader 
        title="用药管理" 
        subtitle="管理用药计划，并接收提醒（MVP）"
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

      <Card className="mb-10">
        <CardHeader title="提醒设置" subtitle="系统通知权限与快速测试" />
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">系统通知：{permissionLabel(permission)}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                提醒仅在浏览器允许通知时生效；若关闭权限，请在系统设置中重新开启。
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    const p = await requestPermission()
                    setPermission(p)
                    if (p === 'granted') {
                      startReminders()
                      toast({ tone: 'success', message: '已启用系统通知' })
                    } else if (p === 'denied') {
                      toast({ tone: 'warning', message: '你已拒绝通知权限，可在系统设置中开启' })
                    }
                  } catch {
                    toast({ tone: 'error', message: '无法请求通知权限' })
                  }
                }}
              >
                启用系统提醒
              </Button>
              <Button
                onClick={() => {
                  try {
                    testNotification()
                    toast({ tone: 'success', message: '已发送测试提醒' })
                  } catch {
                    toast({ tone: 'warning', message: '请先启用系统提醒' })
                  }
                }}
              >
                发送测试提醒
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mb-10">
        <CardHeader title="新增用药" subtitle="填写基本信息后添加到列表" />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">药品名称</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如 二甲双胍" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">剂量</label>
              <Input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="例如 500mg" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">频率</label>
              <Select value={frequency} onChange={(e) => setFrequency(e.target.value as MedicationFrequency)}>
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="once">一次</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">时间</label>
              <Input type="time" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">开始日期</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">备注</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="例如 饭后服用、禁酒等" />
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => {
                if (!name.trim()) {
                  toast({ tone: 'warning', message: '请输入药品名称' })
                  return
                }
                const created = addMedication({
                  name: name.trim(),
                  dose: dose.trim() || '-',
                  frequency,
                  timeOfDay,
                  startDate,
                  notes: notes.trim(),
                  active: true,
                })
                setItems(readMedications())
                setName('')
                setDose('')
                setNotes('')

                toast({ tone: 'success', title: '已添加', message: `${created.name} · ${freqLabel(created.frequency)}` })
                pushNotification({
                  type: 'medication',
                  title: '已添加用药计划',
                  description: `${created.name} ${created.dose} · ${freqLabel(created.frequency)} ${created.timeOfDay}`,
                })

                if (Notification.permission === 'granted') {
                  startReminders()
                }
              }}
            >
              添加
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={`用药列表${items.length ? `（${activeCount}/${items.length} 启用）` : ''}`} subtitle="可暂停/删除（提醒逻辑已接入前台系统通知）" />
        <CardBody>
          {items.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">暂无用药计划</div>
          ) : (
            <div className="space-y-3">
              {items.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg border px-5 py-4 transition-colors ${
                    m.active
                      ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900/60'
                      : 'border-amber-200 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={m.active ? ('green' as any) : ('amber' as any)}>{m.active ? '启用' : '暂停'}</Badge>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{m.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{m.dose}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {freqLabel(m.frequency)} · {m.timeOfDay}
                        </span>
                      </div>
                      {m.notes ? <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">备注：{m.notes}</div> : null}
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">开始：{m.startDate}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        className="text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                        onClick={() => {
                          toggleMedicationActive(m.id)
                          setItems(readMedications())
                          toast({ tone: 'success', message: m.active ? '已暂停' : '已启用' })
                          if (Notification.permission === 'granted') startReminders()
                        }}
                      >
                        {m.active ? '暂停' : '启用'}
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => {
                          removeMedication(m.id)
                          setItems(readMedications())
                          toast({ tone: 'success', message: '已删除' })
                          pushNotification({
                            type: 'medication',
                            title: '已删除用药计划',
                            description: m.name,
                            unread: false,
                          })
                          if (Notification.permission === 'granted') startReminders()
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </Page>
  )
}
