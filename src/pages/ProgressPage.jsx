import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { enrollmentAPI, progressAPI } from '../services/api'
import ProgressBar from '../components/ProgressBar'
import { SkeletonCard } from '../components/Skeleton'
import { TrendingUp, Award, BookOpen, Target, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProgressPage() {
  const [courses, setCourses] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const res = await enrollmentAPI.getMyEnrolled()
        const enrolled = res.data || []
        if (mounted) setCourses(enrolled)

        const progEntries = await Promise.all(
          enrolled.map(async (c) => {
            try {
              const p = await progressAPI.getCourseProgress(c._id)
              return [c._id, p.data]
            } catch {
              return [c._id, { percentage: 0, completed: 0, total: 0 }]
            }
          })
        )
        if (mounted) setProgressMap(Object.fromEntries(progEntries))
      } catch (err) {
        if (mounted) console.error('Progress Load Error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const completed = courses.filter((c) => (progressMap[c._id]?.percentage || 0) === 100)
  const inProgress = courses.filter((c) => {
    const p = progressMap[c._id]?.percentage || 0
    return p > 0 && p < 100
  })
  const notStarted = courses.filter((c) => (progressMap[c._id]?.percentage || 0) === 0)
  const avgProg = courses.length
    ? Math.round(courses.reduce((s, c) => s + (progressMap[c._id]?.percentage || 0), 0) / courses.length)
    : 0

  if (loading) return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 glass-panel rounded-3xl animate-pulse" />)}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-32 glass-panel rounded-3xl animate-pulse" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white">Learning Progress</h1>
          <p className="text-slate-400 mt-2">Track your growth and milestone across all enrolled courses</p>
        </div>
        <div className="premium-badge bg-green-500/10 text-green-500 border-green-500/20 px-4 py-2 text-sm">
          {completed.length} Courses Completed
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg Progress', value: `${avgProg}%`, icon: TrendingUp, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          { label: 'Completed', value: completed.length, icon: Award, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'In Progress', value: inProgress.length, icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Not Started', value: notStarted.length, icon: BookOpen, color: 'text-slate-400', bg: 'bg-slate-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            whileHover={{ y: -5 }}
            className="glass-panel p-6 rounded-[2rem] flex items-center gap-5"
          >
            <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-7 h-7 ${color}`} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">{value}</p>
              <p className="text-sm text-slate-400 font-medium">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {courses.length > 0 ? (
          courses.map((course) => {
            const prog = progressMap[course._id] || { percentage: 0, completed: 0, total: 0 }
            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel group p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 transition-all hover:bg-white/5"
              >
                <div className="relative w-40 h-24 rounded-2xl overflow-hidden shadow-lg shadow-black/40">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
                    {course.category}
                  </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors">{course.title}</h3>
                      <p className="text-sm text-slate-500">Instructor: {course.instructorId?.name}</p>
                    </div>
                    <span className={`text-lg font-black ${prog.percentage === 100 ? 'text-green-500' : 'text-brand-primary'}`}>
                      {prog.percentage}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <ProgressBar value={prog.percentage} height={8} />
                    <div className="flex justify-between text-xs font-bold text-slate-500 tracking-wider">
                      <span>{prog.completed || 0} / {prog.total || 0} LESSONS COMPLETED</span>
                      {prog.percentage === 100 && <span className="text-green-500">CERTIFICATE READY</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/courses/${course._id}`)}
                  className="premium-button flex items-center gap-2 group/btn"
                >
                  {prog.percentage === 100 ? 'Review' : 'Continue Learning'}
                  <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )
          })
        ) : (
          <div className="glass-panel rounded-[3rem] p-16 text-center space-y-6">
            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-12 h-12 text-brand-primary" />
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-white">No active courses</h2>
              <p className="text-slate-400">Your learning journey hasn't started yet. Browse our catalog to find your next skill.</p>
            </div>
            <button onClick={() => navigate('/browse')} className="premium-button">
              Browse Catalog
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
