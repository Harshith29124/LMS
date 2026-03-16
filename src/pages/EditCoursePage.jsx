import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { courseAPI } from '../services/api'
import { ArrowLeft, Type, Layout, Image as ImageIcon, Save } from 'lucide-react'
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
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-20 glass-panel rounded-3xl" />
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="h-16 glass-panel rounded-2xl" />
      ))}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="flex items-center gap-6">
        <button 
          className="p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl border border-black/5 dark:border-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90" 
          onClick={() => navigate('/instructor')}
          id="back-btn"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Edit Course</h1>
          <p className="text-slate-500 font-medium">Update course details and configuration</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Information */}
        <section className="glass-panel p-8 lg:p-10 rounded-[3rem] border-white/5 space-y-8">
          <div className="flex items-center gap-3 text-brand-primary">
            <Type size={20} className="fill-current" />
            <h2 className="text-xl font-black uppercase tracking-widest">General Info</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="edit-title">Course Title</label>
              <input
                id="edit-title"
                type="text"
                className="input-field text-lg font-bold"
                placeholder="e.g. Masterclass: Advanced System Design"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                className="input-field min-h-[200px] leading-relaxed"
                placeholder="Describe what students will learn..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
          </div>
        </section>

        {/* Metadata */}
        <section className="glass-panel p-8 lg:p-10 rounded-[3rem] border-white/5 space-y-8">
          <div className="flex items-center gap-3 text-brand-primary">
            <Layout size={20} className="fill-current" />
            <h2 className="text-xl font-black uppercase tracking-widest">Metadata</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="edit-category">Category</label>
              <select 
                id="edit-category" 
                className="input-field cursor-pointer appearance-none pr-10" 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-surface-900">{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="edit-level">Level</label>
              <select 
                id="edit-level" 
                className="input-field cursor-pointer appearance-none pr-10" 
                value={form.level} 
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                {LEVELS.map((l) => <option key={l} value={l} className="bg-surface-900">{l}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Thumbnail */}
        <section className="glass-panel p-8 lg:p-10 rounded-[3rem] border-white/5 space-y-8">
          <div className="flex items-center gap-3 text-brand-primary">
            <ImageIcon size={20} className="fill-current" />
            <h2 className="text-xl font-black uppercase tracking-widest">Visual Cover</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="edit-thumbnail">Thumbnail URL</label>
              <input
                id="edit-thumbnail"
                type="url"
                className="input-field text-sm"
                placeholder="https://images.unsplash.com/..."
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              />
            </div>
            {form.thumbnail && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 shadow-xl">
                <img src={form.thumbnail} alt="thumbnail preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            className="flex-1 px-8 py-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 font-bold transition-all active:scale-95 border border-black/5 dark:border-white/5" 
            onClick={() => navigate('/instructor')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="flex-[2] premium-button flex items-center justify-center gap-3" 
            disabled={loading} 
            id="save-course-btn"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
