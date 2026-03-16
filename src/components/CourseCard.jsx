import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Clock, User, ArrowRight } from 'lucide-react'
import ProgressBar from './ProgressBar'

const CATEGORY_COLORS = {
  Programming: { bg: 'rgba(99,102,241,0.12)', color: '#6366F1' },
  Design: { bg: 'rgba(236,72,153,0.12)', color: '#EC4899' },
  Business: { bg: 'rgba(245,158,11,0.12)', color: '#D97706' },
  Marketing: { bg: 'rgba(34,197,94,0.12)', color: '#16A34A' },
  'Data Science': { bg: 'rgba(14,165,233,0.12)', color: '#0284C7' },
  DevOps: { bg: 'rgba(239,68,68,0.12)', color: '#DC2626' },
  Other: { bg: 'rgba(107,114,128,0.12)', color: '#6B7280' },
}

export default function CourseCard({ course, progress, enrolled, showProgress }) {
  const navigate = useNavigate()
  const catStyle = CATEGORY_COLORS[course.category] || CATEGORY_COLORS.Other

  const handleClick = () => {
    if (enrolled) {
      navigate(`/courses/${course._id}`)
    } else {
      navigate(`/courses/${course._id}`)
    }
  }

  return (
    <motion.div
      className="card"
      style={{ overflow: 'hidden', cursor: 'pointer' }}
      onClick={handleClick}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(99,102,241,0.15)' }}
      transition={{ duration: 0.2 }}
      layout
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative' }}>
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80'}
          alt={course.title}
          className="course-thumbnail"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80'
          }}
        />
        {/* Category badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          padding: '4px 10px', borderRadius: 999,
          fontSize: 12, fontWeight: 600,
          background: catStyle.bg,
          color: catStyle.color,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${catStyle.color}33`,
        }}>
          {course.category}
        </div>
        {enrolled && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            padding: '4px 10px', borderRadius: 999,
            fontSize: 12, fontWeight: 600,
            background: 'rgba(34,197,94,0.9)',
            color: 'white',
          }}>
            Enrolled
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontSize: 15, fontWeight: 700,
          color: 'var(--text-primary-light)',
          marginBottom: 6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
        }}>
          {course.title}
        </h3>

        <p style={{
          fontSize: 13, color: 'var(--text-secondary-light)',
          marginBottom: 12,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.5,
        }}>
          {course.description}
        </p>

        {/* Meta info */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary-light)' }}>
            <User size={13} />
            <span>{course.instructorId?.name || 'Instructor'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary-light)' }}>
            <BookOpen size={13} />
            <span>{course.level || 'Beginner'}</span>
          </div>
        </div>

        {/* Progress bar (when enrolled) */}
        {showProgress && progress !== undefined && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary-light)' }}>
              <span>Progress</span>
              <span style={{ color: 'var(--primary)' }}>{progress}%</span>
            </div>
            <ProgressBar value={progress} height={6} />
          </div>
        )}

        {/* CTA */}
        <button
          className="btn btn-primary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={(e) => { e.stopPropagation(); handleClick() }}
          id={`course-card-btn-${course._id}`}
        >
          {enrolled ? (progress > 0 ? 'Continue Learning' : 'Start Learning') : 'View Course'}
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  )
}
