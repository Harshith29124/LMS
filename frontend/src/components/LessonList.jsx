import { CheckCircle, Circle, PlayCircle } from 'lucide-react'

/**
 * LessonList - sidebar lesson navigator for course page
 */
export default function LessonList({ lessons, activeLessonId, completedLessons = [], onSelect }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary-light)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Lessons ({lessons.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {lessons.map((lesson, index) => {
          const isActive = lesson._id === activeLessonId
          const isCompleted = completedLessons.includes(lesson._id)

          return (
            <button
              key={lesson._id}
              className={`lesson-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(lesson)}
              id={`lesson-item-${lesson._id}`}
              style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
            >
              {/* Completion indicator */}
              <div style={{ flexShrink: 0 }}>
                {isCompleted ? (
                  <CheckCircle size={18} color="#22C55E" />
                ) : isActive ? (
                  <PlayCircle size={18} color="#6366F1" />
                ) : (
                  <Circle size={18} color="#94A3B8" />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontSize: 13, fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-primary-light)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {index + 1}. {lesson.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary-light)', marginTop: 1 }}>
                  {lesson.duration || '5 min'}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
