import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courseAPI, lessonAPI, enrollmentAPI, progressAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import LessonList from '../components/LessonList'
import ProgressBar from '../components/ProgressBar'
import VideoPlayer from '../components/VideoPlayer'
import { BookOpen, Users, Star, CheckCircle, Lock, PlayCircle, Trophy, Sparkles, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState({ percentage: 0, completedLessons: [] })
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes, enrollRes] = await Promise.all([
          courseAPI.getById(courseId),
          lessonAPI.getForCourse(courseId),
          enrollmentAPI.checkEnrollment(courseId),
        ])
        setCourse(courseRes.data)
        setLessons(lessonsRes.data || [])
        setEnrolled(enrollRes.data.enrolled)

        if (enrollRes.data.enrolled) {
          const progRes = await progressAPI.getCourseProgress(courseId)
          setProgress(progRes.data)
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to load system metadata')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [courseId])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await enrollmentAPI.enroll(courseId)
      setEnrolled(true)
      toast.success('Access Link Established. Profile Updated. 🎉')
      const progRes = await progressAPI.getCourseProgress(courseId)
      setProgress(progRes.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Synchronization failed')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-64 glass-panel rounded-[3rem]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 glass-panel rounded-3xl" />
          <div className="h-96 glass-panel rounded-3xl" />
        </div>
        <div className="h-80 glass-panel rounded-3xl" />
      </div>
    </div>
  )

  if (!course) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center">
         <X size={48} className="text-rose-500" />
      </div>
      <h2 className="text-3xl font-black text-white">Course Index Missing</h2>
      <button onClick={() => navigate('/browse')} className="premium-button">Back to Catalog</button>
    </div>
  )

  const DEFAULT_PLAYLIST = 'PLWKjhJtqVAbnSe1qUNMG7AbPmjIG54u88'

  return (
    <div className="space-y-12 pb-20">
      {/* Mobile Feed Overlay - Top */}
      <div className="lg:hidden w-full aspect-video rounded-3xl overflow-hidden glass-panel border-white/10 shadow-2xl">
         <VideoPlayer url={course.playlist_id || DEFAULT_PLAYLIST} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Module Diagnostics & Content */}
        <div className="lg:col-span-2 space-y-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="premium-badge">{course.category}</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-slate-400">
                {course.level}
              </span>
            </div>
            <h1 className="text-5xl font-black text-white mb-6 leading-tight">{course.title}</h1>
            
            <div className="flex flex-wrap gap-8 py-6 border-y border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                   <Users className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase">Lead Engineer</p>
                   <p className="text-sm font-bold text-white">{course.instructorId?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                   <PlayCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase">Data Modules</p>
                   <p className="text-sm font-bold text-white">{lessons.length} Lessons</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                   <Star className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase">Trust Level</p>
                   <p className="text-sm font-bold text-white">4.9 System Rating</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Documentation Section */}
          <section className="glass-panel p-8 lg:p-12 rounded-[3.5rem] space-y-8">
            <div className="flex items-center gap-4 text-white">
               <Sparkles className="text-brand-primary" />
               <h2 className="text-2xl font-black uppercase tracking-widest">Protocol Description</h2>
            </div>
            <p className="text-slate-400 leading-relaxed whitespace-pre-line text-lg prose prose-invert">
              {course.description}
            </p>
          </section>

          {/* Curriculum Mapping Section */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black text-white px-2 uppercase tracking-widest">Curiculum Index</h2>
            <div className="glass-panel rounded-[4rem] overflow-hidden border-white/5 shadow-2xl">
                <LessonList 
                  lessons={lessons} 
                  completedLessons={progress.completedLessons}
                  onSelect={(l) => {
                    if (enrolled) navigate(`/courses/${courseId}/lessons/${l._id}`)
                    else toast.error('Enrollment required for module access')
                  }}
                />
                {lessons.length === 0 && (
                  <div className="p-24 text-center text-slate-800">
                    <BookOpen size={64} className="mx-auto mb-6 opacity-10" />
                    <p className="font-bold uppercase tracking-[0.2em] text-sm">No data assets programmed yet.</p>
                  </div>
                )}
            </div>
          </section>
        </div>

        {/* System Operations Column */}
        <div className="space-y-8">
          {/* Primary Visual Interface */}
          <div className="hidden lg:block w-full sticky top-24">
            {!enrolled ? (
              <div className="relative aspect-video rounded-[3rem] overflow-hidden glass-panel border-white/10 shadow-2xl group cursor-pointer" onClick={handleEnroll}>
                <img src={course.thumbnail} className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="w-20 h-20 rounded-[2rem] bg-brand-primary flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                     <PlayCircle className="w-10 h-10 text-white fill-white" />
                  </div>
                </div>
              </div>
            ) : (
              <VideoPlayer url={course.playlist_id || DEFAULT_PLAYLIST} />
            )}
          </div>

          <div className={`${enrolled ? '' : 'sticky top-24'} space-y-6`}>
            {/* Enrollment Logic Panel */}
            <div className="glass-panel p-8 lg:p-10 rounded-[3.5rem] space-y-8 border-brand-primary/10 bg-gradient-to-br from-white/[0.02] to-transparent">
              {enrolled ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="text-green-500" />
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Access Identity Verified</p>
                      <p className="text-xs font-bold text-green-500/80 italic">Authorized for Full Catalog Feed</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-end px-2">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synchronization</p>
                       <p className="text-2xl font-black text-white">{progress.percentage}%</p>
                     </div>
                     <ProgressBar value={progress.percentage} height={8} />
                     <p className="text-[10px] text-slate-500 font-bold text-center uppercase tracking-widest">
                        {progress.completed || 0} / {lessons.length} Modules Finalized
                     </p>
                  </div>

                  <button 
                    onClick={() => {
                        const next = lessons.find(l => !progress.completedLessons.includes(l._id)) || lessons[0]
                        if (next) navigate(`/courses/${courseId}/lessons/${next._id}`)
                    }}
                    className="premium-button w-full shadow-2xl shadow-brand-primary/30"
                  >
                    {progress.percentage === 100 ? 'Reset Simulation' : 'Continue Synchronization'}
                  </button>
                </div>
              ) : (
                <div className="space-y-10 text-center lg:text-left">
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Initialize Access</h3>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed">Bridge your profile to this module to unlock the full technical feed.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      'Real-time Playlist Linkage',
                      'Internal Module Documentation',
                      'System Validation Quizzes',
                      'Technical Badge of Merit'
                    ].map(feat => (
                      <div key={feat} className="flex items-center gap-4 text-slate-400">
                        <Trophy size={14} className="text-brand-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="premium-button w-full text-sm py-5"
                  >
                    {enrolling ? 'Establishing Link...' : '🚀 Synchronize Now'}
                  </button>
                </div>
              )}
            </div>

            {/* Curriculum Preview Tracker */}
            <div className="glass-panel p-8 lg:p-10 rounded-[3.5rem] space-y-6">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Module Sequence</h4>
               <div className="space-y-4">
                  {lessons.slice(0, 5).map((l, i) => (
                    <div key={l._id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-crosshair">
                       <span className="text-[10px] font-black text-slate-700 group-hover:text-brand-primary transition-colors">{String(i+1).padStart(2, '0')}</span>
                       <p className="text-[10px] font-black text-slate-500 group-hover:text-white truncate flex-1 tracking-wider">{l.title}</p>
                       {enrolled ? <PlayCircle size={14} className="text-brand-primary animate-pulse" /> : <Lock size={12} className="text-slate-800" />}
                    </div>
                  ))}
                  {lessons.length > 5 && (
                    <p className="text-[9px] text-center font-black text-slate-700 pt-4 uppercase tracking-[0.4em]">+{lessons.length - 5} Encrypted Assets</p>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
