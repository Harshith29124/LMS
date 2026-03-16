import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * POST /api/quiz/create
 * Body: { lessonId, question, optionA, optionB, optionC, optionD, correctAnswer }
 * correctAnswer: 'A' | 'B' | 'C' | 'D'
 * Instructor must own parent course
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    const { lessonId, question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;

    if (!lessonId || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return res.status(400).json({ message: 'All quiz fields are required' });
    }

    if (!['A', 'B', 'C', 'D'].includes(correctAnswer.toUpperCase())) {
      return res.status(400).json({ message: 'correctAnswer must be A, B, C, or D' });
    }

    // Ownership check through lesson → course
    const [rows] = await db.query(
      `SELECT c.instructor_id FROM lessons l
       JOIN courses c ON c.id = l.course_id WHERE l.id = ?`, [lessonId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Lesson not found' });
    if (rows[0].instructor_id !== decoded.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Upsert: replace existing quiz for this lesson
    const [existing] = await db.query('SELECT id FROM quizzes WHERE lesson_id = ?', [lessonId]);
    let quizId;

    if (existing.length) {
      await db.query(
        `UPDATE quizzes SET question=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_answer=?
         WHERE lesson_id=?`,
        [question, optionA, optionB, optionC, optionD, correctAnswer.toUpperCase(), lessonId]
      );
      quizId = existing[0].id;
    } else {
      const [result] = await db.query(
        `INSERT INTO quizzes (lesson_id, question, option_a, option_b, option_c, option_d, correct_answer)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [lessonId, question, optionA, optionB, optionC, optionD, correctAnswer.toUpperCase()]
      );
      quizId = result.insertId;
    }

    return res.status(201).json({
      id: quizId, lessonId, question,
      options: [optionA, optionB, optionC, optionD],
      correctAnswer: correctAnswer.toUpperCase(),
    });
  } catch (err) {
    console.error('[quiz/create]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
