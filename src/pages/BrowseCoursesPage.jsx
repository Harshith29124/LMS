import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Sparkles, BookCopy } from 'lucide-react'
import { courseAPI, enrollmentAPI } from '../services/api'
import CourseCard from '../components/CourseCard'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'DevOps', 'Other']

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const [coursesRes, enrolledRes] = await Promise.all([
          courseAPI.getAll({ search, category }),
          enrollmentAPI.getMyEnrolled(),
        ])
        if (mounted) {
          setCourses(coursesRes.data || [])
          setEnrolledIds((enrolledRes.data || []).map((c) => c._id))
        }
      } catch (err) {
        if (mounted) console.error('Browse Load Error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [search, category])

  return (
    <div className="space-y-12">
      {/* Header with Search & Filter */}
      <div className="relative glass-panel rounded-[3rem] p-10 lg:p-14 overflow-hidden border-black/5 dark:border-white/5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -ml-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">Learn. Build. Glow.</h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm font-medium">Discover {courses.length}+ expert-led programs designed for your digital transformation.</p>
          </div>

          <div className="flex-1 max-w-xl flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
              <input
                type="text"
                placeholder="Find your next path..."
                className="input-field pl-14"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                className="input-field pl-12 cursor-pointer appearance-none pr-10"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{cat}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
              category === cat 
                ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/30' 
                : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-black/10 dark:hover:border-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="course-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 glass-panel rounded-[2.5rem] animate-pulse" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard 
              key={course._id} 
              course={course} 
              enrolled={enrolledIds.includes(course._id)} 
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-[3rem] p-20 text-center flex flex-col items-center gap-6 border-black/5 dark:border-white/5">
          <div className="w-24 h-24 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400">
            <Sparkles size={48} />
          </div>
          <div className="max-w-xs mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Library Empty</h3>
            <p className="text-slate-500">We couldn't find any modules matching your search filters. Try again.</p>
          </div>
          <button 
            onClick={() => { setSearch(''); setCategory('All') }}
            className="premium-button"
          >
            Reset Catalog
          </button>
        </div>
      )}

      {/* Footer / CTA */}
      <div className="glass-panel p-10 rounded-[3rem] flex flex-col lg:flex-row items-center justify-between gap-8 border-brand-primary/10">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20">
            <BookCopy className="w-8 h-8 text-brand-primary" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Contribute modules?</h4>
            <p className="text-slate-500 text-sm font-medium">Join our expert collective and share your knowledge globally.</p>
          </div>
        </div>
        <button className="premium-button whitespace-nowrap">Apply Today</button>
      </div>
    </div>
  )
}
