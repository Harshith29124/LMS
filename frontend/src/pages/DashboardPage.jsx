import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { enrollmentAPI, courseAPI } from '../services/api'
import CourseCard from '../components/CourseCard'
import { SkeletonCard } from '../components/Skeleton'
import { BookOpen, TrendingUp, Award, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [myCourses, setMyCourses] = useState([])
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrolledRes, allRes] = await Promise.all([
          enrollmentAPI.getMyEnrolled(),
          courseAPI.getAll(),
        ])
        setMyCourses(enrolledRes.data || [])
        setFeaturedCourses((allRes.data || []).slice(0, 3))
      } catch {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const avgProgress = myCourses.length
    ? Math.round(myCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / myCourses.length)
    : 0

  const completedCount = myCourses.filter((c) => c.progress === 100).length

  const stats = [
    { label: 'Enrolled Courses', value: myCourses.length, icon: BookOpen, color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Avg. Progress', value: `${avgProgress}%`, icon: TrendingUp, color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
    { label: 'Completed', value: completedCount, icon: Award, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Hours Learned', value: `${myCourses.length * 3}h`, icon: Clock, color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Welcome banner */}
      <motion.div variants={item} style={{
        background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #22C55E 100%)',
        borderRadius: 20, padding: '32px', marginBottom: 28, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 6 }}>
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'} 👋
          </p>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            {user?.name}!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, maxWidth: 400 }}>
            {myCourses.length > 0
              ? `You're making great progress! Keep it up.`
              : 'Start your learning journey today. Browse courses to get started.'}
          </p>
          {myCourses.length === 0 && (
            <button
              className="btn"
              style={{ marginTop: 20, background: 'white', color: '#6366F1', fontWeight: 700 }}
              onClick={() => navigate('/browse')}
              id="browse-courses-cta"
            >
              Browse Courses
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32,
      }}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card-flat stat-card" style={{ padding: 20 }}>
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary-light)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary-light)', marginTop: 4 }}>{label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* My courses */}
      {myCourses.length > 0 && (
        <motion.div variants={item} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Continue Learning</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-courses')} id="see-all-my-courses">
              See all →
            </button>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {myCourses.slice(0, 3).map((course) => (
                <CourseCard key={course._id} course={course} progress={course.progress} enrolled showProgress />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Featured courses */}
      <motion.div variants={item}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Featured Courses</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/browse')} id="see-all-featured">
            Browse all →
          </button>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : featuredCourses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {featuredCourses.map((course) => {
              const enrolled = myCourses.some((c) => c._id === course._id)
              return <CourseCard key={course._id} course={course} enrolled={enrolled} />
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookOpen size={36} color="#6366F1" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>No courses yet</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary-light)' }}>
              Courses will appear here once instructors create them
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
