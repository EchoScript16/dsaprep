// ================================================================
// routes/problems.js — Problem listing, detail, filtering
// ================================================================
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return next(); // no token → continue
  }

  try {
    const actualToken = token.startsWith('Bearer ')
      ? token.split(' ')[1]
      : token;

    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded;

  } catch (err) {
    // ignore invalid token
  }

  next();
};

// ── GET /api/problems — List with filters ───────────────────────
router.get('/', optionalAuth, async (req, res) => {
  const { topic, difficulty, company, search, page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let whereClause = 'WHERE p.is_active = TRUE';
  const params = [];
  let pCount = 0;

  if (topic) { pCount++; whereClause += ` AND p.topic = $${pCount}`; params.push(topic); }
  if (difficulty) { pCount++; whereClause += ` AND p.difficulty = $${pCount}`; params.push(difficulty); }
  if (company) { pCount++; whereClause += ` AND $${pCount} = ANY(p.companies)`; params.push(company); }
  if (search) { pCount++; whereClause += ` AND p.title ILIKE $${pCount}`; params.push(`%${search}%`); }

  // If user is logged in, include their submission status
  let selectExtra = '';
  let joinExtra = '';
  if (req.user) {
    selectExtra = ', s.status as user_status, s.solved_at';
    joinExtra = ` LEFT JOIN submissions s ON s.problem_id = p.id AND s.user_id = '${req.user.id}'`;
  }

  try {
    pCount++; params.push(parseInt(limit));
    pCount++; params.push(offset);

    const result = await query(
      `SELECT p.id, p.title, p.slug, p.topic, p.difficulty, p.companies, p.leetcode_url, p.acceptance_rate${selectExtra}
       FROM problems p${joinExtra}
       ${whereClause}
       ORDER BY p.topic, p.difficulty, p.title
       LIMIT $${pCount - 1} OFFSET $${pCount}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM problems p ${whereClause}`,
      params.slice(0, params.length - 2)
    );

    res.json({
      success: true,
      problems: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
    });
  } catch (err) {
    console.error('Problems list error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/problems/:slug — Single problem detail ─────────────
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM problems WHERE slug = $1 AND is_active = TRUE',
      [req.params.slug]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Problem not found.' });

    const problem = result.rows[0];

    // Get user's submission if logged in
    let userSubmission = null;
    if (req.user) {
      const sub = await query(
        'SELECT * FROM submissions WHERE user_id = $1 AND problem_id = $2',
        [req.user.id, problem.id]
      );
      if (sub.rows.length) userSubmission = sub.rows[0];
    }

    // Get discussion count
    const discussCount = await query(
      'SELECT COUNT(*) FROM discussions WHERE problem_id = $1 AND parent_id IS NULL',
      [problem.id]
    );

    res.json({
      success: true,
      problem: {
        ...problem,
        userSubmission,
        discussionCount: parseInt(discussCount.rows[0].count),
      },
    });
  } catch (err) {
    console.error('Problem detail error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/problems/topics/summary — Topic stats ──────────────
router.get('/topics/summary', optionalAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT
        p.topic,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE p.difficulty = 'easy') as easy_count,
        COUNT(*) FILTER (WHERE p.difficulty = 'medium') as medium_count,
        COUNT(*) FILTER (WHERE p.difficulty = 'hard') as hard_count
      FROM problems p
      WHERE p.is_active = TRUE
      GROUP BY p.topic
      ORDER BY p.topic
    `);

    let userProgress = [];
    if (req.user) {
      const prog = await query(`
        SELECT p.topic, COUNT(*) as solved
        FROM submissions s
        JOIN problems p ON p.id = s.problem_id
        WHERE s.user_id = $1 AND s.status = 'solved'
        GROUP BY p.topic
      `, [req.user.id]);
      userProgress = prog.rows;
    }

    const topics = result.rows.map(t => ({
      ...t,
      solved: userProgress.find(p => p.topic === t.topic)?.solved || 0,
    }));

    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
