import { authState, syncWithPythonBackend } from './modules/auth.js';
import { renderAuthModal } from './modules/authModal.js';
import { renderEditProfileModal } from './modules/editProfileModal.js';
import { renderInterviewSetup } from './modules/interviewSetup.js';
import { renderActiveInterview } from './modules/activeInterview.js';
import { renderFeedbackReport } from './modules/feedbackReport.js';
import { renderCandidateDashboard } from './modules/candidateDashboard.js';
import { renderMentorDashboard, renderAdminDashboard } from './modules/roleDashboards.js';
import { renderDemoInterview } from './modules/demoInterview.js';
import { renderAppLayout } from './modules/appLayout.js';
import { interviewStore } from './modules/auth.js';

// Application State: If no user is logged in, show the landing first page
let initialUser = authState.getCurrentUser();
if (initialUser && initialUser.name === 'Alex Rivera') {
  initialUser.name = 'Candidate';
  if (initialUser.email === 'alex@candidate.edu') {
    initialUser.email = 'candidate@interviewiq.io';
  }
  authState.updateUser(initialUser.id, { name: 'Candidate', email: initialUser.email });
}

const state = {
  currentUser: initialUser,
  currentView: initialUser ? 'dashboard' : 'landing', // 'landing' | 'demo' | 'dashboard' | 'setup' | 'active_interview' | 'feedback_report'
  activeNavTab: 'dashboard', // 'dashboard' | 'start_interview' | 'my_interviews' | 'practice_learn' | 'my_progress'
  activeSetupConfig: null,
  activeReport: null
};

// DOM Roots
const appContainer = document.getElementById('app');
const userSection = document.getElementById('header-user-section');
const brandLink = document.getElementById('brand-link');

