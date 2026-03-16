import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { enrollmentAPI, progressAPI } from '../services/api'
import ProgressBar from '../components/ProgressBar'
import { SkeletonCard } from '../components/Skeleton'
import { TrendingUp, Award, BookOpen, Target } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProgressPage() {
  const [courses, setCourses] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await enrollmentAPI.getMyEnrolled()
        const enrolled = res.data || []
        setCourses(enrolled)

        // Fetch progress for each enrolled course
        const progEntries = await Promise.all(
          enrolled.map(async (c) => {
            try {
              const p = await progressAPI.getCourseProgress(c._id)
              return [c._id, p.data]
            } catch {
              return [c._id, { percentage: 0 }]
            }
          })
        )
        setProgressMap(Object.fromEntries(progEntries))
      } catch {
        toast.error('Failed to load progress')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Learning Progress</h1>
        <p style={{ color: 'var(--text-secondary-light)', fontSize: 15 }}>Track your learning journey</p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Avg Progress', value: `${avgProg}%`, icon: TrendingUp, color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
          { label: 'Completed', value: completed.length, icon: Award, color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
          { label: 'In Progress', value: inProgress.length, icon: Target, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
          { label: 'Not Started', value: notStarted.length, icon: BookOpen, color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card-flat" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary-light)' }}>{label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Course Progress List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
        </div>
      ) : courses.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {courses.map((course) => {
            const prog = progressMap[course._id] || { percentage: 0, completed: 0, total: 0 }
            return (
              <div key={course._id} className="card-flat" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {course.title}
                    </h3>
                    <ProgressBar value={prog.percentage} height={6} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary-light)' }}>
                        {prog.completed || 0} / {prog.total || '?'} lessons
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: prog.percentage === 100 ? '#22C55E' : '#6366F1' }}>
                        {prog.percentage}%
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/courses/${course._id}`)}
                    id={`progress-course-btn-${course._id}`}
                    style={{ flexShrink: 0 }}
                  >
                    {prog.percentage === 100 ? 'Review' : 'Continue'}
                  </button>
                </div>
              </div>
            )
          })}
        </motion.div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><TrendingUp size={36} color="#6366F1" /></div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>No progress yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary-light)' }}>Enroll in courses to track your progress</p>
          <button className="btn btn-primary" onClick={() => navigate('/browse')} id="browse-for-progress">Browse Courses</button>
        </div>
      )}
    </div>
  )
}
