import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topnav from '../components/Topnav'
import MobileNav from '../components/MobileNav'
import { useTheme } from '../hooks/useTheme'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isDark } = useTheme()

  return (
    <div className={`app-layout ${isDark ? 'dark' : ''}`}>
      {/* Desktop + Mobile Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          style={{ display: 'block' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="main-content">
        <Topnav onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  )
}
