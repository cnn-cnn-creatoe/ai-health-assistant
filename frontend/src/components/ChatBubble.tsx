import { useEffect, useState } from 'react'
import { Message } from '../pages/Chat'
import { CheckIcon } from './Icons'

interface ChatBubbleProps {
  message: Message
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const [isVisible, setIsVisible] = useState(false)
  const isUser = message.sender === 'user'

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      style={{ 
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${isUser ? '-5px' : '5px'})`,
        transition: 'all 0.2s ease-out'
      }}
    >
      <div
        className={`max-w-[75%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        <p className={`text-xs mt-2 flex items-center gap-2 ${
          isUser ? 'text-blue-100' : 'text-gray-400'
        }`}>
          <span>{message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
          {isUser && (
            <span className="w-3 h-3 rounded-full bg-green-400 flex items-center justify-center">
              <CheckIcon className="w-2 h-2 text-white" />
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
