import db from '../config/db.js';
import { cors } from '../config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { category, search } = req.query || {};

    let sql = `
      SELECT c.*, u.name AS instructor_name, u.email AS instructor_email
      FROM courses c
      JOIN users u ON u.id = c.instructor_id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND c.category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (c.title LIKE ? OR c.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY c.created_at DESC';

    const [rows] = await db.query(sql, params);

    const courses = rows.map((r) => ({
      _id: r.id,
      id: r.id,
      title: r.title,
      description: r.description,
      thumbnail: r.thumbnail,
      category: r.category,
      level: r.level,
      instructorId: { 
        _id: r.instructor_id, 
        name: r.instructor_name, 
        email: r.instructor_email 
      },
      createdAt: r.created_at,
    }));

    return res.status(200).json(courses);
  } catch (err) {
    console.error('[courses/index GET]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
