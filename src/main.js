import { authState } from './modules/auth.js';
import { renderAuthModal } from './modules/authModal.js';
import { renderEditProfileModal } from './modules/editProfileModal.js';
import { renderInterviewSetup } from './modules/interviewSetup.js';
import { renderActiveInterview } from './modules/activeInterview.js';
import { renderFeedbackReport } from './modules/feedbackReport.js';
import { renderCandidateDashboard } from './modules/candidateDashboard.js';
import { renderMentorDashboard, renderAdminDashboard } from './modules/roleDashboards.js';
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
  currentView: initialUser ? 'dashboard' : 'landing', // 'landing' | 'dashboard' | 'setup' | 'active_interview' | 'feedback_report'
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

  const isLanding = !state.currentUser || state.currentView === 'landing';
  if (isLanding) {
    document.body.classList.add('landing-no-scroll');
    document.documentElement.classList.add('landing-no-scroll');
  } else {
    document.body.classList.remove('landing-no-scroll');
    document.documentElement.classList.remove('landing-no-scroll');
  }

  if (isLanding) {
    // Show Welcome Landing that exactly matches the format in the user's reference image
    appContainer.innerHTML = `
      <div class="landing-page-container" style="position: relative; width: 100vw; margin-left: calc(-50vw + 50%); margin-right: calc(-50vw + 50%); height: calc(100vh - 65px); max-height: calc(100vh - 65px); background: #060913; background-image: radial-gradient(circle at 65% 25%, #0d2859 0%, #08142c 45%, #050814 100%); color: #ffffff; padding: 1.25rem 3.5rem; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-start; gap: 1.5rem; box-sizing: border-box;">
        
        <!-- Decorative Ambient Sparkle Elements -->
        <span style="position: absolute; top: 35px; right: 40px; color: #94a3b8; opacity: 0.5; font-size: 1.4rem; pointer-events: none;">✦</span>
        <span style="position: absolute; top: 320px; left: 47%; color: #94a3b8; opacity: 0.45; font-size: 1.1rem; pointer-events: none;">✦</span>
        <span style="position: absolute; bottom: 120px; left: 35px; color: #94a3b8; opacity: 0.45; font-size: 1.3rem; pointer-events: none;">✦</span>
        <span style="position: absolute; bottom: 65px; right: 35px; color: #94a3b8; opacity: 0.55; font-size: 1.6rem; pointer-events: none;">✦</span>

        <!-- UPPER HERO SECTION -->
        <div style="max-width: 1400px; width: 100%; margin: 0 auto; display: grid; grid-template-columns: 1.1fr 1.3fr; gap: 2rem; align-items: center; position: relative; z-index: 2; margin-bottom: 0;">
          
          <!-- LEFT COLUMN: Headline, Paragraph, CTAs (Shifted further upwards) -->
          <div style="display: flex; flex-direction: column; align-items: flex-start; text-align: left; z-index: 10; padding-top: 0; margin-top: -1rem;">
                 <!-- Main Hero Headline -->
            <h1 class="landing-headline" style="font-size: 3.1rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 0.75rem;">
              AI Mock Interviews <br/>
              That <br/>
              <span style="background: linear-gradient(135deg, #38bdf8 0%, #818cf8 40%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Explain Every Score</span>
            </h1>

            <!-- Subtitle -->
            <p class="landing-subtitle" style="font-size: 1rem; line-height: 1.45; margin-bottom: 1.15rem; max-width: 480px; font-weight: 400;">
              Practice live voice and video interviews tailored to your role and resume, and see exactly what to improve.
            </p>

            <!-- Dual CTA Buttons -->
            <div style="display: flex; gap: 1.15rem; align-items: center; flex-wrap: wrap;">
              <button type="button" id="landing-demo-btn" class="btn btn-primary" style="background: #0284c7; background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); border: none; color: #ffffff !important; padding: 0.8rem 1.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4); cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                <span>Try Free Demo</span>
                <span style="font-size: 1.1rem; line-height: 1;">→</span>
              </button>

              <button type="button" id="landing-account-btn" style="padding: 0.8rem 1.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.95rem; cursor: pointer; backdrop-filter: blur(8px); transition: background 0.2s ease, border-color 0.2s ease;">
                Create Free Account
              </button>
            </div>

          </div>

          <!-- RIGHT COLUMN: Laptop Mockup & Evaluator Woman Picture -->
          <div style="position: relative; width: 100%; min-height: 330px; display: flex; align-items: center; justify-content: flex-start;">
            
            <!-- Radial Glow behind Laptop Mockup -->
            <div style="position: absolute; left: 10%; top: 5%; width: 400px; height: 280px; background: radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 75%); filter: blur(45px); pointer-events: none; z-index: 1;"></div>

            <!-- Laptop Device Mockup with Split Screen (Shifted more to the left) -->
            <div style="position: relative; z-index: 3; width: 490px; margin-left: -70px;">
              
              <!-- Laptop Screen -->
              <div style="background: #111827; border-radius: 12px 12px 0 0; padding: 5px 6px 0 6px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(37, 99, 235, 0.35); border: 1.5px solid #2d3b50; border-bottom: none; position: relative;">
                
                <!-- Tiny Top Camera Dot -->
                <div style="width: 5px; height: 5px; background: #64748b; border-radius: 50%; margin: 0 auto 4px auto;"></div>

                <!-- Screen Contents (Left Candidate Video, Right HUD) -->
                <div style="position: relative; width: 100%; height: 230px; border-radius: 6px 6px 0 0; overflow: hidden; background: #070d1e; display: grid; grid-template-columns: 1fr 1fr;">
                  
                  <!-- Left: Candidate Live Feed -->
                  <div style="position: relative; height: 100%; overflow: hidden; border-right: 1px solid rgba(255,255,255,0.08);">
                    <img 
                      src="/boy-interview.png" 
                      alt="Candidate practicing interview" 
                      style="width: 100%; height: 100%; object-fit: cover; object-position: center 15%; display: block;" 
                    />
                    
                    <!-- Live Interview Tag -->
                    <div style="position: absolute; top: 7px; left: 7px; display: flex; align-items: center; gap: 4px; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(4px); padding: 2px 7px; border-radius: 9999px; font-size: 0.62rem; color: #f8fafc; font-weight: 600;">
                      <span style="width: 5px; height: 5px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 6px #ef4444;"></span>
                      <span>Live Interview</span>
                    </div>

                    <!-- Bottom Floating Call Control Buttons -->
                    <div style="position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px; align-items: center; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(6px); padding: 3px 7px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.12);">
                      <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; color: white;">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>
                      </div>
                      <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; color: white;">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                      </div>
                      <div style="width: 18px; height: 18px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center; color: white;">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path></svg>
                      </div>
                    </div>
                  </div>

                  <!-- Right: AI Analysis HUD Screen -->
                  <div class="laptop-hud-screen" style="background: #091224; padding: 0.75rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.35rem;">
                      <span style="font-size: 0.72rem; color: #38bdf8;">📊</span>
                      <span style="font-size: 0.72rem; font-weight: 700; color: #ffffff;">AI Analysis</span>
                    </div>

                    <!-- Overall Score Circle & Text -->
                    <div style="display: flex; align-items: center; gap: 0.55rem; padding: 0.15rem 0;">
                      <div style="width: 38px; height: 38px; border-radius: 50%; background: conic-gradient(#06b6d4 0% 82%, rgba(255,255,255,0.15) 82% 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);">
                        <div class="laptop-mockup-score-number" style="width: 30px; height: 30px; border-radius: 50%; background: #070e20; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.88rem; color: #ffffff !important;">
                          82
                        </div>
                      </div>
                      <div>
                        <div style="font-size: 0.72rem; font-weight: 700; color: #f8fafc;">Overall Score</div>
                        <div style="font-size: 0.62rem; color: #38bdf8; font-weight: 600;">Good Performance</div>
                      </div>
                    </div>

                    <!-- Progress Bars -->
                    <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.62rem; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Response Directness</span>
                          <span style="color: #94a3b8; font-family: var(--font-mono);">81 / 100</span>
                        </div>
                        <div style="height: 3px; width: 100%; background: rgba(255,255,255,0.12); border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; width: 81%; background: #0284c7; border-radius: 3px;"></div>
                        </div>
                      </div>

                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.62rem; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Technical Precision</span>
                          <span style="color: #94a3b8; font-family: var(--font-mono);">83 / 100</span>
                        </div>
                        <div style="height: 3px; width: 100%; background: rgba(255,255,255,0.12); border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; width: 83%; background: #0284c7; border-radius: 3px;"></div>
                        </div>
                      </div>

                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.62rem; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Confidence Tone</span>
                          <span style="color: #94a3b8; font-family: var(--font-mono);">90 / 100</span>
                        </div>
                        <div style="height: 3px; width: 100%; background: rgba(255,255,255,0.12); border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; width: 90%; background: #0284c7; border-radius: 3px;"></div>
                        </div>
                      </div>

                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.62rem; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Body Language</span>
                          <span style="color: #94a3b8; font-family: var(--font-mono);">80 / 100</span>
                        </div>
                        <div style="height: 3px; width: 100%; background: rgba(255,255,255,0.12); border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; width: 80%; background: #0284c7; border-radius: 3px;"></div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              <!-- Laptop Bottom Hinge / Base -->
              <div style="width: 530px; height: 10px; background: linear-gradient(to bottom, #94a3b8, #475569); border-radius: 0 0 10px 10px; margin-left: -20px; box-shadow: 0 16px 30px rgba(0, 0, 0, 0.85); position: relative;">
                <div style="width: 60px; height: 3px; background: #334155; margin: 0 auto; border-radius: 0 0 3px 3px;"></div>
              </div>

            </div>

            <!-- Floating Translucent Feedback Card with Lightbulb Icon (Overlapping Laptop & Evaluator) -->
            <div class="landing-feedback-pill" style="position: absolute; right: 200px; top: 30px; z-index: 6; background: rgba(79, 70, 229, 0.88); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.45); border-radius: 12px; padding: 0.65rem 0.85rem; display: flex; align-items: center; gap: 0.65rem; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.45); max-width: 175px;">
              <span style="font-size: 1.25rem;">💡</span>
              <span class="landing-feedback-pill-text" style="font-size: 0.68rem; font-weight: 700; color: #ffffff !important; line-height: 1.3;">
                Practice voice video tailored feedback with actionable advice
              </span>
            </div>

            <!-- Evaluator Asian Business Woman Photo on Right Edge -->
            <div style="position: absolute; right: -25px; top: -20px; width: 310px; height: 370px; pointer-events: none; z-index: 4; overflow: hidden; -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%); mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%); -webkit-mask-composite: source-in; mask-composite: intersect;">
              <img 
                src="/girl-interview.png" 
                alt="AI Evaluator conducting mock interview" 
                style="width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block;" 
              />
            </div>

          </div>

        </div>

        <!-- LOWER SECTION: "Why Choose InterviewIQ" (4 Feature Cards - Directly below Try Free Demo button) -->
        <div style="max-width: 1400px; width: 100%; margin: 0 auto; z-index: 2; margin-top: 0;">
          
          <h2 class="landing-feature-heading" style="font-size: 1.65rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.65rem; text-align: left;">
            Why Choose InterviewIQ
          </h2>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
            
            <!-- Card 1: Real-Time Voice & Video Simulation -->
            <div class="landing-feature-card" style="border-radius: 12px; padding: 1.15rem 1.25rem; display: flex; flex-direction: column; text-align: left; transition: transform 0.2s ease, border-color 0.2s ease;">
              <div style="margin-bottom: 0.75rem; font-size: 1.85rem; display: flex; align-items: center; gap: 0.35rem; height: 34px;">
                <span style="color: #38bdf8;">🎙️</span>
                <span style="color: #a855f7; font-size: 1.45rem;">▶️</span>
              </div>
              <h3 style="font-size: 1.05rem; font-weight: 700; line-height: 1.25; margin-bottom: 0.5rem;">
                Real-Time Voice & Video Simulation
              </h3>
              <p style="font-size: 0.84rem; line-height: 1.42;">
                Practice live voice and video interviews that accurately mimic actual high-stakes hiring environments.
              </p>
            </div>

            <!-- Card 2: Precise Identification of What Needs Improvement -->
            <div class="landing-feature-card" style="border-radius: 12px; padding: 1.15rem 1.25rem; display: flex; flex-direction: column; text-align: left; transition: transform 0.2s ease, border-color 0.2s ease;">
              <div style="margin-bottom: 0.75rem; font-size: 1.85rem; display: flex; align-items: center; gap: 0.35rem; height: 34px;">
                <span style="color: #38bdf8;">📍</span>
                <span style="color: #60a5fa; font-size: 1.55rem;">🔍</span>
              </div>
              <h3 style="font-size: 1.05rem; font-weight: 700; line-height: 1.25; margin-bottom: 0.5rem;">
                Precise Identification of What Needs Improvement
              </h3>
              <p style="font-size: 0.84rem; line-height: 1.42;">
                Pinpoint exact areas—such as filler-word frequency, pacing issues, or gaps in technical clarity—instead of giving you vague feedback.
              </p>
            </div>

            <!-- Card 3: Tailored to Your Specific Role & Resume -->
            <div class="landing-feature-card" style="border-radius: 12px; padding: 1.15rem 1.25rem; display: flex; flex-direction: column; text-align: left; transition: transform 0.2s ease, border-color 0.2s ease;">
              <div style="margin-bottom: 0.75rem; font-size: 1.85rem; display: flex; align-items: center; gap: 0.35rem; height: 34px;">
                <span style="color: #60a5fa;">📄</span>
                <span style="color: #f43f5e; font-size: 1.45rem;">🎯</span>
              </div>
              <h3 style="font-size: 1.05rem; font-weight: 700; line-height: 1.25; margin-bottom: 0.5rem;">
                Tailored to Your Specific Role & Resume
              </h3>
              <p style="font-size: 0.84rem; line-height: 1.42;">
                Receive evaluation metrics customized strictly to your target job description, seniority level, and background.
              </p>
            </div>

            <!-- Card 4: Clear Performance Breakdown & Scoring -->
            <div class="landing-feature-card" style="border-radius: 12px; padding: 1.15rem 1.25rem; display: flex; flex-direction: column; text-align: left; transition: transform 0.2s ease, border-color 0.2s ease;">
              <div style="margin-bottom: 0.75rem; font-size: 1.85rem; display: flex; align-items: center; gap: 0.35rem; height: 34px;">
                <span style="color: #38bdf8;">📈</span>
                <span style="color: #3b82f6; font-size: 1.4rem;">🛡️</span>
              </div>
              <h3 style="font-size: 1.05rem; font-weight: 700; line-height: 1.25; margin-bottom: 0.5rem;">
                Clear Performance Breakdown & Scoring
              </h3>
              <p style="font-size: 0.84rem; line-height: 1.42;">
                See an evidence-based breakdown of every score so you always know precisely what to fix before your actual interview.
              </p>
            </div>

          </div>

        </div>

        <!-- BOTTOM BANNER: Ready to Ace Your Next Interview? -->
        <div class="landing-bottom-banner" style="max-width: 1400px; width: 100%; margin: 0 auto; z-index: 2; background: linear-gradient(90deg, rgba(79, 70, 229, 0.4) 0%, rgba(37, 99, 235, 0.35) 50%, rgba(6, 182, 212, 0.25) 100%); border: 1px solid rgba(99, 102, 241, 0.4); backdrop-filter: blur(12px); border-radius: 14px; padding: 0.75rem 1.75rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 30px rgba(79, 70, 229, 0.25);">
          
          <div style="display: flex; align-items: center; justify-content: center;">
            <!-- Eye-catching Text Centered -->
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; line-height: 1.25;">
              <div class="landing-banner-title" style="font-size: 1.05rem; font-weight: 800; letter-spacing: -0.015em; color: #ffffff; text-align: center;">
                Ready to Ace Your Next Interview?
              </div>
              <div class="landing-banner-sub" style="font-size: 0.85rem; color: #cbd5e1; font-weight: 500; margin-top: 2px; text-align: center;">
                Join thousands of candidates who are already gaining confidence and landing dream offers with InterviewIQ.
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    // Hook up action buttons
    const triggerDemo = () => {
      let demoUser = authState.getUsers().find(u => u.role === 'Candidate') || {
        id: 'usr_guest_demo',
        name: 'Demo Candidate',
        email: 'demo@interviewiq.io',
        role: 'Candidate',
        verified: true,
        targetRole: 'Full Stack Engineer',
        level: 'Mid Level',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      authState.setCurrentUser(demoUser);
      state.currentUser = demoUser;
      state.currentView = 'setup';
      renderApp();
    };

    const triggerSignUp = () => {
      renderAuthModal('signup', (u) => { 
        state.currentUser = u; 
        state.currentView = 'dashboard';
        renderApp(); 
      });
    };

    const demoBtn = appContainer.querySelector('#landing-demo-btn');
    if (demoBtn) demoBtn.addEventListener('click', triggerDemo);

    const accountBtn = appContainer.querySelector('#landing-account-btn');
    if (accountBtn) accountBtn.addEventListener('click', triggerSignUp);

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
  state.currentView = state.currentUser ? 'dashboard' : 'landing';
  renderApp();
});

// Initial boot
renderApp();
