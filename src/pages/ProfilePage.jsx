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
      <section className="relative glass-panel p-10 lg:p-14 rounded-[3rem] overflow-hidden border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-[100px] -mr-40 -mt-40" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-2xl shadow-brand-primary/20 rotate-3 transition-transform group-hover:rotate-6 duration-500">
               <span className="text-5xl font-black text-white -rotate-3 group-hover:-rotate-6 transition-transform">
                 {user?.name?.[0]?.toUpperCase()}
               </span>
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-800 border border-white/10 rounded-xl flex items-center justify-center text-white shadow-xl hover:bg-slate-700 transition-colors active:scale-90">
               <Camera size={18} />
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
            <div className="flex items-center justify-center gap-3">
               <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary text-xs font-semibold rounded-full capitalize">
                 {user?.role}
               </span>
               <span className="text-sm font-medium text-slate-500">Member ID: #{String(user?.id).padStart(4, '0')}</span>
            </div>
          </div>

          {user?.role === 'learner' && (
            <div className="flex gap-8 pt-6 border-t border-white/5 w-full max-w-md justify-center">
              {identityStats.map(stat => (
                <div key={stat.label} className="text-center space-y-1 block">
                   <div className="flex items-center justify-center gap-2 mb-1">
                      <stat.icon size={16} className={stat.color} />
                      <span className="text-2xl font-bold text-white">{stat.value}</span>
                   </div>
                   <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="glass-panel p-8 lg:p-10 rounded-[2.5rem] border-white/5 space-y-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-3">
             <User size={20} className="text-brand-primary" /> Profile Information
          </h2>
          
          <div className="space-y-6">
             {[
               { icon: User, label: 'Full Name', value: user?.name },
               { icon: Mail, label: 'Email Address', value: user?.email },
               { icon: Shield, label: 'Account Type', value: user?.role },
               { icon: Calendar, label: 'Member Since', value: '2026' }
             ].map((field) => (
               <div key={field.label} className="group">
                  <p className="text-xs font-semibold text-slate-500 mb-1 ml-1">{field.label}</p>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 transition-all hover:bg-white/10">
                     <field.icon size={18} className="text-slate-400" />
                     <span className="text-sm font-medium text-white">{field.value}</span>
                  </div>
               </div>
             ))}
          </div>
        </section>

        <section className="glass-panel p-8 lg:p-10 rounded-[2.5rem] border-white/5 flex flex-col justify-between space-y-8">
          <div className="space-y-8">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
               <Shield size={20} className="text-brand-secondary" /> Account Security
            </h2>
            <div className="space-y-4">
               <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500 mt-1">Add an extra layer of security</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-700 rounded-full relative p-1 cursor-pointer">
                     <div className="w-4 h-4 bg-slate-500 rounded-full" />
                  </div>
               </div>
               <div className="p-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 mb-8">
                  <p className="text-xs font-semibold text-brand-primary mb-2">Email Preferences</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Contact your system administrator to change your associated email address.</p>
               </div>
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-white/5">
             <button 
               onClick={handleLogout}
               className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all active:scale-95"
             >
               <LogOut size={18} /> Sign Out
             </button>
          </div>
        </section>
      </div>
    </div>
  )
}
