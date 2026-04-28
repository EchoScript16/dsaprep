// ================================================================
// api.js — Frontend API client (FIXED)
// Fix: _originalToggleDone timing bug resolved
// Fix: showProfileMenu added
// ================================================================

const API_BASE = 'http://localhost:5000/api';

// ── Token management ─────────────────────────────────────────────
const getToken    = () => localStorage.getItem('dsa_token');
const setToken    = (t) => localStorage.setItem('dsa_token', t);
const removeToken = () => localStorage.removeItem('dsa_token');

// ── Base fetch ───────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (res.status === 401) {
      removeToken();
      currentUser = null;
      renderAuthUI();
    }
    if (!data.success && res.status >= 400) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Make sure backend is running on port 5000.');
    }
    throw err;
  }
}

const api = {
  get:    (url)       => apiFetch(url),
  post:   (url, body) => apiFetch(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (url, body) => apiFetch(url, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (url)       => apiFetch(url, { method: 'DELETE' }),
};

// ── API modules ──────────────────────────────────────────────────
const Auth = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  me:            ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};
const ProblemsAPI = {
  list:   (params = {}) => api.get(`/problems?${new URLSearchParams(params)}`),
  detail: (slug)        => api.get(`/problems/${slug}`),
  topics: ()            => api.get('/problems/topics/summary'),
};
const ProgressAPI = {
  submit:      (data)      => api.post('/progress/submit', data),
  dashboard:   ()          => api.get('/progress/dashboard'),
  submissions: (params={}) => api.get(`/progress/submissions?${new URLSearchParams(params)}`),
  getNote:     (id)        => api.get(`/progress/notes/${id}`),
  saveNote:    (id, c)     => api.put(`/progress/notes/${id}`, { content: c }),
};
const LeaderboardAPI = {
  global: (params={}) => api.get(`/leaderboard?${new URLSearchParams(params)}`),
};
const Execute = {
  run: (sourceCode, languageId, stdin = '') =>
    api.post('/execute', { source_code: sourceCode, language_id: languageId, stdin }),
};
const LANG_IDS = { python: 71, cpp: 54, java: 62, c: 50, javascript: 63 };

// ================================================================
// AUTH STATE & UI
// ================================================================
let currentUser = null;

function renderAuthUI() {
  let authArea = document.getElementById('nav-auth');
  if (!authArea) {
    authArea = document.createElement('div');
    authArea.id = 'nav-auth';
    authArea.style.cssText = 'display:flex;gap:8px;align-items:center;flex-shrink:0;margin-left:.25rem';
    document.getElementById('navbar')?.appendChild(authArea);
  }

  if (currentUser) {
    authArea.innerHTML = `
      <div onclick="showProfileMenu()" style="display:flex;align-items:center;gap:7px;background:var(--surface2);border:1px solid var(--border2);border-radius:99px;padding:5px 14px 5px 8px;cursor:pointer;transition:all .15s" onmouseover="this.style.borderColor='rgba(255,77,109,.4)'" onmouseout="this.style.borderColor='var(--border2)'">
        <div style="width:26px;height:26px;border-radius:50%;background:var(--coral);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0">${currentUser.username[0].toUpperCase()}</div>
        <span style="font-size:13px;color:var(--text);font-weight:500">${currentUser.username}</span>
      </div>
      <button onclick="logout()" style="background:none;border:1px solid var(--border2);color:var(--muted);font-size:12.5px;padding:5px 13px;border-radius:99px;cursor:pointer;transition:all .15s" onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--muted)'">Logout</button>
    `;
  } else {
    authArea.innerHTML = `
      <button onclick="showAuthModal('login')" style="background:none;border:1px solid var(--border2);color:var(--muted);font-size:13px;font-weight:500;padding:6px 15px;border-radius:99px;cursor:pointer;transition:all .15s" onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--muted)'">Login</button>
      <button onclick="showAuthModal('register')" style="background:var(--coral);color:#fff;font-size:13px;font-weight:600;padding:7px 16px;border-radius:9px;border:none;cursor:pointer;transition:all .15s;box-shadow:0 3px 12px rgba(255,77,109,.3)" onmouseover="this.style.opacity='.88'" onmouseout="this.style.opacity='1'">Sign Up Free</button>
    `;
  }
}

// ── Profile menu ─────────────────────────────────────────────────
function showProfileMenu() {
  const existing = document.getElementById('profile-menu');
  if (existing) { existing.remove(); return; }

  const menu = document.createElement('div');
  menu.id = 'profile-menu';
  menu.style.cssText = `position:fixed;top:68px;right:12px;background:var(--surface);border:1px solid var(--border2);border-radius:12px;padding:.5rem;min-width:220px;z-index:500;box-shadow:0 8px 32px rgba(0,0,0,.6)`;
  menu.innerHTML = `
    <div style="padding:.75rem 1rem;border-bottom:1px solid var(--border);margin-bottom:.4rem">
      <div style="font-weight:700;color:var(--text);font-size:14px">${currentUser.username}</div>
      <div style="font-size:12px;color:var(--muted);margin-top:1px">${currentUser.email}</div>
      ${currentUser.college ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${currentUser.college}</div>` : ''}
    </div>
    <div style="display:flex;flex-direction:column;gap:2px">
      <button onclick="showPage('progress');closeProfileMenu()" style="background:none;border:none;color:var(--text2);font-size:13.5px;padding:8px 1rem;border-radius:8px;text-align:left;cursor:pointer;transition:background .12s;width:100%" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background='none'">📊 My Progress</button>
      <button onclick="showProfileEdit();closeProfileMenu()" style="background:none;border:none;color:var(--text2);font-size:13.5px;padding:8px 1rem;border-radius:8px;text-align:left;cursor:pointer;transition:background .12s;width:100%" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background='none'">✏️ Edit Profile</button>
      <div style="border-top:1px solid var(--border);margin:.3rem 0"></div>
      <button onclick="logout();closeProfileMenu()" style="background:none;border:none;color:var(--coral);font-size:13.5px;padding:8px 1rem;border-radius:8px;text-align:left;cursor:pointer;transition:background .12s;width:100%" onmouseover="this.style.background='rgba(255,77,109,.08)'" onmouseout="this.style.background='none'">🚪 Logout</button>
    </div>
  `;
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener('click', closeProfileMenuOutside), 50);
}

function closeProfileMenu() {
  document.getElementById('profile-menu')?.remove();
  document.removeEventListener('click', closeProfileMenuOutside);
}

function closeProfileMenuOutside(e) {
  const menu = document.getElementById('profile-menu');
  if (menu && !menu.contains(e.target)) closeProfileMenu();
}

function showProfileEdit() {
  const modal = document.createElement('div');
  modal.id = 'profile-edit-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:1rem';
  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border2);border-radius:18px;padding:2rem;width:100%;max-width:400px;position:relative">
      <button onclick="document.getElementById('profile-edit-modal').remove()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer">×</button>
      <div style="font-family:var(--fh);font-size:1.2rem;font-weight:800;color:var(--text);margin-bottom:1.25rem">Edit Profile</div>
      <form onsubmit="saveProfile(event)">
        <div style="margin-bottom:.85rem">
          <label style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-family:var(--fm);display:block;margin-bottom:.3rem">College</label>
          <input type="text" id="edit-college" value="${currentUser.college || ''}" placeholder="Your college name" style="width:100%;background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:9px 13px;border-radius:8px;font-size:13.5px">
        </div>
        <div style="margin-bottom:.85rem">
          <label style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-family:var(--fm);display:block;margin-bottom:.3rem">Target Company</label>
          <select id="edit-company" style="width:100%;background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:9px 13px;border-radius:8px;font-size:13.5px">
            <option value="">Select company</option>
            ${['Amazon','Google','Microsoft','TCS','Infosys','Wipro','Capgemini','Accenture'].map(c => `<option${currentUser.targetCompany===c?' selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div style="margin-bottom:1.25rem">
          <label style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-family:var(--fm);display:block;margin-bottom:.3rem">Placement Date</label>
          <input type="date" id="edit-date" value="${currentUser.placementDate?.slice(0,10) || ''}" style="width:100%;background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:9px 13px;border-radius:8px;font-size:13.5px">
        </div>
        <div id="profile-edit-error" style="color:var(--coral);font-size:13px;margin-bottom:.75rem;display:none"></div>
        <button type="submit" style="background:var(--coral);color:#fff;width:100%;padding:11px;border-radius:9px;border:none;font-size:14px;font-weight:600;cursor:pointer">Save Changes</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

async function saveProfile(e) {
  e.preventDefault();
  const errEl = document.getElementById('profile-edit-error');
  try {
    const data = await Auth.updateProfile({
      college: document.getElementById('edit-college').value,
      targetCompany: document.getElementById('edit-company').value,
      placementDate: document.getElementById('edit-date').value || null,
    });
    currentUser = data.user;
    document.getElementById('profile-edit-modal')?.remove();
    renderAuthUI();
    if (typeof showToast === 'function') showToast('Profile updated! ✅');
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
}

// ── Auth Modal ───────────────────────────────────────────────────
function showAuthModal(tab = 'login') {
  document.getElementById('auth-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(4px)';

  const inputStyle = 'width:100%;background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:10px 14px;border-radius:9px;font-size:13.5px;outline:none;transition:border-color .15s';
  const labelStyle = 'font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-family:var(--fm);display:block;margin-bottom:.3rem';

  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border2);border-radius:18px;padding:2rem;width:100%;max-width:420px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.7)">
      <button onclick="document.getElementById('auth-modal').remove()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer;line-height:1">×</button>
      <div style="font-family:var(--fh);font-size:1.5rem;font-weight:800;color:var(--text);margin-bottom:1.6rem;letter-spacing:-.03em">
        ${tab === 'login' ? 'Welcome back 👋' : 'Join DSAPrep 🚀'}
      </div>
      ${tab === 'login' ? `
        <form onsubmit="handleLogin(event)">
          <div style="margin-bottom:1rem"><label style="${labelStyle}">Email</label><input type="email" id="login-email" required placeholder="you@example.com" style="${inputStyle}"></div>
          <div style="margin-bottom:1.5rem"><label style="${labelStyle}">Password</label><input type="password" id="login-password" required placeholder="••••••••" style="${inputStyle}"></div>
          <div id="auth-error" style="color:var(--coral);font-size:13px;margin-bottom:.75rem;display:none;background:rgba(255,77,109,.1);padding:8px 12px;border-radius:7px;border:1px solid rgba(255,77,109,.2)"></div>
          <button type="submit" class="btn-primary" style="width:100%;padding:13px;font-size:14.5px">Login →</button>
          <p style="text-align:center;margin-top:1rem;font-size:13px;color:var(--muted)">No account? <span style="color:var(--coral);cursor:pointer;font-weight:600" onclick="showAuthModal('register')">Sign up free</span></p>
        </form>
      ` : `
        <form onsubmit="handleRegister(event)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin-bottom:.85rem">
            <div><label style="${labelStyle}">Email</label><input type="email" id="reg-email" required placeholder="you@example.com" style="${inputStyle};font-size:12.5px"></div>
            <div><label style="${labelStyle}">Username</label><input type="text" id="reg-username" required placeholder="arjun_99" style="${inputStyle};font-size:12.5px"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin-bottom:.85rem">
            <div><label style="${labelStyle}">Password</label><input type="password" id="reg-password" required placeholder="Min 6 chars" style="${inputStyle};font-size:12.5px"></div>
            <div><label style="${labelStyle}">College</label><input type="text" id="reg-college" placeholder="VIT, NIT, BITS…" style="${inputStyle};font-size:12.5px"></div>
          </div>
          <div style="margin-bottom:1.5rem"><label style="${labelStyle}">Target Company</label>
            <select id="reg-company" style="${inputStyle}">
              <option value="">Select (optional)</option>
              ${['Amazon','Google','Microsoft','TCS','Infosys','Wipro','Capgemini','Accenture'].map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>
          <div id="auth-error" style="color:var(--coral);font-size:13px;margin-bottom:.75rem;display:none;background:rgba(255,77,109,.1);padding:8px 12px;border-radius:7px;border:1px solid rgba(255,77,109,.2)"></div>
          <button type="submit" class="btn-primary" style="width:100%;padding:13px;font-size:14.5px">Create Free Account →</button>
          <p style="text-align:center;margin-top:1rem;font-size:13px;color:var(--muted)">Have account? <span style="color:var(--coral);cursor:pointer;font-weight:600" onclick="showAuthModal('login')">Login</span></p>
        </form>
      `}
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  setTimeout(() => document.querySelector('#auth-modal input')?.focus(), 100);
}

async function handleLogin(e) {
  e.preventDefault();
  const errEl = document.getElementById('auth-error');
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = 'Logging in…'; btn.disabled = true;
  try {
    const data = await Auth.login({
      email:    document.getElementById('login-email').value,
      password: document.getElementById('login-password').value,
    });
    setToken(data.token);
    currentUser = data.user;
    document.getElementById('auth-modal')?.remove();
    renderAuthUI();
    if (typeof showToast === 'function') showToast(`Welcome back, ${currentUser.username}! 👋`);
    if (document.getElementById('page-progress')?.classList.contains('active')) renderProgressFromDB();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
    btn.textContent = 'Login →'; btn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const errEl = document.getElementById('auth-error');
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = 'Creating account…'; btn.disabled = true;
  try {
    const data = await Auth.register({
      email:         document.getElementById('reg-email').value,
      username:      document.getElementById('reg-username').value,
      password:      document.getElementById('reg-password').value,
      college:       document.getElementById('reg-college').value,
      targetCompany: document.getElementById('reg-company').value,
    });
    setToken(data.token);
    currentUser = data.user;
    document.getElementById('auth-modal')?.remove();
    renderAuthUI();
    if (typeof showToast === 'function') showToast(`Welcome to DSAPrep, ${currentUser.username}! 🎉`);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
    btn.textContent = 'Create Free Account →'; btn.disabled = false;
  }
}

function logout() {
  removeToken();
  currentUser = null;
  renderAuthUI();
  if (typeof showToast === 'function') showToast('Logged out successfully.');
}

// ================================================================
// DB SYNC — toggleDone override (runs after app.js DOMContentLoaded)
// Fixed: use DOMContentLoaded to guarantee app.js is loaded first
// ================================================================
window.addEventListener('DOMContentLoaded', () => {
  // Wait a tick for app.js to also finish its DOMContentLoaded
  setTimeout(() => {
    const _orig = window.toggleDone;
    if (typeof _orig === 'function') {
      window.toggleDone = async function(t, i) {
        _orig(t, i); // update local state first
        if (currentUser && window.PROBLEMS?.[t]?.[i]) {
          try {
            const prob = window.PROBLEMS[t][i];
            const isDone = window.state?.done?.[`${t}_${i}`];
            await ProgressAPI.submit({
              problemId: prob.dbId || prob.slug || `${t}_${i}`,
              status: isDone ? 'solved' : 'attempted',
              language: document.getElementById('lang-select')?.value || 'python',
            });
          } catch (err) {
            console.warn('DB sync failed (non-critical):', err.message);
          }
        }
      };
    }
  }, 0);
});

// ================================================================
// DB-powered Progress Dashboard
// ================================================================
async function renderProgressFromDB() {
  if (!currentUser) return;
  try {
    const data = await ProgressAPI.dashboard();
    const { stats, topicBreakdown, activity, badges } = data;

    document.getElementById('progress-stats').innerHTML = `
      <div class="pstat-card"><div class="pstat-big">${stats.totalSolved}</div><div class="pstat-label">Problems solved</div></div>
      <div class="pstat-card"><div class="pstat-big" style="color:var(--mint)">${stats.points}</div><div class="pstat-label">Total points</div></div>
      <div class="pstat-card"><div class="pstat-big" style="color:var(--coral-l)">${stats.easySolved}/${stats.mediumSolved}/${stats.hardSolved}</div><div class="pstat-label">Easy / Med / Hard</div></div>
      <div class="pstat-card"><div class="pstat-big" style="color:var(--gold)">${stats.streak}🔥</div><div class="pstat-label">Day streak</div></div>
    `;

    // Streak grid
    const sg = document.getElementById('streak-grid');
    const days = [], today = new Date();
    for (let i = 27; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate()-i); days.push(d.toISOString().slice(0,10)); }
    const actDates = new Set(activity.map(a => a.date?.slice(0,10)));
    const DN = ['S','M','T','W','T','F','S'];
    const todStr = today.toISOString().slice(0,10);
    sg.innerHTML = days.map(day => `<div class="sday${actDates.has(day)?' active':''}${day===todStr?' today':''}" title="${day}">${DN[new Date(day).getDay()]}</div>`).join('');
    document.getElementById('streak-days-label').textContent = stats.streak + ' days';

    // Topic breakdown
    if (window.TOPICS && window.PROBLEMS) {
      document.getElementById('topic-breakdown').innerHTML = window.TOPICS.map((name, t) => {
        const td = topicBreakdown.find(x => x.topic === name);
        const dn = td ? parseInt(td.solved) : 0;
        const tot = window.PROBLEMS[t]?.length || 0;
        const pct = tot ? Math.round(dn/tot*100) : 0;
        return `<div class="bkrow"><span class="bkrow-name">${name}</span><span class="bkrow-count">${dn}/${tot}</span><div class="bkrow-bar"><div class="bkrow-fill" style="width:${pct}%;background:${pct===100?'var(--mint)':'var(--coral)'}"></div></div></div>`;
      }).join('');
    }

    // Badges
    const earnedSlugs = new Set(badges.map(b => b.slug));
    if (window.BADGES) {
      document.getElementById('badges-grid').innerHTML = window.BADGES.map(b => {
        const isEarned = earnedSlugs.has(b.id);
        return `<div class="badge-card ${isEarned?'earned':'locked'}"><div class="badge-icon">${b.icon}</div><div class="badge-name">${b.name}</div><div class="badge-desc">${b.desc}</div></div>`;
      }).join('');
    }

    // Leaderboard from DB
    renderLeaderboardFromDB();
  } catch (err) {
    console.warn('DB progress load failed, using localStorage:', err.message);
  }
}

async function renderLeaderboardFromDB() {
  try {
    const data = await LeaderboardAPI.global({ limit: 20 });
    const lb = document.getElementById('leaderboard');
    if (!lb) return;
    lb.innerHTML = data.leaderboard.map((p, i) => {
      const rc = i===0?'gold':i===1?'silver':i===2?'bronze':'';
      return `<div class="lb-row${p.isYou?' you':''}">
        <div class="lb-rank ${rc}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
        <div>
          <div class="lb-name">${p.username}${p.isYou?' <span style="color:var(--coral);font-size:11px">(you)</span>':''}</div>
          ${p.college?`<div style="font-size:11px;color:var(--muted)">${p.college}</div>`:''}
        </div>
        <div class="lb-pts">⭐ ${p.points}</div>
        <div class="lb-streak">🔥 ${p.streak}</div>
      </div>`;
    }).join('');
  } catch (err) {
    console.warn('DB leaderboard failed, using mock data');
  }
}

// ── Mobile nav toggle ────────────────────────────────────────────
function toggleMobileNav() {
  document.getElementById('nav-links')?.classList.toggle('mobile-open');
}

// ── Init: restore session ────────────────────────────────────────
(async () => {
  if (getToken()) {
    try {
      const data = await Auth.me();
      currentUser = data.user;
    } catch (_) {
      removeToken();
    }
  }
  renderAuthUI();
})();