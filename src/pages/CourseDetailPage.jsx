import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courseAPI, lessonAPI, enrollmentAPI, progressAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import LessonList from '../components/LessonList'
import ProgressBar from '../components/ProgressBar'
import { SkeletonText } from '../components/Skeleton'
import { BookOpen, Users, Clock, Tag, CheckCircle, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState({ percentage: 0, completedLessons: [] })
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes, enrollRes] = await Promise.all([
          courseAPI.getById(courseId),
          lessonAPI.getForCourse(courseId),
          enrollmentAPI.checkEnrollment(courseId),
        ])
        setCourse(courseRes.data)
        setLessons(lessonsRes.data || [])
        setEnrolled(enrollRes.data.enrolled)

        if (enrollRes.data.enrolled) {
          const progRes = await progressAPI.getCourseProgress(courseId)
          setProgress(progRes.data)
        }
      } catch {
        toast.error('Failed to load course')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [courseId])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await enrollmentAPI.enroll(courseId)
      setEnrolled(true)
      toast.success('Enrolled successfully! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 0', maxWidth: 900, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 16, marginBottom: 24 }} />
        <SkeletonText lines={5} />
      </div>
    )
  }

  if (!course) return <div className="empty-state"><p>Course not found</p></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Course hero */}
      <div style={{
        borderRadius: 20, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        marginBottom: 28, position: 'relative',
      }}>
        <img
          src={course.thumbnail}
          alt={course.title}
          style={{ width: '100%', height: 280, objectFit: 'cover', opacity: 0.4, display: 'block' }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div style={{
          position: 'absolute', inset: 0, padding: '32px',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(99,102,241,0.8)', borderRadius: 999, color: 'white', fontSize: 12, fontWeight: 600, marginBottom: 12, width: 'fit-content' }}>
            <Tag size={12} /> {course.category}
          </span>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>
            {course.title}
          </h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
              <Users size={14} /> By {course.instructorId?.name}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
              <BookOpen size={14} /> {lessons.length} lessons
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
              <Clock size={14} /> {course.level}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24 }}>
        {/* Left: description */}
        <div>
          <div className="card-flat" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>About this course</h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary-light)' }}>
              {course.description}
            </p>
          </div>

          {/* Progress (if enrolled) */}
          {enrolled && (
            <div className="card-flat" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Progress</h3>
              <ProgressBar value={progress.percentage} showLabel />
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary-light)' }}>
                  <strong style={{ color: 'var(--text-primary-light)' }}>{progress.completed}</strong> / {progress.total} lessons completed
                </div>
              </div>
            </div>
          )}

          {/* Lessons list (mobile) */}
          <div className="card-flat" style={{ padding: 24 }}>
            <LessonList
              lessons={lessons}
              completedLessons={progress.completedLessons}
              onSelect={(lesson) => {
                if (enrolled) navigate(`/courses/${courseId}/lessons/${lesson._id}`)
                else toast.error('Please enroll to access lessons')
              }}
            />
          </div>
        </div>

        {/* Right: enroll card */}
        <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <div className="card-flat" style={{ padding: 24 }}>
            {enrolled ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <CheckCircle size={20} color="#22C55E" />
                  <span style={{ fontWeight: 700, color: '#16A34A' }}>You're enrolled</span>
                </div>
                <ProgressBar value={progress.percentage} />
                <p style={{ fontSize: 12, color: 'var(--text-secondary-light)', margin: '8px 0 20px' }}>
                  {progress.percentage}% complete · {progress.completed}/{progress.total} lessons
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    if (lessons.length > 0) {
                      const next = lessons.find((l) => !progress.completedLessons.includes(l._id)) || lessons[0]
                      navigate(`/courses/${courseId}/lessons/${next._id}`)
                    }
                  }}
                  id="continue-learning-btn"
                >
                  {progress.percentage > 0 ? 'Continue Learning' : 'Start Learning'}
                </button>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Free Course</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary-light)', marginBottom: 20 }}>
                  Get full access to all {lessons.length} lessons
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {['Full lifetime access', 'Certificate of completion', 'Mobile & desktop access'].map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <CheckCircle size={15} color="#22C55E" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={handleEnroll}
                  disabled={enrolling}
                  id="enroll-btn"
                >
                  {enrolling ? 'Enrolling...' : '🚀 Enroll For Free'}
                </button>
                {lessons.length === 0 && (
                  <p style={{ fontSize: 12, color: '#F59E0B', marginTop: 10, textAlign: 'center' }}>
                    No lessons added yet
                  </p>
                )}
              </>
            )}

            <div className="divider" style={{ margin: '16px 0' }} />

            {/* Mini lesson list preview */}
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary-light)', marginBottom: 10 }}>
              Course content
            </div>
            {lessons.slice(0, 5).map((l, i) => (
              <div key={l._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, color: 'var(--text-secondary-light)' }}>
                {enrolled ? <BookOpen size={13} color="#6366F1" /> : <Lock size={13} color="#94A3B8" />}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {i + 1}. {l.title}
                </span>
              </div>
            ))}
            {lessons.length > 5 && (
              <div style={{ fontSize: 12, color: '#6366F1', marginTop: 8, fontWeight: 600 }}>
                +{lessons.length - 5} more lessons
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .course-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  )
}
