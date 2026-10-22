import { authState } from './modules/auth.js';
import { renderAuthModal } from './modules/authModal.js';
import { renderEditProfileModal } from './modules/editProfileModal.js';
import { renderInterviewSetup } from './modules/interviewSetup.js';
import { renderActiveInterview } from './modules/activeInterview.js';
import { renderFeedbackReport } from './modules/feedbackReport.js';
import { renderCandidateDashboard } from './modules/candidateDashboard.js';
import { renderMentorDashboard, renderAdminDashboard } from './modules/roleDashboards.js';
import { interviewStore } from './modules/auth.js';

// Application State
let initialUser = authState.getCurrentUser() || authState.getUsers()[0];
if (initialUser && initialUser.name === 'Alex Rivera') {
  initialUser.name = 'Candidate';
  if (initialUser.email === 'alex@candidate.edu') {
    initialUser.email = 'candidate@interviewiq.io';
  }
  authState.updateUser(initialUser.id, { name: 'Candidate', email: initialUser.email });
}

const state = {
  currentUser: initialUser,
  currentView: 'dashboard', // 'dashboard' | 'setup' | 'active_interview' | 'feedback_report'
  activeSetupConfig: null,
  activeReport: null
};

// DOM Roots
const appContainer = document.getElementById('app');
const userSection = document.getElementById('header-user-section');
const brandLink = document.getElementById('brand-link');

// Theme Management
const STORAGE_THEME = 'ai_interview_theme';
function initTheme() {
  const saved = localStorage.getItem(STORAGE_THEME) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  return saved;
}

let currentTheme = initTheme();

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem(STORAGE_THEME, currentTheme);
  updateHeader();
}

function updateHeader() {
  const isLight = currentTheme === 'light';
  const themeIcon = isLight 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

  const user = state.currentUser;
  if (!user) {
    userSection.innerHTML = `
      <button type="button" class="btn-theme-toggle" id="btn-theme-toggle" title="Switch to ${isLight ? 'Dark' : 'Light'} Mode">
        ${themeIcon}
      </button>
      <button type="button" class="btn btn-secondary btn-sm" id="btn-header-login">Sign In</button>
      <button type="button" class="btn btn-primary btn-sm" id="btn-header-register">Sign Up</button>
    `;
    userSection.querySelector('#btn-theme-toggle').addEventListener('click', toggleTheme);
    userSection.querySelector('#btn-header-login').addEventListener('click', () => {
      renderAuthModal('login', (u) => { state.currentUser = u; renderApp(); });
    });
    userSection.querySelector('#btn-header-register').addEventListener('click', () => {
      renderAuthModal('signup', (u) => { state.currentUser = u; renderApp(); });
    });
    return;
  }

  userSection.innerHTML = `
    <button type="button" class="btn-theme-toggle" id="btn-theme-toggle" title="Switch to ${isLight ? 'Dark' : 'Light'} Mode">
      ${themeIcon}
    </button>
    <div class="user-menu-wrapper" id="user-menu-wrapper">
      <button type="button" class="user-badge-btn" id="user-menu-toggle" aria-expanded="false" aria-haspopup="true">
        <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" alt="${user.name}" class="user-avatar-sm" />
        <div style="line-height: 1.1; text-align: left;">
          <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">${user.name}</div>
          <span class="role-pill ${user.role}">${user.role}</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 0.25rem; color: var(--text-muted);"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>

      <div class="user-dropdown-menu" id="user-dropdown-menu" style="display: none;">
        <div class="user-dropdown-header">
          <div class="user-name">${user.name}</div>
          <div class="user-email">${user.email}</div>
        </div>
        <button type="button" class="dropdown-item" id="btn-edit-profile">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          My Profile
        </button>
        <button type="button" class="dropdown-item dropdown-logout" id="btn-dropdown-logout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Sign Out
        </button>
      </div>
    </div>
  `;

  const themeToggle = userSection.querySelector('#btn-theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const menuToggle = userSection.querySelector('#user-menu-toggle');
  const dropdownMenu = userSection.querySelector('#user-dropdown-menu');
  const editProfileBtn = userSection.querySelector('#btn-edit-profile');
  const logoutBtn = userSection.querySelector('#btn-dropdown-logout');

  if (menuToggle && dropdownMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = dropdownMenu.style.display === 'flex';
      dropdownMenu.style.display = isVisible ? 'none' : 'flex';
      menuToggle.setAttribute('aria-expanded', !isVisible);
    });

    document.addEventListener('click', (e) => {
      if (!userSection.contains(e.target)) {
        dropdownMenu.style.display = 'none';
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      dropdownMenu.style.display = 'none';
      renderEditProfileModal(state.currentUser, (updatedUser) => {
        state.currentUser = updatedUser;
        renderApp();
      });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authState.logout();
      state.currentUser = null;
      renderApp();
    });
  }
}

