import mysql from 'mysql2/promise';

/**
 * MySQL connection pool singleton for Vercel Serverless.
 * Using a pool ensures connections are reused across function calls.
 */

let pool;

export function getPool() {
  if (!pool) {
    const config = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      ssl: {
        rejectUnauthorized: false // Required for filess.io and most cloud providers
      }
    };

    pool = mysql.createPool(config);
    
    // Test connectivity
    pool.getConnection()
      .then(conn => {
        console.log('✅ MySQL Connected');
        conn.release();
      })
      .catch(err => {
        console.error('❌ MySQL Connection Failed:', err.message);
      });
  }
  return pool;
}

const db = getPool();
export default db;
