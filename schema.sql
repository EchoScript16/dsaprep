-- ================================================================
-- DSAPrep Platform — Database Schema
-- Run this in Supabase SQL Editor or any PostgreSQL instance
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. USERS TABLE
-- ================================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar        TEXT DEFAULT NULL,
  college       TEXT DEFAULT NULL,
  city          TEXT DEFAULT NULL,
  target_company TEXT DEFAULT NULL,
  placement_date DATE DEFAULT NULL,
  current_level TEXT DEFAULT 'beginner' CHECK (current_level IN ('beginner','basic','intermediate','advanced')),
  daily_goal    INT DEFAULT 2,
  points        INT DEFAULT 0,
  streak        INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active   DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 2. PROBLEMS TABLE
-- ================================================================
CREATE TABLE problems (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  topic       TEXT NOT NULL,
  difficulty  TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  description TEXT NOT NULL,
  examples    TEXT NOT NULL,
  hints       JSONB NOT NULL DEFAULT '[]',
  companies   TEXT[] DEFAULT '{}',
  leetcode_url TEXT DEFAULT NULL,
  gfg_url     TEXT DEFAULT NULL,
  acceptance_rate DECIMAL(5,2) DEFAULT 50.0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 3. USER PROBLEM SUBMISSIONS
-- ================================================================
CREATE TABLE submissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id  UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  status      TEXT NOT NULL CHECK (status IN ('solved','attempted','bookmarked')),
  language    TEXT DEFAULT 'python',
  code        TEXT DEFAULT NULL,
  time_taken  INT DEFAULT NULL,           -- seconds
  attempts    INT DEFAULT 1,
  notes       TEXT DEFAULT NULL,
  solved_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);

-- ================================================================
-- 4. DAILY ACTIVITY / STREAK TRACKING
-- ================================================================
CREATE TABLE daily_activity (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  problems_solved INT DEFAULT 0,
  points_earned   INT DEFAULT 0,
  UNIQUE(user_id, date)
);

-- ================================================================
-- 5. BADGES
-- ================================================================
CREATE TABLE badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  condition_type TEXT NOT NULL,   -- 'solved_count', 'streak', 'topic_complete', 'difficulty'
  condition_value INT NOT NULL
);

CREATE TABLE user_badges (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id  UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ================================================================
-- 6. DISCUSSION / COMMENTS
-- ================================================================
CREATE TABLE discussions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id  UUID DEFAULT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  upvotes    INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 7. NOTES (per user per problem)
-- ================================================================
CREATE TABLE notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);

-- ================================================================
-- 8. LEADERBOARD VIEW
-- ================================================================
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.id,
  u.username,
  u.college,
  u.avatar,
  u.points,
  u.streak,
  COUNT(s.id) FILTER (WHERE s.status = 'solved') AS problems_solved,
  RANK() OVER (ORDER BY u.points DESC, u.streak DESC) AS rank
FROM users u
LEFT JOIN submissions s ON s.user_id = u.id
GROUP BY u.id
ORDER BY rank;

-- ================================================================
-- 9. SEED BADGES
-- ================================================================
INSERT INTO badges (slug, name, description, icon, condition_type, condition_value) VALUES
  ('first_solve',   'First Step',     'Solve your first problem',    '🎯', 'solved_count', 1),
  ('ten_problems',  'Ten Down',       'Solve 10 problems',           '🔟', 'solved_count', 10),
  ('fifty_problems','Half Century',   'Solve 50 problems',           '🏅', 'solved_count', 50),
  ('century',       'Centurion',      'Solve 100 problems',          '💯', 'solved_count', 100),
  ('week_streak',   'Week Warrior',   'Maintain a 7-day streak',     '🔥', 'streak', 7),
  ('month_streak',  'Monthly Master', 'Maintain a 30-day streak',    '🌟', 'streak', 30),
  ('easy_20',       'Easy Rider',     'Solve 20 easy problems',      '🟢', 'difficulty_easy', 20),
  ('hard_5',        'Hard Hitter',    'Solve 5 hard problems',       '🔴', 'difficulty_hard', 5),
  ('dp_master',     'DP Expert',      'Complete all DP problems',    '🧠', 'topic_complete', 1),
  ('graph_master',  'Graph Master',   'Complete all graph problems', '🕸', 'topic_complete', 1);

-- ================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, date);
CREATE INDEX idx_discussions_problem_id ON discussions(problem_id);
CREATE INDEX idx_problems_topic ON problems(topic);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);

-- ================================================================
-- 11. ROW LEVEL SECURITY (Supabase)
-- Uncomment these if using Supabase Auth
-- ================================================================
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "Users can read own submissions" ON submissions FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Public leaderboard" ON users FOR SELECT USING (true);
