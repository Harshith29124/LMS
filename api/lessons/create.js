import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * POST /api/lessons/create
 * Body: { courseId, title, content, videoUrl, duration }
 * Instructor must own the course
 */

// Validate that URL is YouTube only
function isValidYouTubeUrl(url) {
  if (!url) return true; // empty is OK
  try {
    const u = new URL(url);
    return u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com' || u.hostname === 'youtu.be';
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    const { courseId, title, content = '', videoUrl = '', duration = '10 min' } = req.body;

    if (!courseId || !title?.trim()) {
      return res.status(400).json({ message: 'courseId and title are required' });
    }

    // Validate YouTube URL
    if (videoUrl && !isValidYouTubeUrl(videoUrl)) {
      return res.status(400).json({ message: 'Only YouTube URLs (youtube.com or youtu.be) are accepted' });
    }

    // Ownership check
    const [courseRows] = await db.query(
      'SELECT instructor_id FROM courses WHERE id = ?', [courseId]
    );
    if (!courseRows.length) return res.status(404).json({ message: 'Course not found' });
    if (courseRows[0].instructor_id !== decoded.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get next order
    const [countRows] = await db.query(
      'SELECT COUNT(*) AS cnt FROM lessons WHERE course_id = ?', [courseId]
    );
    const lessonOrder = countRows[0].cnt;

    const [result] = await db.query(
      'INSERT INTO lessons (course_id, title, content, video_url, lesson_order, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [courseId, title.trim(), content, videoUrl, lessonOrder, duration]
    );

    return res.status(201).json({
      _id: result.insertId, id: result.insertId,
      courseId, title, content, videoUrl, lessonOrder, duration,
    });
  } catch (err) {
    console.error('[lessons/create]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
