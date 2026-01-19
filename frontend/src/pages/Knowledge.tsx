import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardBody, CardHeader, Input, Page, PageHeader, Select } from '../components/ui'
import { readArticles, type KnowledgeArticle, type KnowledgeCategory } from '../services/knowledgeStore'
import { pushNotification } from '../services/notificationHelpers'
import { useToast } from '../components/ToastProvider'

function categoryLabel(c: KnowledgeCategory) {
  switch (c) {
    case 'emergency':
      return '急症'
    case 'symptom':
      return '症状'
    case 'medication':
      return '用药'
    case 'nutrition':
      return '营养'
    case 'exercise':
      return '运动'
    case 'chronic':
      return '慢病'
    case 'mental':
      return '心理'
    case 'general':
      return '通用'
  }
}

const categoryTone: Record<KnowledgeCategory, Parameters<typeof Badge>[0]['tone']> = {
  emergency: 'red' as any,
  symptom: 'blue',
  medication: 'purple' as any,
  nutrition: 'green',
  exercise: 'teal' as any,
  chronic: 'amber',
  mental: 'indigo' as any,
  general: 'gray',
}

export default function Knowledge() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const [tab, setTab] = useState<'all' | KnowledgeCategory>('all')
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState<KnowledgeArticle[]>(() => readArticles())

  useEffect(() => {
    const update = () => setArticles(readArticles())
    update()
    window.addEventListener('knowledge:changed', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('knowledge:changed', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim()
    return articles.filter((a) => {
      if (tab !== 'all' && a.category !== tab) return false
      if (!q) return true
      const hay = `${a.title} ${a.summary} ${a.tags.join(' ')}`
      return hay.includes(q)
    })
  }, [articles, tab, query])

  return (
    <Page>
      <PageHeader 
        title="健康知识库" 
        subtitle="权威健康科普与自我管理建议（MVP）"
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
        <CardHeader
          title="检索"
          subtitle="按分类与关键词筛选"
          right={
            <div className="flex items-center gap-3">
              <div className="w-44">
                <Select value={tab} onChange={(e) => setTab(e.target.value as any)}>
                  <option value="all">全部</option>
                  <option value="emergency">急症</option>
                  <option value="symptom">症状</option>
                  <option value="medication">用药</option>
                  <option value="chronic">慢病</option>
                  <option value="nutrition">营养</option>
                  <option value="exercise">运动</option>
                  <option value="mental">心理</option>
                  <option value="general">通用</option>
                </Select>
              </div>
              <div className="w-56">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索标题/标签" />
              </div>
            </div>
          }
        />
        <CardBody>
          {filtered.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">暂无匹配内容</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filtered.map((a) => (
                <button
                  key={a.id}
                  className="text-left rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900/60 transition-colors p-5"
                  onClick={() => {
                    toast({ tone: 'info', message: '已打开文章' })
                    pushNotification({
                      type: 'system',
                      title: '阅读健康知识',
                      description: a.title,
                      unread: false,
                    })
                    navigate(`/knowledge/${a.id}`)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Badge tone={categoryTone[a.category]}>{categoryLabel(a.category)}</Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">更新：{a.updatedAt}</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{a.title}</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{a.summary}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* 提示：点击上方卡片会跳转到完整的文章详情页 */}
    </Page>
  )
}
