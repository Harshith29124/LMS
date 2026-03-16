import { Menu, Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Topnav({ onMenuClick }) {
  const { isDark, toggleTheme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="topnav">
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        gap: 16,
      }}>
        {/* Left: hamburger (mobile) */}
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-sm"
          id="menu-toggle-btn"
          aria-label="Toggle menu"
          style={{ display: 'none' }}
        >
          <Menu size={22} />
        </button>

        {/* Page title area */}
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary-light)', fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm"
            aria-label="Toggle theme"
            style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}
          >
            {isDark ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} />}
          </button>

          {/* Notification bell */}
          <button className="btn btn-ghost btn-sm" aria-label="Notifications"
            style={{ borderRadius: '50%', width: 36, height: 36, padding: 0, position: 'relative' }}>
            <Bell size={18} />
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, background: '#EF4444', borderRadius: '50%',
            }} />
          </button>

          {/* Avatar */}
          <button
            onClick={() => navigate('/profile')}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #818CF8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 14,
              border: 'none', cursor: 'pointer',
            }}
            aria-label="Profile"
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #menu-toggle-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
