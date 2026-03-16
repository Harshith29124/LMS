import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * PUT /api/courses/update
 * Body: { id, title, description, thumbnail, category, level }
 * Instructor must own the course
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method not allowed' });

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    const { id, title, description, thumbnail, category, level } = req.body;
    if (!id) return res.status(400).json({ message: 'Course id required' });

    // Ownership check
    const [rows] = await db.query('SELECT instructor_id FROM courses WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Course not found' });
    if (rows[0].instructor_id !== decoded.id) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    await db.query(
      'UPDATE courses SET title = ?, description = ?, thumbnail = ?, category = ?, level = ? WHERE id = ?',
      [title, description, thumbnail, category, level, id]
    );

    return res.status(200).json({ message: 'Course updated', id });
  } catch (err) {
    console.error('[courses/update]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
