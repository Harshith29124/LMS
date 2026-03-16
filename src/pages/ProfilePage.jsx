import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Mail, User, Shield, Calendar, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 28 }}>Profile</h1>

      {/* Avatar card */}
      <div className="card-flat" style={{ padding: 32, marginBottom: 20, textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1, #22C55E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 32, fontWeight: 800, color: 'white',
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
        <span style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 999,
          fontWeight: 700, fontSize: 13, textTransform: 'capitalize',
          background: user?.role === 'instructor' ? 'rgba(99,102,241,0.1)' : 'rgba(34,197,94,0.1)',
          color: user?.role === 'instructor' ? '#6366F1' : '#16A34A',
        }}>
          {user?.role}
        </span>
      </div>

      {/* Info */}
      <div className="card-flat" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Account Information</h3>
        {[
          { icon: User, label: 'Full Name', value: user?.name },
          { icon: Mail, label: 'Email', value: user?.email },
          { icon: Shield, label: 'Role', value: user?.role, capitalize: true },
          { icon: Calendar, label: 'Member Since', value: 'March 2026' },
        ].map(({ icon: Icon, label, value, capitalize }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={16} color="#6366F1" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary-light)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, textTransform: capitalize ? 'capitalize' : 'none' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="card-flat" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#EF4444' }}>Actions</h3>
        <button
          className="btn btn-danger"
          style={{ width: '100%' }}
          onClick={handleLogout}
          id="logout-btn"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </motion.div>
  )
}
