// ================================================================
// routes/auth.js — Register, Login, Profile
// ================================================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Helper: generate JWT
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// Helper: format user response (strip password)
const formatUser = (u) => ({
  id: u.id, email: u.email, username: u.username,
  college: u.college, city: u.city, avatar: u.avatar,
  targetCompany: u.target_company, placementDate: u.placement_date,
  currentLevel: u.current_level, dailyGoal: u.daily_goal,
  points: u.points, streak: u.streak, longestStreak: u.longest_streak,
  createdAt: u.created_at,
});

// ── POST /api/auth/register ──────────────────────────────────────
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('username').trim().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, username, password, college, city, targetCompany, currentLevel } = req.body;

  try {
    const existing = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email or username already taken.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (email, username, password_hash, college, city, target_company, current_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [email, username, passwordHash, college || null, city || null, targetCompany || null, currentLevel || 'beginner']
    );

    const user = result.rows[0];
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: formatUser(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await query('UPDATE users SET last_active = CURRENT_DATE, updated_at = NOW() WHERE id = $1', [user.id]);

    const token = signToken(user);
    res.json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];
    delete user.password_hash;

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  const { college, city, targetCompany, placementDate, currentLevel, dailyGoal } = req.body;
  try {
    const result = await query(
      `UPDATE users SET
        college = COALESCE($1, college),
        city = COALESCE($2, city),
        target_company = COALESCE($3, target_company),
        placement_date = COALESCE($4, placement_date),
        current_level = COALESCE($5, current_level),
        daily_goal = COALESCE($6, daily_goal),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [college, city, targetCompany, placementDate, currentLevel, dailyGoal, req.user.id]
    );
    res.json({ success: true, user: formatUser(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PUT /api/auth/change-password ────────────────────────────────
router.put('/change-password', authMiddleware, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { currentPassword, newPassword } = req.body;
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
