import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { lessonAPI, quizAPI, progressAPI } from '../services/api'
import VideoPlayer from '../components/VideoPlayer'
import LessonList from '../components/LessonList'
import QuizCard from '../components/QuizCard'
import { SkeletonText } from '../components/Skeleton'
import ReactMarkdown from 'react-markdown'
import { CheckCircle, ChevronLeft, ChevronRight, List } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [lessons, setLessons] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [progress, setProgress] = useState({ completedLessons: [], percentage: 0 })
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [lessonRes, lessonsRes, progRes] = await Promise.all([
          lessonAPI.getById(lessonId),
          lessonAPI.getForCourse(courseId),
          progressAPI.getCourseProgress(courseId),
        ])
        setLesson(lessonRes.data)
        setLessons(lessonsRes.data || [])
        setProgress(progRes.data)

        // Try to load quiz
        try {
          const quizRes = await quizAPI.getForLesson(lessonId)
          setQuiz(quizRes.data)
        } catch {
          setQuiz(null)
        }
      } catch {
        toast.error('Failed to load lesson')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [lessonId, courseId])

  const handleComplete = async () => {
    if (progress.completedLessons.includes(lessonId)) return
    setCompleting(true)
    try {
      await progressAPI.complete(lessonId)
      const progRes = await progressAPI.getCourseProgress(courseId)
      setProgress(progRes.data)
      toast.success('Lesson marked as complete! ✅')
    } catch {
      toast.error('Failed to mark complete')
    } finally {
      setCompleting(false)
    }
  }

  const currentIndex = lessons.findIndex((l) => l._id === lessonId)
  const prevLesson = lessons[currentIndex - 1]
  const nextLesson = lessons[currentIndex + 1]
  const isCompleted = progress.completedLessons.includes(lessonId)

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 400, borderRadius: 16, marginBottom: 24 }} />
        <SkeletonText lines={8} />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Top breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/courses/${courseId}`)} id="back-to-course">
          <ChevronLeft size={16} /> Back to Course
        </button>
        <span style={{ color: 'var(--text-secondary-light)', fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lesson?.title}
        </span>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginLeft: 'auto' }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          id="toggle-lesson-sidebar"
        >
          <List size={16} /> Lessons
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: sidebarOpen ? '1fr 280px' : '1fr', gap: 24, transition: 'all 0.3s' }}>
        {/* Main lesson content */}
        <div>
          {/* Video player */}
          <div style={{ marginBottom: 24 }}>
            <VideoPlayer url={lesson?.videoUrl} />
          </div>

          {/* Lesson info */}
          <div className="card-flat" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{lesson?.title}</h1>
                <div style={{ fontSize: 13, color: 'var(--text-secondary-light)' }}>
                  Lesson {currentIndex + 1} of {lessons.length}
                </div>
              </div>

              {/* Mark complete button */}
              <button
                className={`btn ${isCompleted ? 'btn-accent' : 'btn-outline'}`}
                onClick={handleComplete}
                disabled={completing || isCompleted}
                id="mark-complete-btn"
              >
                <CheckCircle size={16} />
                {isCompleted ? 'Completed!' : completing ? 'Saving...' : 'Mark Complete'}
              </button>
            </div>

            {/* Lesson content / markdown */}
            {lesson?.content && (
              <div className="markdown-content">
                <ReactMarkdown>{lesson.content}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Quiz */}
          {quiz && (
            <div style={{ marginBottom: 20 }}>
              <QuizCard quiz={quiz} onComplete={handleComplete} />
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <button
              className="btn btn-outline"
              onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson._id}`)}
              disabled={!prevLesson}
              id="prev-lesson-btn"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (nextLesson) navigate(`/courses/${courseId}/lessons/${nextLesson._id}`)
                else navigate(`/courses/${courseId}`)
              }}
              id="next-lesson-btn"
            >
              {nextLesson ? 'Next Lesson' : 'Finish Course'} <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Lesson sidebar */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-flat"
            style={{ padding: 20, alignSelf: 'start', position: 'sticky', top: 80, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
          >
            <LessonList
              lessons={lessons}
              activeLessonId={lessonId}
              completedLessons={progress.completedLessons}
              onSelect={(l) => navigate(`/courses/${courseId}/lessons/${l._id}`)}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
