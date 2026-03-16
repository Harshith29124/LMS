import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { lessonAPI, quizAPI, courseAPI } from '../services/api'
import Modal from '../components/Modal'
import { ArrowLeft, Plus, Trash2, Edit3, HelpCircle, CheckCircle, Video, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ManageLessonsPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [lessonModal, setLessonModal] = useState(false)
  const [quizModal, setQuizModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [lessonForm, setLessonForm] = useState({ title: '', content: '', videoUrl: '', order: 0, duration: '10 min' })
  const [quizForm, setQuizForm] = useState({ question: '', options: ['', '', '', ''], correctAnswer: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          courseAPI.getById(courseId),
          lessonAPI.getForCourse(courseId),
        ])
        setCourse(courseRes.data)
        setLessons(lessonsRes.data || [])
      } catch {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [courseId])

  const handleAddLesson = async (e) => {
    e.preventDefault()
    if (!lessonForm.title.trim()) return toast.error('Lesson title required')
    setSubmitting(true)
    try {
      const res = await lessonAPI.create(courseId, { ...lessonForm, order: lessons.length })
      setLessons((prev) => [...prev, res.data])
      setLessonModal(false)
      setLessonForm({ title: '', content: '', videoUrl: '', order: 0, duration: '10 min' })
      toast.success('Lesson added!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add lesson')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return
    try {
      await lessonAPI.delete(lessonId)
      setLessons((prev) => prev.filter((l) => l._id !== lessonId))
      toast.success('Lesson deleted')
    } catch {
      toast.error('Failed to delete lesson')
    }
  }

  const handleAddQuiz = async (e) => {
    e.preventDefault()
    if (!quizForm.question.trim()) return toast.error('Question required')
    if (quizForm.options.some((o) => !o.trim())) return toast.error('All 4 options required')
    if (!quizForm.correctAnswer) return toast.error('Select the correct answer')
    setSubmitting(true)
    try {
      await quizAPI.create(selectedLesson._id, quizForm)
      setQuizModal(false)
      setQuizForm({ question: '', options: ['', '', '', ''], correctAnswer: '' })
      toast.success('Quiz created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/instructor')} id="back-to-instructor">
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Manage Lessons</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary-light)' }}>{course?.title}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setLessonModal(true)}
          id="add-lesson-btn"
        >
          <Plus size={16} /> Add Lesson
        </button>
      </div>

      {/* Lessons */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
      ) : lessons.length > 0 ? (
        <AnimatePresence mode="popLayout">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card-flat"
              style={{ padding: 20, marginBottom: 12 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(99,102,241,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontWeight: 800, color: '#6366F1', fontSize: 14,
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{lesson.title}</h3>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {lesson.videoUrl && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary-light)' }}>
                        <Video size={12} /> Has Video
                      </span>
                    )}
                    {lesson.content && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary-light)' }}>
                        <FileText size={12} /> Has Content
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--text-secondary-light)' }}>{lesson.duration}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => { setSelectedLesson(lesson); setQuizModal(true) }}
                    id={`add-quiz-${lesson._id}`}
                    title="Add quiz"
                  >
                    <HelpCircle size={14} /> Quiz
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDeleteLesson(lesson._id)}
                    id={`delete-lesson-${lesson._id}`}
                    style={{ color: '#EF4444' }}
                    title="Delete lesson"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={36} color="#6366F1" /></div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>No lessons yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary-light)' }}>Add your first lesson to get started</p>
          <button className="btn btn-primary" onClick={() => setLessonModal(true)} id="first-lesson-btn">
            <Plus size={16} /> Add First Lesson
          </button>
        </div>
      )}

      {/* Add Lesson Modal */}
      <Modal open={lessonModal} onClose={() => setLessonModal(false)} title="Add New Lesson">
        <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="lesson-title">Lesson Title *</label>
            <input
              id="lesson-title"
              type="text"
              className="form-input"
              placeholder="e.g. Introduction to React Hooks"
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lesson-video">Video URL (YouTube, Vimeo, etc.)</label>
            <input
              id="lesson-video"
              type="url"
              className="form-input"
              placeholder="https://youtube.com/watch?v=..."
              value={lessonForm.videoUrl}
              onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lesson-content">Lesson Content (Markdown)</label>
            <textarea
              id="lesson-content"
              className="form-input"
              placeholder="# Lesson Content&#10;&#10;Write content in **Markdown** format..."
              value={lessonForm.content}
              onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
              style={{ minHeight: 120 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lesson-duration">Duration</label>
            <input
              id="lesson-duration"
              type="text"
              className="form-input"
              placeholder="e.g. 15 min"
              value={lessonForm.duration}
              onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setLessonModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting} id="submit-lesson-btn">
              {submitting ? 'Adding...' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Quiz Modal */}
      <Modal open={quizModal} onClose={() => setQuizModal(false)} title={`Add Quiz: ${selectedLesson?.title || ''}`} maxWidth={580}>
        <form onSubmit={handleAddQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="quiz-question">Question *</label>
            <textarea
              id="quiz-question"
              className="form-input"
              placeholder="e.g. What is the purpose of the useState hook?"
              value={quizForm.question}
              onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
              required
              style={{ minHeight: 80 }}
            />
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Options (select correct answer)</label>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => setQuizForm({ ...quizForm, correctAnswer: quizForm.options[i] })}
                  id={`correct-option-${i}`}
                  style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    border: `2px solid ${quizForm.correctAnswer === quizForm.options[i] && quizForm.options[i] ? '#22C55E' : 'var(--border-light)'}`,
                    background: quizForm.correctAnswer === quizForm.options[i] && quizForm.options[i] ? '#22C55E' : 'transparent',
                    color: quizForm.correctAnswer === quizForm.options[i] && quizForm.options[i] ? 'white' : 'var(--text-secondary-light)',
                    cursor: 'pointer', fontWeight: 700, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {quizForm.correctAnswer === quizForm.options[i] && quizForm.options[i]
                    ? <CheckCircle size={16} />
                    : optionLabels[i]
                  }
                </button>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Option ${optionLabels[i]}`}
                  value={quizForm.options[i]}
                  onChange={(e) => {
                    const newOpts = [...quizForm.options]
                    const wasCorrect = quizForm.correctAnswer === quizForm.options[i]
                    newOpts[i] = e.target.value
                    setQuizForm({
                      ...quizForm,
                      options: newOpts,
                      correctAnswer: wasCorrect ? e.target.value : quizForm.correctAnswer,
                    })
                  }}
                  required
                />
              </div>
            ))}
            <p style={{ fontSize: 12, color: 'var(--text-secondary-light)', marginTop: 4 }}>
              Click the label button on the left to mark the correct answer
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setQuizModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting} id="submit-quiz-btn">
              {submitting ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
