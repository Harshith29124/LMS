import db from './config/db.js';
import { cors } from './config/middleware.js';

// HIGH-QUALITY SEEDED DATA
const SEEDED_COURSES = [
  {
    id: 1, _id: 1,
    title: 'Modern React Masterclass 2026',
    description: 'Master the internal architecture of React, including Fiber, Concurrent Mode, and Server Components. This course is designed for senior developers wanting to push the boundaries of UI engineering.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    category: 'Programming',
    level: 'Advanced',
    instructor_name: 'Senior Instructor',
    playlist_id: 'PLillGF-RfqbbQeVSccR9PGKHzPJSWqcsm'
  },
  {
    id: 2, _id: 2,
    title: 'Python Ecosystem: Data & Backend',
    description: 'A comprehensive exploration of the Python ecosystem. From FastAPI backend architecture to data processing with Polars and NumPy. Learn to build production-grade systems.',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    category: 'Programming',
    level: 'Intermediate',
    instructor_name: 'Senior Instructor',
    playlist_id: 'PLWKjhJtqVAbnSe1qUNMG7AbPmjIG54u88'
  },
  {
    id: 3, _id: 3,
    title: 'JavaScript Fundamentals',
    description: 'Complete JavaScript course from basics to advanced concepts including closures, prototypes, async/await, and modern ES2025+ features.',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80',
    category: 'Programming',
    level: 'Beginner',
    instructor_name: 'Senior Instructor',
    playlist_id: 'PLillGF-RfqbZTASqIqdvm1R5mLrQq79CU'
  },
  {
    id: 4, _id: 4,
    title: 'Node.js Backend Development',
    description: 'Build scalable server-side applications with Node.js, Express, and MongoDB. Covers REST APIs, authentication, and deployment.',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    category: 'Programming',
    level: 'Intermediate',
    instructor_name: 'Senior Instructor',
    playlist_id: 'PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX'
  },
  {
    id: 5, _id: 5,
    title: 'HTML & CSS Mastery',
    description: 'Learn modern HTML5 and CSS3 from scratch. Covers Flexbox, Grid, animations, responsive design, and accessibility best practices.',
    thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80',
    category: 'Design',
    level: 'Beginner',
    instructor_name: 'Senior Instructor',
    playlist_id: 'PL0Zuz27SZ-6PrE9srvEn8NBhOOyx61qd7'
  },
  {
    id: 6, _id: 6,
    title: 'SQL Database Engineering',
    description: 'Master relational databases with SQL. Covers queries, joins, indexing, normalization, and performance optimization.',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
    category: 'Data Science',
    level: 'Intermediate',
    instructor_name: 'Senior Instructor',
    playlist_id: 'PL0Zuz27SZ-6NDfReGuY74O-L-A_R5z04U'
  }
];

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const url = req.url.split('?')[0];

  try {
    // GET /api/courses
    if ((url === '/api/courses' || url === '/api/courses/') && req.method === 'GET') {
      let finalCourses = SEEDED_COURSES;
      try {
        const [rows] = await db.query(`
          SELECT c.*, u.name as instructor_name, u.email as instructor_email 
          FROM courses c 
          JOIN users u ON u.id = c.instructor_id 
          ORDER BY c.created_at DESC
        `);
        if (rows && rows.length > 0) finalCourses = rows;
      } catch (e) {
        console.warn('DB Fetch failed, serving static data');
      }

      return res.status(200).json(finalCourses.map(r => ({
        ...r,
        id: r.id, _id: r.id,
        instructorId: { name: r.instructor_name || 'Senior Instructor' }
      })));
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
      } catch (e) {}

      // Detailed Fallback
      const fb = SEEDED_COURSES.find(c => String(c.id) === String(id));
      if (fb) return res.status(200).json({ ...fb, instructorId: { name: fb.instructor_name } });
      
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.status(404).json({ message: 'Not Found' });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
