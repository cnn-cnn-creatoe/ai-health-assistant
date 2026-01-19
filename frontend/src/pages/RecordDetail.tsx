import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, CardBody, CardHeader, Page, PageHeader } from '../components/ui'
import { readRecords, deleteRecord } from '../services/recordsStore'
import { useToast } from '../components/ToastProvider'
import { ConfirmDialog } from '../components/ConfirmDialog'

function categoryLabel(category: string) {
  switch (category) {
    case 'exam':
    case 'report':
      return '报告'
    case 'measure':
    case 'vitals':
      return '指标'
    case 'consult':
    case 'symptom':
      return '症状'
    default:
      return '其他'
  }
}

const categoryTone: Record<string, Parameters<typeof Badge>[0]['tone']> = {
  exam: 'blue',
  report: 'blue',
  measure: 'green' as any,
  vitals: 'green' as any,
  consult: 'amber' as any,
  symptom: 'amber' as any,
  other: 'gray',
}

export default function RecordDetail() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const record = useMemo(() => {
    const all = readRecords()
    return all.find((r) => r.id === params.id)
  }, [params.id])

  const category = record?.category || 'other'
  const normalizedCategory = category === 'exam' ? 'report' : category === 'measure' ? 'vitals' : category === 'consult' ? 'symptom' : category

  // 创建blob URL用于预览
  useEffect(() => {
    if (record?.fileData && record.fileName) {
      try {
        const base64Data = record.fileData.split(',')[1] || record.fileData
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: record.fileType || 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
        return () => {
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error('创建blob URL失败:', error)
      }
    }
  }, [record?.fileData, record?.fileName, record?.fileType])

  const handleDelete = () => {
    setDeleteConfirm(true)
  }

  const handleDownload = () => {
    if (blobUrl && record?.fileName) {
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = record.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <Page>
      <PageHeader
        title={record ? record.summary : '记录详情'}
        subtitle={record ? '查看健康档案详细信息' : '未找到对应的记录'}
        leftSlot={
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => navigate('/records')}
            className="border border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-950/30"
          >
            返回档案列表
          </Button>
        }
        actions={
          record && (
            <Button 
              variant="danger" 
              size="sm"
              onClick={handleDelete}
            >
              删除记录
            </Button>
          )
        }
      />

      <Card>
        {record ? (
          <>
            <CardHeader
              title={
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={categoryTone[normalizedCategory] || 'gray'}>
                    {categoryLabel(normalizedCategory)}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">日期：{record.date}</span>
                </div>
              }
              subtitle={record.type}
            />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">记录信息</h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex">
                      <span className="w-24 text-gray-500 dark:text-gray-400">类型：</span>
                      <span>{record.type}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-gray-500 dark:text-gray-400">日期：</span>
                      <span>{record.date}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-gray-500 dark:text-gray-400">摘要：</span>
                      <span>{record.summary}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-gray-500 dark:text-gray-400">分类：</span>
                      <span>{categoryLabel(normalizedCategory)}</span>
                    </div>
                  </div>
                </div>
                
                {/* 显示图片预览 */}
                {(record.fileData || record.fileName) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">文件预览</h3>
                    <div className="mt-2">
                      {/* 检查是否为图片文件 */}
                      {(() => {
                        const fileName = record.fileName || ''
                        const fileType = record.fileType || ''
                        const isImage = fileType.startsWith('image/') || 
                                      /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)
                        
                        if (isImage && record.fileData) {
                          return (
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900/50 p-4">
                              <img 
                                src={record.fileData} 
                                alt={record.fileName || '上传的图片'} 
                                className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
                                style={{ maxHeight: '600px' }}
                                onError={(e) => {
                                  console.error('图片加载失败:', record.fileName)
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                          )
                        }
                        
                        // PDF 文件
                        if (fileType === 'application/pdf' || /\.pdf$/i.test(fileName)) {
                          if (blobUrl) {
                            return (
                              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{record.fileName}</span>
                                  </div>
                                  <Button size="sm" variant="secondary" onClick={handleDownload}>
                                    下载
                                  </Button>
                                </div>
                                <iframe
                                  src={blobUrl}
                                  className="w-full"
                                  style={{ height: '800px' }}
                                  title="PDF预览"
                                />
                              </div>
                            )
                          }
                          return (
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
                              <div className="flex flex-col items-center justify-center text-center">
                                <svg className="w-16 h-16 text-red-500 mb-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">PDF 文档</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{record.fileName}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">PDF 文件暂不支持在线预览，请下载后查看</p>
                              </div>
                            </div>
                          )
                        }
                        
                        // Office 文档 - 使用iframe嵌入，尝试在线预览
                        if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(fileName)) {
                          const officeType = /\.(doc|docx)$/i.test(fileName) ? 'Word' :
                                           /\.(xls|xlsx)$/i.test(fileName) ? 'Excel' : 'PowerPoint'
                          
                          return (
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
                              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                                <div className="flex items-center gap-2">
                                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{officeType} 文档</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">({record.fileName})</span>
                                </div>
                                <Button size="sm" variant="secondary" onClick={handleDownload}>
                                  下载文件
                                </Button>
                              </div>
                              {blobUrl ? (
                                <div className="relative bg-gray-100 dark:bg-gray-900" style={{ height: '800px' }}>
                                  <iframe
                                    src={blobUrl}
                                    className="w-full h-full"
                                    title={`${officeType}文档预览`}
                                    style={{ border: 'none' }}
                                  />
                                  <div className="absolute bottom-4 left-4 right-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <p className="text-xs text-blue-800 dark:text-blue-200">
                                      💡 <strong>提示：</strong>如果文档无法在此预览，请点击右上角的"下载文件"按钮，使用 Microsoft Office 或 WPS Office 打开查看。
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-6">
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <svg className="w-16 h-16 text-blue-500 mb-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{officeType} 文档</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{record.fileName}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">请下载文件后使用 Office 软件打开查看</p>
                                    <Button size="sm" variant="primary" onClick={handleDownload}>
                                      下载文件
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        }
                        
                        // 文本文件
                        if (/\.txt$/i.test(fileName) && record.fileData) {
                          try {
                            const textContent = atob(record.fileData.split(',')[1] || '')
                            return (
                              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono max-h-96 overflow-auto">
                                  {textContent}
                                </pre>
                              </div>
                            )
                          } catch {
                            // 如果不是base64，直接显示
                          }
                        }
                        
                        // 其他文件类型
                        return (
                          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
                            <div className="flex flex-col items-center justify-center text-center">
                              <svg className="w-16 h-16 text-gray-400 mb-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">文件</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{record.fileName}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">文件类型：{fileType || '未知'}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">此文件类型暂不支持预览，请下载后查看</p>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </>
        ) : (
          <CardBody>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              找不到这条记录，可能已被删除。你可以返回档案列表重新选择。
            </div>
          </CardBody>
        )}
      </Card>

      <ConfirmDialog
        open={deleteConfirm}
        title="确认删除"
        message="确定要删除这条记录吗？删除后无法恢复。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          if (record?.id) {
            deleteRecord(record.id)
            toast({ tone: 'success', title: '删除成功', message: '记录已删除' })
            navigate('/records')
          }
          setDeleteConfirm(false)
        }}
        onCancel={() => {
          setDeleteConfirm(false)
        }}
      />
    </Page>
  )
}
