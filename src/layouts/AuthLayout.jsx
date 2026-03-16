import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthLayout() {
  const { user } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-main)' }}>
      {/* Immersive Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-brand-primary/10 rounded-full blur-[120px] -translate-y-1/2 opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-brand-secondary/10 rounded-full blur-[150px] translate-y-1/3 translate-x-1/3 opacity-50 pointer-events-none" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-30 dark:opacity-100 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDEwaDQwTTEwIDB2NDAiIHN0cm9rZT0icmdiYSgxNDgsIDE2MywgMTg0LCAwLjA2KSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==")`
      }} />

      {/* Dynamic Header */}
      <header className="absolute top-0 left-0 w-full p-8 z-10 flex items-center justify-between pointer-events-none">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center backdrop-blur-md shadow-lg shadow-brand-primary/20">
               <span className="text-xl">🎓</span>
            </div>
            <span className="text-xl font-black tracking-widest uppercase text-slate-900 dark:text-white">CraftConnect</span>
         </div>
         <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em]">System Online</span>
         </div>
      </header>

      {/* Main Outlet Container */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10 w-full">
         <Outlet />
      </main>
      
      {/* Footer Details */}
      <footer className="absolute bottom-6 w-full text-center z-10 pointer-events-none">
         <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 dark:text-slate-600">Secure Initialization Protocol v2.0</p>
      </footer>
    </div>
  )
}
