import mysql from 'mysql2/promise';

/**
 * ULTRA-STRICT DB MANAGEMENT FOR FILESS.IO
 * 
 * Since Filess.io has a 5-connection limit, we CANNOT use pools 
 * in a serverless environment (Vercel). Each parallel request 
 * would create a pool and eat up the limit.
 * 
 * SOLUTION: Manual connection handling with mandatory cleanup.
 */

const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  rowsAsArray: false,
  ssl: {
    rejectUnauthorized: false
  }
};

export async function query(sql, params = []) {
  let conn;
  try {
    // Open a fresh connection for every single query
    conn = await mysql.createConnection(config);
    const [rows] = await conn.execute(sql, params);
    return [rows];
  } catch (err) {
    if (err.message.includes('max_user_connections')) {
      console.error('DB Limit Reached. Retrying in 500ms...');
      await new Promise(r => setTimeout(r, 500));
      return query(sql, params); // Recursive retry once
    }
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.end(); // FORCE CLOSE IMMEDIATELY
      } catch (e) {
        console.error('Error closing connection:', e.message);
      }
    }
  }
}

const db = { query };
export default db;
