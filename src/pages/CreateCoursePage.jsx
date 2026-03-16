import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { courseAPI } from '../services/api'
import { ArrowLeft, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'DevOps', 'Other']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const THUMBNAILS = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
]

export default function CreateCoursePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail: THUMBNAILS[0],
    category: 'Programming',
    level: 'Beginner',
  })
  const [loading, setLoading] = useState(false)
  const [selectedThumb, setSelectedThumb] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      return toast.error('Title and description are required')
    }
    setLoading(true)
    try {
      const res = await courseAPI.create(form)
      toast.success('Course created successfully! 🎉')
      navigate(`/instructor/courses/${res.data._id}/lessons`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/instructor')} id="back-btn">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Create New Course</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary-light)' }}>Fill in the details below to publish your course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Basic info */}
        <div className="card-flat" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Course Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="course-title">Course Title *</label>
              <input
                id="course-title"
                type="text"
                className="form-input"
                placeholder="e.g. Complete React Developer Course"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-description">Description *</label>
              <textarea
                id="course-description"
                className="form-input"
                placeholder="What will students learn in this course? Describe the key topics, prerequisites, and outcomes..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                style={{ minHeight: 130 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="course-category">Category</label>
                <select
                  id="course-category"
                  className="form-input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="course-level">Level</label>
                <select
                  id="course-level"
                  className="form-input"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail picker */}
        <div className="card-flat" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Course Thumbnail</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary-light)', marginBottom: 16 }}>
            Pick from our curated collection or enter a custom URL
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {THUMBNAILS.map((url, i) => (
              <div
                key={i}
                onClick={() => { setSelectedThumb(i); setForm({ ...form, thumbnail: url }) }}
                id={`thumbnail-option-${i}`}
                style={{
                  borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                  border: `2.5px solid ${selectedThumb === i ? '#6366F1' : 'transparent'}`,
                  transition: 'all 0.2s',
                  opacity: selectedThumb === i ? 1 : 0.7,
                }}
              >
                <img src={url} alt={`thumb-${i}`} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="custom-thumbnail">Or enter custom URL</label>
            <input
              id="custom-thumbnail"
              type="url"
              className="form-input"
              placeholder="https://example.com/image.jpg"
              value={form.thumbnail}
              onChange={(e) => { setForm({ ...form, thumbnail: e.target.value }); setSelectedThumb(-1) }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          id="submit-course-btn"
        >
          {loading ? 'Creating...' : '🚀 Create Course & Add Lessons'}
        </button>
      </form>
    </motion.div>
  )
}
