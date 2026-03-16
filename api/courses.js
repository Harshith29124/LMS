import db from './config/db.js';
import { cors, authenticate } from './config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const url = req.url.split('?')[0];

  try {
    // GET /api/courses (List all) - Handle both /api/courses and /api/courses/
    if ((url === '/api/courses' || url === '/api/courses/') && req.method === 'GET') {
      const { category, search } = req.query;
      let sql = `
        SELECT c.*, u.name as instructor_name, u.email as instructor_email 
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
      return res.status(200).json(rows.map(r => ({
        ...r,
        _id: r.id,
        id: r.id,
        instructorId: {
          _id: r.instructor_id,
          name: r.instructor_name,
          email: r.instructor_email
        },
        createdAt: r.created_at
      })));
    }

    // POST /api/courses/create
    if (url.includes('/create') && req.method === 'POST') {
      const decoded = authenticate(req, res);
      if (!decoded) return;
      const { title, description, thumbnail, category, level } = req.body;
      const [result] = await db.query(
        'INSERT INTO courses (title, description, thumbnail, category, level, instructor_id) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, thumbnail, category, level, decoded.id]
      );
      return res.status(201).json({ id: result.insertId, _id: result.insertId, title });
    }

    // GET /api/courses/get (Single)
    if (url.includes('/get') && req.method === 'GET') {
      const { id } = req.query;
      const [rows] = await db.query(`
        SELECT c.*, u.name as instructor_name, u.email as instructor_email 
        FROM courses c 
        JOIN users u ON u.id = c.instructor_id 
        WHERE c.id = ?
      `, [id]);
      
      if (rows.length === 0) return res.status(404).json({ message: 'Course not found' });
      
      const r = rows[0];
      return res.status(200).json({
        ...r,
        _id: r.id,
        id: r.id,
        instructorId: {
          _id: r.instructor_id,
          name: r.instructor_name,
          email: r.instructor_email
        }
      });
    }

    // GET /api/courses/my (Instructor personal)
    if (url.includes('/my') && req.method === 'GET') {
      const decoded = authenticate(req, res);
      if (!decoded) return;
      const [rows] = await db.query('SELECT * FROM courses WHERE instructor_id = ? ORDER BY created_at DESC', [decoded.id]);
      return res.status(200).json(rows.map(r => ({ ...r, _id: r.id, id: r.id })));
    }

    // DELETE /api/courses/delete
    if (url.includes('/delete') && req.method === 'DELETE') {
      const decoded = authenticate(req, res);
      if (!decoded) return;
      const { id } = req.query;
      await db.query('DELETE FROM courses WHERE id = ? AND instructor_id = ?', [id, decoded.id]);
      return res.status(200).json({ message: 'Course deleted successfully' });
    }

    return res.status(404).json({ message: `Course endpoint not found: ${url}` });
  } catch (err) {
    console.error('[API COURSES ERROR]', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
