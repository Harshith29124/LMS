import jwt from 'jsonwebtoken';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  // Production frontend URL — add your Vercel URL here
];

/**
 * Applies CORS headers for Vercel serverless functions.
 * Returns true if the request is an OPTIONS preflight (should return early).
 */
export function cors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true; // caller should return immediately
  }
  return false;
}

/**
 * Verifies the Bearer JWT and returns the decoded payload.
 * Throws with status 401 on failure.
 */
export function authenticate(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    return null;
  }
}

/**
 * Generates a signed JWT for a user.
 */
export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
