-- ============================================================
-- CraftConnect LMS — MySQL Schema (Vercel Fix)
-- ============================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(191)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,
  role          ENUM('instructor','learner') NOT NULL DEFAULT 'learner',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Courses
CREATE TABLE IF NOT EXISTS courses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT          NOT NULL,
  thumbnail     VARCHAR(512)  DEFAULT '',
  category      VARCHAR(100)  NOT NULL DEFAULT 'Other',
  level         ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
  instructor_id INT           NOT NULL,
  playlist_id   VARCHAR(100)  DEFAULT '',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  course_id     INT           NOT NULL,
  title         VARCHAR(255)  NOT NULL,
  content       TEXT,
  video_url     VARCHAR(512)  DEFAULT '',
  lesson_order  INT           DEFAULT 0,
  duration      VARCHAR(30)   DEFAULT '10 min',
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id     INT           NOT NULL,
  question      TEXT          NOT NULL,
  option_a      VARCHAR(512)  NOT NULL,
  option_b      VARCHAR(512)  NOT NULL,
  option_c      VARCHAR(512)  NOT NULL,
  option_d      VARCHAR(512)  NOT NULL,
  correct_answer CHAR(1)      NOT NULL COMMENT 'A, B, C, or D',
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  course_id     INT           NOT NULL,
  enrolled_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_enrollment (user_id, course_id),
  FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Progress
CREATE TABLE IF NOT EXISTS progress (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  lesson_id     INT           NOT NULL,
  completed     TINYINT(1)    NOT NULL DEFAULT 1,
  completed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_progress (user_id, lesson_id),
  FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

