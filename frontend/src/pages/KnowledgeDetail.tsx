import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Page, PageHeader, Card, CardHeader, CardBody, Badge, Button } from '../components/ui'
import { readArticles, type KnowledgeArticle, type KnowledgeCategory } from '../services/knowledgeStore'

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

export default function KnowledgeDetail() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()

  const article = useMemo<KnowledgeArticle | undefined>(() => {
    const all = readArticles()
    return all.find((a) => a.id === params.id)
  }, [params.id])

  return (
    <Page>
      <PageHeader
        title={article ? article.title : '文章详情'}
        subtitle={article ? '以下内容仅为健康科普，不能替代线下就诊与医生诊断。' : '未找到对应的文章'}
        leftSlot={
          <Button size="sm" variant="ghost" onClick={() => navigate('/knowledge')}>
            返回知识库
          </Button>
        }
      />

      <Card>
        {article ? (
          <>
            <CardHeader
              title={
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={categoryTone[article.category]}>{categoryLabel(article.category)}</Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">更新：{article.updatedAt}</span>
                </div>
              }
              subtitle={article.summary}
            />
            <CardBody>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {article.content}
              </div>
            </CardBody>
          </>
        ) : (
          <CardBody>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              找不到这篇文章，可能已被删除或尚未同步。你可以返回知识库列表重新选择。
            </div>
          </CardBody>
        )}
      </Card>
    </Page>
  )
}

