import { interviewStore, authState } from './auth.js';

export function renderCandidateDashboard(container, currentUser, onNewInterview, onViewReport) {
  const interviews = interviewStore.getUserInterviews(currentUser.id);

  // Group by category for progress tracking
  const categoryStats = {};
  ['Python', 'SQL', 'Aptitude', 'HR', 'Behavioral'].forEach(cat => {
    const list = interviews.filter(i => i.category === cat);
    if (list.length > 0) {
      const avg = Math.round(list.reduce((acc, curr) => acc + curr.overallScore, 0) / list.length);
      categoryStats[cat] = {
        count: list.length,
        avgScore: avg,
        latestScore: list[0].overallScore
      };
    } else {
      categoryStats[cat] = { count: 0, avgScore: null, latestScore: null };
    }
  });

  const overallAvg = interviews.length > 0 
    ? Math.round(interviews.reduce((acc, c) => acc + c.overallScore, 0) / interviews.length)
    : 0;

  function render() {
    container.innerHTML = `
      <div class="fade-in">
        
        <!-- Welcome Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem;">
              <span class="badge badge-cyan">${currentUser.role} Control Center</span>
              <span class="badge badge-emerald">Verified Account</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: #fff; letter-spacing: -0.02em;">
              Welcome back, ${currentUser.name}
            </h1>
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 0.2rem;">
              Target Track: <strong style="color: #fff;">${currentUser.targetRole || 'Full Stack Engineer'}</strong> • Level: <strong style="color: #fff;">${currentUser.level || 'Mid Level'}</strong>
            </p>
          </div>

          <div style="display: flex; gap: 0.8rem;">
            <button type="button" id="start-new-session-btn" class="btn btn-primary btn-lg" style="box-shadow: 0 0 25px rgba(99,102,241,0.4);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Start New Mock Round
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem;">
          
          <div class="glass-card" style="padding: 1.4rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Completed Rounds</div>
            <div style="font-size: 2rem; font-weight: 800; color: #fff; margin-top: 0.35rem;">${interviews.length}</div>
            <div style="font-size: 0.75rem; color: #34d399; margin-top: 0.2rem;">Across ${Object.values(categoryStats).filter(c => c.count > 0).length} technical tracks</div>
          </div>

          <div class="glass-card" style="padding: 1.4rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Overall Average Score</div>
            <div style="font-size: 2rem; font-weight: 800; color: var(--secondary); margin-top: 0.35rem;">${overallAvg > 0 ? overallAvg + '%' : 'N/A'}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Calibrated to human benchmarks</div>
          </div>

          <div class="glass-card" style="padding: 1.4rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Avg Verbal Pace</div>
            <div style="font-size: 2rem; font-weight: 800; color: #fff; margin-top: 0.35rem;">142 <span style="font-size: 1rem; font-weight: 500; color: var(--text-muted);">WPM</span></div>
            <div style="font-size: 0.75rem; color: #34d399; margin-top: 0.2rem;">Optimal conversational range</div>
          </div>

          <div class="glass-card" style="padding: 1.4rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Privacy & Consent</div>
            <div style="font-size: 1.4rem; font-weight: 700; color: #34d399; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Protected
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">Opt-in voice & GDPR consent</div>
          </div>

        </div>

        <!-- Category Progress Radar / Bars -->
        <div class="glass-card" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem;">
            Category-Wise Progress & Domain Mastery
          </h3>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${['Python', 'SQL', 'Aptitude', 'HR', 'Behavioral'].map(cat => {
              const stat = categoryStats[cat];
              const score = stat.avgScore || 0;
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; margin-bottom: 0.35rem;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                      <strong style="color: #fff;">${cat}</strong>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">(${stat.count} sessions)</span>
                    </div>
                    <div style="font-weight: 700; color: ${score >= 80 ? '#34d399' : (score > 0 ? '#38bdf8' : 'var(--text-muted)')};">
                      ${score > 0 ? score + '%' : 'Not Attempted'}
                    </div>
                  </div>
                  <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
                    <div style="width: ${score}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 999px; transition: width 0.4s ease;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Complete Interview History Table -->
        <div class="glass-card" style="padding: 1.8rem; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">Complete Interview History</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem;">Review past rubrics, replay audio recordings, or purge sessions</p>
            </div>
            
            <button type="button" id="purge-account-data-btn" class="btn btn-secondary btn-sm" style="color: #fda4af; border-color: rgba(244,63,94,0.3);">
              Delete All My Data
            </button>
          </div>

          ${interviews.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.75rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <div>No interviews recorded yet. Launch your first mock round above!</div>
            </div>
          ` : `
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                    <th style="padding: 0.75rem 0.5rem;">Date & Title</th>
                    <th style="padding: 0.75rem 0.5rem;">Track</th>
                    <th style="padding: 0.75rem 0.5rem;">Persona</th>
                    <th style="padding: 0.75rem 0.5rem;">Score</th>
                    <th style="padding: 0.75rem 0.5rem;">Delivery</th>
                    <th style="padding: 0.75rem 0.5rem;">Recording</th>
                    <th style="padding: 0.75rem 0.5rem; text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${interviews.map(inv => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                      <td style="padding: 0.9rem 0.5rem;">
                        <strong style="color: #fff; display: block;">${inv.title}</strong>
                        <span style="font-size: 0.72rem; color: var(--text-muted);">${new Date(inv.date).toLocaleDateString()} • Project: ${inv.projectName}</span>
                      </td>
                      <td style="padding: 0.9rem 0.5rem;">
                        <span class="badge badge-cyan">${inv.category}</span>
                      </td>
                      <td style="padding: 0.9rem 0.5rem; color: var(--text-secondary); font-size: 0.82rem;">
                        ${inv.persona}
                      </td>
                      <td style="padding: 0.9rem 0.5rem;">
                        <strong style="font-size: 1rem; color: ${inv.overallScore >= 80 ? '#34d399' : '#38bdf8'};">${inv.overallScore}%</strong>
                      </td>
                      <td style="padding: 0.9rem 0.5rem; font-size: 0.78rem; color: var(--text-secondary);">
                        ${inv.metrics.avgPaceWpm} WPM • ${inv.metrics.fillerWordsCount} fillers
                      </td>
                      <td style="padding: 0.9rem 0.5rem;">
                        ${inv.recordingOptIn ? `
                          <button type="button" class="btn btn-secondary btn-sm play-rec-btn" data-id="${inv.id}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
                            ▶ Replay
                          </button>
                        ` : '<span style="font-size: 0.75rem; color: var(--text-muted);">Opted Out</span>'}
                      </td>
                      <td style="padding: 0.9rem 0.5rem; text-align: right;">
                        <button type="button" class="btn btn-secondary btn-sm view-rubric-btn" data-id="${inv.id}" style="margin-right: 0.4rem;">
                          Rubric
                        </button>
                        <button type="button" class="del-inv-btn" data-id="${inv.id}" title="Delete session" style="background: none; border: none; color: #fda4af; cursor: pointer; font-size: 1rem;">
                          ✕
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const newBtn = container.querySelector('#start-new-session-btn');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        if (onNewInterview) onNewInterview();
      });
    }

    // View Rubric details
    container.querySelectorAll('.view-rubric-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const inv = interviews.find(i => i.id === id);
        if (inv && onViewReport) {
          onViewReport(inv);
        }
      });
    });

    // Delete single interview
    container.querySelectorAll('.del-inv-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (confirm('Permanently delete this interview session and its telemetry?')) {
          interviewStore.deleteInterview(id);
          renderDashboard(container, currentUser, onNewInterview, onViewReport);
        }
      });
    });

    // Purge account data
    const purgeBtn = container.querySelector('#purge-account-data-btn');
    if (purgeBtn) {
      purgeBtn.addEventListener('click', () => {
        if (confirm('Delete all your interview records and exercise right to be forgotten?')) {
          interviews.forEach(i => interviewStore.deleteInterview(i.id));
          renderDashboard(container, currentUser, onNewInterview, onViewReport);
        }
      });
    }

    // Play recording simulation
    container.querySelectorAll('.play-rec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        alert('Simulating encrypted audio replay playback for this session...');
      });
    });
  }

  render();
}
