interface RingProps {
  value: number // 0-100
  label: string
  description?: string
  size?: number
  stroke?: number
  color?: string
}

export function Ring({
  value,
  label,
  description,
  size = 140,
  stroke = 10,
  color = '#2563eb',
}: RingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          className="fill-gray-900"
          style={{ fontSize: size * 0.2, fontWeight: 700 }}
        >
          {clamped.toFixed(0)}
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          className="fill-gray-500"
          style={{ fontSize: size * 0.11 }}
        >
          /100
        </text>
      </svg>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {description ? <p className="text-sm text-gray-600">{description}</p> : null}
      </div>
    </div>
  )
}

