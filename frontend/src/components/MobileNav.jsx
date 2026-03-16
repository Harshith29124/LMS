import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LayoutDashboard, BookOpen, Compass, TrendingUp, User } from 'lucide-react'

const learnerItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/my-courses', icon: BookOpen, label: 'Courses' },
  { to: '/browse', icon: Compass, label: 'Browse' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const instructorItems = [
  { to: '/instructor', icon: LayoutDashboard, label: 'Home' },
  { to: '/browse', icon: Compass, label: 'Browse' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function MobileNav() {
  const { user } = useAuth()
  const items = user?.role === 'instructor' ? instructorItems : learnerItems

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/instructor' || to === '/dashboard'}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
