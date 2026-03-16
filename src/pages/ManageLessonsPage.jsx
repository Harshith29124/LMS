import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { lessonAPI, quizAPI, courseAPI } from '../services/api'
import Modal from '../components/Modal'
import { ArrowLeft, Plus, Trash2, HelpCircle, CheckCircle, Video, FileText, ChevronRight, Clock, Hash, Layout } from 'lucide-react'
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
        toast.error('Failed to load asset index')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [courseId])

  const handleAddLesson = async (e) => {
    e.preventDefault()
    if (!lessonForm.title.trim()) return toast.error('Asset identity required')
    setSubmitting(true)
    try {
      const res = await lessonAPI.create(courseId, { ...lessonForm, order: lessons.length })
      setLessons((prev) => [...prev, res.data])
      setLessonModal(false)
      setLessonForm({ title: '', content: '', videoUrl: '', order: 0, duration: '10 min' })
      toast.success('Asset integrated into curiculum')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sync asset')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to decouple this asset from the curiculum?')) return
    try {
      await lessonAPI.delete(lessonId)
      setLessons((prev) => prev.filter((l) => l._id !== lessonId))
      toast.success('Asset removed successfully')
    } catch {
      toast.error('Failed to delete asset')
    }
  }

  const handleAddQuiz = async (e) => {
    e.preventDefault()
    if (!quizForm.question.trim()) return toast.error('Knowledge check requires a question')
    if (quizForm.options.some((o) => !o.trim())) return toast.error('Four-option set is mandatory')
    if (!quizForm.correctAnswer) return toast.error('Designate a valid key')
    setSubmitting(true)
    try {
      await quizAPI.create(selectedLesson._id, quizForm)
      setQuizModal(false)
      setQuizForm({ question: '', options: ['', '', '', ''], correctAnswer: '' })
      toast.success('Knowledge check initialized')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register quiz data')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="space-y-6 animate-pulse">
        <div className="h-20 glass-panel rounded-3xl" />
        {[1,2,3,4].map(i => <div key={i} className="h-24 glass-panel rounded-[2rem]" />)}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6 min-w-0">
            <button 
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-all active:scale-95" 
              onClick={() => navigate('/instructor')}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-3xl font-black text-white truncate">Curriculum Console</h1>
              <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.2em]">{course?.title}</p>
            </div>
        </div>
        <button
          className="premium-button flex items-center gap-3 whitespace-nowrap"
          onClick={() => setLessonModal(true)}
        >
          <Plus size={20} /> Deploy New Asset
        </button>
      </header>

      {/* Assets Integrated List */}
      <div className="space-y-4">
        {lessons.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel group p-6 rounded-[2.5rem] flex items-center gap-6 border-white/5 hover:bg-white/5 transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-[1.25rem] border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-brand-primary/20 transition-all">
                  <span className="text-xl font-black text-brand-primary">{String(index + 1).padStart(2, '0')}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors truncate">{lesson.title}</h3>
                  <div className="flex flex-wrap items-center gap-6 mt-1">
                    {lesson.videoUrl && (
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300">
                        <Video size={12} className="text-brand-primary" /> Visual Module
                      </span>
                    )}
                    {lesson.content && (
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300">
                        <FileText size={12} className="text-brand-secondary" /> Documentation
                      </span>
                    )}
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                      <Clock size={12} /> {lesson.duration || '10 min'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="p-3 bg-white/5 hover:bg-brand-primary/20 border border-white/5 hover:border-brand-primary/30 rounded-2xl text-slate-400 hover:text-brand-primary transition-all active:scale-95 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                    onClick={() => { setSelectedLesson(lesson); setQuizModal(true) }}
                    title="Design Assessment"
                  >
                    <HelpCircle size={18} />
                  </button>
                  <button
                    className="p-3 bg-rose-500/5 hover:bg-rose-500 border border-white/5 hover:border-rose-500 rounded-2xl text-rose-500 hover:text-white transition-all active:scale-95"
                    onClick={() => handleDeleteLesson(lesson._id)}
                    title="De-sync Asset"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="glass-panel border-dashed border-white/10 rounded-[3rem] p-20 text-center space-y-8">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
               <Layout size={48} />
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              <h3 className="text-2xl font-bold text-white">Curriculum Empty</h3>
              <p className="text-slate-500">Every module starts with a single asset. Deploy your first lesson now.</p>
            </div>
            <button 
                onClick={() => setLessonModal(true)}
                className="premium-button"
            >
              Add First Module
            </button>
          </div>
        )}
      </div>

      {/* Asset Deployment Modal */}
      <Modal open={lessonModal} onClose={() => setLessonModal(false)} title="Module Deployment">
        <form onSubmit={handleAddLesson} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
               <Type size={12} /> Module Identity
            </label>
            <input
              type="text"
              className="input-field text-base font-bold"
              placeholder="e.g. Architecture Principles of React"
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                   <Video size={12} /> Visual Link
                </label>
                <input
                    type="url"
                    className="input-field text-xs py-3"
                    placeholder="YouTube/Vimeo Source URL"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                />
            </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                   <Clock size={12} /> Expected Duration
                </label>
                <input
                    type="text"
                    className="input-field text-xs py-3"
                    placeholder="e.g. 15:00 min"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
               <Hash size={12} /> Technical Documentation (Markdown)
            </label>
            <textarea
              className="input-field min-h-[160px] text-sm font-mono leading-relaxed"
              placeholder="# Implementation Details&#10;Describe technical specs or core concepts..."
              value={lessonForm.content}
              onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" className="flex-1 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold transition-all active:scale-95" onClick={() => setLessonModal(false)}>
              Discard
            </button>
            <button type="submit" className="flex-[2] premium-button" disabled={submitting}>
              {submitting ? 'Syncing...' : 'Deploy Module'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assessment Design Modal */}
      <Modal open={quizModal} onClose={() => setQuizModal(false)} title={`Assessment: ${selectedLesson?.title}`} maxWidth={600}>
        <form onSubmit={handleAddQuiz} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Critical Question</label>
            <textarea
              className="input-field min-h-[100px] text-lg font-bold leading-tight"
              placeholder="Design a question that validates comprehension..."
              value={quizForm.question}
              onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Option Set & Calibration</label>
            {['A', 'B', 'C', 'D'].map((label, i) => (
              <div key={label} className="flex items-center gap-4 group">
                <button
                  type="button"
                  onClick={() => setQuizForm({ ...quizForm, correctAnswer: quizForm.options[i] })}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all active:scale-90 flex-shrink-0 border-2 ${
                    quizForm.correctAnswer === quizForm.options[i] && quizForm.options[i] 
                      ? 'bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                      : 'bg-white/5 border-white/5 text-slate-600 hover:border-brand-primary/30 group-hover:text-brand-primary'
                  }`}
                >
                  {quizForm.correctAnswer === quizForm.options[i] && quizForm.options[i] ? <CheckCircle size={20} /> : label}
                </button>
                <input
                  type="text"
                  className="input-field py-3 text-sm font-bold"
                  placeholder={`Distractor Option ${label}`}
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
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center pt-4 italic">
              * Click the letter circle to mark the correct validation key
            </p>
          </div>

          <div className="flex gap-4">
            <button type="button" className="flex-1 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold transition-all active:scale-95" onClick={() => setQuizModal(false)}>
              Discard
            </button>
            <button type="submit" className="flex-[2] premium-button" disabled={submitting}>
              {submitting ? 'Registering...' : 'Seal Knowledge Check'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
