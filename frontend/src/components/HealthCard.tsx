import { useEffect, useState } from 'react'
import { CheckIcon, AlertIcon } from './Icons'

interface HealthCardProps {
  title: string
  value: string
  unit: string
  status: 'normal' | 'warning' | 'danger'
}

export default function HealthCard({ title, value, unit, status }: HealthCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const statusConfig = {
    normal: {
      icon: CheckIcon,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      barColor: 'bg-emerald-500',
      statusText: '正常',
    },
    warning: {
      icon: AlertIcon,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      barColor: 'bg-amber-500',
      statusText: '注意',
    },
    danger: {
      icon: AlertIcon,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      barColor: 'bg-red-500',
      statusText: '异常',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div 
      className={`bg-white border ${config.borderColor} rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 标题和状态 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
        <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
      </div>
      
      {/* 数值显示 */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-4xl font-bold text-gray-900">
            {value}
          </span>
          <span className="text-base text-gray-500">{unit}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">最后更新：今天</p>
      </div>
      
      {/* 状态指示 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">状态</span>
          <span className={`font-medium ${config.iconColor}`}>{config.statusText}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${config.barColor} rounded-full transition-all duration-700 ${
              isVisible ? 'w-full' : 'w-0'
            }`}
            style={{ transitionDelay: '200ms' }}
          ></div>
        </div>
      </div>
    </div>
  )
}
