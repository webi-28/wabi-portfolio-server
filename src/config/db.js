import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Support both DATABASE_URL (Neon/Render) and individual vars (local)
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 5432,
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'portfolio_wabi',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
    };

const pool = new Pool(poolConfig);

// Wrap pool.query to return [rows] like mysql2
const originalQuery = pool.query.bind(pool);
pool.query = async (sql, params) => {
  const result = await originalQuery(sql, params);
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
