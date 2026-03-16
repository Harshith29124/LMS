import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, UserPlus, GraduationCap, Briefcase } from 'lucide-react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('learner')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.signup({ name, email, password, role })
      localStorage.setItem('lms_user', JSON.stringify(res.data))
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">Join CraftConnect</h1>
            <p className="text-slate-400">Master new skills with our expert-led platform</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="text"
                    required
                    className="input-field pl-12"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="email"
                    required
                    className="input-field pl-12"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                <input
                  type="password"
                  required
                  className="input-field pl-12"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300 ml-1">Choose your role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('learner')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    role === 'learner' 
                      ? 'bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/20' 
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <GraduationCap className={`w-8 h-8 ${role === 'learner' ? 'text-brand-primary' : 'text-slate-500'}`} />
                  <div className="text-center">
                    <p className={`font-bold ${role === 'learner' ? 'text-white' : 'text-slate-400'}`}>Learner</p>
                    <p className="text-[10px] text-slate-500">I want to learn</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    role === 'instructor' 
                      ? 'bg-brand-secondary/10 border-brand-secondary shadow-lg shadow-brand-secondary/20' 
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <Briefcase className={`w-8 h-8 ${role === 'instructor' ? 'text-brand-secondary' : 'text-slate-500'}`} />
                  <div className="text-center">
                    <p className={`font-bold ${role === 'instructor' ? 'text-white' : 'text-slate-400'}`}>Instructor</p>
                    <p className="text-[10px] text-slate-500">I want to teach</p>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="premium-button w-full h-14 flex items-center justify-center gap-2 group text-lg"
            >
              {loading ? 'Creating Account...' : 'Get Started Free'}
              <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </form>

          <p className="text-center text-slate-500 mt-10">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
