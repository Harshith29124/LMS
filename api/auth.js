import bcrypt from 'bcryptjs';
import db from './config/db.js';
import { cors, generateToken, authenticate } from './config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const { path } = req.query; // If using dynamic routing or we can check req.url
  const url = req.url.split('?')[0];

  try {
    // POST /api/auth/signup
    if (url.includes('/signup') && req.method === 'POST') {
      const { name, email, password, role = 'learner' } = req.body;
      if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
      
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) return res.status(409).json({ message: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 12);
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email.toLowerCase(), hashed, role]
      );

      const token = generateToken(result.insertId);
      return res.status(201).json({ id: result.insertId, name, email, role, token });
    }

    // POST /api/auth/login
    if (url.includes('/login') && req.method === 'POST') {
      const { email, password } = req.body;
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });

      const token = generateToken(user.id);
      return res.status(200).json({ id: user.id, name: user.name, email: user.email, role: user.role, token });
    }

    // GET /api/auth/me
    if (url.includes('/me') && req.method === 'GET') {
      const decoded = authenticate(req, res);
      if (!decoded) return;
      
      const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json({ ...rows[0], _id: rows[0].id });
    }

    return res.status(404).json({ message: 'Auth endpoint not found' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
