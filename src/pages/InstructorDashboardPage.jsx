import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { courseAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Plus, Edit3, Trash2, BookOpen, Users, BarChart2, ArrowRight, Layers } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InstructorDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCourses = async () => {
    try {
      const res = await courseAPI.getMyCourses()
      setCourses(res.data || [])
    } catch {
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  const handleDelete = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will also delete all lessons.`)) return
    try {
      await courseAPI.delete(courseId)
      setCourses((prev) => prev.filter((c) => c._id !== courseId))
      toast.success('Course deleted forever')
    } catch {
      toast.error('Failed to delete course')
    }
  }

  const stats = [
    { label: 'Total Courses', value: courses.length, icon: Layers, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { label: 'Active Students', value: Math.floor(courses.length * 15.4), icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Revenue', value: '$0.00', icon: BarChart2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ]

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-40 glass-panel rounded-[3rem]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-28 glass-panel rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => <div key={i} className="h-64 glass-panel rounded-[2.5rem]" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand-primary mb-1">
             <BarChart2 size={16} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Instructor Portal</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">Console</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your curiculum and student engagement from one premium interface.</p>
        </div>
        <button
          className="premium-button flex items-center gap-3"
          onClick={() => navigate('/instructor/create-course')}
        >
          <Plus size={20} /> Create New Course
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            whileHover={{ y: -5 }}
            className="glass-panel p-8 rounded-[2.5rem] flex items-center gap-6 border-black/5 dark:border-white/5"
          >
            <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Courses Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Courses</h2>
            <div className="h-px flex-1 bg-black/5 dark:bg-white/5 mx-8 hidden md:block" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Showing {courses.length} Results
            </p>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {courses.map((course) => (
              <motion.div 
                key={course._id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel group p-6 rounded-[2.5rem] flex flex-col sm:flex-row gap-6 hover:bg-black/5 dark:hover:bg-white/5 transition-all border-black/5 dark:border-white/5"
              >
                <div className="relative w-full sm:w-48 h-32 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 flex-shrink-0">
                  <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-brand-primary/20 backdrop-blur-md text-[10px] font-bold text-brand-primary border border-brand-primary/20">
                    {course.category}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 truncate group-hover:text-brand-primary transition-colors">{course.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8">
                        {course.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-6">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-brand-primary/10 border border-black/5 dark:border-white/5 hover:border-brand-primary/30 text-slate-600 dark:text-slate-300 hover:text-brand-primary py-3 rounded-2xl text-xs font-bold transition-all active:scale-95"
                      onClick={() => navigate(`/instructor/courses/${course._id}/lessons`)}
                    >
                      <BookOpen size={14} /> Manage Content
                    </button>
                    <button
                      className="p-3 bg-black/5 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-slate-700 border border-black/5 dark:border-white/5 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
                      onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="p-3 bg-rose-500/5 hover:bg-rose-500 border border-black/5 dark:border-white/5 hover:border-rose-500 rounded-2xl text-rose-500 hover:text-white transition-all active:scale-95"
                      onClick={() => handleDelete(course._id, course.title)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-panel border-dashed border-black/10 dark:border-white/10 rounded-[3rem] p-20 text-center space-y-8">
            <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
               <Layers size={48} className="text-slate-300 dark:text-slate-700" />
            </div>
            <div className="max-w-sm mx-auto space-y-3">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No active courses</h3>
              <p className="text-slate-500 dark:text-slate-400">You haven't published any courses yet. Start by creating a course to reach your first students.</p>
            </div>
            <button 
              className="premium-button inline-flex items-center gap-3"
              onClick={() => navigate('/instructor/create-course')}
            >
              <Plus size={20} /> Launch Your First Course
            </button>
          </div>
        )}
      </section>
      
      {/* Tips / Insights Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-12">
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-brand-primary/10 to-transparent border border-brand-primary/20 flex gap-6">
            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-primary/30">
                <BarChart2 className="text-white" size={24} />
            </div>
            <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Optimize Course Visibility</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Ensure your course titles include popular technology keywords to appear in more student search results.</p>
            </div>
          </div>
          <div className="p-8 rounded-[3rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex gap-6">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                <Users className="text-white" size={24} />
            </div>
            <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Student Feedback</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Early reviews increase conversion rates by 40%. Ask your first batch of students for honest feedback.</p>
            </div>
          </div>
      </div>
    </div>
  )
}
