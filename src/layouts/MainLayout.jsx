import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topnav from '../components/Topnav'
import MobileNav from '../components/MobileNav'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-main)' }}>
      {/* Sidebar for Desktop */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content wrapper */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Topnav onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {/* Transition wrapper */}
          <div className="animate-in">
            <Outlet />
          </div>
        </main>

        {/* Padding for Mobile Bottom Nav */}
        <div className="h-20 lg:hidden" />
      </div>

      <MobileNav />
    </div>
  )
}
