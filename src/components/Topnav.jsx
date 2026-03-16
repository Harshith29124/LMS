import { Menu, Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Topnav({ onMenuClick }) {
  const { isDark, toggleTheme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-3xl border-b border-black/5 dark:border-white/5 h-20 flex items-center shrink-0" style={{ backgroundColor: 'var(--glass-bg)' }}>
      <div className="flex-1 flex items-center justify-between px-6 lg:px-10 max-w-7xl mx-auto w-full">
        {/* Left: Mobile Toggle & Date */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden sm:block">
             <p className="text-[10px] font-black uppercase text-brand-primary tracking-[0.3em]">System Cycle</p>
             <p className="text-sm font-bold text-slate-800 dark:text-slate-300">
               {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
             </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Dark Mode */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 transition-all active:scale-95"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications */}
          <button 
            className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 transition-all active:scale-95 relative" 
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-full animate-pulse shadow-[0_0_10px_rgb(99,102,241)]" />
          </button>

          <div className="w-px h-6 bg-black/5 dark:bg-white/10 mx-2" />

          {/* Avatar Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
            aria-label="Profile"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center border border-white/10 shadow-lg shadow-brand-primary/20">
              <span className="text-sm font-black text-white">{user?.name?.[0]?.toUpperCase() || 'X'}</span>
            </div>
            <div className="hidden sm:block text-left">
               <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.name?.split(' ')[0]}</p>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{user?.role}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
