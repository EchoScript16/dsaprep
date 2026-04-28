// ================================================================
// routes/discussions.js — Comments per problem (separate file)
// ================================================================
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// ── GET /api/discussions/:problemId ─────────────────────────────
router.get('/:problemId', async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*, u.username, u.avatar,
         (SELECT COUNT(*) FROM discussions r WHERE r.parent_id = d.id) AS reply_count
       FROM discussions d
       JOIN users u ON u.id = d.user_id
       WHERE d.problem_id = $1 AND d.parent_id IS NULL
       ORDER BY d.upvotes DESC, d.created_at DESC`,
      [req.params.problemId]
    );
    res.json({ success: true, discussions: result.rows });
  } catch (err) {
    console.error('Discussions GET error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/discussions/:problemId/replies/:parentId ────────────
router.get('/:problemId/replies/:parentId', async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*, u.username, u.avatar
       FROM discussions d JOIN users u ON u.id = d.user_id
       WHERE d.parent_id = $1 ORDER BY d.created_at ASC`,
      [req.params.parentId]
    );
    res.json({ success: true, replies: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── POST /api/discussions/:problemId ────────────────────────────
router.post('/:problemId', authMiddleware, async (req, res) => {
  const { content, parentId } = req.body;
  if (!content?.trim()) {
    return res.status(400).json({ success: false, message: 'Comment content is required.' });
  }
  try {
    const result = await query(
      `INSERT INTO discussions (problem_id, user_id, parent_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.problemId, req.user.id, parentId || null, content.trim()]
    );
    res.status(201).json({ success: true, discussion: result.rows[0] });
  } catch (err) {
    console.error('Discussions POST error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── POST /api/discussions/:id/upvote ────────────────────────────
router.post('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    await query('UPDATE discussions SET upvotes = upvotes + 1 WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Upvoted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── DELETE /api/discussions/:id ──────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM discussions WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) {
      return res.status(403).json({ success: false, message: 'Not allowed.' });
    }
    res.json({ success: true, message: 'Comment deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;