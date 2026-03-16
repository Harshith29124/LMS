import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useWatchProgress } from '../hooks/useWatchProgress'
import { enrollmentAPI, courseAPI } from '../services/api'
import CourseCard from '../components/CourseCard'
import ProgressBar from '../components/ProgressBar'
import { BookOpen, TrendingUp, Award, Clock, ArrowRight, Zap, PlayCircle } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { getLastWatched } = useWatchProgress()
  const [myCourses, setMyCourses] = useState([])
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const lastWatched = getLastWatched()

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [enrolledRes, allRes] = await Promise.all([
          enrollmentAPI.getMyEnrolled(),
          courseAPI.getAll(),
        ])
        if (mounted) {
          setMyCourses(enrolledRes.data || [])
          setFeaturedCourses((allRes.data || []).slice(0, 3))
        }
      } catch (err) {
        if (mounted) console.error('Dashboard load error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false; };
  }, [])

  const avgProgress = myCourses.length
    ? Math.round(myCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / myCourses.length)
    : 0

  const stats = [
    { label: 'Enrolled', value: myCourses.length, icon: BookOpen, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { label: 'Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Completed', value: myCourses.filter(c => c.progress === 100).length, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Hours', value: `${myCourses.length * 4}h`, icon: Clock, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  ]

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-48 glass-panel rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 glass-panel rounded-xl" />)}
      </div>
      <div className="h-48 glass-panel rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative glass-panel p-8 lg:p-10 rounded-2xl border-black/5 dark:border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="relative z-10 max-w-xl space-y-4">
            <div className="flex items-center gap-2 text-brand-primary">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Welcome back</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              Hey, {user?.name?.split(' ')[0]}
            </h1>
            
            <p className="text-sm text-slate-500 leading-relaxed">
              {myCourses.length > 0 
                ? `You're enrolled in ${myCourses.length} course${myCourses.length > 1 ? 's' : ''} with ${avgProgress}% average progress.`
                : "Start your learning journey by browsing our course catalog."
              }
            </p>

            <button 
              onClick={() => navigate(myCourses.length > 0 ? '/my-courses' : '/browse')}
              className="premium-button flex items-center gap-2 text-sm"
            >
              {myCourses.length > 0 ? 'My Courses' : 'Browse Courses'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Continue Learning Card */}
      {lastWatched && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div 
            onClick={() => navigate(`/courses/${lastWatched.courseId}`)}
            className="glass-panel p-5 rounded-2xl border-black/5 dark:border-white/5 flex items-center gap-5 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            {/* Thumbnail */}
            <div className="relative w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-800">
              {lastWatched.thumbnail && (
                <img src={lastWatched.thumbnail} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle size={24} className="text-white" />
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1">Continue Learning</p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-primary transition-colors">
                {lastWatched.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{lastWatched.courseTitle}</p>
            </div>

            {/* Resume Button */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
              <PlayCircle size={14} />
              Resume
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div 
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel p-5 rounded-xl flex items-center gap-4 border-black/5 dark:border-white/5"
          >
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Course Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Courses */}
        <div className="xl:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Courses</h2>
            {myCourses.length > 0 && (
              <button onClick={() => navigate('/my-courses')} className="text-brand-primary text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight size={14} />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCourses.length > 0 ? (
              myCourses.slice(0, 4).map((course) => (
                <CourseCard key={course._id} course={course} progress={course.progress} enrolled showProgress />
              ))
            ) : (
              <div className="md:col-span-2 glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 border-black/5 dark:border-white/5">
                <BookOpen className="text-slate-300 dark:text-slate-700" size={32} />
                <p className="text-sm text-slate-500 font-medium">No courses yet</p>
                <button onClick={() => navigate('/browse')} className="text-brand-primary text-xs font-bold">
                  Browse catalog →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Featured Sidebar */}
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Featured</h2>
          <div className="space-y-3">
            {featuredCourses.map(course => (
              <motion.div 
                key={course._id}
                whileHover={{ x: 4 }}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="glass-panel p-3.5 rounded-xl flex items-center gap-3 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-brand-primary uppercase">{course.category}</p>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate group-hover:text-brand-primary transition-colors">{course.title}</h4>
                </div>
                <ArrowRight size={14} className="text-slate-300 dark:text-slate-700 group-hover:text-brand-primary flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
