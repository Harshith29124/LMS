import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data)
      toast.success(`Welcome back, ${data.name}! 🎉`)
      navigate(data.role === 'instructor' ? '/instructor' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, #6366F1, #22C55E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <GraduationCap size={28} color="white" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary-light)' }}>
          Sign in to continue your learning journey
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              aria-label="Toggle password visibility"
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
              }}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: 8 }}
          disabled={loading}
          id="login-submit-btn"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Demo credentials */}
      <div style={{
        marginTop: 20, padding: '12px 16px',
        background: 'rgba(99,102,241,0.06)',
        borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)',
        fontSize: 12, color: 'var(--text-secondary-light)',
      }}>
        <strong style={{ color: '#6366F1' }}>Demo accounts:</strong><br />
        Learner: learner@demo.com / password123<br />
        Instructor: instructor@demo.com / password123
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary-light)' }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}>
          Sign up free
        </Link>
      </p>
    </motion.div>
  )
}
