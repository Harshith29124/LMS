import db from './config/db.js';
import { cors } from './config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
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

    try {
      await db.query(`ALTER TABLE courses ADD COLUMN playlist_id VARCHAR(100) DEFAULT '' AFTER instructor_id`);
    } catch (e) {}

    await db.query(`INSERT IGNORE INTO users (id, name, email, password, role) VALUES 
      (99, 'Senior Instructor', 'instructor@craftconnect.com', 'admin123', 'instructor')`);

    await db.query(`INSERT IGNORE INTO courses (id, title, description, thumbnail, category, level, instructor_id, playlist_id) VALUES
      (1, 'Modern React Masterclass 2026', 'Master the internal architecture of React.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80', 'Programming', 'Advanced', 99, 'PLillGF-RfqbbQeVSccR9PGKHzPJSWqcsm'),
      (2, 'Python Ecosystem', 'Full Python backend architecture.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', 'Programming', 'Intermediate', 99, 'PLWKjhJtqVAbnSe1qUNMG7AbPmjIG54u88'),
      (3, 'JavaScript Fundamentals', 'Basics to advanced JS.', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80', 'Programming', 'Beginner', 99, 'PLillGF-RfqbZTASqIqdvm1R5mLrQq79CU')`);

    return res.status(200).json({ message: 'Database seeded successfully!' });
  } catch (err) {
    return res.status(500).json({ message: 'Seed failed', error: err.message });
  }
}
