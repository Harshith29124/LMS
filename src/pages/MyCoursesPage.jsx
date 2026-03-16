import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { enrollmentAPI } from '../services/api'
import CourseCard from '../components/CourseCard'
import { BookOpen, Sparkles, Box } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await enrollmentAPI.getMyEnrolled()
        setCourses(res.data || [])
      } catch {
        toast.error('Failed to sync enrollment data')
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  if (loading) return (
    <div className="space-y-8 animate-pulse">
        <div className="h-40 glass-panel rounded-[3rem]" />
        <div className="course-grid">
            {[1, 2, 3].map((n) => <div key={n} className="h-80 glass-panel rounded-[2.5rem]" />)}
        </div>
    </div>
  )

  return (
    <div className="space-y-12 pb-20">
      {/* Immersive Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-panel p-10 lg:p-14 rounded-[4rem] overflow-hidden border-white/5"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -ml-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-primary">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Knowledge Assets</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white">My Library</h1>
                <p className="text-slate-400 max-w-sm">Manage your active learning paths and technical specializations across {courses.length} enrolled modules.</p>
            </div>
            
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5">
                <div className="text-right">
                    <p className="text-2xl font-black text-white leading-none">{courses.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Modules</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-right">
                    <p className="text-2xl font-black text-brand-primary leading-none">
                      {courses.filter(c => c.progress === 100).length}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Finished</p>
                </div>
            </div>
        </div>
      </motion.div>

      {/* Grid Content */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-white">Current Track</h2>
            <div className="h-px flex-1 bg-white/5 mx-8" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">A-Z</span>
        </div>

        {courses.length > 0 ? (
          <div className="course-grid">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} progress={course.progress} enrolled showProgress />
            ))}
          </div>
        ) : (
          <div className="glass-panel border-dashed border-white/10 rounded-[4rem] p-24 text-center space-y-8 border-2">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-800">
               <Box size={48} />
            </div>
            <div className="max-w-xs mx-auto space-y-3">
              <h3 className="text-2xl font-bold text-white">Library Empty</h3>
              <p className="text-slate-500">You haven't initialized any learning paths. Browse the architectural catalog to begin.</p>
            </div>
            <button 
                onClick={() => navigate('/browse')}
                className="premium-button px-10"
            >
              Browse Catalog
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
