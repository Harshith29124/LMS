# 🎓 CraftConnect LMS - Vercel Serverless

A complete, production-ready **Learning Management System** built with modern 2026 SaaS UI standards, optimized for **Vercel** serverless functions and **MySQL**.

---

## 🚀 Tech Stack

### Frontend
- **React + Vite**
- **Tailwind CSS** & Framer Motion
- **YouTube Embed Player** (Lightweight, no hosting needed)

### Backend (Serverless)
- **Vercel Functions** (Node.js runtime)
- **MySQL** (Optimized for providers like filess.io)
- **JWT** Authentication
- **bcryptjs** Password hashing

---

## 📁 Project Structure

```
LMS/
├── api/               # Vercel Serverless Functions
│   ├── auth/          # signup, login, me
│   ├── courses/       # list, get, create, update, delete, my
│   ├── lessons/       # get, create, delete
│   ├── quiz/          # get, create, submit
│   ├── enroll/        # index (enroll, check, list)
│   ├── progress/      # index (get %, mark complete)
│   └── config/        # db.js (MySQL pool), middleware.js
│
├── frontend/          # React + Vite application
│
├── vercel.json        # Vercel routing & environment
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Database Setup
1. Create a free MySQL database (e.g., on [filess.io](https://filess.io)).
2. Run the SQL script found in `api/config/schema.sql` to create the tables.

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
DB_HOST=...
DB_PORT=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
JWT_SECRET=...
```

### 3. Run Locally (via Vercel CLI)
```bash
npm install -g vercel
vercel dev
```
The app will be available at `http://localhost:3000`.

---

## ✨ Features

- **Instructor Tools**: Create courses, add YouTube lessons, and build interactive 4-option quizzes.
- **Learner Experience**: Browse courses, enroll, track progress, and take quizzes.
- **YouTube Powered**: Lightweight lesson delivery using YouTube embeds.
- **SaaS UI**: Responsive design with liquid animations and dark mode.
- **Serverless**: Zero-server maintenance, scaling automatically on Vercel.

---

## 🔑 Demo Access
Sign up as either a **Learner** or an **Instructor** via the UI to explore the different dashboards.
