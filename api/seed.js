import db from './config/db.js';
import { cors } from './config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    // Create tables
    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('instructor','learner') NOT NULL DEFAULT 'learner',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await db.query(`CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      thumbnail VARCHAR(512) DEFAULT '',
      category VARCHAR(100) NOT NULL DEFAULT 'Other',
      level ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
      instructor_id INT NOT NULL,
      playlist_id VARCHAR(100) DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Ensure playlist_id column exists if table was created previously without it
    try {
      await db.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS playlist_id VARCHAR(100) DEFAULT '' AFTER instructor_id`);
    } catch (e) {
      // Some MySQL versions don't support ADD COLUMN IF NOT EXISTS, ignore if already exists
      if (!e.message.includes('Duplicate column name')) throw e;
    }

    await db.query(`CREATE TABLE IF NOT EXISTS lessons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      video_url VARCHAR(512) DEFAULT '',
      lesson_order INT DEFAULT 0,
      duration VARCHAR(30) DEFAULT '10 min',
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await db.query(`CREATE TABLE IF NOT EXISTS quizzes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lesson_id INT NOT NULL,
      question TEXT NOT NULL,
      option_a VARCHAR(512) NOT NULL,
      option_b VARCHAR(512) NOT NULL,
      option_c VARCHAR(512) NOT NULL,
      option_d VARCHAR(512) NOT NULL,
      correct_answer CHAR(1) NOT NULL,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await db.query(`CREATE TABLE IF NOT EXISTS enrollments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      course_id INT NOT NULL,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_enrollment (user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await db.query(`CREATE TABLE IF NOT EXISTS progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      lesson_id INT NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 1,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_progress (user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Seed instructor
    await db.query(`INSERT IGNORE INTO users (id, name, email, password, role) VALUES 
      (99, 'Senior Instructor', 'instructor@craftconnect.com', '$2a$12$R9h/lSAbR79X.Y4VvN/x6.YvYn4X1Z0/2l3X4Z5/6X7Z8Y9A0B1C', 'instructor')`);

    // Seed courses with YouTube playlist IDs
    await db.query(`INSERT IGNORE INTO courses (id, title, description, thumbnail, category, level, instructor_id, playlist_id) VALUES
      (1, 'Modern React Masterclass 2026', 'Master the internal architecture of React, including Fiber, Concurrent Mode, and Server Components. This course is designed for senior developers wanting to push the boundaries of UI engineering.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80', 'Programming', 'Advanced', 99, 'PLillGF-RfqbbQeVSccR9PGKHzPJSWqcsm'),
      (2, 'Python Ecosystem: Data & Backend', 'A comprehensive exploration of the Python ecosystem. From FastAPI backend architecture to data processing with Polars and NumPy. Learn to build production-grade systems.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', 'Programming', 'Intermediate', 99, 'PLWKjhJtqVAbnSe1qUNMG7AbPmjIG54u88'),
      (3, 'JavaScript Fundamentals', 'Complete JavaScript course from basics to advanced concepts including closures, prototypes, async/await, and modern ES2025+ features.', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80', 'Programming', 'Beginner', 99, 'PLillGF-RfqbZTASqIqdvm1R5mLrQq79CU'),
      (4, 'Node.js Backend Development', 'Build scalable server-side applications with Node.js, Express, and MongoDB. Covers REST APIs, authentication, and deployment.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80', 'Programming', 'Intermediate', 99, 'PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX'),
      (5, 'HTML & CSS Mastery', 'Learn modern HTML5 and CSS3 from scratch. Covers Flexbox, Grid, animations, responsive design, and accessibility best practices.', 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80', 'Design', 'Beginner', 99, 'PL0Zuz27SZ-6PrE9srvEn8NBhOOyx61qd7'),
      (6, 'SQL Database Engineering', 'Master relational databases with SQL. Covers queries, joins, indexing, normalization, stored procedures, and performance optimization.', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80', 'Data Science', 'Intermediate', 99, 'PL0Zuz27SZ-6NDfReGuY74O-L-A_R5z04U')`);

    // Seed lessons
    await db.query(`INSERT IGNORE INTO lessons (id, course_id, title, content, video_url, duration, lesson_order) VALUES
      (1, 1, 'The Architecture of Fiber', '# Fiber Reconciler\\nLearn how React schedules updates and manages the component tree with the Fiber algorithm.', 'https://www.youtube.com/watch?v=0ywa92437vE', '15 min', 0),
      (2, 1, 'Concurrent Mode Patterns', '# Concurrent Rendering\\nMaster useTransition, useDeferredValue, and how to keep your app responsive.', 'https://www.youtube.com/watch?v=0ywa92437vE', '22 min', 1),
      (3, 1, 'Server Components Deep Dive', '# Next-Gen Rendering\\nExplore RSCs, streaming, and the future of full-stack React.', 'https://www.youtube.com/watch?v=0ywa92437vE', '30 min', 2),
      (4, 2, 'FastAPI Structure', '# Modern API Design\\nLearn dependency injection and schema validation in FastAPI.', 'https://www.youtube.com/watch?v=tLreidmX0B4', '18 min', 0)`);

    // Seed quiz
    await db.query(`INSERT IGNORE INTO quizzes (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
      (1, 1, 'What is the primary goal of the Fiber reconciler?', 'To increase bundle size', 'To enable incremental rendering', 'To replace the virtual DOM', 'To simplify CSS-in-JS', 'B')`);

    // Get counts
    const [users] = await db.query('SELECT COUNT(*) as c FROM users');
    const [courses] = await db.query('SELECT COUNT(*) as c FROM courses');
    const [lessons] = await db.query('SELECT COUNT(*) as c FROM lessons');

    return res.status(200).json({
      message: 'Database seeded successfully!',
      counts: {
        users: users[0].c,
        courses: courses[0].c,
        lessons: lessons[0].c,
      }
    });
  } catch (err) {
    console.error('[SEED ERROR]', err);
    return res.status(500).json({ message: 'Seed failed', error: err.message });
  }
}
