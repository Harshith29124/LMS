import db from './config/db.js';
import { cors, authenticate } from './config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const url = req.url.split('?')[0];

  try {
    // GET /api/lessons/get
    if (url.includes('/get') && req.method === 'GET') {
      const { lessonId, courseId } = req.query;
      
      if (lessonId) {
        const [rows] = await db.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Lesson module not found' });
        const r = rows[0];
        return res.status(200).json({ 
          ...r, 
          _id: r.id, 
          id: r.id,
          videoUrl: r.video_url,
          lessonOrder: r.lesson_order
        });
      }

      if (courseId) {
        const [rows] = await db.query('SELECT * FROM lessons WHERE course_id = ? ORDER BY lesson_order ASC, created_at ASC', [courseId]);
        return res.status(200).json(rows.map(r => ({ 
          ...r, 
          _id: r.id, 
          id: r.id,
          videoUrl: r.video_url,
          lessonOrder: r.lesson_order
        })));
      }

      return res.status(400).json({ message: 'Module ID or Course ID required' });
    }

    // POST /api/lessons/create
    if (url.includes('/create') && req.method === 'POST') {
      const decoded = authenticate(req, res);
      if (!decoded) return;

      const { courseId, title, content, videoUrl, duration, order } = req.body;
      
      // Verify course ownership
      const [courses] = await db.query('SELECT id FROM courses WHERE id = ? AND instructor_id = ?', [courseId, decoded.id]);
      if (courses.length === 0) return res.status(403).json({ message: 'Unauthorized course modification' });

      const [result] = await db.query(
        'INSERT INTO lessons (course_id, title, content, video_url, duration, lesson_order) VALUES (?, ?, ?, ?, ?, ?)',
        [courseId, title, content, videoUrl, duration, order || 0]
      );
      
      return res.status(201).json({ 
        id: result.insertId, 
        _id: result.insertId,
        title 
      });
    }

    // DELETE /api/lessons/delete
    if (url.includes('/delete') && req.method === 'DELETE') {
      const decoded = authenticate(req, res);
      if (!decoded) return;

      const { lessonId } = req.query;
      
      // Ownership check (join with courses)
      const [rows] = await db.query(`
        SELECT l.id FROM lessons l 
        JOIN courses c ON c.id = l.course_id 
        WHERE l.id = ? AND c.instructor_id = ?
      `, [lessonId, decoded.id]);
      
      if (rows.length === 0) return res.status(403).json({ message: 'Unauthorized asset disposal' });

      await db.query('DELETE FROM lessons WHERE id = ?', [lessonId]);
      return res.status(200).json({ message: 'Module decoupled successfully' });
    }

    return res.status(404).json({ message: `System Error: Endpoint ${url} is inactive` });
  } catch (err) {
    console.error('[API LESSONS ERROR]', err);
    return res.status(500).json({ message: 'Kernel Error', error: err.message });
  }
}
