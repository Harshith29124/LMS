import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { lessonAPI, quizAPI, progressAPI } from '../services/api'
import VideoPlayer from '../components/VideoPlayer'
import LessonList from '../components/LessonList'
import QuizCard from '../components/QuizCard'
import ReactMarkdown from 'react-markdown'
import { CheckCircle, ChevronLeft, ChevronRight, Layout, BookOpen, Layers, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [lessons, setLessons] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [progress, setProgress] = useState({ completedLessons: [], percentage: 0 })
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
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

        try {
          const quizRes = await quizAPI.getForLesson(lessonId)
          setQuiz(quizRes.data)
        } catch {
          setQuiz(null)
        }
      } catch {
        toast.error('Failed to synchronize lesson module')
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
      toast.success('Milestone synchronized! ✅')
    } catch {
      toast.error('Failed to register progress')
    } finally {
      setCompleting(false)
    }
  }

  const currentIndex = lessons.findIndex((l) => l._id === lessonId)
  const prevLesson = lessons[currentIndex - 1]
  const nextLesson = lessons[currentIndex + 1]
  const isCompleted = progress.completedLessons.includes(lessonId)

  if (loading) return (
    <div className="flex gap-10 animate-pulse h-[80vh]">
        <div className="flex-1 space-y-6">
            <div className="aspect-video glass-panel rounded-[3rem]" />
            <div className="h-40 glass-panel rounded-3xl" />
        </div>
        <div className="w-80 glass-panel rounded-3xl hidden lg:block" />
    </div>
  )

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
      {/* Immersive Learning Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-black/5 dark:border-white/5 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <Link 
            to={`/courses/${courseId}`} 
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </Link>
          <div className="min-w-0">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary hidden sm:block">Learning System</h4>
             <h1 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white truncate">{lesson?.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end px-4 border-r border-black/10 dark:border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase">Progress</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{progress.percentage}%</p>
             </div>
             <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-3 rounded-2xl transition-all active:scale-95 border ${sidebarOpen ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-slate-500'}`}
             >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-10 relative">
        {/* Playback & Content Column */}
        <div className="flex-1 space-y-8 min-w-0">
           {/* Primary Player */}
           <div className="glass-panel overflow-hidden rounded-[3rem] shadow-2xl border-black/5 dark:border-white/5">
              <VideoPlayer url={lesson?.videoUrl} />
           </div>

           {/* Module Information Details */}
           <div className="glass-panel p-8 lg:p-12 rounded-[3.5rem] border-black/5 dark:border-white/5 space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-black/5 dark:border-white/5">
                 <div className="space-y-2">
                    <div className="flex items-center gap-3 text-brand-primary">
                        <Layers size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Module Details</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">{lesson?.title}</h2>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest italic">Lesson {currentIndex + 1} of {lessons.length}</p>
                 </div>

                 <button
                    onClick={handleComplete}
                    disabled={completing || isCompleted}
                    className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 ${
                        isCompleted 
                        ? 'bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20' 
                        : 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 hover:scale-[1.02]'
                    }`}
                   >
                    <CheckCircle size={18} />
                    {isCompleted ? 'Completed' : completing ? 'Syncing...' : 'Mark Complete'}
                  </button>
              </div>

              {/* Technical Documentation Layer */}
              {lesson?.content && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-slate-500">
                        <BookOpen size={18} />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em]">Documentation</h3>
                    </div>
                    <div className="markdown-viewer text-slate-600 dark:text-slate-300 leading-relaxed text-lg prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{lesson.content}</ReactMarkdown>
                    </div>
                </div>
              )}

              {/* Knowledge Check Layer */}
              {quiz && (
                 <div className="pt-10 border-t border-black/5 dark:border-white/5 space-y-8">
                    <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
                        <Layout size={18} />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em]">Quiz</h3>
                    </div>
                    <QuizCard quiz={quiz} onComplete={handleComplete} />
                 </div>
              )}
           </div>

           {/* Sequence Navigation Navigation */}
           <div className="flex items-center justify-between pt-6">
              <button
                className={`p-4 md:px-8 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl flex items-center gap-3 text-sm font-black uppercase tracking-widest transition-all ${!prevLesson ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 text-slate-800 dark:text-white'}`}
                onClick={() => prevLesson && navigate(`/courses/${courseId}/lessons/${prevLesson._id}`)}
                disabled={!prevLesson}
              >
                <ChevronLeft size={20} /> <span className="hidden sm:inline">Previous</span>
              </button>
              
              <button
                className={`p-4 md:px-8 bg-brand-primary rounded-2xl flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-90 shadow-xl shadow-brand-primary/20`}
                onClick={() => {
                  if (nextLesson) navigate(`/courses/${courseId}/lessons/${nextLesson._id}`)
                  else navigate(`/courses/${courseId}`)
                }}
              >
                <span className="hidden sm:inline">{nextLesson ? 'Next Lesson' : 'Course Home'}</span> 
                {nextLesson ? <ChevronRight size={20} /> : <CheckCircle size={20} />}
              </button>
           </div>
        </div>

        {/* Integrated Navigation Sidebar */}
        <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ opacity: 0, x: 50, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 340 }}
                exit={{ opacity: 0, x: 50, width: 0 }}
                className="hidden xl:block overflow-hidden sticky top-24 h-[calc(100vh-120px)]"
              >
                <div className="glass-panel h-full rounded-[3rem] border-black/5 dark:border-white/5 flex flex-col p-8 overflow-hidden">
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <Layers size={18} className="text-brand-primary" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Curriculum</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
                        <LessonList
                            lessons={lessons}
                            activeLessonId={lessonId}
                            completedLessons={progress.completedLessons}
                            onSelect={(l) => navigate(`/courses/${courseId}/lessons/${l._id}`)}
                        />
                    </div>
                </div>
              </motion.aside>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}
