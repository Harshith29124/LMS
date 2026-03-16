import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import { courseAPI, enrollmentAPI } from '../services/api'
import CourseCard from '../components/CourseCard'
import { SkeletonCard } from '../components/Skeleton'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'DevOps', 'Other']

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
}

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, enrolledRes] = await Promise.all([
          courseAPI.getAll({ search, category }),
          enrollmentAPI.getMyEnrolled(),
        ])
        setCourses(coursesRes.data || [])
        setEnrolledIds((enrolledRes.data || []).map((c) => c._id))
      } catch {
        toast.error('Failed to load courses')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [search, category])

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Browse Courses</h1>
        <p style={{ color: 'var(--text-secondary-light)', fontSize: 15 }}>
          Discover {courses.length}+ courses from expert instructors
        </p>
      </motion.div>

      {/* Search + Filter bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {/* Search */}
        <div className="search-input" style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            id="browse-search"
            type="text"
            className="form-input"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* Category dropdown */}
        <div style={{ position: 'relative' }}>
          <Filter size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', zIndex: 1, pointerEvents: 'none' }} />
          <select
            id="browse-category"
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ paddingLeft: 36, paddingRight: 16, cursor: 'pointer' }}
          >
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Category pills */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            id={`category-pill-${cat}`}
            style={{
              padding: '6px 16px', borderRadius: 999,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${category === cat ? '#6366F1' : 'var(--border-light)'}`,
              background: category === cat ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: category === cat ? '#6366F1' : 'var(--text-secondary-light)',
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Courses grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
        </div>
      ) : courses.length > 0 ? (
        <motion.div
          variants={container} initial="hidden" animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}
        >
          {courses.map((course) => (
            <motion.div key={course._id} variants={item}>
              <CourseCard course={course} enrolled={enrolledIds.includes(course._id)} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ fontSize: 40 }}>🔍</div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>No courses found</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary-light)' }}>
            Try a different search term or category
          </p>
          <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory('All') }}>Clear filters</button>
        </div>
      )}
    </div>
  )
}
