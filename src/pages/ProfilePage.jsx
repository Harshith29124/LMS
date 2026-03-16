import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Mail, User, Shield, Calendar, LogOut, Camera, Star, Award } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const identityStats = [
    { label: 'Completed', value: '12', icon: Award, color: 'text-green-500' },
    { label: 'Points', value: '2.4k', icon: Star, color: 'text-amber-500' },
    { label: 'Rank', value: '#12', icon: Shield, color: 'text-brand-primary' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Profile Header Card */}
      <section className="relative glass-panel p-10 lg:p-14 rounded-[4rem] overflow-hidden border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-[100px] -mr-40 -mt-40" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-2xl shadow-brand-primary/20 rotate-3 transition-transform group-hover:rotate-6 duration-500">
               <span className="text-5xl font-black text-white -rotate-3 group-hover:-rotate-6 transition-transform">
                 {user?.name?.[0]?.toUpperCase()}
               </span>
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-800 border border-white/10 rounded-xl flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">
               <Camera size={18} />
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white">{user?.name}</h1>
            <div className="flex items-center justify-center gap-3">
               <span className="premium-badge px-4 py-1.5 bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                 {user?.role}
               </span>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Member ID: #00{user?.id}</span>
            </div>
          </div>

          <div className="flex gap-8 pt-6 border-t border-white/5 w-full max-w-md justify-center">
            {identityStats.map(stat => (
              <div key={stat.label} className="text-center space-y-1">
                 <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon size={14} className={stat.color} />
                    <span className="text-xl font-black text-white">{stat.value}</span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="glass-panel p-10 rounded-[3rem] border-white/5 space-y-8">
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
             <User size={20} className="text-brand-primary" /> Credentials
          </h2>
          
          <div className="space-y-6">
             {[
               { icon: User, label: 'Legal Name', value: user?.name },
               { icon: Mail, label: 'Email Address', value: user?.email },
               { icon: Shield, label: 'System Role', value: user?.role },
               { icon: Calendar, label: 'Registry Date', value: '16 Mar 2026' }
             ].map((field) => (
               <div key={field.label} className="group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1 group-hover:text-brand-primary transition-colors">{field.label}</p>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 transition-all group-hover:bg-white/10 group-hover:border-white/10">
                     <field.icon size={16} className="text-slate-500" />
                     <span className="text-sm font-bold text-white tracking-wide">{field.value}</span>
                  </div>
               </div>
             ))}
          </div>
        </section>

        <section className="glass-panel p-10 rounded-[3rem] border-white/5 flex flex-col justify-between space-y-8">
          <div className="space-y-8">
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
               <Shield size={20} className="text-brand-secondary" /> Privacy & Safety
            </h2>
            <div className="space-y-4">
               <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Two-Factor Auth</p>
                    <p className="text-[10px] text-slate-500">Highly recommended</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-700 rounded-full relative p-1 cursor-pointer">
                     <div className="w-4 h-4 bg-slate-500 rounded-full" />
                  </div>
               </div>
               <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 mb-8">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Warning</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Changes to your institutional email requires system administrator approval.</p>
               </div>
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-white/5">
             <button 
               onClick={handleLogout}
               className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-rose-500/10"
             >
               <LogOut size={16} /> Decouple Session
             </button>
             <p className="text-[10px] text-center font-bold text-slate-700 uppercase tracking-[0.2em]">Secure Node Build 2026.03.16</p>
          </div>
        </section>
      </div>
    </div>
  )
}
