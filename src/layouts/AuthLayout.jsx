import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export default function AuthLayout() {
  const { user } = useAuth()
  const { isDark } = useTheme()

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className={isDark ? 'dark' : ''} style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left: decorative panel */}
      <div style={{
        flex: 1,
        display: 'none',
        background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #22C55E 100%)',
        position: 'relative',
        overflow: 'hidden',
      }} className="auth-left">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '48px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20 }}>🎓</span>
            </div>
            <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>CraftConnect LMS</span>
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
              Learn. Create.
              <br />Excel.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.6 }}>
              Join thousands of learners building real skills with expert-led courses, interactive quizzes, and progress tracking.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { label: '10K+', sub: 'Learners' },
              { label: '500+', sub: 'Courses' },
              { label: '98%', sub: 'Satisfaction' },
            ].map(({ label, sub }) => (
              <div key={sub}>
                <div style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>{label}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: 'var(--bg-light)',
      }}>
        <div style={{ width: '100%' }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .auth-left { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
