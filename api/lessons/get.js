import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * GET /api/lessons/get?courseId=1  — get all lessons for a course
 * GET /api/lessons/get?lessonId=5  — get single lesson
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    const { courseId, lessonId } = req.query;

    if (lessonId) {
      // Single lesson
      const [rows] = await db.query(
        'SELECT * FROM lessons WHERE id = ?', [lessonId]
      );
      if (!rows.length) return res.status(404).json({ message: 'Lesson not found' });
      const l = rows[0];
      return res.status(200).json({
        _id: l.id, id: l.id,
        courseId: l.course_id, title: l.title,
        content: l.content, videoUrl: l.video_url,
        lessonOrder: l.lesson_order, duration: l.duration,
      });
    }

    if (courseId) {
      // All lessons for a course
      const [rows] = await db.query(
        'SELECT * FROM lessons WHERE course_id = ? ORDER BY lesson_order ASC', [courseId]
      );
      const lessons = rows.map((l) => ({
        _id: l.id, id: l.id,
        courseId: l.course_id, title: l.title,
        content: l.content, videoUrl: l.video_url,
        lessonOrder: l.lesson_order, duration: l.duration,
      }));
      return res.status(200).json(lessons);
    }

    return res.status(400).json({ message: 'Provide courseId or lessonId query param' });
  } catch (err) {
    console.error('[lessons/get]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
