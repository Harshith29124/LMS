import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { courseAPI } from '../services/api'
import { ArrowLeft, Sparkles, Layout, Type, Image as ImageIcon, Rocket, ChevronRight } from 'lucide-react'
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
      return toast.error('Title and description are essential fields')
    }
    setLoading(true)
    try {
      const res = await courseAPI.create(form)
      toast.success('Course Created Successfully! 🚀')
      navigate(`/instructor/courses/${res.data._id}/lessons`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="flex items-center gap-6">
        <button 
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-all active:scale-90" 
          onClick={() => navigate('/instructor')}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white">Course Architect</h1>
          <p className="text-slate-500 font-medium">Design and structure your next masterpiece</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* General Information Card */}
          <section className="glass-panel p-8 lg:p-10 rounded-[3rem] border-white/5 space-y-8">
            <div className="flex items-center gap-3 text-brand-primary">
              <Type size={20} className="fill-current" />
              <h2 className="text-xl font-black uppercase tracking-widest">General Info</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Course Identity</label>
                <input
                  type="text"
                  className="input-field text-lg font-bold"
                  placeholder="e.g. Masterclass: Advanced System Design"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Curriculum Abstract</label>
                <textarea
                  className="input-field min-h-[200px] leading-relaxed"
                  placeholder="Draft a compelling description of what your students will achieve..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
            </div>
          </section>

          {/* Classification Section */}
          <section className="glass-panel p-8 lg:p-10 rounded-[3rem] border-white/5 space-y-8">
             <div className="flex items-center gap-3 text-brand-primary">
              <Layout size={20} className="fill-current" />
              <h2 className="text-xl font-black uppercase tracking-widest">Metadata</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Domain</label>
                <select
                  className="input-field cursor-pointer appearance-none pr-10"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-surface-900">{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Audience Level</label>
                <select
                  className="input-field cursor-pointer appearance-none pr-10"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  {LEVELS.map((l) => <option key={l} value={l} className="bg-surface-900">{l}</option>)}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar: Thumbnail & Actions */}
        <div className="space-y-8">
          <section className="glass-panel p-8 rounded-[3rem] border-white/5 space-y-8 sticky top-24">
             <div className="flex items-center gap-3 text-brand-primary">
              <ImageIcon size={20} className="fill-current" />
              <h2 className="text-xl font-black uppercase tracking-widest">Visual Cover</h2>
            </div>

            <div className="space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-brand-primary/20 shadow-2xl relative group">
                <img src={form.thumbnail} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Sparkles className="text-white animate-pulse" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {THUMBNAILS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setSelectedThumb(i); setForm({ ...form, thumbnail: url }) }}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-95 ${selectedThumb === i ? 'border-brand-primary' : 'border-transparent opacity-60'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Or provide explicit URL</label>
                <input
                  type="url"
                  className="input-field text-xs py-3"
                  placeholder="https://images.unsplash.com/..."
                  value={form.thumbnail}
                  onChange={(e) => { setForm({ ...form, thumbnail: e.target.value }); setSelectedThumb(-1) }}
                />
              </div>
            </div>

            <div className="pt-8">
                <button
                  type="submit"
                  className="premium-button w-full flex items-center justify-center gap-3 group"
                  disabled={loading}
                >
                  {loading ? 'Designing...' : 'Generate Course'}
                  <Rocket size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
          </section>
        </div>
      </form>
    </div>
  )
}
