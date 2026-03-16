import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * GET /api/courses/my
 * Returns courses created by the authenticated instructor
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    const [rows] = await db.query(
      `SELECT c.*, u.name AS instructor_name
       FROM courses c JOIN users u ON u.id = c.instructor_id
       WHERE c.instructor_id = ?
       ORDER BY c.created_at DESC`,
      [decoded.id]
    );

    const courses = rows.map((r) => ({
      _id: r.id, id: r.id,
      title: r.title, description: r.description,
      thumbnail: r.thumbnail, category: r.category, level: r.level,
      instructorId: { _id: r.instructor_id, name: r.instructor_name },
      createdAt: r.created_at,
    }));

    return res.status(200).json(courses);
  } catch (err) {
    console.error('[courses/my]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
