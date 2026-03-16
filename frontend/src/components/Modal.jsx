import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * Modal - accessible dialog overlay component
 */
export default function Modal({ open, onClose, title, children, maxWidth = 540 }) {
  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-content"
          style={{ maxWidth }}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary-light)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              style={{ borderRadius: '50%', width: 32, height: 32, padding: 0 }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
