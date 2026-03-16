import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * POST /api/courses/create
 * Body: { title, description, thumbnail, category, level }
 * Role: instructor only
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const decoded = authenticate(req, res);
  if (!decoded) return;

  // Role check
  const [userRows] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
  if (!userRows.length || userRows[0].role !== 'instructor') {
    return res.status(403).json({ message: 'Forbidden: Instructor access only' });
  }

  try {
    const {
      title,
      description,
      thumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
      category = 'Other',
      level = 'Beginner',
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const [result] = await db.query(
      'INSERT INTO courses (title, description, thumbnail, category, level, instructor_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title.trim(), description.trim(), thumbnail, category, level, decoded.id]
    );

    return res.status(201).json({
      _id: result.insertId,
      id: result.insertId,
      title, description, thumbnail, category, level,
      instructorId: decoded.id,
    });
  } catch (err) {
    console.error('[courses/create]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
