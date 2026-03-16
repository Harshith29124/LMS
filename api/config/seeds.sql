-- LMS SEED DATA 2026.03.16
-- Clean existing data (USE WITH CAUTION)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE progress;
-- TRUNCATE TABLE enrollments;
-- TRUNCATE TABLE quizzes;
-- TRUNCATE TABLE lessons;
-- TRUNCATE TABLE courses;
-- SET FOREIGN_KEY_CHECKS = 1;

-- 1. Create Instructor if not exists
INSERT IGNORE INTO users (id, name, email, password, role) VALUES 
(99, 'Senior Instructor', 'instructor@craftconnect.com', '$2a$12$R9h/lSAbR79X.Y4VvN/x6.YvYn4X1Z0/2l3X4Z5/6X7Z8Y9A0B1C', 'instructor');

-- 2. Insert React Course
INSERT IGNORE INTO courses (id, title, description, thumbnail, category, level, instructor_id, playlist_id) VALUES
(1, 'Modern React Masterclass 2026', 'Master the internal architecture of React, including Fiber, Concurrent Mode, and Server Components. This course is designed for senior developers wanting to push the boundaries of UI engineering.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80', 'Programming', 'Advanced', 99, 'PLillGF-RfqbbQeVSccR9PGKHzPJSWqcsm');

-- 3. Insert Python Course
INSERT IGNORE INTO courses (id, title, description, thumbnail, category, level, instructor_id, playlist_id) VALUES
(2, 'Python Ecosystem: Data & Backend', 'A comprehensive exploration of the Python ecosystem. From FastAPI backend architecture to data processing with Polars and NumPy. Learn to build production-grade systems.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', 'Programming', 'Intermediate', 99, 'PLWKjhJtqVAbnSe1qUNMG7AbPmjIG54u88');

-- 4. Insert Lessons for React
INSERT IGNORE INTO lessons (id, course_id, title, content, video_url, duration, lesson_order) VALUES
(1, 1, 'The Architecture of Fiber', '# Fiber Reconciler\nLearn how React schedules updates and manages the component tree with the Fiber algorithm.', 'https://www.youtube.com/watch?v=0ywa92437vE', '15 min', 0),
(2, 1, 'Concurrent Mode Patterns', '# Concurrent Rendering\nMaster useTransition, useDeferredValue, and how to keep your app responsive during heavy renders.', 'https://www.youtube.com/watch?v=0ywa92437vE', '22 min', 1),
(3, 1, 'Server Components Deep Dive', '# Next-Gen Rendering\nExplore RSCs (React Server Components), streaming, and the future of full-stack React.', 'https://www.youtube.com/watch?v=0ywa92437vE', '30 min', 2);

-- 5. Insert Quiz for Lesson 1
INSERT IGNORE INTO quizzes (lesson_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
(1, 'What is the primary goal of the Fiber reconciler?', 'To increase bundle size', 'To enable incremental rendering', 'To replace the virtual DOM', 'To simplify CSS-in-JS', 'To enable incremental rendering');

-- 6. Insert Lessons for Python
INSERT IGNORE INTO lessons (id, course_id, title, content, video_url, duration, lesson_order) VALUES
(4, 2, 'FastAPI Structure', '# Modern API Design\nLearn the dependency injection system and schema validation in FastAPI.', 'https://www.youtube.com/watch?v=tLreidmX0B4', '18 min', 0);
