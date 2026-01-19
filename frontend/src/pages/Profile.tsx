import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, Input, Page, PageHeader, Select } from '../components/ui'
import { useToast } from '../components/ToastProvider'
import { pushNotification } from '../services/notificationHelpers'
import { readProfile, writeProfile, type NotificationPreferenceKey, type ProfileData } from '../services/profileStore'

function prefLabel(k: NotificationPreferenceKey) {
  switch (k) {
    case 'medication':
      return '用药提醒'
    case 'message':
      return '新消息通知'
    case 'lab':
      return '化验单更新'
    case 'system':
      return '系统通知'
  }
}

export default function Profile() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState<ProfileData>(() => readProfile())

  const changed = useMemo(() => {
    try {
      return JSON.stringify(form) !== JSON.stringify(readProfile())
    } catch {
      return true
    }
  }, [form])

  return (
    <Page>
      <PageHeader
        title="个人资料与设置"
        subtitle="管理您的账户信息与偏好"
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
            <Button
              variant="secondary"
              onClick={() => {
                setForm(readProfile())
                toast({ tone: 'info', message: '已重置为已保存内容' })
              }}
            >
              重置
            </Button>
            <Button
              onClick={() => {
                writeProfile(form)
                toast({ tone: 'success', title: '已保存', message: '您的设置已更新' })
                pushNotification({
                  type: 'system',
                  title: '设置已更新',
                  description: '您的个人资料与通知偏好已保存。',
                  unread: false,
                })
              }}
              disabled={!changed}
            >
              保存更改
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        <Card>
          <CardHeader title="个人信息" subtitle="用于消息通知与个人健康管理" />
          <CardBody>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">姓名</label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">出生日期</label>
                <Input
                  type="date"
                  value={form.birthday}
                  onChange={(e) => setForm((p) => ({ ...p, birthday: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">联系电话</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="例如 13800138000"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">电子邮箱</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="例如 example@email.com"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="紧急联系人" subtitle="用于紧急情况的快速联系" />
          <CardBody>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">姓名</label>
                <Input
                  value={form.emergencyContactName}
                  onChange={(e) => setForm((p) => ({ ...p, emergencyContactName: e.target.value }))}
                  placeholder="联系人姓名"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">关系</label>
                <Select
                  value={form.emergencyContactRelation}
                  onChange={(e) => setForm((p) => ({ ...p, emergencyContactRelation: e.target.value }))}
                >
                  <option value="家属">家属</option>
                  <option value="配偶">配偶</option>
                  <option value="父母">父母</option>
                  <option value="子女">子女</option>
                  <option value="朋友">朋友</option>
                  <option value="其他">其他</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">电话</label>
                <Input
                  value={form.emergencyContactPhone}
                  onChange={(e) => setForm((p) => ({ ...p, emergencyContactPhone: e.target.value }))}
                  placeholder="例如 13900139000"
                />
              </div>
            </div>
          </CardBody>
        </Card>


        <Card>
          <CardHeader title="通知偏好" subtitle="选择你希望接收的通知类型" />
          <CardBody>
            <div className="space-y-3">
              {(Object.keys(form.notificationPrefs) as NotificationPreferenceKey[]).map((k) => {
                const enabled = form.notificationPrefs[k]
                return (
                  <div key={k} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{prefLabel(k)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">关闭后将不再收到此类提醒</p>
                    </div>
                    <Button
                      variant={enabled ? 'secondary' : 'ghost'}
                      className={enabled ? '' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          notificationPrefs: { ...p.notificationPrefs, [k]: !enabled },
                        }))
                      }
                    >
                      {enabled ? '已启用' : '已关闭'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => {
              writeProfile(form)
              toast({ tone: 'success', title: '已保存', message: '您的设置已更新' })
              pushNotification({
                type: 'system',
                title: '设置已更新',
                description: '您的个人资料与通知偏好已保存。',
                unread: false,
              })
            }}
            disabled={!changed}
          >
            保存更改
          </Button>
        </div>
      </div>
    </Page>
  )
}
