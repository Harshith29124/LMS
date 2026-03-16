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
    <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-3xl border-t border-black/5 dark:border-white/5 lg:hidden pb-safe" style={{ backgroundColor: 'var(--glass-bg)' }}>
      <div className="flex items-center justify-around px-2 py-3">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/instructor' || to === '/dashboard'}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl transition-all ${
                isActive 
                  ? 'text-brand-primary' 
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <Icon size={20} className="mb-0.5" />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
