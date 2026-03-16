import db from './config/db.js';
import { cors, authenticate } from './config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const url = req.url.split('?')[0];

  try {
    // GET /api/quiz/get
    if (url.includes('/get') && req.method === 'GET') {
      const { lessonId } = req.query;
      const [rows] = await db.query('SELECT * FROM quizzes WHERE lesson_id = ?', [lessonId]);
      
      if (rows.length === 0) return res.status(404).json({ message: 'No knowledge check initialized' });
      
      const q = rows[0];
      return res.status(200).json({ 
        _id: q.id, 
        id: q.id, 
        question: q.question, 
        // Map back to array for frontend
        options: [q.option_a, q.option_b, q.option_c, q.option_d] 
      });
    }

    // POST /api/quiz/create
    if (url.includes('/create') && req.method === 'POST') {
      const decoded = authenticate(req, res);
      if (!decoded) return;

      const { lessonId, question, options, correctAnswer } = req.body;
      
      // Ownership check via course join
      const [rights] = await db.query(`
        SELECT l.id FROM lessons l
        JOIN courses c ON c.id = l.course_id
        WHERE l.id = ? AND c.instructor_id = ?
      `, [lessonId, decoded.id]);

      if (rights.length === 0) return res.status(403).json({ message: 'Unauthorized assessment engineering' });

      // Atomically refresh quiz (one per lesson)
      await db.query('DELETE FROM quizzes WHERE lesson_id = ?', [lessonId]);
      await db.query(
        'INSERT INTO quizzes (lesson_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [lessonId, question, options[0], options[1], options[2], options[3], correctAnswer]
      );
      
      return res.status(201).json({ message: 'Validation sequence cached' });
    }

    // POST /api/quiz/submit
    if (url.includes('/submit') && req.method === 'POST') {
      const decoded = authenticate(req, res);
      if (!decoded) return;

      const { quizId, selectedAnswer } = req.body;
      const [rows] = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
      
      if (rows.length === 0) return res.status(404).json({ message: 'Assessment ID invalid' });
      
      const quiz = rows[0];
      const isCorrect = quiz.correct_answer === selectedAnswer;
      
      return res.status(200).json({ 
        isCorrect, 
        correctAnswer: quiz.correct_answer 
      });
    }

    return res.status(404).json({ message: 'System Notification: Endpoint offline' });
  } catch (err) {
    console.error('[API QUIZ ERROR]', err);
    return res.status(500).json({ message: 'Kernel Exception', error: err.message });
  }
}
