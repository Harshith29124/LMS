import { motion } from 'framer-motion'

/**
 * Animated progress bar component
 */
export default function ProgressBar({ value = 0, height = 8, showLabel = false }) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: 'var(--text-secondary-light)' }}>Course Progress</span>
          <span style={{ color: 'var(--primary)' }}>{clamped}%</span>
        </div>
      )}
      <div className="progress-bar-container" style={{ height }}>
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  )
}
