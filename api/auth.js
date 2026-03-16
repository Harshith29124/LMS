import bcrypt from 'bcryptjs';
import db from './config/db.js';
import { cors, generateToken, authenticate } from './config/middleware.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const url = req.url.split('?')[0];

  try {
    // POST /api/auth/signup
    if (url.includes('/signup') && req.method === 'POST') {
      const { name, email, password, role = 'learner' } = req.body;
      if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
      
      const normalizedEmail = email.toLowerCase().trim();
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
      
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const hashed = await bcrypt.hash(password, 12);
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, normalizedEmail, hashed, role]
      );

      const token = generateToken(result.insertId);
      return res.status(201).json({ 
        _id: result.insertId, 
        id: result.insertId, 
        name, 
        email: normalizedEmail, 
        role, 
        token 
      });
    }

    // POST /api/auth/login
    if (url.includes('/login') && req.method === 'POST') {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

      const normalizedEmail = email.toLowerCase().trim();
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
      
      if (rows.length === 0) {
        return res.status(401).json({ message: 'User not found. Please sign up first.' });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = generateToken(user.id);
      return res.status(200).json({ 
        _id: user.id, 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        token 
      });
    }

    // GET /api/auth/me
    if (url.includes('/me') && req.method === 'GET') {
      const decoded = authenticate(req, res);
      if (!decoded) return;
      
      const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
      if (rows.length === 0) return res.status(404).json({ message: 'User profile not found' });
      
      const user = rows[0];
      return res.status(200).json({ 
        ...user, 
        _id: user.id,
        id: user.id 
      });
    }

    return res.status(404).json({ message: `Auth endpoint not found: ${url}` });
  } catch (err) {
    console.error('[API AUTH ERROR]', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