export function renderApp() {
  updateHeader();

  if (!state.currentUser) {
    // Show Welcome Landing with instant sign-in prompt
    appContainer.innerHTML = `
      <div class="fade-in" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; max-width: 820px; min-height: calc(100vh - 160px); margin: 0 auto; padding: 2rem 1rem;">
        <h1 style="font-size: 3.5rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.18; color: #fff; margin-bottom: 1.25rem;">
          AI Mock Interviews That <br><span style="background: linear-gradient(135deg, var(--secondary), var(--primary-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Explain Every Score</span>
        </h1>
        <p style="font-size: 1.25rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 2.25rem; max-width: 680px;">
          Practice live voice and video interviews tailored to your role and resume, and see exactly what to improve.
        </p>

        <div style="display: flex; gap: 1.75rem; justify-content: center; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; width: 250px;">
            <button type="button" id="landing-login-btn" class="btn btn-primary btn-lg" style="box-shadow: 0 0 30px rgba(99,102,241,0.5); width: 100%; height: 56px; font-size: 1.12rem; display: inline-flex; align-items: center; justify-content: center;">
              Try Free Demo
            </button>
            <span style="font-size: 0.9rem; color: var(--text-muted, #94a3b8); font-weight: 500;">No sign-up needed</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; width: 250px;">
            <button type="button" id="landing-signup-btn" class="btn btn-secondary btn-lg" style="width: 100%; height: 56px; font-size: 1.12rem; display: inline-flex; align-items: center; justify-content: center;">
              Create Free Account
            </button>
            <span style="font-size: 0.9rem; color: var(--text-muted, #94a3b8); font-weight: 500;">Get detailed analysis and track your progress</span>
          </div>
        </div>
      </div>
    `;

    appContainer.querySelector('#landing-login-btn').addEventListener('click', () => {
      renderAuthModal('login', (u) => { state.currentUser = u; renderApp(); });
    });
    appContainer.querySelector('#landing-signup-btn').addEventListener('click', () => {
      renderAuthModal('signup', (u) => { state.currentUser = u; renderApp(); });
    });
    return;
  }

  // Route depending on view
  if (state.currentView === 'dashboard') {
    if (state.currentUser.role === 'Candidate') {
      renderCandidateDashboard(
        appContainer,
        state.currentUser,
        () => { state.currentView = 'setup'; renderApp(); },
        (inv) => { state.activeReport = inv; state.currentView = 'feedback_report'; renderApp(); }
      );
    } else if (state.currentUser.role === 'Mentor') {
      renderMentorDashboard(
        appContainer,
        state.currentUser,
        (inv) => { state.activeReport = inv; state.currentView = 'feedback_report'; renderApp(); }
      );
    } else if (state.currentUser.role === 'Administrator') {
      renderAdminDashboard(appContainer, state.currentUser);
    }
  } else if (state.currentView === 'setup') {
    renderInterviewSetup(
      appContainer,
      state.currentUser,
      (setupConfig) => {
        state.activeSetupConfig = setupConfig;
        state.currentView = 'active_interview';
        renderApp();
      }
    );
  } else if (state.currentView === 'active_interview') {
    renderActiveInterview(
      appContainer,
      state.activeSetupConfig,
      state.currentUser,
      (finalReport) => {
        // Save to interview store
        const saved = interviewStore.saveInterview(finalReport);
        state.activeReport = saved;
        state.currentView = 'feedback_report';
        renderApp();
      }
    );
  } else if (state.currentView === 'feedback_report') {
    renderFeedbackReport(
      appContainer,
      state.activeReport,
      () => { state.currentView = 'dashboard'; renderApp(); }
    );
  }
}

// Global Nav Handlers
brandLink.addEventListener('click', (e) => {
  e.preventDefault();
  state.currentView = 'dashboard';
  renderApp();
});

// Initial boot
renderApp();
