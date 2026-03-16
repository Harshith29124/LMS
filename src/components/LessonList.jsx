import { CheckCircle, Circle, PlayCircle } from 'lucide-react'

/**
 * LessonList - sidebar lesson navigator for course page
 */
export default function LessonList({ lessons, activeLessonId, completedLessons = [], onSelect }) {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-4">
        Modules Index ({lessons.length})
      </div>
      <div className="space-y-1">
        {lessons.map((lesson, index) => {
          const isActive = lesson._id === activeLessonId
          const isCompleted = completedLessons.includes(lesson._id)

          return (
            <button
              key={lesson._id}
              onClick={() => onSelect(lesson)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group text-left ${
                isActive 
                ? 'bg-brand-primary/10 border border-brand-primary/20 shadow-lg' 
                : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              {/* Completion indicator */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                   <CheckCircle size={18} className="text-green-500" />
                ) : isActive ? (
                   <PlayCircle size={18} className="text-brand-primary" />
                ) : (
                   <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-800" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate tracking-wide ${isActive ? 'text-brand-primary' : 'text-slate-800 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                  {String(index + 1).padStart(2, '0')}. {lesson.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     {lesson.duration || '05:00'}
                   </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
