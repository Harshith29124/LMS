import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { quizAPI } from '../services/api'
import toast from 'react-hot-toast'

/**
 * QuizCard - displays a quiz for a lesson and handles submission
 */
export default function QuizCard({ quiz, onComplete }) {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!quiz) return null

  const optionLabels = ['A', 'B', 'C', 'D']

  const handleSubmit = async () => {
    if (!selected) return toast.error('Please select an answer')
    setSubmitting(true)
    try {
      const { data } = await quizAPI.submit({ quizId: quiz._id, selectedAnswer: selected })
      setResult(data)
      onComplete?.()
    } catch (err) {
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const getOptionClass = (opt) => {
    if (!result) return selected === opt ? 'quiz-option selected' : 'quiz-option'
    if (opt === result.correctAnswer) return 'quiz-option correct'
    if (opt === selected && !result.isCorrect) return 'quiz-option wrong'
    return 'quiz-option'
  }

  return (
    <motion.div
      className="card-flat"
      style={{ padding: 24 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(99,102,241,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <HelpCircle size={20} color="#6366F1" />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Quiz
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary-light)' }}>
            Test your knowledge
          </div>
        </div>
      </div>

      {/* Question */}
      <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, lineHeight: 1.4, color: 'var(--text-primary-light)' }}>
        {quiz.question}
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {quiz.options.map((opt, i) => (
          <button
            key={opt}
            className={getOptionClass(opt)}
            onClick={() => !result && setSelected(opt)}
            disabled={!!result}
            id={`quiz-option-${i}`}
          >
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: selected === opt && !result
                ? '#6366F1'
                : result && opt === result.correctAnswer
                  ? '#22C55E'
                  : result && opt === selected && !result.isCorrect
                    ? '#EF4444'
                    : 'rgba(100,116,139,0.12)',
              color: (selected === opt && !result) || (result && (opt === result.correctAnswer || (opt === selected && !result.isCorrect)))
                ? 'white' : 'var(--text-secondary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, flexShrink: 0,
              transition: 'all 0.2s',
            }}>
              {optionLabels[i]}
            </span>
            <span style={{ flex: 1, textAlign: 'left' }}>{opt}</span>
            {result && opt === result.correctAnswer && <CheckCircle size={18} color="#22C55E" />}
            {result && opt === selected && !result.isCorrect && opt === selected && <XCircle size={18} color="#EF4444" />}
          </button>
        ))}
      </div>

      {/* Submit / Result */}
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.button
            key="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleSubmit}
            disabled={!selected || submitting}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="quiz-submit-btn"
          >
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </motion.button>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '16px 20px',
              borderRadius: 12,
              background: result.isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1.5px solid ${result.isCorrect ? '#22C55E' : '#EF4444'}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            {result.isCorrect
              ? <CheckCircle size={24} color="#22C55E" />
              : <XCircle size={24} color="#EF4444" />
            }
            <div>
              <div style={{ fontWeight: 700, color: result.isCorrect ? '#16A34A' : '#DC2626', fontSize: 15 }}>
                {result.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
              </div>
              {!result.isCorrect && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary-light)', marginTop: 2 }}>
                  Correct answer: <strong>{result.correctAnswer}</strong>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
