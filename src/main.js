import { authState } from './modules/auth.js';
import { renderAuthModal } from './modules/authModal.js';
import { renderEditProfileModal } from './modules/editProfileModal.js';
import { renderInterviewSetup } from './modules/interviewSetup.js';
import { renderActiveInterview } from './modules/activeInterview.js';
import { renderFeedbackReport } from './modules/feedbackReport.js';
import { renderCandidateDashboard } from './modules/candidateDashboard.js';
import { renderMentorDashboard, renderAdminDashboard } from './modules/roleDashboards.js';
import { renderDemoInterview } from './modules/demoInterview.js';
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

  const isLanding = (!state.currentUser && state.currentView !== 'demo') || state.currentView === 'landing';
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
      <div class="landing-page-container" style="position: relative; width: 100vw; margin-left: calc(-50vw + 50%); margin-right: calc(-50vw + 50%); height: 100%; min-height: 0; background: #060913; background-image: radial-gradient(circle at 65% 25%, #0d2859 0%, #08142c 45%, #050814 100%); color: #ffffff; padding: 0.75rem 2.5rem 0 2.5rem; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow: hidden;">
        
        <!-- Decorative Ambient Sparkle Elements -->
        <span style="position: absolute; top: 15px; right: 35px; color: #94a3b8; opacity: 0.45; font-size: 1.1rem; pointer-events: none;">✦</span>
        <span style="position: absolute; top: 38%; left: 47%; color: #94a3b8; opacity: 0.4; font-size: 0.95rem; pointer-events: none;">✦</span>
        <span style="position: absolute; bottom: 70px; left: 30px; color: #94a3b8; opacity: 0.4; font-size: 1.1rem; pointer-events: none;">✦</span>
        <span style="position: absolute; bottom: 45px; right: 30px; color: #94a3b8; opacity: 0.5; font-size: 1.3rem; pointer-events: none;">✦</span>

        <!-- UPPER HERO SECTION -->
        <div style="max-width: 1360px; width: 100%; margin: 0 auto; display: grid; grid-template-columns: 1.15fr 1.25fr; gap: 1.75rem; align-items: center; position: relative; z-index: 2; flex-shrink: 0;">
          
          <!-- LEFT COLUMN: Headline, Paragraph, CTAs -->
          <div style="display: flex; flex-direction: column; align-items: flex-start; text-align: left; z-index: 10;">
            <!-- Main Hero Headline -->
            <h1 class="landing-headline" style="font-size: clamp(2.35rem, 3.4vw, 3.1rem); font-weight: 800; letter-spacing: -0.035em; line-height: 1.1; margin-bottom: 0.65rem;">
              AI Mock Interviews <br/>
              That <br/>
              <span style="background: linear-gradient(135deg, #38bdf8 0%, #818cf8 40%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Explain Every Score</span>
            </h1>

            <!-- Subtitle -->
            <p class="landing-subtitle" style="font-size: clamp(0.98rem, 1.22vw, 1.12rem); line-height: 1.48; margin-bottom: 1.25rem; max-width: 520px; font-weight: 400;">
              Practice live voice and video interviews tailored to your role and resume, and see exactly what to improve.
            </p>

            <!-- Dual CTA Buttons -->
            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
              <button type="button" id="landing-demo-btn" class="btn btn-primary" style="background: #0284c7; background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); border: none; color: #ffffff !important; padding: 0.85rem 1.85rem; border-radius: 9999px; font-weight: 600; font-size: 1.02rem; display: inline-flex; align-items: center; gap: 0.55rem; box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4); cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                <span>Try Free Demo</span>
                <span style="font-size: 1.18rem; line-height: 1;">→</span>
              </button>

              <button type="button" id="landing-account-btn" style="padding: 0.85rem 1.85rem; border-radius: 9999px; font-weight: 600; font-size: 1.02rem; cursor: pointer; backdrop-filter: blur(8px); transition: background 0.2s ease, border-color 0.2s ease;">
                Create Free Account
              </button>
            </div>

          </div>

          <!-- RIGHT COLUMN: Laptop Mockup & Evaluator Woman Picture -->
          <div style="position: relative; width: 100%; min-height: 235px; display: flex; align-items: center; justify-content: flex-start;">
            
            <!-- Radial Glow behind Laptop Mockup -->
            <div style="position: absolute; left: 0%; top: 5%; width: 360px; height: 210px; background: radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 75%); filter: blur(35px); pointer-events: none; z-index: 1;"></div>

            <!-- Laptop Device Mockup with Split Screen (Shifted to Left Side) -->
            <div style="position: relative; z-index: 3; width: 510px; margin-left: -75px;">
              
              <!-- Laptop Screen -->
              <div style="background: #111827; border-radius: 14px 14px 0 0; padding: 6px 6px 0 6px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(37, 99, 235, 0.35); border: 1.5px solid #2d3b50; border-bottom: none; position: relative;">
                
                <!-- Tiny Top Camera Dot -->
                <div style="width: 5px; height: 5px; background: #64748b; border-radius: 50%; margin: 0 auto 4px auto;"></div>

                <!-- Screen Contents (Left Candidate Video, Right HUD) -->
                <div style="position: relative; width: 100%; height: 215px; border-radius: 7px 7px 0 0; overflow: hidden; background: #070d1e; display: grid; grid-template-columns: 1fr 1fr;">
                  
                  <!-- Left: Candidate Live Feed -->
                  <div style="position: relative; height: 100%; overflow: hidden; border-right: 1px solid rgba(255,255,255,0.08);">
                    <img 
                      src="/boy-interview.png" 
                      alt="Candidate practicing interview" 
                      style="width: 100%; height: 100%; object-fit: cover; object-position: center 15%; display: block;" 
                    />
                    
                    <!-- Live Interview Tag -->
                    <div style="position: absolute; top: 7px; left: 7px; display: flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(4px); padding: 3px 9px; border-radius: 9999px; font-size: 0.74rem; color: #f8fafc; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 7px #ef4444;"></span>
                      <span>Live Interview</span>
                    </div>

                    <!-- Bottom Floating Call Control Buttons -->
                    <div style="position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; align-items: center; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(6px); padding: 3px 8px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.15);">
                      <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; color: white;">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>
                      </div>
                      <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; color: white;">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                      </div>
                      <div style="width: 18px; height: 18px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center; color: white;">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path></svg>
                      </div>
                    </div>
                  </div>

                  <!-- Right: AI Analysis HUD Screen -->
                  <div class="laptop-hud-screen" style="background: #091224; padding: 0.75rem 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.45rem;">
                      <span style="font-size: 0.95rem; color: #38bdf8;">📊</span>
                      <span style="font-size: 0.92rem; font-weight: 800; color: #ffffff; letter-spacing: -0.01em;">AI Analysis</span>
                    </div>

                    <!-- Overall Score Circle & Text -->
                    <div style="display: flex; align-items: center; gap: 0.65rem; padding: 0.15rem 0;">
                      <div style="width: 44px; height: 44px; border-radius: 50%; background: conic-gradient(#06b6d4 0% 82%, rgba(255,255,255,0.15) 82% 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(6, 182, 212, 0.45); flex-shrink: 0;">
                        <div class="laptop-mockup-score-number" style="width: 35px; height: 35px; border-radius: 50%; background: #070e20; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: #ffffff !important;">
                          82
                        </div>
                      </div>
                      <div>
                        <div style="font-size: 0.88rem; font-weight: 700; color: #f8fafc; line-height: 1.2;">Overall Score</div>
                        <div style="font-size: 0.76rem; color: #38bdf8; font-weight: 600;">Good Performance</div>
                      </div>
                    </div>

                    <!-- Progress Bars with Larger Text -->
                    <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 600; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Response Directness</span>
                          <span style="color: #94a3b8; font-family: var(--font-mono); font-weight: 700;">81 / 100</span>
                        </div>
                        <div style="height: 4.5px; width: 100%; background: rgba(255,255,255,0.14); border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; width: 81%; background: #0284c7; border-radius: 3px;"></div>
                        </div>
                      </div>

                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 600; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Technical Precision</span>
                          <span style="color: #94a3b8; font-family: var(--font-mono); font-weight: 700;">83 / 100</span>
                        </div>
                        <div style="height: 4.5px; width: 100%; background: rgba(255,255,255,0.14); border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; width: 83%; background: #0284c7; border-radius: 3px;"></div>
                        </div>
                      </div>

                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 600; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Confidence Tone</span>
                          <span style="color: #94a3b8; font-family: var(--font-mono); font-weight: 700;">90 / 100</span>
                        </div>
                        <div style="height: 4.5px; width: 100%; background: rgba(255,255,255,0.14); border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; width: 90%; background: #0284c7; border-radius: 3px;"></div>
                        </div>
                      </div>

                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 600; margin-bottom: 2px;">
                          <span style="color: #cbd5e1;">Body Language</span>
                          <span style="color: #94a3b8; font-family: var(--font-mono); font-weight: 700;">80 / 100</span>
                        </div>
                        <div style="height: 4.5px; width: 100%; background: rgba(255,255,255,0.14); border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; width: 80%; background: #0284c7; border-radius: 3px;"></div>
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
            <div class="landing-feedback-pill" style="position: absolute; right: 150px; top: 18px; z-index: 6; background: rgba(79, 70, 229, 0.88); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.45); border-radius: 10px; padding: 0.45rem 0.7rem; display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 8px 18px rgba(79, 70, 229, 0.45); max-width: 155px;">
              <span style="font-size: 1rem;">💡</span>
              <span class="landing-feedback-pill-text" style="font-size: 0.62rem; font-weight: 700; color: #ffffff !important; line-height: 1.25;">
                Practice voice video tailored feedback with actionable advice
              </span>
            </div>

            <!-- Evaluator Asian Business Woman Photo on Right Edge -->
            <div style="position: absolute; right: -15px; top: -10px; width: 250px; height: 285px; pointer-events: none; z-index: 4; overflow: hidden; -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%); mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%); -webkit-mask-composite: source-in; mask-composite: intersect;">
              <img 
                src="/girl-interview.png" 
                alt="AI Evaluator conducting mock interview" 
                style="width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block;" 
              />
            </div>

          </div>

        </div>

        <!-- LOWER SECTION: "Why Choose InterviewIQ" (Stretched Full-Bleed Till End on Right & Left) -->
        <div style="width: 100vw; margin-left: -2.5rem; margin-right: -2.5rem; z-index: 2; flex-shrink: 0; box-sizing: border-box;">
          
          <div style="padding: 0 2.5rem 0.4rem 2.5rem;">
            <h2 class="landing-feature-heading" style="font-size: clamp(1.55rem, 2.2vw, 2.1rem); font-weight: 800; letter-spacing: -0.025em; margin-bottom: 0.35rem; text-align: left;">
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

            <!-- Column 2: Card 1 - Real-Time Voice & Video Simulation -->
            <div class="landing-feature-card" style="border-radius: 0; border: none; border-right: 1px solid rgba(59, 130, 246, 0.25); padding: 1rem 1.25rem; min-height: 165px; display: flex; flex-direction: column; justify-content: flex-start; text-align: left; background: transparent; box-shadow: none;">
              <div style="margin-bottom: 0.45rem; font-size: 1.45rem; display: flex; align-items: center; gap: 0.35rem; height: 28px;">
                <span style="color: #38bdf8;">🎙️</span>
                <span style="color: #a855f7; font-size: 1.25rem;">▶️</span>
              </div>
              <h3 style="font-size: clamp(0.92rem, 1.05vw, 1.02rem); font-weight: 700; line-height: 1.28; margin-bottom: 0.35rem;">
                Real-Time Voice & Video Simulation
              </h3>
              <p style="font-size: clamp(0.78rem, 0.88vw, 0.86rem); line-height: 1.42; margin: 0; opacity: 0.92;">
                Practice live voice and video interviews that accurately mimic actual high-stakes hiring environments.
              </p>
            </div>

            <!-- Column 3: Card 2 - Precise Identification of What Needs Improvement -->
            <div class="landing-feature-card" style="border-radius: 0; border: none; border-right: 1px solid rgba(59, 130, 246, 0.25); padding: 1rem 1.25rem; min-height: 165px; display: flex; flex-direction: column; justify-content: flex-start; text-align: left; background: transparent; box-shadow: none;">
              <div style="margin-bottom: 0.45rem; font-size: 1.45rem; display: flex; align-items: center; gap: 0.35rem; height: 28px;">
                <span style="color: #38bdf8;">📍</span>
                <span style="color: #60a5fa; font-size: 1.3rem;">🔍</span>
              </div>
              <h3 style="font-size: clamp(0.92rem, 1.05vw, 1.02rem); font-weight: 700; line-height: 1.28; margin-bottom: 0.35rem;">
                Precise Identification of What Needs Improvement
              </h3>
              <p style="font-size: clamp(0.78rem, 0.88vw, 0.86rem); line-height: 1.42; margin: 0; opacity: 0.92;">
                Pinpoint exact areas—such as filler-word frequency, pacing issues, or gaps in technical clarity—instead of giving you vague feedback.
              </p>
            </div>

            <!-- Column 4: Card 3 - Tailored to Your Specific Role & Resume -->
            <div class="landing-feature-card" style="border-radius: 0; border: none; border-right: 1px solid rgba(59, 130, 246, 0.25); padding: 1rem 1.25rem; min-height: 165px; display: flex; flex-direction: column; justify-content: flex-start; text-align: left; background: transparent; box-shadow: none;">
              <div style="margin-bottom: 0.45rem; font-size: 1.45rem; display: flex; align-items: center; gap: 0.35rem; height: 28px;">
                <span style="color: #60a5fa;">📄</span>
                <span style="color: #f43f5e; font-size: 1.25rem;">🎯</span>
              </div>
              <h3 style="font-size: clamp(0.92rem, 1.05vw, 1.02rem); font-weight: 700; line-height: 1.28; margin-bottom: 0.35rem;">
                Tailored to Your Specific Role & Resume
              </h3>
              <p style="font-size: clamp(0.78rem, 0.88vw, 0.86rem); line-height: 1.42; margin: 0; opacity: 0.92;">
                Receive evaluation metrics customized strictly to your target job description, seniority level, and background.
              </p>
            </div>

            <!-- Column 5: Card 4 - Clear Performance Breakdown & Scoring -->
            <div class="landing-feature-card" style="border-radius: 0; border: none; border-right: 1px solid rgba(59, 130, 246, 0.25); padding: 1rem 1.25rem; min-height: 165px; display: flex; flex-direction: column; justify-content: flex-start; text-align: left; background: transparent; box-shadow: none;">
              <div style="margin-bottom: 0.45rem; font-size: 1.45rem; display: flex; align-items: center; gap: 0.35rem; height: 28px;">
                <span style="color: #38bdf8;">📈</span>
                <span style="color: #3b82f6; font-size: 1.25rem;">🛡️</span>
              </div>
              <h3 style="font-size: clamp(0.92rem, 1.05vw, 1.02rem); font-weight: 700; line-height: 1.28; margin-bottom: 0.35rem;">
                Clear Performance Breakdown & Scoring
              </h3>
              <p style="font-size: clamp(0.78rem, 0.88vw, 0.86rem); line-height: 1.42; margin: 0; opacity: 0.92;">
                See an evidence-based breakdown of every score so you always know precisely what to fix before your actual interview.
              </p>
            </div>

            <!-- Column 6: Right End Photo (Lady Candidate with Laptop) -->
            <div style="position: relative; height: 100%; min-height: 155px; overflow: hidden; background: #070e20;">
              <img 
                src="/lady-candidate-right.jpg" 
                alt="Candidate practicing mock interview" 
                style="width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; filter: contrast(1.05) brightness(1.02);" 
              />
            </div>

          </div>

        </div>

        <!-- BOTTOM BANNER: Ready to Ace Your Next Interview? (Edge-to-edge full width) -->
        <div class="landing-bottom-banner" style="position: relative; width: 100vw; margin-left: -2.5rem; margin-right: -2.5rem; margin-top: 0; z-index: 2; background: linear-gradient(90deg, rgba(79, 70, 229, 0.4) 0%, rgba(37, 99, 235, 0.35) 50%, rgba(6, 182, 212, 0.25) 100%); border-top: 1px solid rgba(99, 102, 241, 0.45); border-bottom: none; border-left: none; border-right: none; backdrop-filter: blur(12px); border-radius: 0; padding: 0.75rem 2rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 -4px 25px rgba(79, 70, 229, 0.25); flex-shrink: 0;">
          
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
        renderApp(); 
      });
    };

    const demoBtn = appContainer.querySelector('#landing-demo-btn');
    if (demoBtn) demoBtn.addEventListener('click', triggerDemo);

    const accountBtn = appContainer.querySelector('#landing-account-btn');
    if (accountBtn) accountBtn.addEventListener('click', triggerSignUp);

    return;
  }

  // Handle demo interview (no login required)
  if (state.currentView === 'demo') {
    document.body.classList.remove('landing-no-scroll');
    document.documentElement.classList.remove('landing-no-scroll');
    renderDemoInterview(
      appContainer,
      // onSignUp: open the signup modal
      () => {
        renderAuthModal('signup', (u) => {
          state.currentUser = u;
          state.currentView = 'dashboard';
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
