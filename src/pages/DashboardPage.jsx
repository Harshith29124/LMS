import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { enrollmentAPI, courseAPI } from '../services/api'
import CourseCard from '../components/CourseCard'
import { BookOpen, TrendingUp, Award, Clock, ArrowRight, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [myCourses, setMyCourses] = useState([])
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loading, setLoading] = useState(true)

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
        if (mounted) {
          console.error('Core Sync Failure:', err);
          // Toast moved to a single point of failure check if needed, 
          // but we'll let the UI handle the 'No data' state gracefully now
        }
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
    { label: 'Courses', value: myCourses.length, icon: BookOpen, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { label: 'Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Certificates', value: myCourses.filter(c => c.progress === 100).length, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Time Spent', value: `${myCourses.length * 4}h`, icon: Clock, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  ]

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-64 glass-panel rounded-[3rem]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 glass-panel rounded-2xl" />)}
      </div>
      <div className="h-48 glass-panel rounded-3xl" />
    </div>
  )

  return (
    <div className="space-y-12">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-brand-secondary/10 to-transparent blur-3xl rounded-[3rem]" />
        <div className="relative glass-panel p-10 lg:p-14 rounded-[3rem] border-white/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="flex items-center gap-3 text-brand-primary mb-2">
              <Zap className="w-5 h-5 fill-current" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Learning Environment Active</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight">
              Welcome back, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                {user?.name.split(' ')[0]}
              </span>.
            </h1>
            
            <p className="text-lg text-slate-400 leading-relaxed">
              {myCourses.length > 0 
                ? `You're currently enrolled in ${myCourses.length} courses. Your average completion rate is ${avgProgress}%. Ready to dive back in?`
                : "You haven't started any courses yet. Transform your career today with our expert-led curiculum."
              }
            </p>

            <button 
              onClick={() => navigate(myCourses.length > 0 ? '/my-courses' : '/browse')}
              className="premium-button flex items-center gap-4 group/btn"
            >
              {myCourses.length > 0 ? 'Resume Learning' : 'Start Exploring'}
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div 
            key={label}
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-6 rounded-3xl flex items-center gap-5 border-white/5"
          >
            <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-7 h-7 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Course Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Continue Learning */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">Continure Learning</h2>
            <button onClick={() => navigate('/my-courses')} className="text-brand-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              See All <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCourses.length > 0 ? (
              myCourses.slice(0, 2).map((course) => (
                <CourseCard key={course._id} course={course} progress={course.progress} enrolled showProgress />
              ))
            ) : (
              <div className="md:col-span-2 h-64 glass-card border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <BookOpen className="text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium italic">You haven't enrolled in any courses yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended / Featured Sidebar */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-white">Recommended</h2>
          <div className="space-y-4">
            {featuredCourses.map(course => (
              <motion.div 
                key={course._id}
                whileHover={{ x: 10 }}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="glass-panel p-4 rounded-3xl flex items-center gap-4 cursor-pointer group hover:bg-white/5 active:scale-95 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-brand-primary uppercase mb-1">{course.category}</p>
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-primary transition-colors">{course.title}</h4>
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-white" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
