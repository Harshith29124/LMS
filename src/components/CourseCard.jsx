import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, GraduationCap, Star, ArrowRight } from 'lucide-react'
import ProgressBar from './ProgressBar'

export default function CourseCard({ course, enrolled, showProgress, progress = 0 }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => navigate(`/courses/${course._id || course.id}`)}
      className="course-card cursor-pointer"
    >
      <div className="course-card-inner h-full flex flex-col p-5">
        {/* Image / Thumbnail Section */}
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-5">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="premium-badge">{course.category || 'Skill'}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
              {course.level || 'Beginner'}
            </span>
          </div>
          
          <div className="absolute bottom-3 right-3 text-white flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-black">4.9</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed h-10">
              {course.description}
            </p>
          </div>

          <div className="flex items-center justify-between py-4 border-y border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30">
                <GraduationCap className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="text-xs font-bold text-slate-300">
                {course.instructorId?.name || 'Expert Instructor'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-tighter">12h 30m</span>
            </div>
          </div>

          {showProgress ? (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                <span>Progress</span>
                <span className="text-brand-primary">{progress}%</span>
              </div>
              <ProgressBar value={progress} height={6} />
            </div>
          ) : (
            <div className="flex items-center justify-between pt-2">
              <span className="text-2xl font-black text-white">$0.00</span>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
