import db from './config/db.js';
import { cors } from './config/middleware.js';

// BACKUP DATA IN CASE DB IS DOWN/EMPTY
const FALLBACK_COURSES = [
  {
    id: 1, _id: 1,
    title: 'Modern React Masterclass 2026',
    description: 'Master the internal architecture of React, including Fiber, Concurrent Mode, and Server Components.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    category: 'Programming',
    level: 'Advanced',
    instructor_name: 'Senior Instructor',
    playlist_id: 'PLillGF-RfqbbQeVSccR9PGKHzPJSWqcsm'
  },
  {
    id: 2, _id: 2,
    title: 'Python Ecosystem: Data & Backend',
    description: 'A comprehensive exploration of the Python ecosystem. From FastAPI to Polars and NumPy.',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    category: 'Programming',
    level: 'Intermediate',
    instructor_name: 'Senior Instructor',
    playlist_id: 'PLWKjhJtqVAbnSe1qUNMG7AbPmjIG54u88'
  },
  {
    id: 3, _id: 3,
    title: 'JavaScript Fundamentals',
    description: 'Complete JavaScript course from basics to advanced concepts.',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80',
    category: 'Programming',
    level: 'Beginner',
    instructor_name: 'Senior Instructor',
    playlist_id: 'PLillGF-RfqbZTASqIqdvm1R5mLrQq79CU'
  }
];

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const url = req.url.split('?')[0];

  try {
    // GET /api/courses
    if ((url === '/api/courses' || url === '/api/courses/') && req.method === 'GET') {
      try {
        const [rows] = await db.query(`
          SELECT c.*, u.name as instructor_name, u.email as instructor_email 
          FROM courses c 
          JOIN users u ON u.id = c.instructor_id 
          ORDER BY c.created_at DESC
        `);
        
        const courses = rows.length > 0 ? rows : FALLBACK_COURSES;
        
        return res.status(200).json(courses.map(r => ({
          ...r,
          id: r.id, _id: r.id,
          instructorId: { name: r.instructor_name || 'Instructor' }
        })));
      } catch (e) {
        console.warn('DB Error in list, using fallback:', e.message);
        return res.status(200).json(FALLBACK_COURSES.map(c => ({...c, instructorId: {name: c.instructor_name}})));
      }
    }

    // GET /api/courses/get (Single)
    if (url.includes('/get') && req.method === 'GET') {
      const { id } = req.query;
      try {
        const [rows] = await db.query(`
          SELECT c.*, u.name as instructor_name, u.email as instructor_email 
          FROM courses c 
          JOIN users u ON u.id = c.instructor_id 
          WHERE c.id = ?
        `, [id]);

        if (rows.length > 0) {
          const r = rows[0];
          return res.status(200).json({ ...r, id: r.id, _id: r.id, instructorId: { name: r.instructor_name } });
        }
      } catch (e) { console.warn('DB Error in single get:', e.message); }

      // Fallback for single course
      const fb = FALLBACK_COURSES.find(c => String(c.id) === String(id));
      if (fb) return res.status(200).json({ ...fb, instructorId: { name: fb.instructor_name } });
      
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.status(404).json({ message: 'Not Found' });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
