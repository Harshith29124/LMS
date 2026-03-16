import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { courseAPI } from '../services/api'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'DevOps', 'Other']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function EditCoursePage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', thumbnail: '', category: 'Programming', level: 'Beginner' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseAPI.getById(courseId)
        const { title, description, thumbnail, category, level } = res.data
        setForm({ title, description, thumbnail, category, level: level || 'Beginner' })
      } catch {
        toast.error('Failed to load course')
        navigate('/instructor')
      } finally {
        setFetching(false)
      }
    }
    fetchCourse()
  }, [courseId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await courseAPI.update(courseId, form)
      toast.success('Course updated! ✅')
      navigate('/instructor')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="skeleton" style={{ height: 48, marginBottom: 16, borderRadius: 10 }} />
      ))}
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/instructor')} id="back-btn">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Edit Course</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary-light)' }}>Update course details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card-flat" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-title">Course Title *</label>
            <input
              id="edit-title"
              type="text"
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-description">Description *</label>
            <textarea
              id="edit-description"
              className="form-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              style={{ minHeight: 130 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-thumbnail">Thumbnail URL</label>
            <input
              id="edit-thumbnail"
              type="url"
              className="form-input"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            />
          </div>
          {form.thumbnail && (
            <img src={form.thumbnail} alt="thumbnail preview" style={{ height: 140, width: '100%', objectFit: 'cover', borderRadius: 10 }} />
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-category">Category</label>
              <select id="edit-category" className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-level">Level</label>
              <select id="edit-level" className="form-input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/instructor')} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="save-course-btn" style={{ flex: 1 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  )
}
