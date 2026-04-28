// ================================================================
// server.js — DSAPrep Backend Entry Point (FIXED)
// ================================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { pool } = require('./db');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;


// ── Serve frontend static files ──────────────────────────────────
// This tells Express to serve index.html, style.css, app.js etc.
app.use(express.static(path.join(__dirname)));

// ── Middleware ───────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please wait an hour.' },
});
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Health check ─────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// ── API Routes ───────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/problems',    require('./routes/problems'));
app.use('/api/progress',    require('./routes/progress'));   
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/discussions', require('./routes/discussions'));

// ── Code execution proxy (Judge0) ────────────────────────────────
app.post('/api/execute', async (req, res) => {
  const { source_code, language_id, stdin } = req.body;

  if (!process.env.JUDGE0_API_KEY) {
    return res.json({
      success: true,
      status: { id: 3, description: 'Accepted (simulation)' },
      stdout: `[Simulation] Code received (${source_code?.split('\n').length || 0} lines)\nAdd JUDGE0_API_KEY to .env for real execution.`,
      stderr: null,
      time: '0.01',
      memory: 1024,
    });
  }

  try {
    const fetch = require('node-fetch');
    const submitRes = await fetch(`${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({ source_code, language_id, stdin }),
    });
    const data = await submitRes.json();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Code execution service unavailable.', error: err.message });
  }
});

// ── Language list ────────────────────────────────────────────────
app.get('/api/languages', (req, res) => {
  res.json({
    languages: [
      { id: 71, name: 'Python 3',    ext: 'py'   },
      { id: 54, name: 'C++ (GCC 9)', ext: 'cpp'  },
      { id: 62, name: 'Java 13',     ext: 'java' },
      { id: 50, name: 'C (GCC 9)',   ext: 'c'    },
      { id: 63, name: 'JavaScript',  ext: 'js'   },
    ]
  });
});

// ── Catch-all: serve index.html for any non-API route ────────────
// This makes the SPA work when you refresh on any page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Global error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   DSAPrep Backend running 🚀             ║
  ║   http://localhost:${PORT}                  ║
  ║   Health: http://localhost:${PORT}/health   ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;