import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { courseAPI, lessonAPI, enrollmentAPI, progressAPI, youtubeAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useWatchProgress } from '../hooks/useWatchProgress'
import ProgressBar from '../components/ProgressBar'
import { BookOpen, Users, Star, CheckCircle, Lock, PlayCircle, Trophy, Sparkles, X, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { saveProgress } = useWatchProgress()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [ytVideos, setYtVideos] = useState([])
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState({ percentage: 0, completedLessons: [] })
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [curriculumOpen, setCurriculumOpen] = useState(true)
  const playerRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes, enrollRes] = await Promise.all([
          courseAPI.getById(courseId),
          lessonAPI.getForCourse(courseId),
          enrollmentAPI.checkEnrollment(courseId),
        ])
        setCourse(courseRes.data)
        setLessons(lessonsRes.data || [])
        setEnrolled(enrollRes.data.enrolled)

        if (enrollRes.data.enrolled) {
          const progRes = await progressAPI.getCourseProgress(courseId)
          setProgress(progRes.data)
        }

        // Fetch YouTube playlist videos if course has a playlist_id
        const playlistId = courseRes.data.playlist_id
        if (playlistId) {
          try {
            const ytRes = await youtubeAPI.getPlaylist(playlistId)
            const vids = ytRes.data?.items || []
            if (vids.length > 0) {
              setYtVideos(vids)
              setActiveVideoId(vids[0].videoId)
            }
          } catch (ytErr) {
            console.warn('YouTube playlist fetch failed, using embedded player', ytErr)
          }
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to load course data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [courseId])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await enrollmentAPI.enroll(courseId)
      setEnrolled(true)
      toast.success('Successfully enrolled! 🎉')
      const progRes = await progressAPI.getCourseProgress(courseId)
      setProgress(progRes.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  const selectVideo = (videoId) => {
    setActiveVideoId(videoId)
    const video = ytVideos.find(v => v.videoId === videoId)
    if (video) {
      saveProgress(courseId, {
        lessonId: video._id,
        videoId: video.videoId,
        title: video.title,
        thumbnail: video.thumbnail,
        courseTitle: course?.title,
      })
    }
    // Scroll to player
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Determine which content list to show
  const hasYtVideos = ytVideos.length > 0
  const contentItems = hasYtVideos ? ytVideos : lessons

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-64 glass-panel rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video glass-panel rounded-3xl" />
          <div className="h-48 glass-panel rounded-3xl" />
        </div>
        <div className="h-80 glass-panel rounded-3xl" />
      </div>
    </div>
  )

  if (!course) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center">
         <X size={48} className="text-rose-500" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white">Course Not Found</h2>
      <button onClick={() => navigate('/browse')} className="premium-button">Browse Courses</button>
    </div>
  )

  return (
    <div className="space-y-8 pb-20">
      {/* Course Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="premium-badge">{course.category}</span>
          <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-bold uppercase text-slate-500">
            {course.level}
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{course.title}</h1>
        
        <div className="flex flex-wrap gap-6 py-4 border-y border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
               <Users className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase">Instructor</p>
               <p className="text-sm font-semibold text-slate-800 dark:text-white">{course.instructorId?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
               <PlayCircle className="w-4 h-4 text-green-500" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase">Content</p>
               <p className="text-sm font-semibold text-slate-800 dark:text-white">{contentItems.length} Lessons</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
               <Star className="w-4 h-4 text-amber-500" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase">Rating</p>
               <p className="text-sm font-semibold text-slate-800 dark:text-white">4.9 / 5.0</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Video Player + Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Player */}
          <div ref={playerRef} className="rounded-2xl overflow-hidden shadow-2xl bg-black">
            {hasYtVideos && activeVideoId ? (
              <div className="aspect-video">
                <iframe
                  className="w-full h-full border-0"
                  src={`https://www.youtube.com/embed/${activeVideoId}?rel=0&modestbranding=1&autoplay=1`}
                  title="Video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : enrolled && course.playlist_id ? (
              <div className="aspect-video">
                <iframe
                  className="w-full h-full border-0"
                  src={`https://www.youtube.com/embed/videoseries?list=${course.playlist_id}&rel=0&modestbranding=1`}
                  title="Playlist player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video relative cursor-pointer group" onClick={!enrolled ? handleEnroll : undefined}>
                <img src={course.thumbnail} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                     <PlayCircle className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
                {!enrolled && (
                  <div className="absolute bottom-4 inset-x-4 text-center">
                    <p className="text-xs font-bold text-white/80">Enroll to start watching</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Now Playing Info (for YouTube videos) */}
          {hasYtVideos && activeVideoId && (
            <div className="glass-panel p-6 rounded-2xl border-black/5 dark:border-white/5">
              <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-2">Now Playing</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {ytVideos.find(v => v.videoId === activeVideoId)?.title}
              </h3>
            </div>
          )}

          {/* Description */}
          <div className="glass-panel p-6 lg:p-8 rounded-2xl border-black/5 dark:border-white/5 space-y-4">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
               <Sparkles size={18} className="text-brand-primary" />
               <h2 className="text-lg font-bold">About this course</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>

          {/* Curriculum — Collapsible (for DB lessons) */}
          {!hasYtVideos && lessons.length > 0 && (
            <div className="glass-panel rounded-2xl overflow-hidden border-black/5 dark:border-white/5">
              <button 
                onClick={() => setCurriculumOpen(!curriculumOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Course Curriculum</h2>
                {curriculumOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
              <AnimatePresence initial={false}>
                {curriculumOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-1">
                      {lessons.map((l, i) => {
                        const isCompleted = progress.completedLessons.includes(l._id)
                        return (
                          <button
                            key={l._id}
                            onClick={() => {
                              if (enrolled) navigate(`/courses/${courseId}/lessons/${l._id}`)
                              else toast.error('Enroll to access lessons')
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                          >
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle size={18} className="text-green-500" />
                              ) : enrolled ? (
                                <PlayCircle size={18} className="text-brand-primary" />
                              ) : (
                                <Lock size={14} className="text-slate-300 dark:text-slate-700" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-primary transition-colors">
                                {String(i + 1).padStart(2, '0')}. {l.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">{l.duration || '10 min'}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Enrollment / Progress Card */}
          <div className="glass-panel p-6 lg:p-8 rounded-2xl border-black/5 dark:border-white/5 space-y-6 sticky top-24">
            {enrolled ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Enrolled</p>
                    <p className="text-xs text-green-600 dark:text-green-500/80">Access active</p>
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between items-end">
                     <p className="text-xs font-bold text-slate-500 uppercase">Progress</p>
                     <p className="text-xl font-black text-slate-900 dark:text-white">{progress.percentage}%</p>
                   </div>
                   <ProgressBar value={progress.percentage} height={6} />
                   <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-wider">
                      {progress.completed || 0} / {contentItems.length} Lessons
                   </p>
                </div>

                <button 
                  onClick={() => {
                    if (hasYtVideos && ytVideos.length > 0) {
                      selectVideo(ytVideos[0].videoId)
                    } else {
                      const next = lessons.find(l => !progress.completedLessons.includes(l._id)) || lessons[0]
                      if (next) navigate(`/courses/${courseId}/lessons/${next._id}`)
                    }
                  }}
                  className="premium-button w-full"
                >
                  {progress.percentage === 100 ? 'Review Course' : 'Continue Learning'}
                </button>
              </div>
            ) : (
              <div className="space-y-6 text-center lg:text-left">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Start Learning</h3>
                  <p className="text-sm text-slate-500">Enroll to unlock all lessons and materials.</p>
                </div>

                <div className="space-y-3">
                  {['Full Video Lessons', 'Course Materials', 'Interactive Quizzes', 'Certificate'].map(feat => (
                    <div key={feat} className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <Trophy size={14} className="text-brand-secondary flex-shrink-0" />
                      <span className="text-xs font-semibold">{feat}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="premium-button w-full py-4"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
                </button>
              </div>
            )}
          </div>

          {/* YouTube Playlist Sidebar (when yt videos available) */}
          {hasYtVideos && (
            <div className="glass-panel rounded-2xl border-black/5 dark:border-white/5 overflow-hidden">
              <div className="p-4 border-b border-black/5 dark:border-white/5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Playlist ({ytVideos.length} videos)
                </h4>
              </div>
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {ytVideos.map((video, i) => (
                  <button
                    key={video.videoId}
                    onClick={() => selectVideo(video.videoId)}
                    className={`w-full flex items-start gap-3 p-3 text-left transition-all hover:bg-black/5 dark:hover:bg-white/5 ${
                      activeVideoId === video.videoId ? 'bg-brand-primary/5 border-l-2 border-brand-primary' : 'border-l-2 border-transparent'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                      {video.thumbnail && (
                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                      )}
                      {activeVideoId === video.videoId && (
                        <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                          <PlayCircle size={20} className="text-white" />
                        </div>
                      )}
                      {video.duration && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-[9px] font-bold rounded">
                          {video.duration}
                        </span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <p className={`text-xs font-semibold line-clamp-2 leading-tight ${
                        activeVideoId === video.videoId ? 'text-brand-primary' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {video.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Lesson {i + 1}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DB Lesson Preview (when no yt videos) */}
          {!hasYtVideos && contentItems.length > 0 && (
            <div className="glass-panel rounded-2xl border-black/5 dark:border-white/5 overflow-hidden">
              <div className="p-4 border-b border-black/5 dark:border-white/5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Course Content ({lessons.length} lessons)
                </h4>
              </div>
              <div className="max-h-[40vh] overflow-y-auto custom-scrollbar p-2">
                {lessons.slice(0, 8).map((l, i) => (
                  <div key={l._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group">
                     <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-primary w-6 text-center">{String(i+1).padStart(2, '0')}</span>
                     <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate flex-1">{l.title}</p>
                     {enrolled ? <PlayCircle size={14} className="text-brand-primary flex-shrink-0" /> : <Lock size={12} className="text-slate-300 dark:text-slate-700 flex-shrink-0" />}
                  </div>
                ))}
                {lessons.length > 8 && (
                  <p className="text-[10px] text-center text-slate-400 py-2 font-bold">+{lessons.length - 8} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
