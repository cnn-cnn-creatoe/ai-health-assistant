import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardBody, CardHeader, Input, Page, PageHeader, Select } from '../components/ui'
import { EmptyState } from '../components/EmptyState'
import { SkeletonList } from '../components/Skeleton'
import { useToast } from '../components/ToastProvider'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { readRecords, addRecord, deleteRecord, type RecordCategory } from '../services/recordsStore'
import { pushNotification } from '../services/notificationHelpers'
import { exportHealthDataToPDF, exportHealthDataToJSON } from '../services/exportService'
import { Download, ChevronDown } from 'lucide-react'

type RecordsTab = 'all' | 'report' | 'vitals' | 'symptom' | 'other'

function normalizeCategory(c: any): Exclude<RecordsTab, 'all'> {
  if (c === 'exam') return 'report'
  if (c === 'measure') return 'vitals'
  if (c === 'consult') return 'symptom'
  if (c === 'report' || c === 'vitals' || c === 'symptom' || c === 'other') return c
  return 'other'
}

function tabLabel(t: RecordsTab) {
  switch (t) {
    case 'all':
      return '全部'
    case 'report':
      return '报告'
    case 'vitals':
      return '指标'
    case 'symptom':
      return '症状'
    case 'other':
      return '其他'
  }
}

