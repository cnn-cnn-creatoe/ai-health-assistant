import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'

type ToastTone = 'success' | 'info' | 'warning' | 'error'

type Toast = {
  id: string
  title?: string
  message: string
  tone: ToastTone
  createdAt: number
}

type ToastInput = {
  title?: string
  message: string
  tone?: ToastTone
  durationMs?: number
}

type ToastContextValue = {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function toneClasses(tone: ToastTone) {
  switch (tone) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-50'
    case 'info':
      return 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-50'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-50'
    case 'error':
      return 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-50'
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<string, number>())

  const remove = useCallback((id: string) => {
    const t = timers.current.get(id)
    if (t) window.clearTimeout(t)
    timers.current.delete(id)
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const durationMs = input.durationMs ?? 2800
      const next: Toast = {
        id,
        title: input.title,
        message: input.message,
        tone: input.tone ?? 'info',
        createdAt: Date.now(),
      }

      setToasts((prev) => {
        const trimmed = prev.slice(-4)
        return [...trimmed, next]
      })

      const timeoutId = window.setTimeout(() => remove(id), durationMs)
      timers.current.set(id, timeoutId)
    },
    [remove]
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`rounded-xl border px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 ease-out will-change-transform data-[state=closed]:pointer-events-none data-[state=open]:translate-y-0 data-[state=open]:opacity-100 data-[state=closed]:-translate-y-2 data-[state=closed]:opacity-0 ${toneClasses(t.tone)}`}
            data-state="open"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
                <div className="text-sm opacity-90">{t.message}</div>
              </div>
              <button
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium opacity-70 hover:opacity-100"
                onClick={() => remove(t.id)}
              >
                关闭
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>')
  }
  return ctx
}
