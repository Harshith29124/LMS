import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * api/progress/index.js
 * GET  /api/progress?courseId=123   - Get progress % and completed lesson IDs
 * POST /api/progress?lessonId=456   - Mark a lesson as completed
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    if (req.method === 'POST') {
      const { lessonId } = req.body || req.query;
      if (!lessonId) return res.status(400).json({ message: 'Lesson ID required' });

      // Mark completed (ignore if already completed via unique constraint)
      await db.query(
        'INSERT IGNORE INTO progress (user_id, lesson_id, completed) VALUES (?, ?, 1)',
        [decoded.id, lessonId]
      );

      return res.status(200).json({ message: 'Lesson marked as completed' });
    }

    if (req.method === 'GET') {
      const { courseId } = req.query;
      if (!courseId) return res.status(400).json({ message: 'Course ID required' });

      // Get count of total lessons in course
      const [totalLessonsRows] = await db.query(
        'SELECT COUNT(*) as total FROM lessons WHERE course_id = ?',
        [courseId]
      );
      const totalCount = totalLessonsRows[0].total;

      // Get completed lessons for this user in this course
      const [completedRows] = await db.query(
        `SELECT lesson_id FROM progress p
         JOIN lessons l ON l.id = p.lesson_id
         WHERE p.user_id = ? AND l.course_id = ?`,
        [decoded.id, courseId]
      );

      const completedIds = completedRows.map(r => r.lesson_id);
      const percentage = totalCount > 0 
        ? Math.round((completedIds.length / totalCount) * 100) 
        : 0;

      return res.status(200).json({
        percentage,
        completedLessons: completedIds,
        total: totalCount,
        completed: completedIds.length
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('[progress]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