export default function Records() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<RecordsTab>('all')
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | '30d' | '90d'>('all')
  const [uploadCategory, setUploadCategory] = useState<RecordCategory>('exam')
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; recordId: string | null }>({
    open: false,
    recordId: null,
  })
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  const [records, setRecords] = useState(() => readRecords())

  // 点击外部关闭导出菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false)
      }
    }
    if (exportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [exportMenuOpen])

  useEffect(() => {
    const t = window.setTimeout(() => {
      setRecords(readRecords())
      setLoading(false)
    }, 450)
    return () => window.clearTimeout(t)
  }, [])

  // 监听搜索变化，实时更新列表
  useEffect(() => {
    setRecords(readRecords())
  }, [search])

  const filtered = useMemo(() => {
    return records.filter((r: any) => {
      const cat = normalizeCategory(r.category)
      if (tab !== 'all' && cat !== tab) return false

      const hay = `${r.type ?? ''}${r.summary ?? ''}${r.date ?? ''}`.toLowerCase()
      const searchLower = search.toLowerCase().trim()
      if (searchLower && !hay.includes(searchLower)) return false

      if (dateFilter !== 'all') {
        // 这里仅示例，不做真实日期计算
      }
      return true
    })
  }, [records, tab, search, dateFilter])

  return (
    <Page>
      <PageHeader 
        title="健康档案" 
        subtitle="集中管理你的报告、指标与个人记录"
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
        <CardHeader 
          title="上传报告" 
          subtitle="支持 PDF、图片、Office 文档等格式"
        />
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  分类
                </label>
                <Select 
                  value={uploadCategory} 
                  onChange={(e) => setUploadCategory(e.target.value as RecordCategory)}
                >
                  <option value="exam">报告</option>
                  <option value="measure">指标</option>
                  <option value="consult">症状</option>
                  <option value="other">其他</option>
                </Select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  选择文件
                </label>
                <label>
                  <span className="sr-only">选择文件</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (!f) return

                      // 保存文件到记录列表
                      const today = new Date().toISOString().split('T')[0]
                      const fileExtension = f.name.split('.').pop()?.toLowerCase() || ''
                      
                      // 如果是图片文件，转换为 base64
                      let fileData: string | undefined
                      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)
                      
                      if (isImage) {
                        try {
                          fileData = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader()
                            reader.onload = () => resolve(reader.result as string)
                            reader.onerror = reject
                            reader.readAsDataURL(f)
                          })
                        } catch (error) {
                          console.error('读取图片失败:', error)
                          toast({ tone: 'error', title: '上传失败', message: '无法读取图片文件' })
                          e.target.value = ''
                          return
                        }
                      }
                      
                      // 如果是Office文档或PDF，也转换为base64以便后续预览
                      if (!isImage && (fileExtension === 'pdf' || ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExtension))) {
                        try {
                          fileData = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader()
                            reader.onload = () => resolve(reader.result as string)
                            reader.onerror = reject
                            reader.readAsDataURL(f)
                          })
                        } catch (error) {
                          console.error('读取文件失败:', error)
                        }
                      }
                      
                      addRecord({
                        date: today,
                        type: '上传报告',
                        category: uploadCategory,
                        summary: f.name,
                        fileData,
                        fileName: f.name,
                        fileType: f.type,
                      })

                      // 更新记录列表
                      setRecords(readRecords())

                      toast({ tone: 'success', title: '上传成功', message: `文件 ${f.name} 已添加到档案列表` })
                      pushNotification({
                        type: 'lab',
                        title: '已添加报告',
                        description: `文件：${f.name}`,
                      })

                      e.target.value = ''
                    }}
                  />
                  <span className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700">
                    选择文件
                  </span>
                </label>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">上传后会显示在档案列表中</p>
          </div>
        </CardBody>
      </Card>

      <Card className="mb-10">
        <CardHeader
          title="档案列表"
          subtitle="最近更新"
          right={
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative" ref={exportMenuRef}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  导出
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-10 dark:border-gray-700 dark:bg-gray-800">
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 rounded-t-lg"
                      onClick={async () => {
                        setExportMenuOpen(false)
                        try {
                          await exportHealthDataToPDF()
                          toast({ tone: 'success', title: '导出成功', message: '健康数据PDF已生成，请使用浏览器的打印功能保存' })
                        } catch (error) {
                          toast({ tone: 'error', title: '导出失败', message: '无法生成PDF报告' })
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>导出 PDF</span>
                      </div>
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 rounded-b-lg"
                      onClick={async () => {
                        setExportMenuOpen(false)
                        try {
                          await exportHealthDataToJSON()
                          toast({ tone: 'success', title: '导出成功', message: '健康数据JSON已下载' })
                        } catch (error) {
                          toast({ tone: 'error', title: '导出失败', message: '无法导出数据' })
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>导出 JSON</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden dark:border-gray-700">
                {(['all', 'report', 'vitals', 'symptom', 'other'] as RecordsTab[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      tab === k
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tabLabel(k)}
                  </button>
                ))}
              </div>
              <div className="w-56">
                <Input 
                  placeholder="搜索标题/摘要/日期" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-32">
                <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)}>
                  <option value="all">全部时间</option>
                  <option value="30d">近30天</option>
                  <option value="90d">近90天</option>
                </Select>
              </div>
            </div>
          }
        />
        <CardBody>
          {loading ? (
            <SkeletonList rows={5} />
          ) : filtered.length === 0 ? (
            <EmptyState
              tone="blue"
              title="暂无内容"
              description="你可以先上传体检/化验报告，或记录一次血压、体重、症状等信息。"
              action={<Button onClick={() => fileInputRef.current?.click()}>上传报告</Button>}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((record: any) => {
                const cat = normalizeCategory(record.category)
                return (
                  <div
                    key={record.id}
                    className="flex items-start justify-between gap-6 rounded-lg border border-gray-200 px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900/60"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge tone={cat === 'report' ? 'blue' : cat === 'vitals' ? ('green' as any) : cat === 'symptom' ? ('amber' as any) : 'gray'}>
                          {tabLabel(cat)}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{record.date}</span>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{record.summary}</h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{record.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        className="text-blue-600 hover:bg-blue-50 dark:text-blue-200 dark:hover:bg-blue-950/30"
                        onClick={() => navigate(`/records/${record.id}`)}
                      >
                        查看
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        onClick={() => {
                          setDeleteConfirm({ open: true, recordId: record.id })
                        }}
                      >
                        删除
                      </Button>
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
        message="确定要删除这条记录吗？删除后无法恢复。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm.recordId) {
            deleteRecord(deleteConfirm.recordId)
            setRecords(readRecords())
            toast({ tone: 'success', title: '删除成功', message: '记录已删除' })
            setDeleteConfirm({ open: false, recordId: null })
          }
        }}
        onCancel={() => {
          setDeleteConfirm({ open: false, recordId: null })
        }}
      />
    </Page>
  )
}
