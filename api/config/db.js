import mysql from 'mysql2/promise';

/**
 * STRICHEST DB MANAGEMENT FOR FILESS.IO (5 CONNECTION LIMIT)
 * 
 * We use a pool size of 1. This ensures that even if Vercel spins up 
 * multiple instances, we stay under the 5-connection limit.
 * We also set a very low idle timeout to release connections immediately.
 */

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 1, // DO NOT INCREASE THIS. Filess.io will kill the app.
  maxIdle: 0, 
  idleTimeout: 1000, 
  queueLimit: 0,
  enableKeepAlive: false,
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = async (sql, params) => {
  const [results] = await pool.query(sql, params);
  return [results];
};

const db = { query };
export default db;
