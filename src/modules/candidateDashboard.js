import { interviewStore, authState } from './auth.js';
import { getSessionScore } from './interviewGrouping.js';

export function renderCandidateDashboard(container, currentUser, onNewInterview, onViewReport) {
  function render() {
    const interviews = interviewStore.getUserInterviews(currentUser.id);

    // Group by category for progress tracking
    const categoryStats = {};
    ['Python', 'SQL', 'Aptitude', 'HR', 'Behavioral'].forEach(cat => {
      const list = interviews.filter(i => i.category === cat);
      if (list.length > 0) {
        const avg = Math.round(list.reduce((acc, curr) => acc + getSessionScore(curr), 0) / list.length);
        categoryStats[cat] = {
          count: list.length,
          avgScore: avg,
          latestScore: getSessionScore(list[0])
        };
      } else {
        categoryStats[cat] = { count: 0, avgScore: null, latestScore: null };
      }
    });

    const overallAvg = interviews.length > 0 
      ? Math.round(interviews.reduce((acc, c) => acc + getSessionScore(c), 0) / interviews.length)
      : 0;

    const validPaceInterviews = interviews.filter(i => typeof i.metrics?.avgPaceWpm === 'number' && i.metrics.avgPaceWpm > 0);
    const avgWpm = validPaceInterviews.length > 0 
      ? Math.round(validPaceInterviews.reduce((acc, curr) => acc + curr.metrics.avgPaceWpm, 0) / validPaceInterviews.length)
      : null;

    // Chronological order (oldest to newest) for Attempt 1 -> Latest trajectory
    const chronological = [...interviews].sort((a, b) => new Date(a.date || a.created_at || 0) - new Date(b.date || b.created_at || 0));
    const totalAttempts = chronological.length;
    const latestInv = chronological[totalAttempts - 1];
    const firstInv = chronological[0];
    const latestScore = latestInv ? getSessionScore(latestInv) : 0;
    const firstScore = firstInv ? getSessionScore(firstInv) : 0;
    const scoreDelta = totalAttempts > 1 ? (latestScore - firstScore) : 0;

    // Detect active scenario for retry banner
    let activeRecommendation = null;
    if (latestInv?.attemptProgression) {
      activeRecommendation = latestInv.attemptProgression;
    } else if (latestInv) {
      if (latestScore >= 85) {
        activeRecommendation = {
          scenario: 'D',
          headline: 'Benchmark Mastered — Role Ready',
          actionMessage: `Congratulations! With an overall score of ${latestScore}%, you have demonstrated senior technical mastery. Consider testing for the Staff / Architect level.`,
          retryRecommended: false
        };
      } else if (totalAttempts > 1 && scoreDelta < 0 && latestScore < 50) {
        activeRecommendation = {
          scenario: 'B',
          headline: 'Persistent Topic Gap Alert',
          actionMessage: 'Specific topics continue to score below 50% across repeated attempts. Review your personalized study modules before retrying.',
          retryRecommended: true
        };
      } else if (totalAttempts > 1 && scoreDelta > 0) {
        activeRecommendation = {
          scenario: 'C',
          headline: `Measurable Improvement Demonstrated (+${scoreDelta}% from Attempt 1)`,
          actionMessage: `Great trajectory! Your score climbed from ${firstInv.overallScore}% to ${latestScore}%. Keep practicing remaining topics to hit 85%+ mastery.`,
          retryRecommended: latestScore < 80
        };
      } else if (latestScore < 50) {
        activeRecommendation = {
          scenario: 'A',
          headline: 'Targeted Study Recommended Before Retrying',
          actionMessage: 'Your initial attempt (Attempt 1) scored below the 50% benchmark. Review your learning plan and complete practice questions to build core foundations.',
          retryRecommended: true
        };
      }
    }

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
              Welcome back, ${currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : 'Candidate')}
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

        <!-- Active Recommendation / Next Attempt Banner -->
        ${activeRecommendation ? `
          <div class="glass-card" style="padding: 1.6rem 2rem; margin-bottom: 2rem; border-left: 5px solid ${activeRecommendation.scenario === 'C' || activeRecommendation.scenario === 'D' ? '#10b981' : (activeRecommendation.scenario === 'B' ? '#ef4444' : '#f59e0b')}; background: linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(30,41,59,0.35) 100%); display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
                <span class="badge" style="background: rgba(99,102,241,0.25); color: #fff; font-weight: 800; border: 1px solid rgba(99,102,241,0.5);">
                  Adaptive Intelligence
                </span>
                <span class="badge" style="background: ${activeRecommendation.scenario === 'C' ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.2)'}; color: ${activeRecommendation.scenario === 'C' ? '#34d399' : '#38bdf8'}; font-weight: 700;">
                  Scenario ${activeRecommendation.scenario}
                </span>
                ${scoreDelta !== 0 ? `
                  <span class="badge" style="background: ${scoreDelta > 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}; color: ${scoreDelta > 0 ? '#34d399' : '#ef4444'}; font-weight: 800;">
                    ${scoreDelta > 0 ? `▲ +${scoreDelta}%` : `▼ ${scoreDelta}%`} since Attempt 1
                  </span>
                ` : ''}
              </div>
              <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0 0 0.35rem;">
                ${activeRecommendation.headline}
              </h3>
              <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">
                ${activeRecommendation.actionMessage}
              </p>
            </div>

            ${activeRecommendation.retryRecommended ? `
              <button type="button" id="dashboard-retake-btn" class="btn btn-primary" style="background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%); font-weight: 800; border-radius: var(--radius-full); box-shadow: 0 0 20px rgba(99,102,241,0.4); padding: 0.85rem 2rem; display: inline-flex; align-items: center; gap: 0.6rem; cursor: pointer;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                <span>Launch Next Attempt (Attempt ${totalAttempts + 1})</span>
              </button>
            ` : ''}
          </div>
        ` : ''}

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
            <div style="font-size: 2rem; font-weight: 800; color: #fff; margin-top: 0.35rem;">
              ${avgWpm !== null ? `${avgWpm} <span style="font-size: 1rem; font-weight: 500; color: var(--text-muted);">WPM</span>` : '<span style="font-size: 1.35rem; color: var(--text-muted);">Unavailable</span>'}
            </div>
            <div style="font-size: 0.75rem; color: ${avgWpm !== null ? '#34d399' : 'var(--text-muted)'}; margin-top: 0.2rem;">
              ${avgWpm !== null ? 'Actual recorded speech pace' : 'No recorded speech data'}
            </div>
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

        <!-- Chronological Progression Curve (A1 -> Latest) -->
        ${chronological.length > 0 ? `
          <div class="glass-card" style="padding: 1.8rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                  <span class="badge badge-cyan">Attempt Timeline</span>
                  <span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-secondary);">${chronological.length} Attempt${chronological.length > 1 ? 's' : ''} Recorded</span>
                </div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0;">
                  Chronological Progression Curve (Attempt 1 → Latest Attempt)
                </h3>
              </div>
              ${scoreDelta !== 0 ? `
                <div style="text-align: right;">
                  <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Net Elevation</span>
                  <strong style="font-size: 1.25rem; font-weight: 800; color: ${scoreDelta > 0 ? '#34d399' : '#ef4444'}; font-family: var(--font-mono);">
                    ${scoreDelta > 0 ? `+${scoreDelta}%` : `${scoreDelta}%`} Improvement
                  </strong>
                </div>
              ` : ''}
            </div>

            <!-- Trajectory Nodes Line -->
            <div style="display: flex; align-items: center; justify-content: space-between; position: relative; padding: 1.5rem 1rem; overflow-x: auto;">
              <div style="position: absolute; top: 50%; left: 30px; right: 30px; height: 3px; background: linear-gradient(90deg, #6366f1, #0284c7, #10b981); transform: translateY(-50%); z-index: 1;"></div>
              
              ${chronological.map((inv, idx) => {
                const attLabel = `Attempt ${idx + 1}`;
                const score = inv.overallScore || 0;
                const scoreColor = score >= 80 ? '#34d399' : (score >= 60 ? '#38bdf8' : (score >= 50 ? '#f59e0b' : '#ef4444'));
                const isLatest = idx === chronological.length - 1;
                return `
                  <div style="display: flex; flex-direction: column; align-items: center; z-index: 2; position: relative; min-width: 90px;">
                    <div style="font-size: 0.78rem; font-weight: 800; color: ${isLatest ? '#fff' : 'var(--text-muted)'}; margin-bottom: 0.4rem;">
                      ${attLabel} ${isLatest ? '<span class="badge badge-emerald" style="font-size: 0.6rem; margin-left: 2px;">Latest</span>' : ''}
                    </div>
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: #0f172a; border: 3px solid ${scoreColor}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-mono); font-size: 0.95rem; color: ${scoreColor}; box-shadow: 0 0 16px ${scoreColor}55;">
                      ${score}%
                    </div>
                    <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 0.45rem; white-space: nowrap;">
                      ${new Date(inv.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

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
          render();
        }
      });
    });

    // Purge account data
    const purgeBtn = container.querySelector('#purge-account-data-btn');
    if (purgeBtn) {
      purgeBtn.addEventListener('click', () => {
        if (confirm('Delete all your interview records and exercise right to be forgotten?')) {
          interviews.forEach(i => interviewStore.deleteInterview(i.id));
          render();
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

  // Background synchronize with MySQL database
  interviewStore.syncWithBackend(currentUser.id).then(updated => {
    if (updated) {
      render();
    }
  }).catch(() => {});
}
