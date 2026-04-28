# DSAPrep — Full Stack Platform

> Free DSA learning platform for Indian placement preparation
> Stack: Node.js + Express + PostgreSQL (Supabase) + Vanilla JS frontend

---

## 📁 Project Structure

```
dsaprep-fullstack/
├── backend/
│   ├── server.js          ← Express entry point
│   ├── db.js              ← PostgreSQL connection
│   ├── package.json
│   ├── .env.example       ← Copy to .env and fill values
│   ├── middleware/
│   │   └── auth.js        ← JWT middleware
│   └── routes/
│       ├── auth.js        ← Register, login, profile
│       ├── problems.js    ← Problem listing + detail
│       ├── progress.js    ← Submissions, streak, badges
│       └── leaderboard.js ← Rankings + discussions
├── frontend/
│   ├── index.html         ← Main HTML (from dsaprep folder)
│   ├── style.css          ← Styles (from dsaprep folder)
│   ├── app.js             ← Frontend logic (from dsaprep folder)
│   └── api.js             ← NEW: API client + auth UI
└── database/
    └── schema.sql         ← Run this in Supabase SQL Editor
```

---

## 🚀 Setup Guide (Step by Step)

### Step 1 — Set up Supabase (Free Database)

1. Go to **https://supabase.com** → Create free account
2. Click **"New Project"** → Choose a name and password
3. Wait ~2 minutes for project to provision
4. Go to **SQL Editor** (left sidebar)
5. Copy everything from `database/schema.sql` and paste it → Click **Run**
6. Go to **Settings → Database** → Copy the **Connection String**

### Step 2 — Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Open `.env` and fill in:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[REF].supabase.co:5432/postgres
JWT_SECRET=run_this_to_generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
FRONTEND_URL=http://localhost:3000
```

### Step 3 — Start Backend

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
DSAPrep Backend running at http://localhost:5000
```

Test it: http://localhost:5000/health → should return `{"status":"ok","db":"connected"}`

### Step 4 — Connect Frontend

1. Copy your existing `index.html`, `style.css`, `app.js` files into `frontend/`
2. Add `api.js` to your `index.html` **before** `app.js`:
   ```html
   <script src="api.js"></script>
   <script src="app.js"></script>
   ```
3. Open `index.html` in a browser — the Login/Signup button appears in the navbar automatically

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login → returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/profile` | Yes | Update profile |

### Problems
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/problems` | Optional | List with filters (`?topic=&difficulty=&company=`) |
| GET | `/api/problems/:slug` | Optional | Problem detail + user status |
| GET | `/api/problems/topics/summary` | Optional | Topic stats |

### Progress
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/progress/submit` | Yes | Mark problem solved/attempted |
| GET | `/api/progress/dashboard` | Yes | Full stats (streak, badges, topic breakdown) |
| GET | `/api/progress/submissions` | Yes | User's submission history |
| GET/PUT | `/api/progress/notes/:problemId` | Yes | Personal notes |

### Other
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/leaderboard` | Optional | Global rankings |
| POST | `/api/execute` | No | Run code via Judge0 |

---

## 🔧 Judge0 Setup (Real Code Execution)

1. Go to **https://rapidapi.com/judge0-official/api/judge0-ce**
2. Subscribe to the **Basic plan (free)** — 200 requests/day
3. Copy your **API key**
4. Add to `.env`:
   ```
   JUDGE0_API_KEY=your_rapidapi_key_here
   ```
5. Restart the backend — code execution now works for real!

**Language IDs:**
- Python 3 → `71`
- C++ → `54`
- Java → `62`
- C → `50`
- JavaScript → `63`

---

## 🌐 Deployment (Free)

### Backend → Railway
1. Push backend folder to GitHub
2. Go to **railway.app** → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Done — Railway gives you a free URL like `https://dsaprep-backend.railway.app`

### Frontend → GitHub Pages / Vercel
1. Update `API_BASE` in `api.js` to your Railway backend URL
2. Push frontend to GitHub
3. Go to **vercel.com** → Import → Done
4. Or enable **GitHub Pages** in repo settings

---

## 🔒 Security Checklist
- [ ] `.env` is in `.gitignore` (NEVER commit secrets)
- [ ] JWT_SECRET is at least 64 random characters
- [ ] Rate limiting is enabled (already done in server.js)
- [ ] Supabase Row Level Security enabled for production
- [ ] HTTPS only in production (Railway/Vercel handle this)

---

## 📝 Adding Problems to Database

To add problems programmatically, use this SQL in Supabase:

```sql
INSERT INTO problems (title, slug, topic, difficulty, description, examples, hints, companies, leetcode_url)
VALUES (
  'Two Sum',
  'two-sum',
  'Arrays & Strings',
  'easy',
  'Given an array of integers and a target, return indices of two numbers that add up to target.',
  'Input: [2,7,11,15], target=9 → Output: [0,1]',
  '["Think about what you need to find for each element.", "For each x, you need target - x.", "A hash map gives O(1) lookup."]',
  ARRAY['tcs', 'amazon', 'google'],
  'https://leetcode.com/problems/two-sum/'
);
```

---

## 🛠 Tech Stack Summary

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | HTML + CSS + Vanilla JS | Free |
| Backend | Node.js + Express | Free |
| Database | PostgreSQL (Supabase) | Free (500MB) |
| Code Execution | Judge0 API (RapidAPI) | Free (200 req/day) |
| Hosting Backend | Railway | Free ($5 credit/mo) |
| Hosting Frontend | Vercel / GitHub Pages | Free |

**Total cost: ₹0** 🎉
