export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const API_BASE = 'http://localhost:8000/api';
const STORAGE_USERS = 'ai_interview_users';
const STORAGE_CURRENT_USER = 'ai_interview_current_user';
const STORAGE_INTERVIEWS = 'ai_interview_sessions';
const STORAGE_CUSTOM_QUESTIONS = 'ai_interview_custom_questions';
export const STORAGE_AUTH_TOKEN = 'ai_interview_token';

export function getAuthHeaders() {
  const token = localStorage.getItem(STORAGE_AUTH_TOKEN);
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Sync local cache with Python database
export async function syncWithPythonBackend() {
  try {
    const controller = new AbortController();
    const tId = setTimeout(() => controller.abort(), 2500);

    const headers = getAuthHeaders();
    const token = localStorage.getItem(STORAGE_AUTH_TOKEN);

    // If logged in, fetch authoritative user profile from MySQL /me endpoint
    if (token) {
      try {
        const meRes = await fetch(`${API_BASE}/auth/me`, { headers, signal: controller.signal });
        if (meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.success && meJson.user) {
            authState.setCurrentUser(meJson.user);
          }
        }
      } catch (err) {
        // silent
      }
    }

    const iRes = await fetch(`${API_BASE}/interviews`, { headers, signal: controller.signal }).catch(() => null);
    clearTimeout(tId);

    if (iRes && iRes.ok) {
      const iJson = await iRes.json();
      if (iJson.success && iJson.interviews?.length) {
        localStorage.setItem(STORAGE_INTERVIEWS, JSON.stringify(iJson.interviews));
      }
    }
  } catch (err) {
    console.info('Database offline fallback active:', err?.message);
  }
}

// Initial mock users fallback
function initStorage() {
  if (!localStorage.getItem(STORAGE_USERS)) {
    const defaultUsers = [
      {
        id: 'usr_cand_1',
        name: 'Candidate',
        email: 'candidate@interviewiq.io',
        passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        role: 'Candidate',
        verified: true,
        consentDate: new Date().toISOString(),
        targetRole: 'Full Stack Engineer',
        level: 'Mid Level',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'usr_mentor_1',
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@tech.org',
        passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        role: 'Mentor',
        verified: true,
        consentDate: new Date().toISOString(),
        organization: 'Silicon Valley Mentorship Circle',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'usr_admin_1',
        name: 'Marcus Vance',
        email: 'admin@interviewiq.internal',
        passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        role: 'Administrator',
        verified: true,
        consentDate: new Date().toISOString(),
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      }
    ];
    localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(STORAGE_INTERVIEWS)) {
    const defaultInterviews = [
      {
        id: 'inv_101',
        userId: 'usr_cand_1',
        title: 'Full Stack Simulation: Scalable Microservices',
        category: 'Software & Engineering',
        role: 'Full Stack Engineer',
        level: 'Mid Level',
        mode: 'Technical Simulation',
        persona: 'Vikram Malhotra',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        overallScore: 84,
        metrics: {
          correctness: 86,
          depth: 82,
          clarity: 88,
          examples: 80,
          responseDelaySec: 2.1,
          avgPaceWpm: 142,
          fillerWordsCount: 3,
          fillerWordsList: ['like', 'basically'],
          pausesCount: 4
        },
        agreementWithHumanScore: 94,
        questionsCount: 4,
        status: 'Completed',
        feedbackSummary: 'Demonstrated high competence in Redis caching layers and asynchronous task queues. Refine runtime metrics on queue backpressure.'
      }
    ];
    localStorage.setItem(STORAGE_INTERVIEWS, JSON.stringify(defaultInterviews));
  }
}

initStorage();
syncWithPythonBackend();

