import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * api/enroll/index.js
 * POST /api/enroll?courseId=123   - Enroll in a course
 * GET  /api/enroll                - Get list of enrolled courses for current user
 * GET  /api/enroll?courseId=123   - Check enrollment status for a specific course
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    // POST: Enroll
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

    // GET: List or Check
    if (req.method === 'GET') {
      const { courseId } = req.query;

      if (courseId) {
        // Check specific status
        const [rows] = await db.query(
          'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
          [decoded.id, courseId]
        );
        return res.status(200).json({ enrolled: rows.length > 0 });
      } else {
        // Get all enrolled courses
        const [rows] = await db.query(
          `SELECT c.id, c.title, c.description, c.thumbnail, c.category, c.level, 
                  u.name AS instructor_name
           FROM enrollments e
           JOIN courses c ON c.id = e.course_id
           JOIN users u ON u.id = c.instructor_id
           WHERE e.user_id = ?`,
          [decoded.id]
        );

        const courses = rows.map(r => ({
          _id: r.id, id: r.id,
          title: r.title, description: r.description,
          thumbnail: r.thumbnail, category: r.category, level: r.level,
          instructorId: { name: r.instructor_name }
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
