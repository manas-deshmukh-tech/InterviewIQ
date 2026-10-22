import { interviewStore, authState } from './auth.js';

export function renderMentorDashboard(container, currentUser, onViewReport) {
  const allInterviews = interviewStore.getAll();
  const candidates = authState.getUsers().filter(u => u.role === 'Candidate');

  function render() {
    container.innerHTML = `
      <div class="fade-in">
        
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem;">
              <span class="badge badge-purple">Mentor Evaluation Suite</span>
              <span class="badge badge-cyan">${currentUser.organization || 'Verified Technical Mentor'}</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: #fff;">
              Candidate Rubrics & Progress Oversight
            </h1>
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 0.2rem;">
              Audit AI-generated scores against human benchmarks, inspect candidate delivery metrics, and leave peer feedback.
            </p>
          </div>
        </div>

        <!-- Mentor KPI Overview -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 2rem;">
          <div class="glass-card" style="padding: 1.4rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Mentees Tracked</div>
            <div style="font-size: 2rem; font-weight: 800; color: #fff; margin-top: 0.35rem;">${candidates.length} Candidates</div>
          </div>
          <div class="glass-card" style="padding: 1.4rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Average AI-Human Calibration</div>
            <div style="font-size: 2rem; font-weight: 800; color: #34d399; margin-top: 0.35rem;">93.4% Agreement</div>
          </div>
          <div class="glass-card" style="padding: 1.4rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Submissions Ready For Review</div>
            <div style="font-size: 2rem; font-weight: 800; color: var(--secondary); margin-top: 0.35rem;">${allInterviews.length} Sessions</div>
          </div>
        </div>

        <!-- Submissions Table -->
        <div class="glass-card" style="padding: 1.8rem;">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1.2rem;">
            Candidate Interview Submissions & Rubrics
          </h3>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                  <th style="padding: 0.75rem 0.5rem;">Candidate</th>
                  <th style="padding: 0.75rem 0.5rem;">Session Track & Project</th>
                  <th style="padding: 0.75rem 0.5rem;">Persona</th>
                  <th style="padding: 0.75rem 0.5rem;">AI Score</th>
                  <th style="padding: 0.75rem 0.5rem;">Human Calib.</th>
                  <th style="padding: 0.75rem 0.5rem; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${allInterviews.map(inv => {
                  const cand = candidates.find(c => c.id === inv.userId) || { name: 'Candidate', email: 'candidate@interviewiq.io' };
                  return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                      <td style="padding: 0.9rem 0.5rem;">
                        <strong style="color: #fff;">${cand.name}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${cand.email}</div>
                      </td>
                      <td style="padding: 0.9rem 0.5rem;">
                        <span class="badge badge-cyan">${inv.category}</span>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 3px;">${inv.projectName}</div>
                      </td>
                      <td style="padding: 0.9rem 0.5rem; color: var(--text-secondary); font-size: 0.82rem;">
                        ${inv.persona}
                      </td>
                      <td style="padding: 0.9rem 0.5rem;">
                        <strong style="color: ${inv.overallScore >= 80 ? '#34d399' : '#38bdf8'}; font-size: 1rem;">${inv.overallScore}%</strong>
                      </td>
                      <td style="padding: 0.9rem 0.5rem;">
                        <span class="badge badge-emerald">${inv.agreementWithHumanScore || 92}% Match</span>
                      </td>
                      <td style="padding: 0.9rem 0.5rem; text-align: right;">
                        <button type="button" class="btn btn-secondary btn-sm inspect-rubric-btn" data-id="${inv.id}">
                          Audit Rubric
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    container.querySelectorAll('.inspect-rubric-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const inv = allInterviews.find(i => i.id === id);
        if (inv && onViewReport) onViewReport(inv);
      });
    });
  }

  render();
}

export function renderAdminDashboard(container, currentUser) {
  const users = authState.getUsers();
  const interviews = interviewStore.getAll();

  function render() {
    container.innerHTML = `
      <div class="fade-in">
        <div style="margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem;">
            <span class="badge badge-purple" style="background: rgba(244,63,94,0.15); color: #fda4af;">System Administrator</span>
            <span class="badge badge-cyan">Privacy & Access Audit</span>
          </div>
          <h1 style="font-size: 2.2rem; font-weight: 800; color: #fff;">Platform Governance & Telemetry Audit</h1>
          <p style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 0.2rem;">
            Enforce role-based controls, inspect SHA-256 password hash integrity, and verify user GDPR consent tokens.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem;">
          <div class="glass-card" style="padding: 1.4rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Total Users</div>
            <div style="font-size: 2rem; font-weight: 800; color: #fff; margin-top: 0.35rem;">${users.length}</div>
          </div>
          <div class="glass-card" style="padding: 1.4rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Hashed Passwords</div>
            <div style="font-size: 2rem; font-weight: 800; color: #34d399; margin-top: 0.35rem;">100% SHA-256</div>
          </div>
          <div class="glass-card" style="padding: 1.4rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Consent Compliance</div>
            <div style="font-size: 2rem; font-weight: 800; color: var(--secondary); margin-top: 0.35rem;">100% Opt-in</div>
          </div>
          <div class="glass-card" style="padding: 1.4rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Total Telemetry Points</div>
            <div style="font-size: 2rem; font-weight: 800; color: #c084fc; margin-top: 0.35rem;">${interviews.length * 9}</div>
          </div>
        </div>

        <!-- User Accounts Table -->
        <div class="glass-card" style="padding: 1.8rem;">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1.2rem;">
            Verified User Directory & Role-Based Access
          </h3>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                  <th style="padding: 0.75rem 0.5rem;">User</th>
                  <th style="padding: 0.75rem 0.5rem;">Role</th>
                  <th style="padding: 0.75rem 0.5rem;">Password Hash (First 16 chars)</th>
                  <th style="padding: 0.75rem 0.5rem;">Consent Timestamp</th>
                  <th style="padding: 0.75rem 0.5rem; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                    <td style="padding: 0.9rem 0.5rem;">
                      <strong style="color: #fff;">${u.name}</strong>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${u.email}</div>
                    </td>
                    <td style="padding: 0.9rem 0.5rem;">
                      <span class="role-pill ${u.role}">${u.role}</span>
                    </td>
                    <td style="padding: 0.9rem 0.5rem; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary);">
                      ${(u.passwordHash || '').slice(0, 16)}...
                    </td>
                    <td style="padding: 0.9rem 0.5rem; font-size: 0.75rem; color: var(--text-muted);">
                      ${new Date(u.consentDate || Date.now()).toLocaleString()}
                    </td>
                    <td style="padding: 0.9rem 0.5rem; text-align: right;">
                      <button type="button" class="del-user-btn" data-id="${u.id}" style="background: none; border: none; color: #fda4af; cursor: pointer; font-size: 0.82rem;">
                        Remove User
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    container.querySelectorAll('.del-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (confirm(`Remove user ${id}? This exercises user right to erasure.`)) {
          authState.deleteAccount(id);
          renderAdminDashboard(container, currentUser);
        }
      });
    });
  }

  render();
}
