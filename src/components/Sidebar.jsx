import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, BookOpen, Compass, TrendingUp,
  User, GraduationCap, PlusCircle, ChevronRight, X
} from 'lucide-react'

const navItems = {
  learner: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-courses', icon: BookOpen, label: 'My Courses' },
    { to: '/browse', icon: Compass, label: 'Browse Courses' },
    { to: '/progress', icon: TrendingUp, label: 'Progress' },
    { to: '/profile', icon: User, label: 'Profile' },
  ],
  instructor: [
    { to: '/instructor', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/instructor/create-course', icon: PlusCircle, label: 'Create Course' },
    { to: '/browse', icon: Compass, label: 'Browse Courses' },
    { to: '/profile', icon: User, label: 'Profile' },
  ],
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = navItems[user?.role] || navItems.learner

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-light)' }} className="dark-border">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #6366F1, #22C55E)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GraduationCap size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary-light)' }} className="dark-text">CraftConnect</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="dark-text-muted">LMS</div>
            </div>
          </div>
          {/* Mobile close btn */}
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ display: 'none' }} id="sidebar-close-btn"
            aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* User profile mini */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #818CF8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary-light)', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '8px 0', flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary-light)', padding: '8px 24px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Menu
        </div>
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/instructor' || to === '/dashboard'}
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span style={{ flex: 1 }}>{label}</span>
            {({ isActive }) => isActive && <ChevronRight size={14} />}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)' }}>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: '#EF4444' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #sidebar-close-btn { display: flex !important; }
        }
        .dark .sidebar { border-right-color: var(--border-dark); }
        .dark .nav-item { color: var(--text-secondary-dark); }
        .dark-border { border-bottom-color: var(--border-dark) !important; }
        .dark .dark-border { border-bottom-color: var(--border-dark) !important; }
        .dark .dark-text { color: var(--text-primary-dark) !important; }
        .dark .dark-text-muted { color: var(--text-secondary-dark) !important; }
      `}</style>
    </aside>
  )
}
