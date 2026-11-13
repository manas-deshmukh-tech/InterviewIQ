import { interviewStore, authState } from './auth.js';
import { renderInterviewSetup } from './interviewSetup.js';

/**
 * InterviewIQ Authenticated App Shell Layout
 * Sidebar on the left:
 * - Dashboard
 * - Start Interview
 * - My Interviews
 * - Practice & Learn
 * - My Progress
 *
 * Top right of the page:
 * - Theme toggle (Light / Dark mode)
 * - User Profile button & dropdown menu (identical to first page)
 *
 * Main content area displays a clean blank page by default on sign in / sign up.
 */
export function renderAppLayout(container, {
  currentUser,
  activeTab = 'dashboard',
  onTabChange,
  onStartActiveInterview,
  onViewReport,
  onSignOut,
  onEditProfile,
  onToggleTheme,
  currentTheme = 'dark'
}) {
  const user = currentUser || authState.getCurrentUser() || { id: 'default', name: 'Candidate', email: 'candidate@interviewiq.com', role: 'Candidate' };
  let currentActiveTab = activeTab;

  function getPageTitle(tab) {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'start_interview':
        return 'Start Interview';
      case 'my_interviews':
        return 'My Interviews';
      case 'practice_learn':
        return 'Practice & Learn';
      case 'my_progress':
        return 'My Progress';
      default:
        return 'Dashboard';
    }
  }

  function render() {
    const isLight = currentTheme === 'light';
    const themeIcon = isLight 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

    container.innerHTML = `
      <div class="app-sidebar-layout">

        <!-- ========================================================
             LEFT SIDEBAR FOR INTERVIEWIQ (NO NUMBERING)
             ======================================================== -->
        <aside class="app-sidebar">
          
          <!-- Top: Brand Header -->
          <div>
            <a href="#" class="app-sidebar-brand" id="sidebar-brand-btn">
              <div class="app-sidebar-logo-icon">
                🎯
              </div>
              <div>
                <div class="app-sidebar-brand-text">
                  <span>Interview</span><span style="color: var(--secondary);">IQ</span>
                </div>
                <div style="font-size: 0.74rem; font-weight: 600; color: var(--text-muted); margin-top: 1px;">
                  AI Mock Interview Platform
                </div>
              </div>
            </a>

            <!-- Navigation Menu (Clean Icons + Names, No Numbering) -->
            <nav class="app-sidebar-nav">
              
              <!-- Dashboard -->
              <button type="button" class="app-sidebar-nav-item ${currentActiveTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                  <rect x="3" y="3" width="7" height="9"></rect>
                  <rect x="14" y="3" width="7" height="5"></rect>
                  <rect x="14" y="12" width="7" height="9"></rect>
                  <rect x="3" y="16" width="7" height="5"></rect>
                </svg>
                <span>Dashboard</span>
              </button>

              <!-- Start Interview -->
              <button type="button" class="app-sidebar-nav-item ${currentActiveTab === 'start_interview' ? 'active' : ''}" data-tab="start_interview">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="flex-shrink: 0;">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Start Interview</span>
                <span class="badge badge-emerald" style="margin-left: auto; font-size: 0.65rem; padding: 0.15rem 0.45rem;">Live</span>
              </button>

              <!-- My Interviews -->
              <button type="button" class="app-sidebar-nav-item ${currentActiveTab === 'my_interviews' ? 'active' : ''}" data-tab="my_interviews">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>My Interviews</span>
              </button>

              <!-- Practice & Learn -->
              <button type="button" class="app-sidebar-nav-item ${currentActiveTab === 'practice_learn' ? 'active' : ''}" data-tab="practice_learn">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>Practice &amp; Learn</span>
              </button>

              <!-- My Progress -->
              <button type="button" class="app-sidebar-nav-item ${currentActiveTab === 'my_progress' ? 'active' : ''}" data-tab="my_progress">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <span>My Progress</span>
              </button>

            </nav>
          </div>

          <!-- Bottom: Clean Status Footer -->
          <div class="app-sidebar-footer" style="padding-top: 0.85rem; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; font-size: 0.76rem; color: var(--text-muted);">
            <span style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981;"></span>
              InterviewIQ Platform
            </span>
            <span class="badge" style="background: rgba(255,255,255,0.06); font-size: 0.68rem; color: var(--text-secondary);">Verified</span>
          </div>

        </aside>

        <!-- ========================================================
             MAIN CONTENT AREA (WITH TOP RIGHT PROFILE & THEME TOGGLE)
             ======================================================== -->
        <main class="app-main-content" id="app-main-content">
          
          <!-- Persistent Top Header Bar (With Profile & Dark/Light mode on Top Right) -->
          <header class="app-top-header" style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 2.25rem; border-bottom: 1px solid var(--border-subtle); background: var(--bg-surface); flex-shrink: 0; min-height: 64px;">
            
            <!-- Left: Active Tab Title -->
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <h1 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin: 0; letter-spacing: -0.02em;">
                ${getPageTitle(currentActiveTab)}
              </h1>
            </div>

            <!-- Right: Dark/Light Mode & User Profile Dropdown (Same as first page) -->
            <div style="display: flex; align-items: center; gap: 1rem;" id="app-top-user-section">
              
              <!-- Theme Toggle Button -->
              <button type="button" class="btn-theme-toggle" id="app-top-theme-toggle" title="Switch to ${isLight ? 'Dark' : 'Light'} Mode">
                ${themeIcon}
              </button>

              <!-- Profile Badge & Dropdown -->
              <div class="user-menu-wrapper" id="app-top-user-menu-wrapper">
                <button type="button" class="user-badge-btn" id="app-top-user-menu-toggle" aria-expanded="false" aria-haspopup="true">
                  <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" alt="${user.name || 'User'}" class="user-avatar-sm" />
                  <div style="display: flex; flex-direction: column; align-items: flex-start; text-align: left; justify-content: center;">
                    <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main); line-height: 1.2; white-space: nowrap;">${user.name || (user.email ? user.email.split('@')[0] : 'Candidate')}</div>
                    <span class="role-pill ${user.role || 'Candidate'}" style="font-size: 0.63rem; font-weight: 700; padding: 0.08rem 0.42rem; letter-spacing: 0.05em; margin-top: 2px; line-height: 1.2; border-radius: 9999px;">${user.role || 'Candidate'}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 0.25rem; color: var(--text-muted);"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                <!-- Dropdown Menu -->
                <div class="user-dropdown-menu" id="app-top-user-dropdown-menu" style="display: none;">
                  <div class="user-dropdown-header">
                    <div class="user-name">${user.name || (user.email ? user.email.split('@')[0] : 'Candidate')}</div>
                    <div class="user-email">${user.email}</div>
                  </div>
                  <button type="button" class="dropdown-item" id="app-top-btn-edit-profile">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    My Profile
                  </button>
                  <button type="button" class="dropdown-item dropdown-logout" id="app-top-btn-dropdown-logout">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Sign Out
                  </button>
                </div>
              </div>

            </div>

          </header>

          <!-- Main View Body -->
          <div style="flex: 1 1 auto; overflow-y: auto;">
            ${renderMainView()}
          </div>

        </main>

      </div>
    `;

    bindSidebarEvents();
    bindTopHeaderEvents();
    bindMainViewEvents();
  }

  function renderMainView() {
    switch (currentActiveTab) {
      case 'dashboard':
        return renderBlankDashboard();
      case 'start_interview':
        return `<div id="subview-interview-setup" style="padding: 1.5rem 2.25rem;"></div>`;
      case 'my_interviews':
        return renderMyInterviews();
      case 'practice_learn':
        return renderPracticeLearn();
      case 'my_progress':
        return renderMyProgress();
      default:
        return renderBlankDashboard();
    }
  }

  /**
   * 1. Dashboard: Blank page with clean workspace layout
   */
  function renderBlankDashboard() {
    return `
      <div class="app-main-blank-page fade-in">
        
        <!-- The Blank Page Canvas Area -->
        <div style="flex: 1 1 auto; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 2rem; box-sizing: border-box;">
          
          <!-- Pristine, Distraction-Free Blank Page State -->
          <div style="width: 100%; max-width: 900px; height: 100%; max-height: 520px; border: 1.5px dashed var(--border-subtle); border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: rgba(255,255,255,0.01); padding: 2.5rem; box-sizing: border-box;">
            
            <div style="width: 64px; height: 64px; border-radius: 16px; background: rgba(2, 132, 199, 0.12); border: 1px solid rgba(2, 132, 199, 0.3); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1.25rem; box-shadow: 0 4px 18px rgba(2, 132, 199, 0.2);">
              🎯
            </div>

            <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; letter-spacing: -0.02em;">
              Welcome to InterviewIQ
            </h2>

            <p style="font-size: 0.98rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.65rem; line-height: 1.5;">
              Your personalized AI mock interview workspace is ready. Select an option from the sidebar to launch a session or track your progress.
            </p>

            <div style="display: flex; gap: 0.85rem; flex-wrap: wrap; justify-content: center;">
              <button type="button" class="btn btn-primary" id="blank-start-interview-btn" style="padding: 0.75rem 1.8rem; font-size: 0.95rem; font-weight: 700; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.45rem;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Start Interview
              </button>
              <button type="button" class="btn btn-secondary" id="blank-practice-btn" style="padding: 0.75rem 1.6rem; font-size: 0.92rem; border-radius: 9999px;">
                Practice &amp; Learn
              </button>
            </div>

          </div>

        </div>

      </div>
    `;
  }

  /**
   * 3. My Interviews: History and past evaluations
   */
  function renderMyInterviews() {
    const interviews = interviewStore.getUserInterviews(user.id);

    return `
      <div class="fade-in" style="padding: 1.75rem 2.25rem;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem;">
          <div>
            <h2 style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); margin: 0; letter-spacing: -0.02em;">
              Past Sessions &amp; Dossiers
            </h2>
            <p style="font-size: 0.86rem; color: var(--text-muted); margin: 0.2rem 0 0;">
              Review recorded AI evaluations, rubric evidence dossiers, and spoken telemetry.
            </p>
          </div>

          <button type="button" class="btn btn-primary" id="history-start-btn" style="display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.65rem 1.4rem; border-radius: 9999px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            New Interview
          </button>
        </div>

        ${interviews.length === 0 ? `
          <div class="glass-card" style="padding: 3.5rem 1.5rem; text-align: center; border-radius: var(--radius-lg);">
            <div style="font-size: 2.2rem; margin-bottom: 0.75rem;">📁</div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem;">No Completed Interviews Yet</h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 420px; margin: 0 auto 1.25rem;">
              You have not completed any mock interview sessions yet. Launch your first round to get explainable rubric feedback!
            </p>
            <button type="button" class="btn btn-primary" id="empty-history-start-btn" style="border-radius: 9999px; padding: 0.7rem 1.6rem;">
              Start Your First Interview
            </button>
          </div>
        ` : `
          <div class="glass-card" style="padding: 1.25rem 1.5rem; border-radius: var(--radius-lg); overflow: hidden;">
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.04em;">
                    <th style="padding: 0.75rem 0.6rem;">Date &amp; Title</th>
                    <th style="padding: 0.75rem 0.6rem;">Track</th>
                    <th style="padding: 0.75rem 0.6rem;">Role Level</th>
                    <th style="padding: 0.75rem 0.6rem;">Score</th>
                    <th style="padding: 0.75rem 0.6rem;">Pace / Telemetry</th>
                    <th style="padding: 0.75rem 0.6rem; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${interviews.map(inv => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                      <td style="padding: 0.85rem 0.6rem;">
                        <strong style="color: var(--text-main); display: block; font-size: 0.92rem;">${inv.title}</strong>
                        <span style="font-size: 0.72rem; color: var(--text-muted);">${new Date(inv.date).toLocaleDateString()}</span>
                      </td>
                      <td style="padding: 0.85rem 0.6rem;">
                        <span class="badge badge-cyan" style="font-size: 0.72rem;">${inv.category}</span>
                      </td>
                      <td style="padding: 0.85rem 0.6rem; color: var(--text-secondary); font-size: 0.82rem;">
                        ${inv.level || 'Mid Level'}
                      </td>
                      <td style="padding: 0.85rem 0.6rem;">
                        <span style="font-weight: 800; font-size: 0.98rem; color: ${inv.overallScore >= 80 ? '#10b981' : inv.overallScore >= 60 ? '#f59e0b' : '#ef4444'};">
                          ${inv.overallScore}%
                        </span>
                      </td>
                      <td style="padding: 0.85rem 0.6rem; font-size: 0.78rem; color: var(--text-secondary);">
                        ${inv.metrics?.avgPaceWpm || 135} WPM • ${inv.metrics?.fillerWordsCount || 0} fillers
                      </td>
                      <td style="padding: 0.85rem 0.6rem; text-align: right;">
                        <button type="button" class="btn btn-secondary btn-sm view-report-btn" data-id="${inv.id}" style="padding: 0.35rem 0.85rem; font-size: 0.78rem; font-weight: 600;">
                          View Report
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `}

      </div>
    `;
  }

  /**
   * 4. Practice & Learn: Question banks and mastery tracks
   */
  function renderPracticeLearn() {
    const modules = [
      {
        icon: '⭐',
        title: 'STAR Behavioral Framework',
        desc: 'Master structured experiential storytelling: Situation, Task, Action, and Measurable Result.',
        questionsCount: '25 Core Prompts',
        color: '#0ea5e9'
      },
      {
        icon: '💻',
        title: 'Technical Problem Articulation',
        desc: 'Communicate trade-offs, time complexity O(N), and modular architectural decisions under pressure.',
        questionsCount: '40 Technical Scenarios',
        color: '#8b5cf6'
      },
      {
        icon: '🏗️',
        title: 'System Design & Scalability',
        desc: 'Practice designing decoupled microservices, database caching, load balancing, and failover.',
        questionsCount: '18 Architecture Cases',
        color: '#10b981'
      },
      {
        icon: '🎙️',
        title: 'Verbal Delivery & Cadence',
        desc: 'Eliminate filler words ("um", "like", "actually") and maintain conversational tempo (125-150 WPM).',
        questionsCount: 'Telemetry Drills',
        color: '#f59e0b'
      },
      {
        icon: '👁️',
        title: 'Webcam Proctor & Body Language',
        desc: 'Improve camera eye contact, posture stability, and confident expression for high-stakes loops.',
        questionsCount: 'Vision Telemetry Guide',
        color: '#ec4899'
      },
      {
        icon: '💼',
        title: 'Executive & Cultural Fit (HR)',
        desc: 'Articulate salary expectations, career milestones, conflict resolution, and leadership mindset.',
        questionsCount: '20 HR Questions',
        color: '#6366f1'
      }
    ];

    return `
      <div class="fade-in" style="padding: 1.75rem 2.25rem;">
        
        <div style="margin-bottom: 1.75rem;">
          <h2 style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); margin: 0; letter-spacing: -0.02em;">
            Preparation Modules &amp; Question Banks
          </h2>
          <p style="font-size: 0.86rem; color: var(--text-muted); margin: 0.2rem 0 0;">
            Explore curated rubrics, behavioral STAR exercises, and high-frequency technical interview tracks.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
          ${modules.map((m, idx) => `
            <div class="glass-card" style="padding: 1.35rem 1.5rem; border-top: 3.5px solid ${m.color}; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
                  <span style="font-size: 1.65rem;">${m.icon}</span>
                  <span class="badge" style="background: rgba(255,255,255,0.06); font-size: 0.72rem; color: var(--text-muted);">${m.questionsCount}</span>
                </div>
                <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem;">
                  ${m.title}
                </h3>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin: 0 0 1rem;">
                  ${m.desc}
                </p>
              </div>

              <button type="button" class="btn btn-secondary btn-sm practice-module-btn" data-idx="${idx}" style="width: 100%; font-size: 0.82rem; font-weight: 600; padding: 0.45rem;">
                Explore Practice Module →
              </button>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }

  /**
   * 5. My Progress: Analytics and rubric mastery
   */
  function renderMyProgress() {
    const interviews = interviewStore.getUserInterviews(user.id);

    const categoryStats = {};
    ['Python', 'SQL', 'Aptitude', 'HR', 'Behavioral'].forEach(cat => {
      const list = interviews.filter(i => i.category === cat);
      if (list.length > 0) {
        const avg = Math.round(list.reduce((acc, curr) => acc + curr.overallScore, 0) / list.length);
        categoryStats[cat] = { count: list.length, avgScore: avg };
      } else {
        categoryStats[cat] = { count: 0, avgScore: null };
      }
    });

    const overallAvg = interviews.length > 0
      ? Math.round(interviews.reduce((acc, c) => acc + c.overallScore, 0) / interviews.length)
      : 0;

    return `
      <div class="fade-in" style="padding: 1.75rem 2.25rem;">
        
        <div style="margin-bottom: 1.75rem;">
          <h2 style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); margin: 0; letter-spacing: -0.02em;">
            Longitudinal Performance Mastery
          </h2>
          <p style="font-size: 0.86rem; color: var(--text-muted); margin: 0.2rem 0 0;">
            Telemetry tracking and domain mastery calibrated against human benchmarks.
          </p>
        </div>

        <!-- 3 KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.75rem;">
          
          <div class="glass-card" style="padding: 1.25rem 1.5rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Overall Average Score</div>
            <div style="font-size: 2.1rem; font-weight: 800; color: #38bdf8; margin: 0.25rem 0;">
              ${overallAvg > 0 ? overallAvg + '%' : 'N/A'}
            </div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">Calibrated against hiring panel benchmarks</div>
          </div>

          <div class="glass-card" style="padding: 1.25rem 1.5rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Sessions Completed</div>
            <div style="font-size: 2.1rem; font-weight: 800; color: var(--text-main); margin: 0.25rem 0;">
              ${interviews.length}
            </div>
            <div style="font-size: 0.74rem; color: #10b981;">Telemetry and transcripts retained</div>
          </div>

          <div class="glass-card" style="padding: 1.25rem 1.5rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Target Track</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #a78bfa; margin: 0.5rem 0 0.25rem;">
              ${user.targetRole || 'Full Stack Engineer'}
            </div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">Level: ${user.level || 'Mid Level'}</div>
          </div>

        </div>

        <!-- Domain Mastery Bars -->
        <div class="glass-card" style="padding: 1.5rem 1.75rem; border-radius: var(--radius-md);">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 1.25rem;">
            Domain Mastery &amp; Category Competency
          </h3>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${['Python', 'SQL', 'Aptitude', 'HR', 'Behavioral'].map(cat => {
              const stat = categoryStats[cat];
              const score = stat.avgScore || 0;
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.86rem; margin-bottom: 0.35rem;">
                    <div style="display: flex; align-items: center; gap: 0.55rem;">
                      <strong style="color: var(--text-main);">${cat}</strong>
                      <span style="font-size: 0.74rem; color: var(--text-muted);">(${stat.count} sessions)</span>
                    </div>
                    <span style="font-weight: 700; color: ${score >= 80 ? '#10b981' : (score > 0 ? '#38bdf8' : 'var(--text-muted)')};">
                      ${score > 0 ? score + '%' : 'Not Attempted'}
                    </span>
                  </div>
                  <div style="width: 100%; height: 7px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
                    <div style="width: ${score}%; height: 100%; background: linear-gradient(90deg, #0284c7, #6366f1); border-radius: 999px; transition: width 0.4s ease;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  function bindSidebarEvents() {
    // Navigation item click
    container.querySelectorAll('.app-sidebar-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab && tab !== currentActiveTab) {
          currentActiveTab = tab;
          if (onTabChange) onTabChange(tab);
          render();
        }
      });
    });

    // Brand click returns to Dashboard (blank page)
    const brandBtn = container.querySelector('#sidebar-brand-btn');
    if (brandBtn) {
      brandBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentActiveTab = 'dashboard';
        if (onTabChange) onTabChange('dashboard');
        render();
      });
    }
  }

  function bindTopHeaderEvents() {
    // Top Right: Theme Toggle
    const themeBtn = container.querySelector('#app-top-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        if (onToggleTheme) onToggleTheme();
      });
    }

    // Top Right: User Profile Dropdown Menu
    const menuToggle = container.querySelector('#app-top-user-menu-toggle');
    const dropdownMenu = container.querySelector('#app-top-user-dropdown-menu');
    const editProfileBtn = container.querySelector('#app-top-btn-edit-profile');
    const logoutBtn = container.querySelector('#app-top-btn-dropdown-logout');

    if (menuToggle && dropdownMenu) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdownMenu.style.display === 'flex';
        dropdownMenu.style.display = isVisible ? 'none' : 'flex';
        menuToggle.setAttribute('aria-expanded', !isVisible);
      });

      document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
          dropdownMenu.style.display = 'none';
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => {
        if (dropdownMenu) dropdownMenu.style.display = 'none';
        if (onEditProfile) onEditProfile();
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (dropdownMenu) dropdownMenu.style.display = 'none';
        if (onSignOut) onSignOut();
      });
    }
  }

  function bindMainViewEvents() {
    // Blank page action buttons
    const blankStartBtn = container.querySelector('#blank-start-interview-btn');
    if (blankStartBtn) {
      blankStartBtn.addEventListener('click', () => {
        currentActiveTab = 'start_interview';
        if (onTabChange) onTabChange('start_interview');
        render();
      });
    }

    const blankPracticeBtn = container.querySelector('#blank-practice-btn');
    if (blankPracticeBtn) {
      blankPracticeBtn.addEventListener('click', () => {
        currentActiveTab = 'practice_learn';
        if (onTabChange) onTabChange('practice_learn');
        render();
      });
    }

    // History start button
    const historyStartBtn = container.querySelector('#history-start-btn') || container.querySelector('#empty-history-start-btn');
    if (historyStartBtn) {
      historyStartBtn.addEventListener('click', () => {
        currentActiveTab = 'start_interview';
        if (onTabChange) onTabChange('start_interview');
        render();
      });
    }

    // View report buttons
    container.querySelectorAll('.view-report-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const interviews = interviewStore.getUserInterviews(user.id);
        const inv = interviews.find(i => i.id === id);
        if (inv && onViewReport) {
          onViewReport(inv);
        }
      });
    });

    // Start interview subview
    if (currentActiveTab === 'start_interview') {
      const subview = container.querySelector('#subview-interview-setup');
      if (subview) {
        renderInterviewSetup(
          subview,
          user,
          (setupConfig) => {
            if (onStartActiveInterview) {
              onStartActiveInterview(setupConfig);
            }
          }
        );
      }
    }
  }

  render();
}
