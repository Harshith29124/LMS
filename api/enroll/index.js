import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    if (req.method === 'POST') {
      const { courseId } = req.body || req.query;
      if (!courseId) return res.status(400).json({ message: 'Course ID required' });

      // Check if already enrolled
      const [existing] = await db.query(
        'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
        [decoded.id, courseId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'Already enrolled in this course' });
      }

      await db.query(
        'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
        [decoded.id, courseId]
      );

      return res.status(201).json({ message: 'Enrolled successfully' });
    }

    if (req.method === 'GET') {
      const { courseId } = req.query;

      if (courseId) {
        // Single enrollment check
        const [rows] = await db.query(
          'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
          [decoded.id, courseId]
        );
        return res.status(200).json({ enrolled: rows.length > 0 });
      } else {
        // List enrolled courses with progress calculation
        const [rows] = await db.query(
          `SELECT c.id, c.title, c.description, c.thumbnail, c.category, c.level, 
                  u.name AS instructor_name,
                  (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS total_lessons,
                  (SELECT COUNT(*) FROM progress p 
                   JOIN lessons l2 ON l2.id = p.lesson_id 
                   WHERE p.user_id = ? AND l2.course_id = c.id) AS completed_lessons
           FROM enrollments e
           JOIN courses c ON c.id = e.course_id
           JOIN users u ON u.id = c.instructor_id
           WHERE e.user_id = ?`,
          [decoded.id, decoded.id]
        );

        const courses = rows.map(r => ({
          _id: r.id, 
          id: r.id,
          title: r.title, 
          description: r.description,
          thumbnail: r.thumbnail, 
          category: r.category, 
          level: r.level,
          instructorId: { name: r.instructor_name },
          progress: r.total_lessons > 0 
            ? Math.round((r.completed_lessons / r.total_lessons) * 100) 
            : 0
        }));

        return res.status(200).json(courses);
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('[enroll]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
