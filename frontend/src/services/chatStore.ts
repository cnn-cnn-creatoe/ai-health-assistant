export type ChatMessage = {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: number
}

export type ChatSession = {
  sessionId: string
  messages: ChatMessage[]
}

const STORAGE_KEY = 'chat:v1'

export function readChat(): ChatSession {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        sessionId: `s-${Date.now()}`,
        messages: [
          {
            id: '1',
            text: '您好！欢迎来到健康咨询。请描述您的症状或健康困扰，我会根据常见医学信息为您提供初步建议与就医指引。',
            sender: 'assistant',
            timestamp: Date.now(),
          },
        ],
      }
    }
    const parsed = JSON.parse(raw) as ChatSession
    if (!parsed || !Array.isArray(parsed.messages) || !parsed.sessionId) throw new Error('invalid')
    return parsed
  } catch {
    return {
      sessionId: `s-${Date.now()}`,
      messages: [
        {
          id: '1',
          text: '您好！欢迎来到健康咨询。请描述您的症状或健康困扰，我会根据常见医学信息为您提供初步建议与就医指引。',
          sender: 'assistant',
          timestamp: Date.now(),
        },
      ],
    }
  }
}

export function writeChat(session: ChatSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}
