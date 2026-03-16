import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * POST /api/quiz/submit
 * Body: { quizId, selectedOption }
 * selectedOption: 'A' | 'B' | 'C' | 'D'
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    const { quizId, selectedOption } = req.body;
    if (!quizId || !selectedOption) {
      return res.status(400).json({ message: 'quizId and selectedOption are required' });
    }

    const [rows] = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (!rows.length) return res.status(404).json({ message: 'Quiz not found' });

    const quiz = rows[0];
    const selected = selectedOption.toUpperCase();
    const isCorrect = quiz.correct_answer === selected;

    // Map correct_answer letter back to text
    const optionMap = {
      A: quiz.option_a,
      B: quiz.option_b,
      C: quiz.option_c,
      D: quiz.option_d,
    };

    return res.status(200).json({
      isCorrect,
      correctAnswer: quiz.correct_answer,
      correctAnswerText: optionMap[quiz.correct_answer],
      selectedAnswerText: optionMap[selected],
    });
  } catch (err) {
    console.error('[quiz/submit]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
