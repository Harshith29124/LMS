/**
 * Skeleton loader components for loading states
 */

export function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 180 }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 18, width: '75%', marginBottom: 8, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 16, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 36, borderRadius: 8 }} />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 14, width: i === lines - 1 ? '60%' : '100%', borderRadius: 6 }} />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
      </div>
    </div>
  )
}
