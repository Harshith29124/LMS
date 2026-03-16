import db from '../config/db.js';
import { cors, authenticate } from '../config/middleware.js';

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const decoded = authenticate(req, res);
  if (!decoded) return;

  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('[me]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
