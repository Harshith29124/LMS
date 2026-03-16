/**
 * Skeleton loader components for loading states
 */

export function SkeletonCard() {
  return (
    <div className="glass-panel rounded-[2.5rem] overflow-hidden animate-pulse">
      <div className="h-44 bg-black/5 dark:bg-white/5" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-black/5 dark:bg-white/5 rounded-lg w-3/4" />
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-full" />
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-3/5" />
        <div className="h-10 bg-black/5 dark:bg-white/5 rounded-xl mt-4" />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-black/5 dark:bg-white/5 rounded-lg" 
          style={{ width: i === lines - 1 ? '60%' : '100%' }} 
        />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-3/5" />
        <div className="h-3 bg-black/5 dark:bg-white/5 rounded-lg w-2/5" />
      </div>
    </div>
  )
}
