import db from './config/db.js';
import { cors, authenticate } from './config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const url = req.url.split('?')[0];

  try {
    // GET /api/lessons/get
    if (url.includes('/get') && req.method === 'GET') {
      const { courseId, lessonId } = req.query;
      if (lessonId) {
        const [rows] = await db.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
        return res.status(200).json({ ...rows[0], _id: rows[0].id });
      }
      const [rows] = await db.query('SELECT * FROM lessons WHERE course_id = ? ORDER BY lesson_order', [courseId]);
      return res.status(200).json(rows.map(r => ({ ...r, _id: r.id })));
    }

    // POST /api/lessons/create
    if (url.includes('/create') && req.method === 'POST') {
      const decoded = authenticate(req, res);
      if (!decoded) return;
      const { courseId, title, content, videoUrl, duration } = req.body;
      const [result] = await db.query(
        'INSERT INTO lessons (course_id, title, content, video_url, duration) VALUES (?, ?, ?, ?, ?)',
        [courseId, title, content, videoUrl, duration]
      );
      return res.status(201).json({ id: result.insertId, title });
    }

    // DELETE /api/lessons/delete
    if (url.includes('/delete') && req.method === 'DELETE') {
      const decoded = authenticate(req, res);
      if (!decoded) return;
      const { lessonId } = req.query;
      await db.query('DELETE FROM lessons WHERE id = ?', [lessonId]);
      return res.status(200).json({ message: 'Deleted' });
    }

    return res.status(404).json({ message: 'Lesson endpoint not found' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
