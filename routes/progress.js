// ================================================================
// routes/progress.js — Submissions, Streak, Badges, Dashboard
// ================================================================
const express = require('express');
const router = express.Router();
const { query, getClient } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// ── POST /api/progress/submit ────────────────────────────────────
router.post('/submit', authMiddleware, async (req, res) => {
  const { problemId, status, language, code, notes, timeTaken } = req.body;
  if (!problemId || !status) {
    return res.status(400).json({ success: false, message: 'problemId and status are required.' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const subResult = await client.query(
      `INSERT INTO submissions (user_id, problem_id, status, language, code, notes, time_taken)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, problem_id)
       DO UPDATE SET
         status = EXCLUDED.status,
         language = COALESCE(EXCLUDED.language, submissions.language),
         code = COALESCE(EXCLUDED.code, submissions.code),
         notes = COALESCE(EXCLUDED.notes, submissions.notes),
         time_taken = COALESCE(EXCLUDED.time_taken, submissions.time_taken),
         attempts = submissions.attempts + 1,
         solved_at = CASE WHEN EXCLUDED.status = 'solved' THEN NOW() ELSE submissions.solved_at END,
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, problemId, status, language, code, notes, timeTaken]
    );

    const problem = await client.query('SELECT difficulty FROM problems WHERE id = $1', [problemId]);
    const difficulty = problem.rows[0]?.difficulty;
    const points = { easy: 10, medium: 20, hard: 40 }[difficulty] || 10;

    if (status === 'solved') {
      await client.query(
        'UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2',
        [points, req.user.id]
      );
      await client.query(
        `INSERT INTO daily_activity (user_id, date, problems_solved, points_earned)
         VALUES ($1, CURRENT_DATE, 1, $2)
         ON CONFLICT (user_id, date)
         DO UPDATE SET
           problems_solved = daily_activity.problems_solved + 1,
           points_earned = daily_activity.points_earned + $2`,
        [req.user.id, points]
      );
      await updateStreak(client, req.user.id);
      await checkAndAwardBadges(client, req.user.id);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: status === 'solved' ? `Solved! +${points} points 🎉` : 'Progress saved.',
      submission: subResult.rows[0],
      pointsEarned: status === 'solved' ? points : 0,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Submit error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    client.release();
  }
});

// ── GET /api/progress/dashboard ──────────────────────────────────
router.get('/dashboard', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const statsResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE s.status = 'solved') AS total_solved,
        COUNT(*) FILTER (WHERE s.status = 'solved' AND p.difficulty = 'easy') AS easy_solved,
        COUNT(*) FILTER (WHERE s.status = 'solved' AND p.difficulty = 'medium') AS medium_solved,
        COUNT(*) FILTER (WHERE s.status = 'solved' AND p.difficulty = 'hard') AS hard_solved,
        COUNT(*) FILTER (WHERE s.status = 'bookmarked') AS bookmarked
      FROM submissions s
      JOIN problems p ON p.id = s.problem_id
      WHERE s.user_id = $1
    `, [userId]);

    const topicResult = await query(`
      SELECT p.topic, COUNT(*) as solved
      FROM submissions s
      JOIN problems p ON p.id = s.problem_id
      WHERE s.user_id = $1 AND s.status = 'solved'
      GROUP BY p.topic
    `, [userId]);

    const activityResult = await query(`
      SELECT date, problems_solved, points_earned
      FROM daily_activity
      WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '28 days'
      ORDER BY date DESC
    `, [userId]);

    const userResult = await query(
      'SELECT points, streak, longest_streak, last_active FROM users WHERE id = $1',
      [userId]
    );

    const badgeResult = await query(`
      SELECT b.slug, b.name, b.icon, b.description, ub.earned_at
      FROM user_badges ub JOIN badges b ON b.id = ub.badge_id
      WHERE ub.user_id = $1 ORDER BY ub.earned_at DESC
    `, [userId]);

    const recentResult = await query(`
      SELECT s.status, s.solved_at, p.title, p.difficulty, p.slug
      FROM submissions s JOIN problems p ON p.id = s.problem_id
      WHERE s.user_id = $1 AND s.status = 'solved'
      ORDER BY s.solved_at DESC LIMIT 5
    `, [userId]);

    const user = userResult.rows[0];
    const stats = statsResult.rows[0];

    res.json({
      success: true,
      stats: {
        totalSolved: parseInt(stats.total_solved),
        easySolved: parseInt(stats.easy_solved),
        mediumSolved: parseInt(stats.medium_solved),
        hardSolved: parseInt(stats.hard_solved),
        bookmarked: parseInt(stats.bookmarked),
        points: user.points,
        streak: user.streak,
        longestStreak: user.longest_streak,
      },
      topicBreakdown: topicResult.rows,
      activity: activityResult.rows,
      badges: badgeResult.rows,
      recentSolves: recentResult.rows,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/progress/submissions ────────────────────────────────
router.get('/submissions', authMiddleware, async (req, res) => {
  const { status, topic } = req.query;
  let whereExtra = '';
  const params = [req.user.id];

  if (status) { params.push(status); whereExtra += ` AND s.status = $${params.length}`; }
  if (topic)  { params.push(topic);  whereExtra += ` AND p.topic = $${params.length}`; }

  try {
    const result = await query(`
      SELECT s.*, p.title, p.slug, p.topic, p.difficulty, p.companies
      FROM submissions s JOIN problems p ON p.id = s.problem_id
      WHERE s.user_id = $1 ${whereExtra}
      ORDER BY s.updated_at DESC
    `, params);
    res.json({ success: true, submissions: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/progress/notes/:problemId ───────────────────────────
router.get('/notes/:problemId', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM notes WHERE user_id = $1 AND problem_id = $2',
      [req.user.id, req.params.problemId]
    );
    res.json({ success: true, note: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PUT /api/progress/notes/:problemId ───────────────────────────
router.put('/notes/:problemId', authMiddleware, async (req, res) => {
  const { content } = req.body;
  try {
    const result = await query(
      `INSERT INTO notes (user_id, problem_id, content)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, problem_id) DO UPDATE SET content = $3, updated_at = NOW()
       RETURNING *`,
      [req.user.id, req.params.problemId, content]
    );
    res.json({ success: true, note: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── Streak update ─────────────────────────────────────────────────
async function updateStreak(client, userId) {
  const result = await client.query(
    'SELECT last_active, streak, longest_streak FROM users WHERE id = $1',
    [userId]
  );
  const user = result.rows[0];
  const today = new Date().toISOString().slice(0, 10);
  const lastActive = user.last_active?.toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let newStreak = user.streak;
  if (lastActive === yesterday) newStreak = user.streak + 1;
  else if (lastActive !== today) newStreak = 1;

  const newLongest = Math.max(newStreak, user.longest_streak);
  await client.query(
    'UPDATE users SET streak = $1, longest_streak = $2, last_active = $3 WHERE id = $4',
    [newStreak, newLongest, today, userId]
  );
}

// ── Badge checking ────────────────────────────────────────────────
async function checkAndAwardBadges(client, userId) {
  const stats = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE s.status='solved') AS total,
      COUNT(*) FILTER (WHERE s.status='solved' AND p.difficulty='easy') AS easy_count,
      COUNT(*) FILTER (WHERE s.status='solved' AND p.difficulty='hard') AS hard_count
    FROM submissions s JOIN problems p ON p.id = s.problem_id WHERE s.user_id = $1
  `, [userId]);
  const user = await client.query('SELECT streak FROM users WHERE id = $1', [userId]);

  const s = stats.rows[0];
  const streak = user.rows[0].streak;
  const total = parseInt(s.total);
  const easyCount = parseInt(s.easy_count);
  const hardCount = parseInt(s.hard_count);

  const allBadges = await client.query('SELECT * FROM badges');
  const earnedResult = await client.query('SELECT badge_id FROM user_badges WHERE user_id = $1', [userId]);
  const earnedIds = new Set(earnedResult.rows.map(r => r.badge_id));

  for (const badge of allBadges.rows) {
    if (earnedIds.has(badge.id)) continue;
    let earned = false;
    if (badge.condition_type === 'solved_count'    && total      >= badge.condition_value) earned = true;
    if (badge.condition_type === 'streak'           && streak     >= badge.condition_value) earned = true;
    if (badge.condition_type === 'difficulty_easy'  && easyCount  >= badge.condition_value) earned = true;
    if (badge.condition_type === 'difficulty_hard'  && hardCount  >= badge.condition_value) earned = true;
    if (earned) {
      await client.query(
        'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, badge.id]
      );
    }
  }
}

module.exports = router;