// Module-level cleanup hook for landing page simulation & observers
let activeLandingCleanup = null;

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
      renderAuthModal('login', (u) => { 
        state.currentUser = u; 
        state.currentView = 'dashboard';
        state.activeNavTab = 'dashboard';
        renderApp(); 
      });
    });
    userSection.querySelector('#btn-header-register').addEventListener('click', () => {
      renderAuthModal('signup', (u) => { 
        state.currentUser = u; 
        state.currentView = 'dashboard';
        state.activeNavTab = 'dashboard';
        renderApp(); 
      });
    });
    return;
  }

  userSection.innerHTML = `
    <button type="button" class="btn-theme-toggle" id="btn-theme-toggle" title="Switch to ${isLight ? 'Dark' : 'Light'} Mode">
      ${themeIcon}
    </button>
    <div class="user-menu-wrapper" id="user-menu-wrapper">
      <button type="button" class="user-badge-btn" id="user-menu-toggle" aria-expanded="false" aria-haspopup="true">
        <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" alt="${user.name || 'User'}" class="user-avatar-sm" />
        <div style="display: flex; flex-direction: column; align-items: flex-start; text-align: left; justify-content: center;">
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main); line-height: 1.2; white-space: nowrap;">${user.name || (user.email ? user.email.split('@')[0] : 'Candidate')}</div>
          <span class="role-pill ${user.role || 'Candidate'}" style="font-size: 0.63rem; font-weight: 700; padding: 0.08rem 0.42rem; letter-spacing: 0.05em; margin-top: 2px; line-height: 1.2; border-radius: 9999px;">${user.role || 'Candidate'}</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 0.25rem; color: var(--text-muted);"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>

      <div class="user-dropdown-menu" id="user-dropdown-menu" style="display: none;">
        <div class="user-dropdown-header">
          <div class="user-name">${user.name || (user.email ? user.email.split('@')[0] : 'Candidate')}</div>
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

// ==========================================================
// LANDING PAGE DEMO SIMULATION & INTERSECTION OBSERVER
// ==========================================================
const HERO_ROTATING_PHRASES = [
  'Help You Improve.',
  'Explain Every Score.',
  'Build Your Confidence.',
  'Track Your Progress.'
];

const DEMO_SCENARIOS = [
  {
    directness: 82,
    technical: 84,
    confidence: 88,
    body: 82,
    status: 'Listening to response...',
    feedback: 'Clear structure articulating distributed caching trade-offs.'
  },
  {
    directness: 86,
    technical: 89,
    confidence: 92,
    body: 85,
    status: 'Analyzing communication...',
    feedback: 'High precision on fault tolerance and replication latency.'
  },
  {
    directness: 91,
    technical: 94,
    confidence: 93,
    body: 89,
    status: 'Evaluating technical clarity...',
    feedback: 'Strong structured STAR answer with quantifiable performance impact.'
  },
  {
    directness: 84,
    technical: 86,
    confidence: 85,
    body: 84,
    status: 'Updating interview insights...',
    feedback: 'Steady speaking pace of 138 WPM; filler words well controlled (<2%).'
  },
  {
    directness: 88,
    technical: 91,
    confidence: 89,
    body: 87,
    status: 'Feedback ready.',
    feedback: 'Tailored rubrics ready with concrete recommendations for Senior role.'
  }
];

function calcOverallScore(d, t, c, b) {
  // Balanced content-first weighting: Tech 35%, Directness 25%, Confidence 20%, Body 20%
  return Math.round(0.35 * t + 0.25 * d + 0.20 * c + 0.20 * b);
}

function getPerformanceLabel(score) {
  const s = Math.round(Number(score) || 0);
  if (s >= 90) return 'Excellent Performance';
  if (s >= 80) return 'Strong Performance';
  if (s >= 70) return 'Good Performance';
  if (s >= 60) return 'Developing Performance';
  return 'Needs Improvement';
}

function initLandingController(container) {
  let scenarioIndex = 0;
  let intervalId = null;
  let currentRaf = null;

  // DOM Elements
  const statusText = container.querySelector('#hud-status-text');
  const scoreNum = container.querySelector('#hud-overall-score-num');
  const scoreRing = container.querySelector('#hud-score-ring');
  const perfLabel = container.querySelector('#hud-performance-label');

  const dirVal = container.querySelector('#hud-directness-val');
  const dirBar = container.querySelector('#hud-directness-bar');
  const techVal = container.querySelector('#hud-technical-val');
  const techBar = container.querySelector('#hud-technical-bar');
  const confVal = container.querySelector('#hud-confidence-val');
  const confBar = container.querySelector('#hud-confidence-bar');
  const bodyVal = container.querySelector('#hud-body-val');
  const bodyBar = container.querySelector('#hud-body-bar');

  const feedbackPill = container.querySelector('#landing-feedback-pill');
  const feedbackText = container.querySelector('#landing-feedback-pill-text');

  // Initial State Tracking
  let curD = DEMO_SCENARIOS[0].directness;
  let curT = DEMO_SCENARIOS[0].technical;
  let curC = DEMO_SCENARIOS[0].confidence;
  let curB = DEMO_SCENARIOS[0].body;
  let curOverall = calcOverallScore(curD, curT, curC, curB);

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyValues(d, t, c, b, overall) {
    if (dirVal) dirVal.textContent = `${d} / 100`;
    if (dirBar) dirBar.style.width = `${d}%`;
    if (techVal) techVal.textContent = `${t} / 100`;
    if (techBar) techBar.style.width = `${t}%`;
    if (confVal) confVal.textContent = `${c} / 100`;
    if (confBar) confBar.style.width = `${c}%`;
    if (bodyVal) bodyVal.textContent = `${b} / 100`;
    if (bodyBar) bodyBar.style.width = `${b}%`;

    if (scoreNum) scoreNum.textContent = String(overall);
    if (perfLabel) perfLabel.textContent = getPerformanceLabel(overall);
    if (scoreRing) {
      scoreRing.style.background = `conic-gradient(#06b6d4 0% ${overall}%, rgba(255,255,255,0.15) ${overall}% 100%)`;
    }
  }

  function transitionToScenario(target) {
    const targetOverall = calcOverallScore(target.directness, target.technical, target.confidence, target.body);

    if (statusText) {
      statusText.style.opacity = '0';
      setTimeout(() => {
        statusText.textContent = target.status;
        statusText.style.opacity = '1';
      }, 180);
    }

    if (feedbackText && feedbackPill) {
      feedbackPill.classList.add('pill-update-pulse');
      feedbackText.style.opacity = '0';
      setTimeout(() => {
        feedbackText.textContent = target.feedback;
        feedbackText.style.opacity = '1';
      }, 180);
      setTimeout(() => {
        feedbackPill.classList.remove('pill-update-pulse');
      }, 600);
    }

    if (reducedMotion) {
      curD = target.directness;
      curT = target.technical;
      curC = target.confidence;
      curB = target.body;
      curOverall = targetOverall;
      applyValues(curD, curT, curC, curB, curOverall);
      return;
    }

    const startD = curD;
    const startT = curT;
    const startC = curC;
    const startB = curB;
    const startOverall = curOverall;

    const duration = 750; // ms
    const startTime = performance.now();

    function animateStep(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      curD = Math.round(startD + (target.directness - startD) * ease);
      curT = Math.round(startT + (target.technical - startT) * ease);
      curC = Math.round(startC + (target.confidence - startC) * ease);
      curB = Math.round(startB + (target.body - startB) * ease);
      curOverall = Math.round(startOverall + (targetOverall - startOverall) * ease);

      applyValues(curD, curT, curC, curB, curOverall);

      if (progress < 1) {
        currentRaf = requestAnimationFrame(animateStep);
      }
    }

    if (currentRaf) cancelAnimationFrame(currentRaf);
    currentRaf = requestAnimationFrame(animateStep);
  }

  // Initialize display
  applyValues(curD, curT, curC, curB, curOverall);

  // Set up controlled loop interval (transitions every 4.8 seconds)
  intervalId = setInterval(() => {
    scenarioIndex = (scenarioIndex + 1) % DEMO_SCENARIOS.length;
    transitionToScenario(DEMO_SCENARIOS[scenarioIndex]);
  }, 4800);

  // Headline Rotating Second-Line Loop (transitions every 3.5 seconds)
  let headlineIntervalId = null;
  const rotatingPhraseEl = container.querySelector('#hero-rotating-phrase');
  let phraseIndex = 0;

  if (rotatingPhraseEl) {
    headlineIntervalId = setInterval(() => {
      if (reducedMotion) {
        phraseIndex = (phraseIndex + 1) % HERO_ROTATING_PHRASES.length;
        rotatingPhraseEl.textContent = HERO_ROTATING_PHRASES[phraseIndex];
        return;
      }

      // 1. Smooth fade-out and slide upward
      rotatingPhraseEl.classList.remove('phrase-enter-active');
      rotatingPhraseEl.classList.add('phrase-exit');

      setTimeout(() => {
        // 2. Advance to next phrase in cycle
        phraseIndex = (phraseIndex + 1) % HERO_ROTATING_PHRASES.length;
        rotatingPhraseEl.textContent = HERO_ROTATING_PHRASES[phraseIndex];

        // 3. Prep incoming position slightly below baseline with transitions off
        rotatingPhraseEl.classList.remove('phrase-exit');
        rotatingPhraseEl.classList.add('phrase-enter-prep');

        // Force browser layout reflow
        void rotatingPhraseEl.offsetWidth;

        // 4. Smooth fade-in and slide upward into baseline position
        rotatingPhraseEl.classList.remove('phrase-enter-prep');
        rotatingPhraseEl.classList.add('phrase-enter-active');
      }, 380);
    }, 3500);
  }

  // IntersectionObserver for feature cards and sections
  let observer = null;
  const revealElements = container.querySelectorAll('.landing-reveal-init');
  if ('IntersectionObserver' in window && !reducedMotion) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('landing-reveal-visible');
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show immediately
    revealElements.forEach((el) => el.classList.add('landing-reveal-visible'));
  }

  // Return cleanup closure
  return function cleanup() {
    if (intervalId) clearInterval(intervalId);
    if (headlineIntervalId) clearInterval(headlineIntervalId);
    if (currentRaf) cancelAnimationFrame(currentRaf);
    if (observer) observer.disconnect();
  };
}

