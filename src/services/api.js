import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Inject auth token on every request
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('lms_user')
  if (user) {
    const { token } = JSON.parse(user)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lms_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ──────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

// ─── Courses ───────────────────────────────────
export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }), // calls /api/courses/index.js
  getById: (id) => api.get('/courses/get', { params: { id } }),
  getMyCourses: () => api.get('/courses/my'),
  create: (data) => api.post('/courses/create', data),
  update: (id, data) => api.put('/courses/update', { ...data, id }),
  delete: (id) => api.delete('/courses/delete', { params: { id } }),
}

// ─── Lessons ───────────────────────────────────
export const lessonAPI = {
  getForCourse: (courseId) => api.get('/lessons/get', { params: { courseId } }),
  getById: (lessonId) => api.get('/lessons/get', { params: { lessonId } }),
  create: (courseId, data) => api.post('/lessons/create', { ...data, courseId }),
  delete: (lessonId) => api.delete('/lessons/delete', { params: { lessonId } }),
}

// ─── Quiz ──────────────────────────────────────
export const quizAPI = {
  getForLesson: (lessonId) => api.get('/quiz/get', { params: { lessonId } }),
  create: (lessonId, data) => api.post('/quiz/create', { ...data, lessonId }),
  submit: (data) => api.post('/quiz/submit', data),
}

// ─── Enrollment ────────────────────────────────
export const enrollmentAPI = {
  enroll: (courseId) => api.post('/enrollment/enroll', { courseId }),
  checkEnrollment: (courseId) => api.get('/enrollment/check', { params: { courseId } }),
  getMyEnrolled: () => api.get('/enrollment/my'),
}

// ─── Progress ──────────────────────────────────
export const progressAPI = {
  complete: (lessonId) => api.post('/enrollment/progress', { lessonId }),
  getCourseProgress: (courseId) => api.get('/enrollment/progress', { params: { courseId } }),
}

// ─── YouTube ──────────────────────────────────
export const youtubeAPI = {
  getPlaylist: (playlistId) => api.get('/youtube', { params: { playlistId } }),
}

export default api
