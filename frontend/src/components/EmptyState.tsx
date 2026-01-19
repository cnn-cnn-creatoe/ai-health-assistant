import { ReactNode } from 'react'

type Tone = 'blue' | 'green' | 'amber' | 'gray'

function toneClasses(tone: Tone) {
  switch (tone) {
    case 'blue':
      return { bg: 'bg-blue-50', stroke: 'stroke-blue-200', accent: 'text-blue-700' }
    case 'green':
      return { bg: 'bg-emerald-50', stroke: 'stroke-emerald-200', accent: 'text-emerald-700' }
    case 'amber':
      return { bg: 'bg-amber-50', stroke: 'stroke-amber-200', accent: 'text-amber-700' }
    default:
      return { bg: 'bg-gray-50', stroke: 'stroke-gray-200', accent: 'text-gray-700' }
  }
}

export function EmptyState({
  title,
  description,
  tone = 'blue',
  icon,
  action,
}: {
  title: string
  description?: string
  tone?: Tone
  icon?: ReactNode
  action?: ReactNode
}) {
  const t = toneClasses(tone)

  return (
    <div className="w-full flex flex-col items-center justify-center text-center px-6 py-10">
      <div className={`w-24 h-24 rounded-3xl ${t.bg} flex items-center justify-center mb-4 border ${t.bg.replace('bg', 'border')}`}>
        {icon ?? <Illustration className={`w-16 h-16 ${t.stroke}`} />}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description ? <p className="text-sm text-gray-600 mt-2 max-w-md">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

function Illustration({ className }: { className?: string }) {
  // 参考医疗插画（简化自 svg.health / undraw 风格）：心率监测 + 护盾
  return (
    <svg className={className} viewBox="0 0 96 96" fill="none">
      <path d="M20 40c0-12 10-22 22-22h24c2.8 0 5 2.2 5 5v36c0 2.8-2.2 5-5 5H36C26 64 20 60 20 52V40Z" strokeWidth="2.5" />
      <path d="M34 46h10l4-10 8 22 3-8h11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M62 22h10" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M67 16v12" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 30c0-8 7-15 15-15h12" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M64 52c0 9-6 17-14 20-2.4.9-5 .9-7.4 0-8.6-3.1-14.6-11.1-14.6-20.1V42l14-4 22 6v8z" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 54a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" strokeWidth="2.5" />
    </svg>
  )
}

