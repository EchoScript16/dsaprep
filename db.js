// ================================================================
// db.js — PostgreSQL connection pool (FIXED)
// ================================================================
const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction
          ? { rejectUnauthorized: false } // ✅ only for production (cloud)
          : false,                        // ✅ disable SSL locally
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: false, // ✅ local DB → no SSL
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

// ── Connection logs ──────────────────────────────────────────────
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

// ── Query helper ────────────────────────────────────────────────
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  if (!isProduction) {
    console.log(`[DB] ${duration}ms — ${text.slice(0, 60)}...`);
  }

  return res;
};

// ── Client helper ───────────────────────────────────────────────
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };