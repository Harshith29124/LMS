import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { cors, generateToken } from '../config/middleware.js';

/**
 * POST /api/auth/signup
 * Body: { name, email, password, role }
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { name, email, password, role = 'learner' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (!['instructor', 'learner'].includes(role)) {
      return res.status(400).json({ message: 'Role must be instructor or learner' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check existing user
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashed, role]
    );

    const userId = result.insertId;
    const token = generateToken(userId);

    return res.status(201).json({ id: userId, name, email, role, token });
  } catch (err) {
    console.error('[signup]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
