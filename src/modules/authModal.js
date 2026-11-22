import { authState, sha256 } from './auth.js';

export function renderAuthModal(defaultMode = 'login', onAuthSuccess) {
  const existing = document.getElementById('auth-modal-root');
  if (existing) existing.remove();

  const root = document.createElement('div');
  root.id = 'auth-modal-root';
  root.className = 'modal-overlay';

  let currentTab = defaultMode; // 'login' | 'signup' | 'otp' | 'forgot' | 'reset-otp' | 'reset-password'
  let pendingEmail = '';
  let pendingRole = 'Candidate';
  let simulatedOtp = '';
  let resetEmail = '';
  let resetToken = '';
  let resetSuccessMsg = '';

  function updateView() {
    root.innerHTML = `
      <div class="modal-content glass-card" style="padding: 1.5rem 1.75rem; max-width: 480px; max-height: 90vh; overflow-y: auto; position: relative;">
        <button id="close-auth-modal" style="position: absolute; right: 1.1rem; top: 1.1rem; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.3rem; line-height: 1;">✕</button>

        ${currentTab === 'otp' ? renderOtpStep() :
          currentTab === 'forgot' ? renderForgotPasswordStep() :
          currentTab === 'reset-otp' ? renderResetOtpStep() :
          currentTab === 'reset-password' ? renderResetPasswordStep() :
          renderStandardForm()}
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

      <div id="auth-alert" style="${resetSuccessMsg ? 'display: block; background: rgba(52,211,153,0.15); color: #6ee7b7; border: 1px solid rgba(52,211,153,0.3);' : 'display: none;'} padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); margin-bottom: 0.8rem; font-size: 0.8rem;">
        ${resetSuccessMsg || ''}
      </div>

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
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
            <label class="input-label" style="font-size: 0.8rem; margin-bottom: 0;">Password</label>
            ${currentTab === 'signup' ? '<span style="font-size: 0.72rem; color: var(--text-muted);">Min. 8 characters</span>' : ''}
          </div>
          <div style="position: relative; display: flex; align-items: center;">
            <input type="password" id="auth-password" class="input-text" style="padding: 0.55rem 2.4rem 0.55rem 0.8rem; font-size: 0.9rem; width: 100%;" placeholder="••••••••••••" required autocomplete="${currentTab === 'login' ? 'current-password' : 'new-password'}" />
            <button type="button" id="toggle-auth-password" aria-label="Toggle password visibility" style="position: absolute; right: 0.5rem; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 4px;">
              <svg id="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
          ${currentTab === 'signup' ? `
            <div id="password-strength-container" style="margin-top: 0.4rem;">
              <div style="display: flex; gap: 4px; height: 3px; width: 100%; margin-bottom: 4px;">
                <div id="str-bar-1" style="flex: 1; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background 0.2s;"></div>
                <div id="str-bar-2" style="flex: 1; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background 0.2s;"></div>
                <div id="str-bar-3" style="flex: 1; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background 0.2s;"></div>
                <div id="str-bar-4" style="flex: 1; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background 0.2s;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem;">
                <span id="password-strength-label" style="color: var(--text-muted);">Strength: Minimum 8 characters</span>
                <span id="password-length-counter" style="color: var(--text-muted);">0 / 8 min</span>
              </div>
            </div>
          ` : ''}
        </div>

        ${currentTab === 'login' ? `
          <div style="display: flex; justify-content: flex-end; margin-top: -0.2rem; margin-bottom: 0.15rem;">
            <button type="button" id="btn-forgot-password-link" style="background: none; border: none; color: var(--secondary); font-size: 0.8rem; cursor: pointer; text-decoration: underline; padding: 2px 0;">
              Forgot Password?
            </button>
          </div>
        ` : ''}

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

  function renderForgotPasswordStep() {
    return `
      <div style="text-align: center; margin-bottom: 1.1rem;">
        <div style="display: inline-flex; width: 40px; height: 40px; background: rgba(99,102,241,0.15); border: 1px solid var(--primary); border-radius: 12px; align-items: center; justify-content: center; margin-bottom: 0.5rem; color: var(--primary);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2 style="font-size: 1.35rem; font-weight: 700; color: #fff; line-height: 1.2;">Reset Your Password</h2>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
          Enter your registered email address and we'll dispatch a 6-digit verification code.
        </p>
      </div>

      <div id="forgot-alert" style="display: none; padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); margin-bottom: 0.8rem; font-size: 0.8rem;"></div>

      <form id="forgot-form" style="display: flex; flex-direction: column; gap: 0.85rem;">
        <div class="input-group" style="margin-bottom: 0;">
          <label class="input-label" style="font-size: 0.8rem;">Email Address</label>
          <input type="email" id="forgot-email" class="input-text" style="padding: 0.55rem 0.8rem; font-size: 0.9rem;" placeholder="you@university.edu" value="${resetEmail || ''}" required />
        </div>

        <button type="submit" id="forgot-submit-btn" class="btn btn-primary" style="width: 100%; padding: 0.7rem; font-size: 0.95rem; margin-top: 0.25rem;">
          Send Reset Code
        </button>

        <div style="text-align: center; margin-top: 0.5rem;">
          <button type="button" id="btn-back-to-login" style="background: none; border: none; color: var(--text-muted); font-size: 0.82rem; cursor: pointer; text-decoration: underline;">
            ← Back to Sign In
          </button>
        </div>
      </form>
    `;
  }

  function renderResetOtpStep() {
    return `
      <div style="text-align: center; margin-bottom: 1.1rem;">
        <div style="display: inline-flex; width: 44px; height: 44px; background: rgba(6,182,212,0.15); border: 1px solid var(--secondary); border-radius: 12px; align-items: center; justify-content: center; margin-bottom: 0.5rem; color: var(--secondary);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <h2 style="font-size: 1.35rem; font-weight: 700; color: #fff; line-height: 1.2;">Verify Reset Code</h2>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
          A single-use verification code was dispatched to <strong style="color: #fff;">${resetEmail}</strong>
        </p>
      </div>

      <div style="background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.25); border-radius: var(--radius-sm); padding: 0.75rem 0.9rem; margin-bottom: 1rem; text-align: left;">
        <div style="display: flex; align-items: flex-start; gap: 0.55rem;">
          <span style="font-size: 1.15rem; line-height: 1;">⏱</span>
          <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
            Please enter the 6-digit code from your email. This reset code expires in <strong>5 minutes</strong>.
          </div>
        </div>
      </div>

      <div id="reset-otp-alert" style="display: none; padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); margin-bottom: 0.8rem; font-size: 0.8rem;"></div>

      <form id="reset-otp-form" style="display: flex; flex-direction: column; gap: 0.85rem;">
        <div class="input-group" style="margin-bottom: 0;">
          <label class="input-label" style="text-align: center; font-size: 0.8rem;">Enter 6-Digit Verification Code</label>
          <input type="text" id="reset-otp-input" class="input-text" maxlength="6" pattern="[0-9]{6}" inputmode="numeric" style="text-align: center; font-size: 1.5rem; font-family: var(--font-mono); letter-spacing: 0.3em;" placeholder="••••••" required />
        </div>

        <button type="submit" id="btn-reset-otp-submit" class="btn btn-primary" style="width: 100%; padding: 0.7rem; font-size: 0.95rem; margin-top: 0.25rem;">
          Verify & Continue
        </button>

        <div style="text-align: center; margin-top: 0.4rem;">
          <button type="button" id="btn-resend-reset-otp" style="background: none; border: none; color: var(--secondary); font-size: 0.82rem; cursor: pointer; text-decoration: underline; padding: 4px;">
            Didn't receive code? Resend Code
          </button>
          <div id="resend-reset-status" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: none;"></div>
        </div>

        <div style="text-align: center; margin-top: 0.35rem;">
          <button type="button" id="btn-reset-back-to-login" style="background: none; border: none; color: var(--text-muted); font-size: 0.82rem; cursor: pointer; text-decoration: underline;">
            ← Cancel & Return to Sign In
          </button>
        </div>
      </form>
    `;
  }

  function renderResetPasswordStep() {
    return `
      <div style="text-align: center; margin-bottom: 1.1rem;">
        <div style="display: inline-flex; width: 40px; height: 40px; background: rgba(52,211,153,0.15); border: 1px solid #34d399; border-radius: 12px; align-items: center; justify-content: center; margin-bottom: 0.5rem; color: #34d399;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5z"></path></svg>
        </div>
        <h2 style="font-size: 1.35rem; font-weight: 700; color: #fff; line-height: 1.2;">Create New Password</h2>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
          Set a secure new password for <strong style="color: #fff;">${resetEmail}</strong>
        </p>
      </div>

      <div id="reset-pass-alert" style="display: none; padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); margin-bottom: 0.8rem; font-size: 0.8rem;"></div>

      <form id="reset-pass-form" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div class="input-group" style="margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
            <label class="input-label" style="font-size: 0.8rem; margin-bottom: 0;">New Password</label>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Min. 8 characters</span>
          </div>
          <div style="position: relative; display: flex; align-items: center;">
            <input type="password" id="new-reset-password" class="input-text" style="padding: 0.55rem 2.4rem 0.55rem 0.8rem; font-size: 0.9rem; width: 100%;" placeholder="••••••••••••" required autocomplete="new-password" />
            <button type="button" id="toggle-new-reset-password" aria-label="Toggle password visibility" style="position: absolute; right: 0.5rem; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 4px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
          <div id="reset-password-strength-container" style="margin-top: 0.4rem;">
            <div style="display: flex; gap: 4px; height: 3px; width: 100%; margin-bottom: 4px;">
              <div id="reset-str-bar-1" style="flex: 1; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background 0.2s;"></div>
              <div id="reset-str-bar-2" style="flex: 1; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background 0.2s;"></div>
              <div id="reset-str-bar-3" style="flex: 1; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background 0.2s;"></div>
              <div id="reset-str-bar-4" style="flex: 1; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background 0.2s;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem;">
              <span id="reset-password-strength-label" style="color: var(--text-muted);">Strength: Minimum 8 characters</span>
              <span id="reset-password-length-counter" style="color: var(--text-muted);">0 / 8 min</span>
            </div>
          </div>
        </div>

        <div class="input-group" style="margin-bottom: 0;">
          <label class="input-label" style="font-size: 0.8rem;">Confirm New Password</label>
          <input type="password" id="confirm-reset-password" class="input-text" style="padding: 0.55rem 0.8rem; font-size: 0.9rem;" placeholder="••••••••••••" required autocomplete="new-password" />
        </div>

        <button type="submit" id="btn-complete-reset" class="btn btn-primary" style="width: 100%; padding: 0.7rem; font-size: 0.95rem; margin-top: 0.25rem;">
          Update Password & Sign In
        </button>

        <div style="text-align: center; margin-top: 0.5rem;">
          <button type="button" id="btn-cancel-reset" style="background: none; border: none; color: var(--text-muted); font-size: 0.82rem; cursor: pointer; text-decoration: underline;">
            Cancel & Return to Sign In
          </button>
        </div>
      </form>
    `;
  }

  function renderOtpStep() {
    return `
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <div style="display: inline-flex; width: 44px; height: 44px; background: rgba(6,182,212,0.15); border: 1px solid var(--secondary); border-radius: 12px; align-items: center; justify-content: center; margin-bottom: 0.75rem; color: var(--secondary);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #fff;">Verify Your Email</h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.3rem;">
          A single-use verification code was dispatched to <strong style="color: #fff;">${pendingEmail}</strong>
        </p>
      </div>

      <div style="background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.25); border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 1.25rem; text-align: left;">
        <div style="display: flex; align-items: flex-start; gap: 0.65rem;">
          <span style="font-size: 1.25rem; line-height: 1;">📬</span>
          <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.45;">
            Please check your email inbox and enter the 6-digit code below. Code expires in <strong>10 minutes</strong>.
          </div>
        </div>
      </div>

      <div id="otp-alert" style="display: none; padding: 0.75rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1.2rem; font-size: 0.85rem;"></div>

      <form id="otp-form">
        <div class="input-group">
          <label class="input-label" style="text-align: center;">Enter 6-Digit Verification Code</label>
          <input type="text" id="otp-input" class="input-text" maxlength="6" style="text-align: center; font-size: 1.5rem; font-family: var(--font-mono); letter-spacing: 0.3em;" placeholder="••••••" required />
        </div>

        <button type="submit" id="btn-otp-submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
          Confirm & Access Platform
        </button>

        <div style="text-align: center; margin-top: 1.1rem;">
          <button type="button" id="btn-resend-otp" style="background: none; border: none; color: var(--secondary); font-size: 0.82rem; cursor: pointer; text-decoration: underline; padding: 4px;">
            Didn't receive code? Resend Code
          </button>
          <div id="resend-status" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: none;"></div>
        </div>
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

    // Toggle Password Visibility
    const togglePassBtn = root.querySelector('#toggle-auth-password');
    const passInput = root.querySelector('#auth-password');
    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', () => {
        const isPassword = passInput.type === 'password';
        passInput.type = isPassword ? 'text' : 'password';
        togglePassBtn.innerHTML = isPassword
          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      });
    }

    // Dynamic password strength indicator for signup
    if (currentTab === 'signup' && passInput) {
      passInput.addEventListener('input', () => {
        const val = passInput.value;
        const bar1 = root.querySelector('#str-bar-1');
        const bar2 = root.querySelector('#str-bar-2');
        const bar3 = root.querySelector('#str-bar-3');
        const bar4 = root.querySelector('#str-bar-4');
        const label = root.querySelector('#password-strength-label');
        const counter = root.querySelector('#password-length-counter');

        if (!bar1) return;

        const len = val.length;
        if (counter) {
          counter.textContent = `${len} / 8 min`;
          counter.style.color = len >= 8 ? '#34d399' : 'var(--text-muted)';
        }

        if (len === 0) {
          bar1.style.background = 'rgba(255,255,255,0.1)';
          bar2.style.background = 'rgba(255,255,255,0.1)';
          bar3.style.background = 'rgba(255,255,255,0.1)';
          bar4.style.background = 'rgba(255,255,255,0.1)';
          if (label) {
            label.textContent = 'Strength: Minimum 8 characters';
            label.style.color = 'var(--text-muted)';
          }
          return;
        }

        if (len < 8) {
          bar1.style.background = '#f43f5e';
          bar2.style.background = 'rgba(255,255,255,0.1)';
          bar3.style.background = 'rgba(255,255,255,0.1)';
          bar4.style.background = 'rgba(255,255,255,0.1)';
          if (label) {
            label.textContent = `Too short (${8 - len} more character${8 - len > 1 ? 's' : ''} needed)`;
            label.style.color = '#f43f5e';
          }
          return;
        }

        // Evaluation for length >= 8
        let score = 1;
        if (len >= 12) score++;
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
        if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score++;

        if (score === 1) {
          bar1.style.background = '#f59e0b';
          bar2.style.background = 'rgba(255,255,255,0.1)';
          bar3.style.background = 'rgba(255,255,255,0.1)';
          bar4.style.background = 'rgba(255,255,255,0.1)';
          if (label) {
            label.textContent = 'Strength: Fair (valid length)';
            label.style.color = '#f59e0b';
          }
        } else if (score === 2) {
          bar1.style.background = '#38bdf8';
          bar2.style.background = '#38bdf8';
          bar3.style.background = 'rgba(255,255,255,0.1)';
          bar4.style.background = 'rgba(255,255,255,0.1)';
          if (label) {
            label.textContent = 'Strength: Good';
            label.style.color = '#38bdf8';
          }
        } else if (score === 3) {
          bar1.style.background = '#38bdf8';
          bar2.style.background = '#38bdf8';
          bar3.style.background = '#38bdf8';
          bar4.style.background = 'rgba(255,255,255,0.1)';
          if (label) {
            label.textContent = 'Strength: Very Good';
            label.style.color = '#38bdf8';
          }
        } else {
          bar1.style.background = '#34d399';
          bar2.style.background = '#34d399';
          bar3.style.background = '#34d399';
          bar4.style.background = '#34d399';
          if (label) {
            label.textContent = 'Strength: Strong';
            label.style.color = '#34d399';
          }
        }
      });
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

          // Client-side password validation
          if (!password || !password.trim()) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(244,63,94,0.15)';
            alertBox.style.color = '#fda4af';
            alertBox.style.border = '1px solid rgba(244,63,94,0.3)';
            alertBox.textContent = 'Password cannot be empty or contain only whitespace.';
            return;
          }
          if (password.length < 8) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(244,63,94,0.15)';
            alertBox.style.color = '#fda4af';
            alertBox.style.border = '1px solid rgba(244,63,94,0.3)';
            alertBox.textContent = 'Password must be at least 8 characters long.';
            return;
          }
          if (password.length > 128) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(244,63,94,0.15)';
            alertBox.style.color = '#fda4af';
            alertBox.style.border = '1px solid rgba(244,63,94,0.3)';
            alertBox.textContent = 'Password cannot exceed 128 characters.';
            return;
          }

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

    // Handle Resend OTP Code
    const resendBtn = root.querySelector('#btn-resend-otp');
    if (resendBtn) {
      resendBtn.addEventListener('click', async () => {
        const resendStatus = root.querySelector('#resend-status');
        const alertBox = root.querySelector('#otp-alert');
        if (alertBox) alertBox.style.display = 'none';
        resendBtn.disabled = true;
        if (resendStatus) {
          resendStatus.style.display = 'block';
          resendStatus.style.color = 'var(--text-muted)';
          resendStatus.textContent = 'Dispatching fresh verification code...';
        }

        try {
          const res = await authState.resendOtp(pendingEmail);
          if (resendStatus) {
            resendStatus.style.color = '#34d399';
            resendStatus.textContent = res.message || 'Verification code resent. Check your inbox.';
          }
          let seconds = 60;
          const timer = setInterval(() => {
            seconds--;
            if (seconds <= 0) {
              clearInterval(timer);
              resendBtn.disabled = false;
              resendBtn.textContent = "Didn't receive code? Resend Code";
              if (resendStatus) resendStatus.style.display = 'none';
            } else {
              resendBtn.textContent = `Resend Code (${seconds}s)`;
            }
          }, 1000);
        } catch (err) {
          resendBtn.disabled = false;
          if (resendStatus) resendStatus.style.display = 'none';
          if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(244,63,94,0.15)';
            alertBox.style.color = '#fda4af';
            alertBox.textContent = err.message;
          }
        }
      });
    }
    const otpForm = root.querySelector('#otp-form');
    if (otpForm) {
      otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = root.querySelector('#otp-input').value.trim();
        const alertBox = root.querySelector('#otp-alert');

        try {
          const user = await authState.verifyOtp(pendingEmail, code);
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

    // Forgot Password Link Click (from Sign In view)
    const forgotLink = root.querySelector('#btn-forgot-password-link');
    if (forgotLink) {
      forgotLink.addEventListener('click', () => {
        resetSuccessMsg = '';
        currentTab = 'forgot';
        updateView();
      });
    }

    // Forgot Password Step: Back to Login
    const backToLoginBtn = root.querySelector('#btn-back-to-login');
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener('click', () => {
        currentTab = 'login';
        updateView();
      });
    }

    // Forgot Password Form Submit
    const forgotForm = root.querySelector('#forgot-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = root.querySelector('#forgot-email');
        const alertBox = root.querySelector('#forgot-alert');
        const submitBtn = root.querySelector('#btn-forgot-submit');
        if (!emailInput) return;
        const email = emailInput.value.trim();
        if (!email) return;

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending Verification Code...';
        }
        if (alertBox) alertBox.style.display = 'none';

        try {
          await authState.requestPasswordReset(email);
          resetEmail = email;
          currentTab = 'reset-otp';
          updateView();
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Verification Code';
          }
          if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(244,63,94,0.15)';
            alertBox.style.color = '#fda4af';
            alertBox.style.border = '1px solid rgba(244,63,94,0.3)';
            alertBox.textContent = err.message || 'Failed to request reset code.';
          }
        }
      });
    }

    // Reset OTP Step: Back to Login
    const resetBackBtn = root.querySelector('#btn-reset-back-to-login');
    if (resetBackBtn) {
      resetBackBtn.addEventListener('click', () => {
        currentTab = 'login';
        updateView();
      });
    }

    // Reset OTP Form Submit
    const resetOtpForm = root.querySelector('#reset-otp-form');
    if (resetOtpForm) {
      resetOtpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otpInput = root.querySelector('#reset-otp-input');
        const alertBox = root.querySelector('#reset-otp-alert');
        const submitBtn = root.querySelector('#btn-reset-otp-submit');
        if (!otpInput) return;
        const code = otpInput.value.trim();
        if (code.length !== 6) {
          if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(244,63,94,0.15)';
            alertBox.style.color = '#fda4af';
            alertBox.style.border = '1px solid rgba(244,63,94,0.3)';
            alertBox.textContent = 'Please enter the full 6-digit code.';
          }
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Verifying Code...';
        }
        if (alertBox) alertBox.style.display = 'none';

        try {
          const res = await authState.verifyPasswordResetOtp(resetEmail, code);
          resetToken = res.resetToken;
          currentTab = 'reset-password';
          updateView();
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Verify & Continue';
          }
          if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(244,63,94,0.15)';
            alertBox.style.color = '#fda4af';
            alertBox.style.border = '1px solid rgba(244,63,94,0.3)';
            alertBox.textContent = err.message || 'Invalid or expired verification code.';
          }
        }
      });
    }

    // Reset OTP Step: Resend Code with 60s Cooldown
    const resendResetBtn = root.querySelector('#btn-resend-reset-otp');
    if (resendResetBtn) {
      resendResetBtn.addEventListener('click', async () => {
        const resendStatus = root.querySelector('#resend-reset-status');
        const alertBox = root.querySelector('#reset-otp-alert');
        if (alertBox) alertBox.style.display = 'none';
        resendResetBtn.disabled = true;
        if (resendStatus) {
          resendStatus.style.display = 'block';
          resendStatus.style.color = 'var(--text-muted)';
          resendStatus.textContent = 'Dispatching fresh reset code...';
        }

        try {
          const res = await authState.requestPasswordReset(resetEmail);
          if (resendStatus) {
            resendStatus.style.color = '#34d399';
            resendStatus.textContent = res.message || 'Reset code sent. Check your inbox.';
          }
          let seconds = 60;
          const timer = setInterval(() => {
            seconds--;
            if (seconds <= 0) {
              clearInterval(timer);
              resendResetBtn.disabled = false;
              resendResetBtn.textContent = "Didn't receive code? Resend Code";
              if (resendStatus) resendStatus.style.display = 'none';
            } else {
              resendResetBtn.textContent = `Resend Code (${seconds}s)`;
            }
          }, 1000);
        } catch (err) {
          resendResetBtn.disabled = false;
          if (resendStatus) resendStatus.style.display = 'none';
          if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(244,63,94,0.15)';
            alertBox.style.color = '#fda4af';
            alertBox.style.border = '1px solid rgba(244,63,94,0.3)';
            alertBox.textContent = err.message || 'Failed to resend reset code.';
          }
        }
      });
    }

    // Reset Password Step: Cancel & Back to Login
    const cancelResetBtn = root.querySelector('#btn-cancel-reset');
    if (cancelResetBtn) {
      cancelResetBtn.addEventListener('click', () => {
        currentTab = 'login';
        updateView();
      });
    }

    // Reset Password Step: Toggle Password Visibility
    const toggleNewPassBtn = root.querySelector('#toggle-new-reset-password');
    const newPassInput = root.querySelector('#new-reset-password');
    if (toggleNewPassBtn && newPassInput) {
      toggleNewPassBtn.addEventListener('click', () => {
        const isPassword = newPassInput.type === 'password';
        newPassInput.type = isPassword ? 'text' : 'password';
        toggleNewPassBtn.innerHTML = isPassword
          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      });
    }

    // Reset Password Step: Dynamic Password Strength Indicator
    if (newPassInput) {
      newPassInput.addEventListener('input', () => {
        const val = newPassInput.value;
        const bar1 = root.querySelector('#reset-str-bar-1');
        const bar2 = root.querySelector('#reset-str-bar-2');
        const bar3 = root.querySelector('#reset-str-bar-3');
        const bar4 = root.querySelector('#reset-str-bar-4');
        const label = root.querySelector('#reset-password-strength-label');
        const counter = root.querySelector('#reset-password-length-counter');

        if (!bar1) return;
        const len = val.length;
        if (counter) {
          counter.textContent = `${len} / 8 min`;
          counter.style.color = len >= 8 ? '#34d399' : 'var(--text-muted)';
        }

        if (len === 0) {
          bar1.style.background = 'rgba(255,255,255,0.1)';
          bar2.style.background = 'rgba(255,255,255,0.1)';
          bar3.style.background = 'rgba(255,255,255,0.1)';
          bar4.style.background = 'rgba(255,255,255,0.1)';
          if (label) {
            label.textContent = 'Strength: Minimum 8 characters';
            label.style.color = 'var(--text-muted)';
          }
          return;
        }

        if (len < 8) {
          bar1.style.background = '#f43f5e';
          bar2.style.background = 'rgba(255,255,255,0.1)';
          bar3.style.background = 'rgba(255,255,255,0.1)';
          bar4.style.background = 'rgba(255,255,255,0.1)';
          if (label) {
            label.textContent = `Too short (${8 - len} more character${8 - len > 1 ? 's' : ''} needed)`;
            label.style.color = '#f43f5e';
          }
          return;
        }

        let score = 1;
        if (len >= 12) score++;
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
        if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score++;

        if (score === 1) {
          bar1.style.background = '#f59e0b';
          bar2.style.background = 'rgba(255,255,255,0.1)';
          bar3.style.background = 'rgba(255,255,255,0.1)';
          bar4.style.background = 'rgba(255,255,255,0.1)';
          if (label) {
            label.textContent = 'Strength: Fair (valid length)';
            label.style.color = '#f59e0b';
          }
        } else if (score === 2) {
          bar1.style.background = '#38bdf8';
          bar2.style.background = '#38bdf8';
          bar3.style.background = 'rgba(255,255,255,0.1)';
          bar4.style.background = 'rgba(255,255,255,0.1)';
          if (label) {
            label.textContent = 'Strength: Good';
            label.style.color = '#38bdf8';
          }
        } else if (score === 3) {
          bar1.style.background = '#38bdf8';
          bar2.style.background = '#38bdf8';
          bar3.style.background = '#38bdf8';
          bar4.style.background = 'rgba(255,255,255,0.1)';
          if (label) {
            label.textContent = 'Strength: Very Good';
            label.style.color = '#38bdf8';
          }
        } else {
          bar1.style.background = '#34d399';
          bar2.style.background = '#34d399';
          bar3.style.background = '#34d399';
          bar4.style.background = '#34d399';
          if (label) {
            label.textContent = 'Strength: Strong';
            label.style.color = '#34d399';
          }
        }
      });
    }

    // Reset Password Form Submit
    const resetPassForm = root.querySelector('#reset-pass-form');
    if (resetPassForm) {
      resetPassForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = root.querySelector('#new-reset-password').value;
        const confirmPassword = root.querySelector('#confirm-reset-password').value;
        const alertBox = root.querySelector('#reset-pass-alert');
        const submitBtn = root.querySelector('#btn-complete-reset');

        const showError = (msg) => {
          if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(244,63,94,0.15)';
            alertBox.style.color = '#fda4af';
            alertBox.style.border = '1px solid rgba(244,63,94,0.3)';
            alertBox.textContent = msg;
          }
        };

        if (!newPassword || !newPassword.trim()) {
          showError('Password cannot be empty or contain only whitespace.');
          return;
        }
        if (newPassword.length < 8) {
          showError('Password must be at least 8 characters long.');
          return;
        }
        if (newPassword.length > 128) {
          showError('Password cannot exceed 128 characters.');
          return;
        }
        if (newPassword !== confirmPassword) {
          showError('Passwords do not match. Please re-enter.');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Updating Password...';
        }
        if (alertBox) alertBox.style.display = 'none';

        try {
          await authState.resetPassword({
            email: resetEmail,
            resetToken,
            newPassword
          });
          resetSuccessMsg = 'Password reset successfully! Please sign in with your new password.';
          currentTab = 'login';
          updateView();
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Password & Sign In';
          }
          showError(err.message || 'Failed to reset password.');
        }
      });
    }
  }

  document.body.appendChild(root);
  updateView();
}
