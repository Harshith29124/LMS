import db from './config/db.js';
import { cors, authenticate } from './config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const url = req.url.split('?')[0];

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    // POST /api/enroll/index (Enroll in course)
    if (url.includes('/enroll') && req.method === 'POST') {
      const { courseId } = req.body || req.query;
      if (!courseId) return res.status(400).json({ message: 'Course ID requested' });

      // Check existing
      const [existing] = await db.query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [decoded.id, courseId]);
      if (existing.length > 0) return res.status(400).json({ message: 'Already enrolled' });

      await db.query('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)', [decoded.id, courseId]);
      return res.status(201).json({ message: 'Enrolled successfully' });
    }

    // GET /api/enroll/index (List enrolled courses)
    if (url.includes('/enroll') && req.method === 'GET') {
      const { courseId } = req.query;
      if (courseId) {
        const [rows] = await db.query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [decoded.id, courseId]);
        return res.status(200).json({ enrolled: rows.length > 0 });
      }

      const [rows] = await db.query(`
        SELECT c.*, u.name as instructor_name,
               (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as total_lessons,
               (SELECT COUNT(*) FROM progress p JOIN lessons l2 ON l2.id = p.lesson_id WHERE p.user_id = ? AND l2.course_id = c.id) as completed_lessons
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        JOIN users u ON u.id = c.instructor_id
        WHERE e.user_id = ?
      `, [decoded.id, decoded.id]);

      return res.status(200).json(rows.map(r => ({
        ...r,
        _id: r.id,
        id: r.id,
        instructorId: { name: r.instructor_name },
        progress: r.total_lessons > 0 ? Math.round((r.completed_lessons / r.total_lessons) * 100) : 0
      })));
    }

    // POST /api/progress/index (Mark lesson complete)
    if (url.includes('/progress') && req.method === 'POST') {
      const { lessonId } = req.body;
      if (!lessonId) return res.status(400).json({ message: 'Lesson ID required' });

      await db.query('INSERT IGNORE INTO progress (user_id, lesson_id, completed) VALUES (?, ?, 1)', [decoded.id, lessonId]);
      return res.status(200).json({ message: 'Progress updated' });
    }

    // GET /api/progress/index (Get course progress)
    if (url.includes('/progress') && req.method === 'GET') {
      const { courseId } = req.query;
      const [rows] = await db.query(`
        SELECT p.lesson_id 
        FROM progress p
        JOIN lessons l ON l.id = p.lesson_id
        WHERE p.user_id = ? AND l.course_id = ?
      `, [decoded.id, courseId]);
      
      return res.status(200).json(rows.map(r => r.lesson_id));
    }

    return res.status(404).json({ message: `Enrollment/Progress endpoint not found: ${url}` });
  } catch (err) {
    console.error('[API ENROLLMENT ERROR]', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
