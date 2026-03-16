import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, HelpCircle, Sparkles, ChevronRight } from 'lucide-react'
import { quizAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function QuizCard({ quiz, onComplete }) {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!quiz) return null

  const optionLabels = ['A', 'B', 'C', 'D']

  const handleSubmit = async () => {
    if (!selected) return toast.error('Selection required')
    setSubmitting(true)
    try {
      const { data } = await quizAPI.submit({ quizId: quiz._id, selectedAnswer: selected })
      setResult(data)
      onComplete?.()
    } catch (err) {
      toast.error('Sync error during quiz validation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-8 lg:p-10 rounded-[3rem] border-brand-primary/10 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
          <HelpCircle size={24} className="text-brand-primary" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Knowledge Check</p>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Validation Module</h3>
        </div>
      </div>

      {/* Question */}
      <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-10 leading-relaxed italic">
        "{quiz.question}"
      </h4>

      {/* Options */}
      <div className="space-y-4 mb-10">
        {quiz.options.map((opt, i) => {
          const isCorrect = result && opt === result.correctAnswer
          const isWrong = result && opt === selected && !result.isCorrect
          const isSelected = selected === opt

          return (
            <button
              key={opt}
              onClick={() => !result && setSelected(opt)}
              disabled={!!result}
              className={`w-full p-5 rounded-2xl flex items-center gap-6 border-2 transition-all text-left group ${
                !result 
                  ? isSelected 
                    ? 'bg-brand-primary/10 border-brand-primary text-white' 
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  : isCorrect
                    ? 'bg-green-500/10 border-green-500 text-green-500'
                    : isWrong
                      ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                      : 'bg-white/5 border-white/5 text-slate-600 opacity-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${
                !result
                  ? isSelected ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'bg-surface-800 text-slate-500 group-hover:text-white'
                  : isCorrect ? 'bg-green-500 text-white' : isWrong ? 'bg-rose-500 text-white' : 'bg-surface-900 text-slate-700'
              }`}>
                {isCorrect ? <CheckCircle size={18} /> : isWrong ? <XCircle size={18} /> : optionLabels[i]}
              </div>
              <span className="flex-1 font-bold text-base md:text-lg">{opt}</span>
              {isSelected && !result && <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse shadow-[0_0_10px_rgb(99,102,241)]" />}
            </button>
          )
        })}
      </div>

      {/* Submission Actions */}
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.button
            key="submit"
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="premium-button w-full flex items-center justify-center gap-3 group"
          >
            <Sparkles size={18} className="fill-current" />
            <span className="uppercase tracking-widest text-xs font-black">{submitting ? 'Verifying...' : 'Validate Answer'}</span>
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-[2rem] flex items-center gap-4 ${
              result.isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-rose-500/10 border border-rose-500/20'
            }`}
          >
             <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.isCorrect ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'}`}>
                {result.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
             </div>
             <div>
                <p className={`text-sm font-black uppercase tracking-widest ${result.isCorrect ? 'text-green-500' : 'text-rose-500'}`}>
                    {result.isCorrect ? 'Validation Passed' : 'Validation Failed'}
                </p>
                <p className="text-xs text-slate-400 font-bold">
                    {result.isCorrect ? 'Knowledge synchronized successfully.' : `Correct sequence: ${result.correctAnswer}`}
                </p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
