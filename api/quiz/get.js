import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * GET /api/quiz/get?lessonId=5
 * Returns the quiz for a lesson
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    const { lessonId } = req.query;
    if (!lessonId) return res.status(400).json({ message: 'lessonId required' });

    const [rows] = await db.query('SELECT * FROM quizzes WHERE lesson_id = ?', [lessonId]);
    if (!rows.length) return res.status(404).json({ message: 'No quiz for this lesson' });

    const q = rows[0];
    return res.status(200).json({
      _id: q.id, id: q.id,
      lessonId: q.lesson_id,
      question: q.question,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      // Do NOT expose correctAnswer to learner here
    });
  } catch (err) {
    console.error('[quiz/get]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