export const authState = {
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
  },

  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER);
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      if (u && typeof u === 'object') {
        u.targetRole = u.targetRole || u.target_role || 'Full Stack Engineer';
        if (!u.name && u.email) {
          const prefix = u.email.split('@')[0];
          u.name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
        return u;
      }
      return null;
    } catch {
      return null;
    }
  },

  async register({ name, email, password, role, consent }) {
    if (role === 'Administrator') {
      throw new Error('Administrator accounts cannot be self-registered. Please sign in with existing admin credentials.');
    }
    if (!consent) {
      throw new Error('Candidate/User consent is mandatory under privacy regulations.');
    }

    const passwordHash = await sha256(password);

    // 1. Try Python SQLite API
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, passwordHash, role, consent })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          const users = this.getUsers();
          users.push(json.user);
          localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
          return { user: json.user };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.detail) throw new Error(errJson.detail);
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) {
        throw e;
      }
      throw new Error(e.message || 'Registration service unavailable. Please check your network connection.');
    }

    throw new Error('Registration failed. Please try again.');
  },

  async resendOtp(email) {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.detail || 'Failed to resend verification code.');
    }
    return json;
  },

  async verifyOtp(email, otp) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.success && json.user) {
      if (json.access_token) {
        localStorage.setItem(STORAGE_AUTH_TOKEN, json.access_token);
      }
      this.setCurrentUser(json.user);
      return json.user;
    } else {
      throw new Error(json.detail || 'Invalid or expired verification code.');
    }
  },

  async login(email, password) {
    const passwordHash = await sha256(password);

    // 1. Try Python SQLite API
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passwordHash })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          if (json.access_token) {
            localStorage.setItem(STORAGE_AUTH_TOKEN, json.access_token);
          }
          this.setCurrentUser(json.user);
          return json.user;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.detail === 'EMAIL_UNVERIFIED') throw new Error('EMAIL_UNVERIFIED');
        if (errJson.detail) throw new Error(errJson.detail);
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) {
        throw e;
      }
      console.info('Using local login fallback');
    }

    // 2. Local fallback
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('No account found with this email.');
    }
    if (user.passwordHash !== passwordHash) {
      throw new Error('Incorrect password provided.');
    }
    if (!user.verified) {
      throw new Error('EMAIL_UNVERIFIED');
    }

    this.setCurrentUser(user);
    return user;
  },

  setCurrentUser(user) {
    if (user && typeof user === 'object') {
      if (typeof user.then === 'function') {
        user.then(resolved => this.setCurrentUser(resolved));
        return;
      }
      user.targetRole = user.targetRole || user.target_role || 'Full Stack Engineer';
      user.target_role = user.targetRole;
      if (!user.name && user.email) {
        const prefix = user.email.split('@')[0];
        user.name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER);
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_AUTH_TOKEN);
    this.setCurrentUser(null);
  },

  async updateUser(userId, updatedFields) {
    // 1. Try Python SQLite API
    try {
      await fetch(`${API_BASE}/auth/user/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });
    } catch (e) {
      // silent
    }

    // 2. Sync local
    let users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedFields };
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        this.setCurrentUser(users[index]);
      }
      return users[index];
    }
    return updatedFields;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const currHash = await sha256(currentPassword);
    const newHash = await sha256(newPassword);

    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, currentPasswordHash: currHash, newPasswordHash: newHash })
      });
      if (res.ok) return true;
    } catch (e) {
      // fallback
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');
    if (user.passwordHash !== currHash) {
      throw new Error('Current password is incorrect.');
    }
    user.passwordHash = newHash;
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    this.setCurrentUser(user);
    return true;
  },

  async requestEmailChange(userIdOrEmail, maybeEmail) {
    const newEmail = (maybeEmail || userIdOrEmail || '').trim();
    if (!newEmail) throw new Error('New email address is required.');

    const res = await fetch(`${API_BASE}/auth/change-email/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newEmail })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.detail || 'Failed to dispatch verification code.');
    }
    return json;
  },

  async verifyNewEmail(userIdOrOtp, maybeOtp) {
    const otp = (maybeOtp || userIdOrOtp || '').trim();
    if (!otp) throw new Error('Verification code is required.');

    const res = await fetch(`${API_BASE}/auth/change-email/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ otp })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.detail || 'Failed to verify verification code.');
    }
    if (json.access_token) {
      localStorage.setItem(STORAGE_AUTH_TOKEN, json.access_token);
    }
    if (json.user) {
      this.setCurrentUser(json.user);
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === json.user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...json.user };
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
      }
      return json.user;
    }
    return json;
  },

  deleteAccount(userId) {
    try {
      fetch(`${API_BASE}/auth/user/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (e) {
      // silent
    }

    let users = this.getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));

    let interviews = interviewStore.getAll();
    interviews = interviews.filter(i => i.userId !== userId);
    localStorage.setItem(STORAGE_INTERVIEWS, JSON.stringify(interviews));

    this.logout();
  }
};