export function renderApp() {
  updateHeader();

  // Clean up any existing landing timers/observers before switching views
  if (typeof activeLandingCleanup === 'function') {
    activeLandingCleanup();
    activeLandingCleanup = null;
  }

  const isLanding = (!state.currentUser && state.currentView !== 'demo') || state.currentView === 'landing';
  if (isLanding) {
    document.body.classList.add('landing-no-scroll');
    document.documentElement.classList.add('landing-no-scroll');
  } else {
    document.body.classList.remove('landing-no-scroll');
    document.documentElement.classList.remove('landing-no-scroll');
  }

  if (isLanding) {
    // Show Welcome Landing with animated components, WebP assets, and dynamic metrics
    appContainer.innerHTML = `
      <div class="landing-page-container" style="position: relative; width: 100vw; margin-left: calc(-50vw + 50%); margin-right: calc(-50vw + 50%); height: 100%; min-height: 0; background: #060913; background-image: radial-gradient(circle at 65% 25%, #0d2859 0%, #08142c 45%, #050814 100%); color: #ffffff; padding: 0.75rem 2.5rem 0 2.5rem; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-x: hidden;">
        
        <!-- Ambient Background Glow -->
        <div class="landing-hero-ambient-glow" aria-hidden="true"></div>

        <!-- UPPER HERO SECTION -->
        <div class="landing-hero-grid" style="max-width: 1360px; width: 100%; margin: 0 auto; display: grid; grid-template-columns: 1.15fr 1.25fr; gap: 1.75rem; align-items: center; position: relative; z-index: 2; flex-shrink: 0;">
          
          <!-- LEFT COLUMN: Headline, Paragraph, CTAs (Staggered Entrance) -->
          <div class="landing-hero-left" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left; z-index: 10;">
            <!-- Main Hero Headline with Rotating Animated Second Line -->
            <h1 class="landing-headline hero-fade-in hero-delay-1" style="font-size: clamp(2.35rem, 3.4vw, 3.1rem); font-weight: 800; letter-spacing: -0.035em; line-height: 1.15; margin-bottom: 0.65rem;">
              <span class="landing-headline-fixed" style="display: block;">AI Mock Interviews That</span>
              <span class="landing-headline-rotator" style="display: block; position: relative; min-height: 1.22em; line-height: 1.15; overflow: hidden;">
                <span id="hero-rotating-phrase" class="hero-rotating-phrase" aria-live="polite">Help You Improve.</span>
              </span>
            </h1>

            <!-- Subtitle -->
            <p class="landing-subtitle hero-fade-in hero-delay-2" style="font-size: clamp(0.98rem, 1.22vw, 1.12rem); line-height: 1.48; margin-bottom: 1.25rem; max-width: 520px; font-weight: 400;">
              Practice live voice and video interviews tailored to your role and resume, and see exactly what to improve.
            </p>

            <!-- Dual CTA Buttons -->
            <div class="hero-fade-in hero-delay-3" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
              <button type="button" id="landing-demo-btn" class="btn btn-primary" style="background: #0284c7; background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); border: none; color: #ffffff !important; padding: 0.85rem 1.85rem; border-radius: 9999px; font-weight: 600; font-size: 1.02rem; display: inline-flex; align-items: center; gap: 0.55rem; box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4); cursor: pointer;">
                <span>Try Free Demo</span>
                <span style="font-size: 1.18rem; line-height: 1;" aria-hidden="true">→</span>
              </button>

              <button type="button" id="landing-account-btn" style="padding: 0.85rem 1.85rem; border-radius: 9999px; font-weight: 600; font-size: 1.02rem; cursor: pointer; backdrop-filter: blur(8px);">
                Create Free Account
              </button>
            </div>

          </div>

          <!-- RIGHT COLUMN: Laptop Mockup & Evaluator Picture -->
          <div class="landing-hero-right hero-fade-in hero-delay-4" style="position: relative; width: 100%; min-height: 235px; display: flex; align-items: center; justify-content: flex-start;">
            
            <!-- Laptop Device Mockup with Split Screen -->
            <div class="landing-laptop-wrapper" style="position: relative; z-index: 3; width: 510px; margin-left: -75px;">
              
              <!-- Laptop Screen Frame -->
              <div style="background: #111827; border-radius: 14px 14px 0 0; padding: 6px 6px 0 6px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(37, 99, 235, 0.35); border: 1.5px solid #2d3b50; border-bottom: none; position: relative;">
                
                <!-- Tiny Top Camera Dot -->
                <div style="width: 5px; height: 5px; background: #64748b; border-radius: 50%; margin: 0 auto 4px auto;" aria-hidden="true"></div>

                <!-- Screen Contents (Left Candidate Video, Right HUD) -->
                <div class="landing-laptop-screen-grid" style="position: relative; width: 100%; height: 215px; border-radius: 7px 7px 0 0; overflow: hidden; background: #070d1e; display: grid; grid-template-columns: 1fr 1fr;">
                  
                  <!-- Left: Candidate Live Feed (Optimized WebP Asset) -->
                  <div class="laptop-candidate-feed" style="position: relative; height: 100%; overflow: hidden; border-right: 1px solid rgba(255,255,255,0.08);">
                    <img 
                      src="/boy-interview.webp" 
                      alt="Candidate practicing interview in live AI simulator" 
                      style="width: 100%; height: 100%; object-fit: cover; object-position: center 15%; display: block;" 
                    />
                    
                    <!-- Live Interview Tag + Simulated Waveform -->
                    <div style="position: absolute; top: 7px; left: 7px; display: flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(6px); padding: 3px 9px; border-radius: 9999px; font-size: 0.74rem; color: #f8fafc; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.12);">
                      <span class="live-indicator-dot" aria-hidden="true"></span>
                      <span>Live Interview</span>
                      <div class="simulated-audio-waveform" title="Illustrative voice activity telemetry" aria-label="Simulated voice telemetry">
                        <span class="wave-bar wave-1"></span>
                        <span class="wave-bar wave-2"></span>
                        <span class="wave-bar wave-3"></span>
                        <span class="wave-bar wave-4"></span>
                        <span class="wave-bar wave-5"></span>
                      </div>
                    </div>

                    <!-- Bottom Floating Call Control Buttons -->
                    <div style="position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; align-items: center; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(6px); padding: 3px 8px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.15);" aria-label="In-call controls">
                      <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; color: white;" title="Microphone Active">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>
                      </div>
                      <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; color: white;" title="Camera Active">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                      </div>
                      <div style="width: 18px; height: 18px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center; color: white;" title="End Interview">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path></svg>
                      </div>
                    </div>
                  </div>

                  <!-- Right: AI Analysis HUD Screen (Dynamic Coordinated Demonstration) -->
                  <div class="laptop-hud-screen" style="background: #091224; padding: 0.75rem 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
                    
                    <!-- HUD Header with Status Badge -->
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.35rem;">
                      <div style="display: flex; align-items: center; gap: 0.45rem;">
                        <span style="font-size: 0.95rem; color: #38bdf8;" aria-hidden="true">📊</span>
                        <span style="font-size: 0.92rem; font-weight: 800; color: #ffffff; letter-spacing: -0.01em;">AI Analysis</span>
                      </div>
                      <div class="hud-status-badge" title="Illustrative demonstration status cycle">
                        <span class="hud-status-dot" aria-hidden="true"></span>
                        <span id="hud-status-text">Listening to response...</span>
                      </div>
                    </div>

                    <!-- Overall Score Circle & Text -->
                    <div style="display: flex; align-items: center; gap: 0.65rem; padding: 0.15rem 0;">
                      <div class="score-conic-ring" id="hud-score-ring" style="width: 44px; height: 44px; border-radius: 50%; background: conic-gradient(#06b6d4 0% 84%, rgba(255,255,255,0.15) 84% 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(6, 182, 212, 0.45); flex-shrink: 0;">
                        <div class="laptop-mockup-score-number" id="hud-overall-score-num" style="width: 35px; height: 35px; border-radius: 50%; background: #070e20; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.08rem; color: #ffffff !important;">
                          84
                        </div>
                      </div>
                      <div>
                        <div style="font-size: 0.88rem; font-weight: 700; color: #f8fafc; line-height: 1.2;">Overall Score</div>
                        <div id="hud-performance-label" style="font-size: 0.76rem; color: #38bdf8; font-weight: 600;">Strong Performance</div>
                      </div>
                    </div>

                    <!-- Bounded Dynamic Progress Bars -->
                    <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 600; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Response Directness</span>
                          <span id="hud-directness-val" style="color: #94a3b8; font-family: var(--font-mono); font-weight: 700;">82 / 100</span>
                        </div>
                        <div style="height: 4.5px; width: 100%; background: rgba(255,255,255,0.14); border-radius: 3px; overflow: hidden;">
                          <div id="hud-directness-bar" class="hud-metric-fill" style="width: 82%;"></div>
                        </div>
                      </div>

                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 600; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Technical Precision</span>
                          <span id="hud-technical-val" style="color: #94a3b8; font-family: var(--font-mono); font-weight: 700;">84 / 100</span>
                        </div>
                        <div style="height: 4.5px; width: 100%; background: rgba(255,255,255,0.14); border-radius: 3px; overflow: hidden;">
                          <div id="hud-technical-bar" class="hud-metric-fill" style="width: 84%;"></div>
                        </div>
                      </div>

                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 600; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Confidence Tone</span>
                          <span id="hud-confidence-val" style="color: #94a3b8; font-family: var(--font-mono); font-weight: 700;">88 / 100</span>
                        </div>
                        <div style="height: 4.5px; width: 100%; background: rgba(255,255,255,0.14); border-radius: 3px; overflow: hidden;">
                          <div id="hud-confidence-bar" class="hud-metric-fill" style="width: 88%;"></div>
                        </div>
                      </div>

                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 600; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Body Language</span>
                          <span id="hud-body-val" style="color: #94a3b8; font-family: var(--font-mono); font-weight: 700;">82 / 100</span>
                        </div>
                        <div style="height: 4.5px; width: 100%; background: rgba(255,255,255,0.14); border-radius: 3px; overflow: hidden;">
                          <div id="hud-body-bar" class="hud-metric-fill" style="width: 82%;"></div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              <!-- Laptop Bottom Hinge / Base -->
              <div style="width: 550px; height: 10px; background: linear-gradient(to bottom, #94a3b8, #475569); border-radius: 0 0 10px 10px; margin-left: -20px; box-shadow: 0 14px 28px rgba(0, 0, 0, 0.85); position: relative;">
                <div style="width: 60px; height: 3px; background: #334155; margin: 0 auto; border-radius: 0 0 3px 3px;"></div>
              </div>

            </div>

            <!-- Floating Translucent Feedback Card with Lightbulb Icon (Overlapping Laptop & Evaluator) -->
            <div class="landing-feedback-pill" id="landing-feedback-pill" style="position: absolute; right: 150px; top: 18px; z-index: 6; background: rgba(79, 70, 229, 0.88); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.45); border-radius: 10px; padding: 0.45rem 0.7rem; display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 8px 18px rgba(79, 70, 229, 0.45); max-width: 175px;">
              <span style="font-size: 1rem;" aria-hidden="true">💡</span>
              <span class="landing-feedback-pill-text" id="landing-feedback-pill-text" style="font-size: 0.62rem; font-weight: 700; color: #ffffff !important; line-height: 1.25;">
                Clear structure articulating distributed caching trade-offs.
              </span>
            </div>

            <!-- Evaluator Asian Business Woman Photo on Right Edge (Upper Hero Visual) -->
            <div class="landing-evaluator-portrait" style="position: absolute; right: -15px; top: -10px; width: 250px; height: 285px; pointer-events: none; z-index: 4; overflow: hidden; -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%); mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%); -webkit-mask-composite: source-in; mask-composite: intersect;">
              <img 
                src="/girl-interview.png" 
                alt="AI Evaluator conducting mock interview" 
                style="width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block;" 
              />
            </div>

          </div>

        </div>

        <!-- LOWER SECTION: "Why Choose InterviewIQ" (Stretched Full-Bleed Frame) -->
        <div style="width: 100vw; margin-left: -2.5rem; margin-right: -2.5rem; z-index: 2; flex-shrink: 0; box-sizing: border-box;">
          
          <div style="padding: 0 2.5rem 0.4rem 2.5rem;">
            <h2 class="landing-feature-heading landing-reveal-init" style="font-size: clamp(1.55rem, 2.2vw, 2.1rem); font-weight: 800; letter-spacing: -0.025em; margin-bottom: 0.35rem; text-align: left;">
              Why Choose InterviewIQ
            </h2>
          </div>

          <!-- ONE CONTINUOUS UNIFIED FRAME FULL BLEED LEFT TO RIGHT -->
          <div class="landing-feature-frame" style="display: grid; grid-template-columns: minmax(140px, 190px) repeat(4, 1fr) minmax(140px, 190px); gap: 0; border-radius: 0; overflow: hidden; border-top: 1.5px solid rgba(59, 130, 246, 0.35); border-bottom: 1.5px solid rgba(59, 130, 246, 0.35); border-left: none; border-right: none; background: rgba(13, 22, 44, 0.7); backdrop-filter: blur(12px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45), 0 0 20px rgba(37, 99, 235, 0.15); width: 100%;">
            
            <!-- Column 1: Left End Photo (Man in Suit / Interviewer) -->
            <div class="landing-feature-side-photo" style="position: relative; height: 100%; min-height: 165px; overflow: hidden; border-right: 1px solid rgba(59, 130, 246, 0.25); background: #070e20;">
              <img 
                src="/man-suit-left.jpg" 
                alt="Executive interviewer in suit" 
                style="width: 100%; height: 100%; object-fit: cover; object-position: 55% 15%; display: block; filter: contrast(1.05) brightness(1.02);" 
              />
            </div>

            <!-- Column 2: Card 1 - Real-Time Voice & Video Simulation (Clean Inline SVG) -->
            <div class="landing-feature-card landing-reveal-init" style="border-radius: 0; border: none; border-right: 1px solid rgba(59, 130, 246, 0.25); padding: 1.1rem 1.25rem; min-height: 165px; display: flex; flex-direction: column; justify-content: flex-start; text-align: left; background: transparent; box-shadow: none;">
              <div class="feature-card-icon-bubble" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                  <line x1="8" y1="22" x2="16" y2="22"></line>
                </svg>
              </div>
              <h3 style="font-size: clamp(0.92rem, 1.05vw, 1.02rem); font-weight: 700; line-height: 1.28; margin-bottom: 0.35rem;">
                Real-Time Voice & Video Simulation
              </h3>
              <p style="font-size: clamp(0.78rem, 0.88vw, 0.86rem); line-height: 1.42; margin: 0; opacity: 0.92;">
                Practice live voice and video interviews that accurately mimic actual high-stakes hiring environments.
              </p>
            </div>

            <!-- Column 3: Card 2 - Precise Identification of What Needs Improvement (Clean Inline SVG) -->
            <div class="landing-feature-card landing-reveal-init" style="border-radius: 0; border: none; border-right: 1px solid rgba(59, 130, 246, 0.25); padding: 1.1rem 1.25rem; min-height: 165px; display: flex; flex-direction: column; justify-content: flex-start; text-align: left; background: transparent; box-shadow: none;">
              <div class="feature-card-icon-bubble" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="22" y1="12" x2="18" y2="12"></line>
                  <line x1="6" y1="12" x2="2" y2="12"></line>
                  <line x1="12" y1="6" x2="12" y2="2"></line>
                  <line x1="12" y1="22" x2="12" y2="18"></line>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h3 style="font-size: clamp(0.92rem, 1.05vw, 1.02rem); font-weight: 700; line-height: 1.28; margin-bottom: 0.35rem;">
                Precise Identification of What Needs Improvement
              </h3>
              <p style="font-size: clamp(0.78rem, 0.88vw, 0.86rem); line-height: 1.42; margin: 0; opacity: 0.92;">
                Pinpoint exact areas—such as filler-word frequency, pacing issues, or gaps in technical clarity—instead of vague remarks.
              </p>
            </div>

            <!-- Column 4: Card 3 - Tailored to Your Specific Role & Resume (Clean Inline SVG) -->
            <div class="landing-feature-card landing-reveal-init" style="border-radius: 0; border: none; border-right: 1px solid rgba(59, 130, 246, 0.25); padding: 1.1rem 1.25rem; min-height: 165px; display: flex; flex-direction: column; justify-content: flex-start; text-align: left; background: transparent; box-shadow: none;">
              <div class="feature-card-icon-bubble" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 style="font-size: clamp(0.92rem, 1.05vw, 1.02rem); font-weight: 700; line-height: 1.28; margin-bottom: 0.35rem;">
                Tailored to Your Specific Role & Resume
              </h3>
              <p style="font-size: clamp(0.78rem, 0.88vw, 0.86rem); line-height: 1.42; margin: 0; opacity: 0.92;">
                Receive evaluation metrics customized strictly to your target job description, seniority level, and background.
              </p>
            </div>

            <!-- Column 5: Card 4 - Clear Performance Breakdown & Scoring (Clean Inline SVG) -->
            <div class="landing-feature-card landing-reveal-init" style="border-radius: 0; border: none; border-right: 1px solid rgba(59, 130, 246, 0.25); padding: 1.1rem 1.25rem; min-height: 165px; display: flex; flex-direction: column; justify-content: flex-start; text-align: left; background: transparent; box-shadow: none;">
              <div class="feature-card-icon-bubble" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                  <line x1="2" y1="20" x2="22" y2="20"></line>
                </svg>
              </div>
              <h3 style="font-size: clamp(0.92rem, 1.05vw, 1.02rem); font-weight: 700; line-height: 1.28; margin-bottom: 0.35rem;">
                Clear Performance Breakdown & Scoring
              </h3>
              <p style="font-size: clamp(0.78rem, 0.88vw, 0.86rem); line-height: 1.42; margin: 0; opacity: 0.92;">
                See an evidence-based breakdown of every score so you always know precisely what to fix before your actual interview.
              </p>
            </div>

            <!-- Column 6: Right End Photo (Lady Candidate with Laptop) -->
            <div class="landing-feature-side-photo" style="position: relative; height: 100%; min-height: 155px; overflow: hidden; background: #070e20;">
              <img 
                src="/lady-candidate-right.jpg" 
                alt="Candidate practicing mock interview" 
                style="width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; filter: contrast(1.05) brightness(1.02);" 
              />
            </div>

          </div>

        </div>

        <!-- BOTTOM BANNER: Ready to Ace Your Next Interview? (Edge-to-edge full width) -->
        <div class="landing-bottom-banner" style="position: relative; width: 100vw; margin-left: -2.5rem; margin-right: -2.5rem; margin-top: 0; z-index: 2; border-top: 1px solid rgba(99, 102, 241, 0.45); border-bottom: none; border-left: none; border-right: none; backdrop-filter: blur(12px); border-radius: 0; padding: 0.75rem 2rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 -4px 25px rgba(79, 70, 229, 0.25); flex-shrink: 0;">
          
          <div style="max-width: 1360px; width: 100%; display: flex; align-items: center; justify-content: center;">
            <!-- Eye-catching Text Centered -->
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; line-height: 1.25;">
              <div class="landing-banner-title" style="font-size: clamp(0.95rem, 1.15vw, 1.05rem); font-weight: 800; letter-spacing: -0.015em; color: #ffffff; text-align: center;">
                Ready to Ace Your Next Interview?
              </div>
              <div class="landing-banner-sub" style="font-size: clamp(0.75rem, 0.9vw, 0.82rem); color: #cbd5e1; font-weight: 500; margin-top: 2px; text-align: center;">
                Join thousands of candidates who are already gaining confidence and landing dream offers with InterviewIQ.
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    // Hook up action buttons
    const triggerDemo = () => {
      state.currentView = 'demo';
      renderApp();
    };

    const triggerSignUp = () => {
      renderAuthModal('signup', (u) => { 
        state.currentUser = u; 
        state.currentView = 'dashboard';
        state.activeNavTab = 'dashboard';
        renderApp(); 
      });
    };

    const demoBtn = appContainer.querySelector('#landing-demo-btn');
    if (demoBtn) demoBtn.addEventListener('click', triggerDemo);

    const accountBtn = appContainer.querySelector('#landing-account-btn');
    if (accountBtn) accountBtn.addEventListener('click', triggerSignUp);

    const bottomBanner = appContainer.querySelector('.landing-bottom-banner');
    if (bottomBanner) {
      bottomBanner.style.cursor = 'pointer';
      bottomBanner.setAttribute('role', 'button');
      bottomBanner.setAttribute('tabindex', '0');
      bottomBanner.setAttribute('aria-label', 'Get started with InterviewIQ');
      bottomBanner.addEventListener('click', triggerSignUp);
      bottomBanner.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerSignUp();
        }
      });
    }

    // Initialize the live demo simulation & scroll observer
    activeLandingCleanup = initLandingController(appContainer);

    return;
  }

  // Handle demo interview (no login required)
  if (state.currentView === 'demo') {
    document.body.classList.remove('landing-no-scroll', 'logged-in-app');
    document.documentElement.classList.remove('landing-no-scroll', 'logged-in-app');
    renderDemoInterview(
      appContainer,
      // onSignUp: open the signup modal
      () => {
        renderAuthModal('signup', (u) => {
          state.currentUser = u;
          state.currentView = 'dashboard';
          state.activeNavTab = 'dashboard';
          renderApp();
        });
      },
      // onGoHome: return to landing
      () => {
        state.currentView = 'landing';
        renderApp();
      }
    );
    return;
  }

  // Route depending on view
  if (state.currentUser && (state.currentView === 'dashboard' || state.currentView === 'setup')) {
    document.body.classList.add('logged-in-app');
    document.documentElement.classList.add('logged-in-app');
    document.body.classList.remove('landing-no-scroll', 'interview-no-scroll');
    document.documentElement.classList.remove('landing-no-scroll', 'interview-no-scroll');

    renderAppLayout(appContainer, {
      currentUser: state.currentUser,
      activeTab: state.activeNavTab || 'dashboard',
      currentTheme: currentTheme,
      initialSetupConfig: state.activeSetupConfig,
      onTabChange: (newTab) => {
        state.activeNavTab = newTab;
      },
      onStartActiveInterview: (setupConfig) => {
        state.activeSetupConfig = setupConfig;
        state.currentView = 'active_interview';
        renderApp();
      },
      onViewReport: (inv) => {
        state.activeReport = inv;
        state.currentView = 'feedback_report';
        renderApp();
      },
      onSignOut: () => {
        authState.logout();
        state.currentUser = null;
        state.activeNavTab = 'dashboard';
        state.currentView = 'landing';
        renderApp();
      },
      onEditProfile: () => {
        renderEditProfileModal(state.currentUser, (updatedUser) => {
          state.currentUser = updatedUser;
          renderApp();
        });
      },
      onToggleTheme: () => {
        toggleTheme();
        renderApp();
      }
    });
    return;
  } else if (state.currentView === 'active_interview') {
    document.body.classList.remove('logged-in-app');
    document.documentElement.classList.remove('logged-in-app');
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
    document.body.classList.remove('logged-in-app');
    document.documentElement.classList.remove('logged-in-app');
    renderFeedbackReport(
      appContainer,
      state.activeReport,
      () => {
        state.currentView = 'dashboard';
        state.activeNavTab = 'my_interviews';
        renderApp();
      },
      (retryConfig) => {
        state.activeSetupConfig = retryConfig;
        state.activeNavTab = 'start_interview';
        state.currentView = 'dashboard';
        renderApp();
      }
    );
  } else {
    document.body.classList.remove('logged-in-app');
    document.documentElement.classList.remove('logged-in-app');
  }
}

// Global Nav Handlers
brandLink.addEventListener('click', (e) => {
  e.preventDefault();
  document.body.classList.remove('interview-no-scroll', 'logged-in-app');
  document.documentElement.classList.remove('interview-no-scroll', 'logged-in-app');
  state.currentView = state.currentUser ? 'dashboard' : 'landing';
  state.activeNavTab = 'dashboard';
  renderApp();
});

// Initial boot
renderApp();

// Sync logged-in user profile from MySQL on startup
if (state.currentUser) {
  syncWithPythonBackend().then(() => {
    const refreshed = authState.getCurrentUser();
    if (refreshed) {
      state.currentUser = refreshed;
      updateHeader();
    }
  }).catch(() => {});
}
