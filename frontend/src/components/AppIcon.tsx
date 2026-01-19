export function AppIcon({ className = 'w-9 h-9' }: { className?: string }) {
  // 更“现代医疗品牌”的简洁标识：圆角方块 + 负空间十字 + 心率折线
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="10" fill="#2563EB" />
      <path
        d="M12 20h4l2-6 4 12 2-6h4"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 12v16"
        stroke="white"
        strokeOpacity="0.25"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M12 20h16"
        stroke="white"
        strokeOpacity="0.25"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

