import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'learner' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    setLoading(true)
    try {
      const { data } = await authAPI.signup(form)
      login(data)
      toast.success(`Account created! Welcome, ${data.name}! 🎉`)
      navigate(data.role === 'instructor' ? '/instructor' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
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
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, #6366F1, #22C55E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <GraduationCap size={28} color="white" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary-light)' }}>Join thousands of learners today</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            type="text"
            className="form-input"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signup-password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="signup-password"
              type={showPass ? 'text' : 'password'}
              className="form-input"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              aria-label="Toggle password visibility"
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Role selection */}
        <div className="form-group">
          <label className="form-label">I am a...</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { value: 'learner', label: '🎓 Learner', desc: 'Browse & take courses' },
              { value: 'instructor', label: '🧑‍🏫 Instructor', desc: 'Create & teach courses' },
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, role: value })}
                id={`role-${value}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: `2px solid ${form.role === value ? '#6366F1' : 'var(--border-light)'}`,
                  background: form.role === value ? 'rgba(99,102,241,0.08)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: form.role === value ? '#6366F1' : 'var(--text-primary-light)', marginBottom: 2 }}>
                  {label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary-light)' }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: 4 }}
          disabled={loading}
          id="signup-submit-btn"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary-light)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
