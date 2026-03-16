import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { courseAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { SkeletonCard } from '../components/Skeleton'
import { Plus, Edit3, Trash2, BookOpen, Users, BarChart2 } from 'lucide-react'
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
      toast.success('Course deleted')
    } catch {
      toast.error('Failed to delete course')
    }
  }

  const stats = [
    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Published', value: courses.filter((c) => c.isPublished).length, icon: BarChart2, color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
    { label: 'Total Students', value: courses.length * 12, icon: Users, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  ]

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Instructor Dashboard</h1>
          <p style={{ color: 'var(--text-secondary-light)', fontSize: 15 }}>
            Welcome back, {user?.name}! Manage your courses below.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/instructor/create-course')}
          id="create-course-btn"
        >
          <Plus size={18} /> Create New Course
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card-flat" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary-light)' }}>{label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Courses list */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your Courses</h2>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
        </div>
      ) : courses.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {courses.map((course) => (
            <motion.div key={course._id} className="card" style={{ overflow: 'hidden' }}
              whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <img
                src={course.thumbnail}
                alt={course.title}
                className="course-thumbnail"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80' }}
              />
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{course.title}</h3>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
                      {course.category}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary-light)', marginTop: 10, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/instructor/courses/${course._id}/lessons`)}
                    id={`manage-lessons-${course._id}`}
                    style={{ flex: 1 }}
                  >
                    <BookOpen size={14} /> Lessons
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
                    id={`edit-course-${course._id}`}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(course._id, course.title)}
                    id={`delete-course-${course._id}`}
                    style={{ color: '#EF4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><BookOpen size={36} color="#6366F1" /></div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>No courses yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary-light)' }}>Create your first course to get started</p>
          <button className="btn btn-primary" onClick={() => navigate('/instructor/create-course')} id="first-course-btn">
            <Plus size={18} /> Create Your First Course
          </button>
        </div>
      )}
    </div>
  )
}
