import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courseAPI, lessonAPI, enrollmentAPI, progressAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import LessonList from '../components/LessonList'
import ProgressBar from '../components/ProgressBar'
import { BookOpen, Users, Clock, Tag, CheckCircle, Lock, PlayCircle, Trophy, Sparkles } from 'lucide-react'
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
        toast.error('Failed to load course details')
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
      toast.success('Congratulations! You are enrolled. 🎉')
      // Refresh progress after enrollment
      const progRes = await progressAPI.getCourseProgress(courseId)
      setProgress(progRes.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed')
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
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center">
         <X size={48} className="text-red-500" />
      </div>
      <h2 className="text-3xl font-black text-white">Course Not Found</h2>
      <button onClick={() => navigate('/browse')} className="premium-button">Back to Catalog</button>
    </div>
  )

  const videoSrc = `https://www.youtube.com/embed/videoseries?list=${course.playlist_id}`

  return (
    <div className="space-y-12 pb-20">
      {/* Mobile Video Player - Top */}
      <div className="lg:hidden w-full aspect-video rounded-3xl overflow-hidden glass-panel border-white/10 shadow-2xl">
        <iframe
          src={videoSrc}
          className="w-full h-full border-0"
          allowFullScreen
          title="Course Playlist"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Details & Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header Info */}
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
                  <p className="text-[10px] font-black text-slate-500 uppercase">Instructor</p>
                  <p className="text-sm font-bold text-white">{course.instructorId?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase">Resources</p>
                  <p className="text-sm font-bold text-white">{lessons.length} Lessons</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase">Rating</p>
                  <p className="text-sm font-bold text-white">4.9 (2.4k reviews)</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* About Section */}
          <section className="glass-panel p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4 text-white">
               <Sparkles className="text-brand-primary" />
               <h2 className="text-2xl font-black">About this course</h2>
            </div>
            <p className="text-slate-400 leading-relaxed whitespace-pre-line text-lg">
              {course.description}
            </p>
          </section>

          {/* Lessons List Section */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black text-white px-2">Course Curiculum</h2>
            <div className="glass-panel rounded-[2.5rem] overflow-hidden">
                <LessonList 
                  lessons={lessons} 
                  completedLessons={progress.completedLessons}
                  onSelect={(l) => {
                    if (enrolled) navigate(`/courses/${courseId}/lessons/${l._id}`)
                    else toast.error('Enroll now to access lessons')
                  }}
                />
                {lessons.length === 0 && (
                  <div className="p-20 text-center text-slate-500">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No lesson assets uploaded yet.</p>
                  </div>
                )}
            </div>
          </section>
        </div>

        {/* Right Column: Player & Enrollment */}
        <div className="space-y-8">
          {/* Desktop Player - Top of Right Column */}
          <div className="hidden lg:block w-full aspect-video rounded-[2.5rem] overflow-hidden glass-panel border-white/10 shadow-2xl sticky top-24">
            {/* If Not Enrolled, Show Thumbnail with Play Button Overlay */}
            {!enrolled ? (
              <div className="relative w-full h-full group cursor-pointer" onClick={handleEnroll}>
                <img src={course.thumbnail} className="w-full h-full object-cover opacity-50 transition-all group-hover:scale-105 duration-700" alt="" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="w-20 h-20 rounded-full bg-brand-primary flex items-center justify-center animate-pulse">
                     <PlayCircle className="w-10 h-10 text-white fill-white" />
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                src={videoSrc}
                className="w-full h-full border-0"
                allowFullScreen
                title="Course Playlist"
              />
            )}
          </div>

          <div className={`${enrolled ? '' : 'sticky top-24'} space-y-6`}>
            {/* Enrollment Status / CTA */}
            <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-brand-primary/20">
              {enrolled ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="text-green-500" />
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-wider">Access Granted</p>
                      <p className="text-[10px] font-bold text-green-500/80">Premium Playlist Unlocked</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                       <p className="text-sm font-black text-white uppercase">Your Progress</p>
                       <p className="text-2xl font-black text-brand-primary">{progress.percentage}%</p>
                     </div>
                     <ProgressBar value={progress.percentage} height={10} />
                     <p className="text-xs text-slate-500 font-bold text-center italic">
                        {progress.completed || 0} of {progress.total || lessons.length} lessons finished
                     </p>
                  </div>

                  <button 
                    onClick={() => {
                        const next = lessons.find(l => !progress.completedLessons.includes(l._id)) || lessons[0]
                        if (next) navigate(`/courses/${courseId}/lessons/${next._id}`)
                    }}
                    className="premium-button w-full shadow-lg shadow-brand-primary/20"
                  >
                    {progress.percentage === 100 ? 'Review Course' : 'Continue Learning'}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white">Unlock Course</h3>
                    <p className="text-slate-400 text-sm">Join the student community and master this topic today.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      'Full Access to YouTube Playlist',
                      'Lesson Assets & Resources',
                      'Certificate of Completion',
                      'Life-time Support Access'
                    ].map(feat => (
                      <div key={feat} className="flex items-center gap-3 text-slate-300">
                        <Trophy size={16} className="text-brand-secondary" />
                        <span className="text-xs font-bold">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="premium-button w-full"
                  >
                    {enrolling ? 'Processing...' : '🚀 Enroll For Free'}
                  </button>
                </div>
              )}
            </div>

            {/* Curriculum Summary for sidebar */}
            <div className="glass-panel p-8 rounded-[2.5rem] space-y-4">
               <h4 className="text-sm font-black text-white uppercase tracking-widest">Section Overview</h4>
               <div className="space-y-3">
                  {lessons.slice(0, 4).map((l, i) => (
                    <div key={l._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-brand-primary/20 transition-all">
                       <span className="text-xs font-black text-slate-600 group-hover:text-brand-primary">{String(i+1).padStart(2, '0')}</span>
                       <p className="text-xs font-bold text-slate-400 group-hover:text-white truncate flex-1">{l.title}</p>
                       {enrolled ? <PlayCircle size={14} className="text-slate-600 group-hover:text-brand-primary" /> : <Lock size={12} className="text-slate-800" />}
                    </div>
                  ))}
                  {lessons.length > 4 && (
                    <p className="text-[10px] text-center font-bold text-slate-600 pt-2 tracking-widest">+{lessons.length - 4} MORE ASSETS</p>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
