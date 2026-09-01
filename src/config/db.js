import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'portfolio_wabi',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
});

// Helper to mimic mysql2's pool.query([sql, params]) → [rows, fields]
// Returns [rows] so all existing code works with [rows] = await pool.query(...)
const originalQuery = pool.query.bind(pool);

pool.query = async (sql, params) => {
  const result = await originalQuery(sql, params);
  // Return [rows] array just like mysql2 does
  return [result.rows, result.fields];
};

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
};

export default pool;
