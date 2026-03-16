import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * DELETE /api/lessons/delete
 * Body or query: { lessonId }
 * Instructor must own parent course
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method not allowed' });

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    const lessonId = req.body?.lessonId || req.query?.lessonId;
    if (!lessonId) return res.status(400).json({ message: 'lessonId required' });

    // Get lesson's course to verify ownership
    const [lessonRows] = await db.query(
      `SELECT l.id, c.instructor_id FROM lessons l
       JOIN courses c ON c.id = l.course_id WHERE l.id = ?`, [lessonId]
    );
    if (!lessonRows.length) return res.status(404).json({ message: 'Lesson not found' });
    if (lessonRows[0].instructor_id !== decoded.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await db.query('DELETE FROM lessons WHERE id = ?', [lessonId]);
    return res.status(200).json({ message: 'Lesson deleted' });
  } catch (err) {
    console.error('[lessons/delete]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
