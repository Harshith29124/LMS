import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      localStorage.setItem('lms_user', JSON.stringify(res.data))
      toast.success('Successfully logged in')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="glass-panel p-8 rounded-[2rem] relative">
          <div className="w-24 h-24 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-brand-primary/20 shadow-xl shadow-brand-primary/10 transition-transform duration-500">
             <LogIn className="w-12 h-12 text-brand-primary transition-transform" />
          </div>

          <div className="text-center mt-8 mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400">Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                <input
                  type="email"
                  required
                  className="input-field pl-12"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Password</label>
                <a href="#" className="text-xs text-brand-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                <input
                  type="password"
                  required
                  className="input-field pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="premium-button w-full flex items-center justify-center gap-2 group"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-primary font-semibold hover:underline decoration-brand-primary/30">
              Join CraftConnect
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
