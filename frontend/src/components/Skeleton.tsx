import { ReactNode } from 'react'

export function Skeleton({
  className = '',
}: {
  className?: string
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${className}`}
    />
  )
}

export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 rounded bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 animate-pulse ${i === lines - 1 ? 'w-3/5' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({
  header = true,
  lines = 3,
}: {
  header?: boolean
  lines?: number
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      {header ? (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="h-4 w-40 rounded bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 animate-pulse" />
            <div className="mt-2 h-3 w-64 rounded bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 animate-pulse" />
          </div>
          <div className="h-8 w-24 rounded-lg bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 animate-pulse" />
        </div>
      ) : null}
      <SkeletonText lines={lines} />
    </div>
  )
}

export function SkeletonList({
  rows = 5,
}: {
  rows?: number
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 rounded-full bg-gray-100 border border-gray-200 animate-pulse" />
                <div className="h-4 w-24 rounded bg-gray-100 border border-gray-200 animate-pulse" />
              </div>
              <div className="mt-3 h-4 w-3/4 rounded bg-gray-100 border border-gray-200 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-100 border border-gray-200 animate-pulse" />
            </div>
            <div className="h-9 w-24 rounded-lg bg-gray-100 border border-gray-200 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
