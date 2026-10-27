import { authState, sha256 } from './auth.js';

export function renderAuthModal(defaultMode = 'login', onAuthSuccess) {
  const existing = document.getElementById('auth-modal-root');
  if (existing) existing.remove();

  const root = document.createElement('div');
  root.id = 'auth-modal-root';
  root.className = 'modal-overlay';

  let currentTab = defaultMode; // 'login' | 'signup' | 'otp'
  let pendingEmail = '';
  let pendingRole = 'Candidate';
  let simulatedOtp = '';

  function updateView() {
    root.innerHTML = `
      <div class="modal-content glass-card" style="padding: 1.5rem 1.75rem; max-width: 480px; max-height: 90vh; overflow-y: auto; position: relative;">
        <button id="close-auth-modal" style="position: absolute; right: 1.1rem; top: 1.1rem; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.3rem; line-height: 1;">✕</button>

        ${currentTab === 'otp' ? renderOtpStep() : renderStandardForm()}
      </div>
    `;

    bindEvents();
  }

  function renderStandardForm() {
    return `
      <div style="text-align: center; margin-bottom: 1.1rem;">
        <div style="display: inline-flex; width: 36px; height: 36px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 10px; align-items: center; justify-content: center; margin-bottom: 0.4rem; box-shadow: 0 0 15px rgba(99,102,241,0.35);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5z"></path></svg>
        </div>
        <h2 style="font-size: 1.35rem; font-weight: 700; color: #fff; line-height: 1.2;">${currentTab === 'login' ? 'Sign In to InterviewIQ' : 'Create an Account'}</h2>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
          ${currentTab === 'login' ? 'Access your explainable interview analytics and progress logs' : 'Role-based access with verified evaluation consent'}
        </p>

        <!-- Toggle Tabs -->
        <div class="auth-toggle-tabs" style="display: flex; padding: 0.25rem; border-radius: var(--radius-sm); margin-top: 0.85rem; border: 1px solid var(--border-subtle);">
          <button type="button" id="tab-login" class="auth-toggle-btn ${currentTab === 'login' ? 'active' : ''}" style="flex: 1; padding: 0.45rem; border: none; border-radius: 6px; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s;">Sign In</button>
          <button type="button" id="tab-signup" class="auth-toggle-btn ${currentTab === 'signup' ? 'active' : ''}" style="flex: 1; padding: 0.45rem; border: none; border-radius: 6px; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s;">Register</button>
        </div>
      </div>

      <div id="auth-alert" style="display: none; padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); margin-bottom: 0.8rem; font-size: 0.8rem;"></div>

      <form id="auth-form" style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${currentTab === 'signup' ? `
          <div class="input-group" style="margin-bottom: 0;">
            <label class="input-label" style="font-size: 0.8rem;">Full Name</label>
            <input type="text" id="auth-name" class="input-text" style="padding: 0.55rem 0.8rem; font-size: 0.9rem;" placeholder="e.g. John Doe" required />
          </div>

          <div class="input-group" style="margin-bottom: 0;">
            <label class="input-label" style="font-size: 0.8rem;">Role-Based Access Level</label>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.65rem; margin-top: 0.2rem;">
              <label class="role-selector active" style="cursor: pointer; padding: 0.55rem 0.65rem; border-radius: var(--radius-sm); text-align: center;">
                <input type="radio" name="auth-role" value="Candidate" checked style="display: none;" />
                <div class="role-selector-title" style="color: var(--secondary);">Candidate</div>
                <div class="role-selector-desc">Takes Interviews</div>
              </label>
              <label class="role-selector" style="cursor: pointer; padding: 0.55rem 0.65rem; border-radius: var(--radius-sm); text-align: center;">
                <input type="radio" name="auth-role" value="Mentor" style="display: none;" />
                <div class="role-selector-title" style="color: var(--accent-purple);">Mentor</div>
                <div class="role-selector-desc">Reviews Rubrics</div>
              </label>
            </div>
          </div>
        ` : ''}

        <div class="input-group" style="margin-bottom: 0;">
          <label class="input-label" style="font-size: 0.8rem;">Email Address</label>
          <input type="email" id="auth-email" class="input-text" style="padding: 0.55rem 0.8rem; font-size: 0.9rem;" placeholder="you@university.edu" required />
        </div>

        <div class="input-group" style="margin-bottom: 0;">
          <label class="input-label" style="font-size: 0.8rem;">Password</label>
          <input type="password" id="auth-password" class="input-text" style="padding: 0.55rem 0.8rem; font-size: 0.9rem;" placeholder="••••••••" required />
        </div>

        ${currentTab === 'signup' ? `
          <div style="margin: 0.2rem 0; padding: 0.6rem 0.75rem; background: rgba(0,0,0,0.25); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; font-size: 0.76rem; color: var(--text-secondary); line-height: 1.35;">
              <input type="checkbox" id="auth-consent" style="margin-top: 2px; accent-color: var(--primary);" required />
              <span>
                <strong style="color: #fff;">Candidate Consent:</strong> I agree to the AI evaluation terms and privacy policy.
              </span>
            </label>
          </div>
        ` : ''}

        <button type="submit" id="auth-submit-btn" class="btn btn-primary" style="width: 100%; padding: 0.7rem; font-size: 0.95rem; margin-top: 0.25rem;">
          ${currentTab === 'login' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
    `;
  }

  function renderOtpStep() {
    return `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="display: inline-flex; width: 44px; height: 44px; background: rgba(6,182,212,0.15); border: 1px solid var(--secondary); border-radius: 12px; align-items: center; justify-content: center; margin-bottom: 0.75rem; color: var(--secondary);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #fff;">Verify Your Email</h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.3rem;">
          A 6-digit confirmation token was dispatched to <strong style="color: #fff;">${pendingEmail}</strong>
        </p>
      </div>

      <div style="background: rgba(6,182,212,0.08); border: 1px dashed var(--secondary); border-radius: var(--radius-sm); padding: 0.9rem; margin-bottom: 1.5rem; text-align: center;">
        <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Simulated Verification Dispatch Token</span>
        <div style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; letter-spacing: 0.25em; color: var(--secondary); margin-top: 0.2rem;">
          ${simulatedOtp}
        </div>
      </div>

      <div id="otp-alert" style="display: none; padding: 0.75rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1.2rem; font-size: 0.85rem;"></div>

      <form id="otp-form">
        <div class="input-group">
          <label class="input-label" style="text-align: center;">Enter 6-Digit Verification Code</label>
          <input type="text" id="otp-input" class="input-text" maxlength="6" style="text-align: center; font-size: 1.5rem; font-family: var(--font-mono); letter-spacing: 0.3em;" placeholder="••••••" required />
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
          Confirm & Access Platform
        </button>
      </form>
    `;
  }

  function bindEvents() {
    root.querySelector('#close-auth-modal').addEventListener('click', () => root.remove());

    const tabLogin = root.querySelector('#tab-login');
    const tabSignup = root.querySelector('#tab-signup');
    if (tabLogin) {
      tabLogin.addEventListener('click', () => { currentTab = 'login'; updateView(); });
    }
    if (tabSignup) {
      tabSignup.addEventListener('click', () => { currentTab = 'signup'; updateView(); });
    }

    // Role radio highlight visual
    root.querySelectorAll('.role-selector').forEach(el => {
      const radio = el.querySelector('input[type="radio"]');
      if (radio.checked) {
        el.classList.add('active');
      }
      el.addEventListener('click', () => {
        root.querySelectorAll('.role-selector').forEach(r => {
          r.classList.remove('active');
          r.style.borderColor = '';
          r.style.background = '';
        });
        radio.checked = true;
        el.classList.add('active');
        el.style.borderColor = '';
        el.style.background = '';
      });
    });

    // Handle Auth form submit
    const authForm = root.querySelector('#auth-form');
    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = root.querySelector('#auth-alert');
        alertBox.style.display = 'none';

        const email = root.querySelector('#auth-email').value.trim();
        const password = root.querySelector('#auth-password').value;

        if (currentTab === 'login') {
          try {
            const user = await authState.login(email, password);
            root.remove();
            if (onAuthSuccess) onAuthSuccess(user);
          } catch (err) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(244,63,94,0.15)';
            alertBox.style.color = '#fda4af';
            alertBox.style.border = '1px solid rgba(244,63,94,0.3)';
            alertBox.textContent = err.message === 'EMAIL_UNVERIFIED' 
              ? 'Please verify your email code first.' 
              : err.message;
          }
        } else {
          // Signup flow
          const name = root.querySelector('#auth-name').value.trim();
          const roleRadio = root.querySelector('input[name="auth-role"]:checked');
          const role = roleRadio ? roleRadio.value : 'Candidate';
          const consent = root.querySelector('#auth-consent').checked;

          try {
            const res = await authState.register({ name, email, password, role, consent });
            pendingEmail = email;
            pendingRole = role;
            simulatedOtp = res.otpMock;
            currentTab = 'otp';
            updateView();
          } catch (err) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(244,63,94,0.15)';
            alertBox.style.color = '#fda4af';
            alertBox.style.border = '1px solid rgba(244,63,94,0.3)';
            alertBox.textContent = err.message;
          }
        }
      });
    }

    // Handle OTP Submit
    const otpForm = root.querySelector('#otp-form');
    if (otpForm) {
      otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = root.querySelector('#otp-input').value.trim();
        const alertBox = root.querySelector('#otp-alert');

        try {
          const user = authState.verifyOtp(pendingEmail, code);
          root.remove();
          if (onAuthSuccess) onAuthSuccess(user);
        } catch (err) {
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(244,63,94,0.15)';
          alertBox.style.color = '#fda4af';
          alertBox.textContent = err.message;
        }
      });
    }
  }

  document.body.appendChild(root);
  updateView();
}
