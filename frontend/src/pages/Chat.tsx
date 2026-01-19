import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatBubble from '../components/ChatBubble'
import { AlertIcon, ChatIcon } from '../components/Icons'
import { Button, Card, CardBody, CardHeader, Input, Page, PageHeader } from '../components/ui'
import api from '../services/api'
import { pushNotification } from '../services/notificationHelpers'
import { EmergencyButton } from '../components/EmergencyButton'

const STORAGE_KEY = 'chat:messages:v1'

function defaultMessage(): Message {
  return {
    id: '1',
    text: '你好，我是你的健康助手。你可以把症状、用药、检查结果或最近的感受告诉我，我会帮你梳理重点、给出自我护理建议，并提供就医准备清单（仅供参考）。',
    sender: 'assistant',
    timestamp: new Date(),
  }
}

export interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

function loadMessages(): Message[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }))
  } catch {
    return null
  }
}

function saveMessages(list: Message[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        list.map((m) => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
        }))
      )
    )
  } catch {
    // ignore write errors
  }
}

function initialMessages(): Message[] {
  const stored = loadMessages()
  if (stored && stored.length > 0) return stored
  return [defaultMessage()]
}

export default function Chat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>(() => initialMessages())
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  const handleClear = () => {
    const fresh = [defaultMessage()]
    saveMessages(fresh)
    setMessages(fresh)
    pushNotification({
      type: 'system',
      title: '已清空对话',
      description: '历史聊天已清除，当前会话保留欢迎语。',
      unread: false,
    })
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const text = input

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await api.post('/chat', { message: text })
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.message || '我暂时没能生成建议，你可以换一种描述方式再试一次。',
        sender: 'assistant',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      pushNotification({
        type: 'message',
        title: '助手已回复',
        description: assistantMessage.text.slice(0, 40) + (assistantMessage.text.length > 40 ? '…' : ''),
      })
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '抱歉，刚才请求失败了。请稍后再试，或检查网络连接。',
        sender: 'assistant',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])

      pushNotification({
        type: 'system',
        title: '请求失败',
        description: '健康助手请求失败，请稍后重试。',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Page>
      <PageHeader 
        title="健康助手" 
        subtitle="记录症状与问题，获取建议与就医准备清单（仅供参考）"
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
          <EmergencyButton variant="danger" size="sm" showLabel={false} />
        }
      />

      <Card className="overflow-hidden">
        <CardHeader
          title="对话"
          subtitle="为保护隐私，请勿输入身份证号、住址等敏感信息"
          right={
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-2">
                <ChatIcon className="h-4 w-4 text-blue-600" />
                在线
              </span>
              <Button variant="secondary" size="sm" onClick={handleClear}>
                清空记录
              </Button>
            </div>
          }
        />
        <CardBody>
          <div className="flex h-[calc(100vh-320px)] min-h-[520px] flex-col rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex-1 overflow-y-auto space-y-4 p-6">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></div>
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: '0.15s' }}
                        ></div>
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: '0.3s' }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">正在生成建议...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="例如：最近三天咳嗽、夜间加重，已服用xx..."
                  disabled={loading}
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()}>
                  发送
                </Button>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-gray-500 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-gray-300">
                <AlertIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <span>提示：本助手仅供参考，不能替代专业医疗诊断。如出现胸痛、呼吸困难、意识异常等情况，请立即就医。</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Page>
  )
}
