import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import BrowseCoursesPage from './pages/BrowseCoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LessonPlayerPage from './pages/LessonPlayerPage'
import InstructorDashboardPage from './pages/InstructorDashboardPage'
import CreateCoursePage from './pages/CreateCoursePage'
import EditCoursePage from './pages/EditCoursePage'
import ManageLessonsPage from './pages/ManageLessonsPage'
import MyCoursesPage from './pages/MyCoursesPage'
import ProgressPage from './pages/ProgressPage'
import ProfilePage from './pages/ProfilePage'

// Protected route wrapper
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-surface-950">
      <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { isDark } = useTheme()

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#1E293B' : '#fff',
            color: isDark ? '#F1F5F9' : '#0F172A',
            border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Protected app routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/browse" element={<BrowseCoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPlayerPage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Instructor only */}
          <Route path="/instructor" element={
            <ProtectedRoute role="instructor">
              <InstructorDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/instructor/create-course" element={
            <ProtectedRoute role="instructor">
              <CreateCoursePage />
            </ProtectedRoute>
          } />
          <Route path="/instructor/edit-course/:courseId" element={
            <ProtectedRoute role="instructor">
              <EditCoursePage />
            </ProtectedRoute>
          } />
          <Route path="/instructor/courses/:courseId/lessons" element={
            <ProtectedRoute role="instructor">
              <ManageLessonsPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
