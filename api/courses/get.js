import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * GET /api/courses/get?id=123
 * Returns a single course by ID with instructor info
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Course id is required' });

    const [rows] = await db.query(
      `SELECT c.*, u.name AS instructor_name, u.email AS instructor_email
       FROM courses c JOIN users u ON u.id = c.instructor_id
       WHERE c.id = ?`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Course not found' });

    const r = rows[0];
    return res.status(200).json({
      _id: r.id, id: r.id,
      title: r.title, description: r.description,
      thumbnail: r.thumbnail, category: r.category, level: r.level,
      instructorId: { _id: r.instructor_id, name: r.instructor_name, email: r.instructor_email },
      createdAt: r.created_at,
    });
  } catch (err) {
    console.error('[courses/get]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
