import db from './config/db.js';
import { cors, authenticate } from './config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const url = req.url.split('?')[0];

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    // POST /api/enrollment/enroll
    if (url.includes('/enroll') && req.method === 'POST') {
      const { courseId } = req.body || req.query;
      if (!courseId) return res.status(400).json({ message: 'Course ID Required' });

      // Check existing
      const [existing] = await db.query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [decoded.id, courseId]);
      if (existing.length > 0) return res.status(200).json({ message: 'Persistence check: Already registered' });

      await db.query('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)', [decoded.id, courseId]);
      return res.status(201).json({ message: 'Enrollment synchronized' });
    }

    // GET /api/enrollment/check
    if (url.includes('/check') && req.method === 'GET') {
      const { courseId } = req.query;
      const [rows] = await db.query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [decoded.id, courseId]);
      return res.status(200).json({ enrolled: rows.length > 0 });
    }

    // GET /api/enrollment/my
    if (url.includes('/my') && req.method === 'GET') {
      const [rows] = await db.query(`
        SELECT c.*, u.name as instructor_name,
               (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as total_lessons,
               (SELECT COUNT(*) FROM progress p JOIN lessons l2 ON l2.id = p.lesson_id WHERE p.user_id = ? AND l2.course_id = c.id) as completed_lessons
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        JOIN users u ON u.id = c.instructor_id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
      `, [decoded.id, decoded.id]);

      return res.status(200).json(rows.map(r => ({
        ...r,
        _id: r.id,
        id: r.id,
        instructorId: { name: r.instructor_name },
        progress: r.total_lessons > 0 ? Math.round((r.completed_lessons / r.total_lessons) * 100) : 0
      })));
    }

    // Progress Section
    // POST /api/enrollment/progress (Complete)
    if (url.includes('/progress') && req.method === 'POST') {
      const { lessonId } = req.body;
      if (!lessonId) return res.status(400).json({ message: 'Module ID required' });

      await db.query('INSERT IGNORE INTO progress (user_id, lesson_id, completed) VALUES (?, ?, 1)', [decoded.id, lessonId]);
      return res.status(200).json({ message: 'Milestone recorded' });
    }

    // GET /api/enrollment/progress (Get Detailed Course Progress)
    if (url.includes('/progress') && req.method === 'GET') {
      const { courseId } = req.query;
      
      const [lessons] = await db.query('SELECT id FROM lessons WHERE course_id = ?', [courseId]);
      const [progress] = await db.query(`
        SELECT p.lesson_id 
        FROM progress p
        JOIN lessons l ON l.id = p.lesson_id
        WHERE p.user_id = ? AND l.course_id = ?
      `, [decoded.id, courseId]);

      const total = lessons.length;
      const completed = progress.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      const completedLessons = progress.map(p => p.lesson_id);

      return res.status(200).json({
        total,
        completed,
        percentage,
        completedLessons // Array of IDs for frontend check
      });
    }

    return res.status(404).json({ message: 'System Notification: Enrollment endpoint offline' });
  } catch (err) {
    console.error('[API ENROLLMENT ERROR]', err);
    return res.status(500).json({ message: 'Internal Kernel Fault', error: err.message });
  }
}
