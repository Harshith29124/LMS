import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Mail, User, Shield, Calendar, LogOut, Camera, Star, Award } from 'lucide-react'
import { enrollmentAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ completed: 0, points: 0, rank: 'Novice' })

  useEffect(() => {
    async function loadStats() {
      if (user?.role !== 'learner') return;
      try {
        const res = await enrollmentAPI.getMyEnrolled()
        const enrolled = res.data || []
        const completed = enrolled.filter(c => c.progress === 100).length
        const inProgress = enrolled.length - completed
        
        setStats({
          completed,
          points: (completed * 500) + (inProgress * 100),
          rank: completed > 5 ? 'Expert' : completed > 0 ? 'Scholar' : 'Novice'
        })
      } catch (err) {
        console.error('Failed to load profile stats');
      }
    }
    loadStats()
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const identityStats = [
    { label: 'Courses Completed', value: stats.completed, icon: Award, color: 'text-green-500' },
    { label: 'Learning Points', value: stats.points, icon: Star, color: 'text-amber-500' },
    { label: 'Current Rank', value: stats.rank, icon: Shield, color: 'text-brand-primary' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Profile Header Card */}
      <section className="relative glass-panel p-10 lg:p-14 rounded-[3rem] overflow-hidden border-black/5 dark:border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-[100px] -mr-40 -mt-40" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-2xl shadow-brand-primary/20 transition-transform duration-500">
               <span className="text-5xl font-black text-white transition-transform">
                 {user?.name?.[0]?.toUpperCase()}
               </span>
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-white shadow-xl hover:bg-slate-800 transition-colors active:scale-90">
               <Camera size={18} />
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{user?.name}</h1>
            <div className="flex items-center justify-center gap-3">
               <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                 {user?.role}
               </span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Member: #{String(user?.id).padStart(4, '0')}</span>
            </div>
          </div>

          {user?.role === 'learner' && (
            <div className="flex flex-wrap gap-8 pt-6 border-t border-black/5 dark:border-white/10 w-full max-w-lg justify-center">
              {identityStats.map(stat => (
                <div key={stat.label} className="text-center space-y-1 block">
                   <div className="flex items-center justify-center gap-2 mb-1">
                      <stat.icon size={16} className={stat.color} />
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</span>
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="glass-panel p-8 lg:p-10 rounded-[2.5rem] border-black/5 dark:border-white/5 space-y-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3 px-2">
             <User size={16} className="text-brand-primary" /> Profile Identity
          </h2>
          
          <div className="space-y-6">
             {[
               { icon: User, label: 'Full Designation', value: user?.name },
               { icon: Mail, label: 'Access Point', value: user?.email },
               { icon: Shield, label: 'Permission Level', value: user?.role },
               { icon: Calendar, label: 'Cycle Init', value: '2026' }
             ].map((field) => (
                <div key={field.label}>
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{field.label}</p>
                   <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-4 transition-all hover:bg-black/10 dark:hover:bg-white/10">
                      <field.icon size={18} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{field.value}</span>
                   </div>
                </div>
             ))}
          </div>
        </section>

        <section className="glass-panel p-8 lg:p-10 rounded-[2.5rem] border-black/5 dark:border-white/5 flex flex-col justify-between space-y-8">
          <div className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3 px-2">
               <Shield size={16} className="text-brand-secondary" /> Data Security
            </h2>
            <div className="space-y-4">
               <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">2-Factor Auth</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Secondary validation</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-300 dark:bg-slate-800 rounded-full relative p-1 cursor-not-allowed">
                     <div className="w-4 h-4 bg-white dark:bg-slate-600 rounded-full" />
                  </div>
               </div>
               <div className="p-6 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Comms Preferences</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Technical notifications are routed through your master identity endpoint.</p>
               </div>
            </div>
          </div>

          <div className="pt-8 border-t border-black/5 dark:border-white/10">
             <button 
               onClick={handleLogout}
               className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all active:scale-95"
             >
               <LogOut size={16} /> Sign Out Interface
             </button>
          </div>
        </section>
      </div>
    </div>
  )
}
