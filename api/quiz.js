import db from './config/db.js';
import { cors, authenticate } from './config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const url = req.url.split('?')[0];

  try {
    // GET /api/quiz/get
    if (url.includes('/get') && req.method === 'GET') {
      const { lessonId } = req.query;
      const [rows] = await db.query('SELECT id, lesson_id, question, option_a, option_b, option_c, option_d FROM quizzes WHERE lesson_id = ?', [lessonId]);
      if (rows.length === 0) return res.status(404).json({ message: 'No quiz' });
      const q = rows[0];
      return res.status(200).json({ _id: q.id, id: q.id, question: q.question, options: [q.option_a, q.option_b, q.option_c, q.option_d] });
    }

    // POST /api/quiz/create
    if (url.includes('/create') && req.method === 'POST') {
      const decoded = authenticate(req, res);
      if (!decoded) return;
      const { lessonId, question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
      await db.query('DELETE FROM quizzes WHERE lesson_id = ?', [lessonId]);
      await db.query(
        'INSERT INTO quizzes (lesson_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [lessonId, question, optionA, optionB, optionC, optionD, correctAnswer]
      );
      return res.status(201).json({ message: 'Created' });
    }

    // POST /api/quiz/submit
    if (url.includes('/submit') && req.method === 'POST') {
      const decoded = authenticate(req, res);
      if (!decoded) return;
      const { quizId, selectedOption } = req.body;
      const [rows] = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
      const quiz = rows[0];
      const isCorrect = quiz.correct_answer === selectedOption;
      return res.status(200).json({ isCorrect, correctAnswer: quiz.correct_answer });
    }

    return res.status(404).json({ message: 'Quiz endpoint not found' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
