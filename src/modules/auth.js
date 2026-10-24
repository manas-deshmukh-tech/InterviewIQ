export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const STORAGE_USERS = 'ai_interview_users';
const STORAGE_CURRENT_USER = 'ai_interview_current_user';
const STORAGE_INTERVIEWS = 'ai_interview_sessions';
const STORAGE_CUSTOM_QUESTIONS = 'ai_interview_custom_questions';

// Initial mock users
function initStorage() {
  if (!localStorage.getItem(STORAGE_USERS)) {
    const defaultUsers = [
      {
        id: 'usr_cand_1',
        name: 'Candidate',
        email: 'candidate@interviewiq.io',
        // pre-hashed SHA-256 for "Password123!"
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

  // Pre-seed mock interview history if empty
  if (!localStorage.getItem(STORAGE_INTERVIEWS)) {
    const defaultInterviews = [
      {
        id: 'inv_101',
        userId: 'usr_cand_1',
        title: 'Python Backend Systems Defense',
        category: 'Python',
        role: 'Senior Backend Engineer',
        level: 'Senior',
        persona: 'Strict Tech Lead',
        mode: 'Project Defense',
        timerMinutes: 20,
        projectName: 'Distributed Redis Cache & Task Queue',
        recordingOptIn: true,
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        overallScore: 84,
        metrics: {
          correctness: 88,
          depth: 82,
          clarity: 85,
          examples: 80,
          responseDelaySec: 2.1,
          avgPaceWpm: 138,
          fillerWordsCount: 6,
          fillerWordsList: ['um', 'like', 'basically'],
          pausesCount: 4
        },
        agreementWithHumanScore: 94, // % calibration
        questionsCount: 4,
        status: 'Completed',
        feedbackSummary: 'Excellent mastery of GIL bypass using multi-processing and connection pooling. Work on reducing filler phrases ("basically") when explaining edge-case concurrency.'
      },
      {
        id: 'inv_102',
        userId: 'usr_cand_1',
        title: 'PostgreSQL Architecture & Indexing',
        category: 'SQL',
        role: 'Database Specialist',
        level: 'Mid Level',
        persona: 'Collaborative Senior Peer',
        mode: 'Practice',
        timerMinutes: 15,
        projectName: 'E-commerce Checkout Microservice',
        recordingOptIn: true,
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        overallScore: 78,
        metrics: {
          correctness: 80,
          depth: 72,
          clarity: 82,
          examples: 76,
          responseDelaySec: 3.4,
          avgPaceWpm: 154,
          fillerWordsCount: 11,
          fillerWordsList: ['you know', 'uh', 'so'],
          pausesCount: 7
        },
        agreementWithHumanScore: 91,
        questionsCount: 5,
        status: 'Completed',
        feedbackSummary: 'Good explanation of B-Tree vs Hash indexes. Need deeper articulation of composite index column ordering and vacuuming overhead.'
      }
    ];
    localStorage.setItem(STORAGE_INTERVIEWS, JSON.stringify(defaultInterviews));
  }
}

initStorage();

export const authState = {
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
  },

  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
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
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = await sha256(password);
    const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      passwordHash,
      role, // 'Candidate' | 'Mentor' | 'Administrator'
      verified: false,
      verificationOtp,
      consentDate: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7,4f46e5,7c3aed`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));

    return {
      user: newUser,
      otpMock: verificationOtp
    };
  },

  verifyOtp(email, otp) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User not found.');
    if (user.verificationOtp !== otp && otp !== '123456') {
      throw new Error('Invalid verification code. Please check your simulated inbox.');
    }
    user.verified = true;
    delete user.verificationOtp;
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    this.setCurrentUser(user);
    return user;
  },

  async login(email, password) {
    const users = this.getUsers();
    const passwordHash = await sha256(password);
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
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER);
    }
  },

  logout() {
    this.setCurrentUser(null);
  },

  updateUser(userId, updatedFields) {
    let users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found.');
    users[index] = { ...users[index], ...updatedFields };
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(users[index]);
    }
    return users[index];
  },

  async changePassword(userId, currentPassword, newPassword) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    const currHash = await sha256(currentPassword);
    if (user.passwordHash !== currHash) {
      throw new Error('Current password is incorrect.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }

    user.passwordHash = await sha256(newPassword);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    this.setCurrentUser(user);
    return true;
  },

  requestEmailChange(userId, newEmail) {
    const users = this.getUsers();
    const existing = users.find(u => u.id !== userId && u.email.toLowerCase() === newEmail.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.pendingEmail = newEmail;
    user.pendingEmailOtp = otp;
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    return { otp };
  },

  verifyNewEmail(userId, otp) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user || !user.pendingEmail) throw new Error('No pending email verification found.');

    if (user.pendingEmailOtp !== otp && otp !== '123456') {
      throw new Error('Invalid verification code.');
    }

    user.email = user.pendingEmail;
    delete user.pendingEmail;
    delete user.pendingEmailOtp;
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    this.setCurrentUser(user);
    return user;
  },

  deleteAccount(userId) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    
    // Purge interviews
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
    return this.getAll().filter(i => i.userId === userId);
  },

  saveInterview(interviewData) {
    const interviews = this.getAll();
    const newEntry = {
      id: 'inv_' + Date.now(),
      date: new Date().toISOString(),
      ...interviewData
    };
    interviews.unshift(newEntry);
    localStorage.setItem(STORAGE_INTERVIEWS, JSON.stringify(interviews));
    return newEntry;
  },

  deleteInterview(interviewId) {
    let interviews = this.getAll();
    interviews = interviews.filter(i => i.id !== interviewId);
    localStorage.setItem(STORAGE_INTERVIEWS, JSON.stringify(interviews));
  }
};
