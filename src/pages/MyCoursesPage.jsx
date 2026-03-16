import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { enrollmentAPI } from '../services/api'
import CourseCard from '../components/CourseCard'
import { SkeletonCard } from '../components/Skeleton'
import { BookOpen } from 'lucide-react'
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
        toast.error('Failed to load your courses')
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>My Courses</h1>
        <p style={{ color: 'var(--text-secondary-light)', fontSize: 15 }}>
          {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled
        </p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
        </div>
      ) : courses.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}
        >
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} progress={course.progress} enrolled showProgress />
          ))}
        </motion.div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <BookOpen size={36} color="#6366F1" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>No courses yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary-light)' }}>
            Enroll in a course to start learning
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/browse')} id="browse-btn">
            Browse Courses
          </button>
        </div>
      )}
    </div>
  )
}