export const interviewStore = {
  getAll() {
    return JSON.parse(localStorage.getItem(STORAGE_INTERVIEWS) || '[]');
  },

  getUserInterviews(userId) {
    return this.getAll().filter(i => i.userId === userId || i.user_id === userId);
  },

  async syncWithBackend(userId) {
    try {
      const headers = getAuthHeaders();
      const url = userId ? `${API_BASE}/interviews?userId=${encodeURIComponent(userId)}` : `${API_BASE}/interviews`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.interviews)) {
          const currentAll = this.getAll();
          const backendIds = new Set(json.interviews.map(i => i.id));
          // Normalize interviews to ensure both overallScore and overall_score are identical numbers
          const normalizedBackend = json.interviews.map(inv => {
            const nested = (inv.report && typeof inv.report === 'object') ? inv.report : {};
            let score = null;
            if (typeof inv.overallScore === 'number' && Number.isFinite(inv.overallScore)) score = Math.round(inv.overallScore);
            else if (typeof nested.overallScore === 'number' && Number.isFinite(nested.overallScore)) score = Math.round(nested.overallScore);
            else if (typeof inv.overall_score === 'number' && Number.isFinite(inv.overall_score)) score = Math.round(inv.overall_score);
            else if (typeof nested.overall_score === 'number' && Number.isFinite(nested.overall_score)) score = Math.round(nested.overall_score);
            else score = 0;

            return {
              ...nested,
              ...inv,
              overallScore: score,
              overall_score: score
            };
          });

          // Preserve local records that might not yet be synced
          const remainingLocal = currentAll.filter(i => !backendIds.has(i.id) && (!userId || i.userId !== userId));
          const merged = [...normalizedBackend, ...remainingLocal];
          localStorage.setItem(STORAGE_INTERVIEWS, JSON.stringify(merged));
          return this.getUserInterviews(userId);
        }
      }
    } catch (e) {
      console.info('Backend interview sync active with local cache:', e.message);
    }
    return this.getUserInterviews(userId);
  },

  async getInterviewById(interviewId) {
    if (!interviewId) return null;
    const all = this.getAll();
    const found = all.find(i => String(i.id) === String(interviewId));
    if (found) return found;
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/interviews/${encodeURIComponent(interviewId)}`, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.interview) {
          return json.interview;
        }
      }
    } catch (e) {}
    return null;
  },

  saveInterview(interviewData) {
    const interviews = this.getAll();
    const newEntry = {
      id: 'inv_' + Date.now(),
      date: new Date().toISOString(),
      ...interviewData
    };

    // Save to local storage for immediate UI rendering
    interviews.unshift(newEntry);
    localStorage.setItem(STORAGE_INTERVIEWS, JSON.stringify(interviews));

    // Authoritative persist to MySQL backend
    try {
      fetch(`${API_BASE}/interviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newEntry)
      })
      .then(res => res.json())
      .then(json => {
        if (json.success && json.interview) {
          const all = this.getAll();
          const idx = all.findIndex(i => i.id === newEntry.id);
          if (idx !== -1) {
            all[idx] = { ...newEntry, ...json.interview };
            localStorage.setItem(STORAGE_INTERVIEWS, JSON.stringify(all));
          }
        }
      })
      .catch(err => console.info('MySQL async save deferred:', err.message));
    } catch (e) {
      // silent
    }

    return newEntry;
  },

  deleteInterview(interviewId) {
    try {
      fetch(`${API_BASE}/interviews/${interviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).catch(() => {});
    } catch (e) {
      // silent
    }

    let interviews = this.getAll();
    interviews = interviews.filter(i => i.id !== interviewId);
    localStorage.setItem(STORAGE_INTERVIEWS, JSON.stringify(interviews));
  }
};
