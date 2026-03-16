import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Compass, TrendingUp,
  User, GraduationCap, PlusCircle, ChevronRight, X, LogOut
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
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-500 transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full glass-panel border-r border-white/5 flex flex-col p-6 rounded-r-[3rem] lg:rounded-none">
        {/* Logo */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 rotate-3">
              <GraduationCap className="text-white w-7 h-7 -rotate-3" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-none">CraftConnect</h1>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">LMS Portal</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="mb-10 px-2">
          <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-4 group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center border border-white/10 overflow-hidden">
               <span className="text-lg font-black text-white">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
               <p className="font-bold text-white truncate">{user?.name}</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Core Menu</p>
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/instructor' || to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) => `nav-link group ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="flex-1">{label}</span>
              <ChevronRight className={`transition-all duration-300 w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1`} />
            </NavLink>
          ))}
        </nav>

        {/* Action Footer */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-400 font-bold hover:bg-rose-500/10 transition-all group active:scale-95"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>

          <div className="p-4 rounded-2xl bg-brand-primary/10 border border-brand-primary/20">
            <p className="text-[10px] font-bold text-brand-primary text-center">v1.2.0 PRODUCTION BUILD</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
