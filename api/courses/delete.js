import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * DELETE /api/courses/delete
 * Body or query: { id }
 * Instructor must own the course
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method not allowed' });

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    const id = req.body?.id || req.query?.id;
    if (!id) return res.status(400).json({ message: 'Course id required' });

    // Ownership check
    const [rows] = await db.query('SELECT instructor_id FROM courses WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Course not found' });
    if (rows[0].instructor_id !== decoded.id) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    // Cascades handle lessons, enrollments, progress via FK
    await db.query('DELETE FROM courses WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('[courses/delete]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
