// ================================================================
// routes/leaderboard.js — Rankings ONLY
// Bug fixed: removed double module.exports
// ================================================================
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// ── GET /api/leaderboard ─────────────────────────────────────────
router.get('/', async (req, res) => {
  const { college, limit = 50 } = req.query;
  const params = [parseInt(limit)];
  let whereClause = '';

  if (college) {
    params.push(college);
    whereClause = `WHERE u.college ILIKE $${params.length}`;
  }

  try {
    const result = await query(
      `SELECT
         u.id, u.username, u.college, u.avatar,
         u.points, u.streak,
         COUNT(s.id) FILTER (WHERE s.status = 'solved') AS problems_solved,
         RANK() OVER (ORDER BY u.points DESC, u.streak DESC) AS rank
       FROM users u
       LEFT JOIN submissions s ON s.user_id = u.id
       ${whereClause}
       GROUP BY u.id
       ORDER BY rank
       LIMIT $1`,
      params
    );

    const rows = result.rows.map(r => ({
      ...r,
      isYou: req.user ? r.id === req.user.id : false,
      problems_solved: parseInt(r.problems_solved),
    }));

    res.json({ success: true, leaderboard: rows });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── Single export — no more double export bug ────────────────────
module.exports = router;