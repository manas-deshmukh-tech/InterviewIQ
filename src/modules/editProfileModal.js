import { authState } from './auth.js';

export function renderEditProfileModal(currentUser, onProfileUpdated, defaultTab = 'info') {
  const existing = document.getElementById('edit-profile-modal-root');
  if (existing) existing.remove();

  const root = document.createElement('div');
  root.id = 'edit-profile-modal-root';
  root.className = 'modal-overlay';

  let currentTab = defaultTab; // 'info' | 'edit' | 'manage'
  let selectedAvatar = currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  let emailVerificationPending = false;
  let simulatedOtp = '';
  let pendingNewEmail = '';

  function render() {
    root.innerHTML = `
      <div class="modal-content glass-card" style="padding: 2.2rem; max-width: 600px; position: relative;">
        <!-- Header with Title & Top-Right Action Options -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); gap: 1rem; flex-wrap: wrap;">
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0;">
              My Profile
            </h2>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem; margin-bottom: 0;">
              Candidate account details, credentials & security
            </p>
          </div>

          <!-- Top-Right Actions: Edit Profile & Manage Account -->
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-left: auto;">
            <button type="button" class="btn btn-sm ${currentTab === 'edit' ? 'btn-primary' : 'btn-secondary'}" id="tab-edit-profile" style="padding: 0.45rem 0.85rem; font-size: 0.85rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit Profile
            </button>
            <button type="button" class="btn btn-sm ${currentTab === 'manage' ? 'btn-primary' : 'btn-secondary'}" id="tab-manage-account" style="padding: 0.45rem 0.85rem; font-size: 0.85rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5z"></path></svg>
              Manage Account
            </button>
            <button type="button" id="close-profile-modal" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.4rem; padding: 0.2rem 0.4rem; line-height: 1; margin-left: 0.25rem;">✕</button>
          </div>
        </div>

        <div id="profile-modal-alert" style="display: none; padding: 0.75rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1.2rem; font-size: 0.85rem;"></div>

        <!-- Tab Body -->
        <div id="profile-modal-body">
          ${renderTabContent()}
        </div>
      </div>
    `;

    bindTabEvents();
  }

  function renderTabContent() {
    if (currentTab === 'info') {
      return `
        <div class="fade-in">
          <!-- User Summary Header -->
          <div style="display: flex; align-items: center; gap: 1.25rem; padding: 1.2rem; background: rgba(15,23,42,0.5); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
            <img src="${currentUser.avatar || selectedAvatar}" alt="${currentUser.name}" class="profile-avatar-preview" style="width: 72px; height: 72px;" />
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff;">${currentUser.name}</h3>
                <span class="role-pill ${currentUser.role}">${currentUser.role}</span>
              </div>
              <div style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.2rem;">${currentUser.email}</div>
              <div style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
                <span class="badge badge-emerald" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">Verified Candidate</span>
              </div>
            </div>
          </div>

          <!-- Info Details Grid -->
          <div class="profile-info-grid">
            <div class="profile-info-item">
              <div class="label">Full Name</div>
              <div class="value">${currentUser.name}</div>
            </div>
            <div class="profile-info-item">
              <div class="label">Email Address</div>
              <div class="value" style="font-size: 0.9rem; word-break: break-all;">${currentUser.email}</div>
            </div>
            <div class="profile-info-item">
              <div class="label">Target Engineering Track</div>
              <div class="value">${currentUser.targetRole || 'Full Stack Engineer'}</div>
            </div>
            <div class="profile-info-item">
              <div class="label">Experience Level</div>
              <div class="value">${currentUser.level || 'Mid Level'}</div>
            </div>
          </div>
        </div>
      `;
    }

    if (currentTab === 'edit') {
      return `
        <form id="edit-profile-form" class="fade-in">
          <!-- Profile Photo Section -->
          <div class="profile-avatar-wrapper">
            <img src="${selectedAvatar}" alt="${currentUser.name}" id="profile-avatar-img" class="profile-avatar-preview" />
            <div class="profile-avatar-actions">
              <div style="font-size: 0.85rem; font-weight: 600; color: #fff;">Profile Photo</div>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <label class="btn-upload-label" for="avatar-file-input">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Upload Photo
                </label>
                <input type="file" id="avatar-file-input" accept="image/*" style="display: none;" />
                <button type="button" id="btn-generate-avatar" class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 0.35rem 0.65rem;">
                  Generate
                </button>
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Supports PNG, JPG, WebP under 2MB</div>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label" for="edit-profile-name">Full Name</label>
            <input type="text" id="edit-profile-name" class="input-text" value="${currentUser.name || ''}" placeholder="e.g. John Doe" required />
          </div>

          <div class="input-group">
            <label class="input-label" for="edit-profile-target-role">Target Engineering Track</label>
            <input type="text" id="edit-profile-target-role" class="input-text" value="${currentUser.targetRole || 'Full Stack Engineer'}" placeholder="e.g. Full Stack Engineer, ML Engineer" />
          </div>

          <div class="input-group">
            <label class="input-label" for="edit-profile-level">Experience Level</label>
            <select id="edit-profile-level" class="input-text" style="background: #1e293b; color: #fff;">
              <option value="Entry Level" ${currentUser.level === 'Entry Level' ? 'selected' : ''}>Entry Level (0-2 yrs)</option>
              <option value="Mid Level" ${currentUser.level === 'Mid Level' ? 'selected' : ''}>Mid Level (3-5 yrs)</option>
              <option value="Senior Level" ${currentUser.level === 'Senior Level' ? 'selected' : ''}>Senior Level (5+ yrs)</option>
            </select>
          </div>

          <div style="display: flex; gap: 0.8rem; margin-top: 1.8rem;">
            <button type="button" id="btn-cancel-edit-profile" class="btn btn-secondary" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex: 1;">Save Changes</button>
          </div>
        </form>
      `;
    }

    if (currentTab === 'manage') {
      return `
        <div class="fade-in">
          <!-- Change Password Card -->
          <div class="manage-account-card">
            <h3 style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Change Password
            </h3>
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Passwords are cryptographically secured using SHA-256. Minimum 6 characters required.
            </p>

            <form id="form-change-password">
              <div class="input-group" style="margin-bottom: 0.75rem;">
                <label class="input-label">Current Password</label>
                <input type="password" id="input-curr-pass" class="input-text" placeholder="••••••••" required />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="input-group" style="margin-bottom: 0;">
                  <label class="input-label">New Password</label>
                  <input type="password" id="input-new-pass" class="input-text" placeholder="••••••••" required />
                </div>
                <div class="input-group" style="margin-bottom: 0;">
                  <label class="input-label">Confirm New Password</label>
                  <input type="password" id="input-confirm-pass" class="input-text" placeholder="••••••••" required />
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-sm" style="margin-top: 1rem;">
                Update Password
              </button>
            </form>
          </div>

          <!-- Change & Verify Email Card -->
          <div class="manage-account-card">
            <h3 style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Change & Verify Email
            </h3>
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Current Email: <strong style="color: #fff;">${currentUser.email}</strong>
            </p>

            ${!emailVerificationPending ? `
              <form id="form-request-email">
                <div class="input-group" style="margin-bottom: 0.75rem;">
                  <label class="input-label">New Email Address</label>
                  <input type="email" id="input-new-email" class="input-text" placeholder="new.email@university.edu" required />
                </div>
                <button type="submit" class="btn btn-secondary btn-sm">
                  Send Verification Code
                </button>
              </form>
            ` : `
              <div style="background: rgba(6,182,212,0.08); border: 1px dashed var(--secondary); border-radius: var(--radius-sm); padding: 0.8rem; margin-bottom: 1rem; text-align: center;">
                <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Simulated Verification Dispatch Token for ${pendingNewEmail}</span>
                <div style="font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; letter-spacing: 0.25em; color: var(--secondary); margin-top: 0.2rem;">
                  ${simulatedOtp}
                </div>
              </div>

              <form id="form-verify-email">
                <div class="input-group" style="margin-bottom: 0.75rem;">
                  <label class="input-label">Enter 6-Digit Code</label>
                  <input type="text" id="input-email-otp" class="input-text" maxlength="6" placeholder="••••••" style="font-family: var(--font-mono); letter-spacing: 0.25em; text-align: center;" required />
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <button type="submit" class="btn btn-primary btn-sm">Verify & Update Email</button>
                  <button type="button" id="btn-cancel-email-change" class="btn btn-secondary btn-sm">Cancel</button>
                </div>
              </form>
            `}
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
            <button type="button" id="btn-back-to-info" class="btn btn-secondary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to Profile Info
            </button>
          </div>
        </div>
      `;
    }
  }

  function showAlert(message, type = 'error') {
    const alertBox = root.querySelector('#profile-modal-alert');
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.style.display = 'block';
    if (type === 'success') {
      alertBox.style.background = 'rgba(52, 211, 153, 0.15)';
      alertBox.style.border = '1px solid rgba(52, 211, 153, 0.3)';
      alertBox.style.color = '#34d399';
    } else {
      alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
      alertBox.style.border = '1px solid rgba(239, 68, 68, 0.3)';
      alertBox.style.color = '#f87171';
    }
  }

  function bindTabEvents() {
    const closeBtn = root.querySelector('#close-profile-modal');
    const close = () => root.remove();
    if (closeBtn) closeBtn.addEventListener('click', close);
    root.addEventListener('click', (e) => {
      if (e.target === root) close();
    });

    const tabEdit = root.querySelector('#tab-edit-profile');
    const tabManage = root.querySelector('#tab-manage-account');

    if (tabEdit) {
      tabEdit.addEventListener('click', () => {
        currentTab = currentTab === 'edit' ? 'info' : 'edit';
        render();
      });
    }
    if (tabManage) {
      tabManage.addEventListener('click', () => {
        currentTab = currentTab === 'manage' ? 'info' : 'manage';
        render();
      });
    }

    // Edit Profile Tab Handlers
    if (currentTab === 'edit') {
      const form = root.querySelector('#edit-profile-form');
      const fileInput = root.querySelector('#avatar-file-input');
      const avatarImg = root.querySelector('#profile-avatar-img');
      const generateAvatarBtn = root.querySelector('#btn-generate-avatar');
      const cancelBtn = root.querySelector('#btn-cancel-edit-profile');

      if (cancelBtn) cancelBtn.addEventListener('click', () => { currentTab = 'info'; render(); });

      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          if (file.size > 2 * 1024 * 1024) {
            showAlert('Selected image exceeds 2MB limit. Please choose a smaller file.');
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            selectedAvatar = event.target.result;
            if (avatarImg) avatarImg.src = selectedAvatar;
          };
          reader.readAsDataURL(file);
        });
      }

      if (generateAvatarBtn) {
        generateAvatarBtn.addEventListener('click', () => {
          const nameVal = root.querySelector('#edit-profile-name').value.trim() || 'Candidate';
          const seed = encodeURIComponent(nameVal + '_' + Date.now());
          selectedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=0284c7,4f46e5,7c3aed`;
          if (avatarImg) avatarImg.src = selectedAvatar;
        });
      }

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const newName = root.querySelector('#edit-profile-name').value.trim();
          const newTargetRole = root.querySelector('#edit-profile-target-role').value.trim();
          const newLevel = root.querySelector('#edit-profile-level').value;

          if (!newName) {
            showAlert('Full Name is required.');
            return;
          }

          try {
            const updated = authState.updateUser(currentUser.id, {
              name: newName,
              targetRole: newTargetRole,
              level: newLevel,
              avatar: selectedAvatar
            });

            currentUser = updated;
            if (typeof onProfileUpdated === 'function') {
              onProfileUpdated(updated);
            }
            currentTab = 'info';
            render();
            showAlert('Profile updated successfully!', 'success');
          } catch (err) {
            showAlert(err.message || 'Error updating profile.');
          }
        });
      }
    }

    // Manage Account Tab Handlers
    if (currentTab === 'manage') {
      const passForm = root.querySelector('#form-change-password');
      if (passForm) {
        passForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const curr = root.querySelector('#input-curr-pass').value;
          const next = root.querySelector('#input-new-pass').value;
          const confirm = root.querySelector('#input-confirm-pass').value;

          if (next !== confirm) {
            showAlert('New password and confirmation do not match.');
            return;
          }

          try {
            await authState.changePassword(currentUser.id, curr, next);
            passForm.reset();
            showAlert('Password changed successfully!', 'success');
          } catch (err) {
            showAlert(err.message || 'Failed to update password.');
          }
        });
      }

      const reqEmailForm = root.querySelector('#form-request-email');
      if (reqEmailForm) {
        reqEmailForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const newEmail = root.querySelector('#input-new-email').value.trim();
          if (!newEmail || newEmail.toLowerCase() === currentUser.email.toLowerCase()) {
            showAlert('Please enter a different email address.');
            return;
          }

          try {
            const res = authState.requestEmailChange(currentUser.id, newEmail);
            pendingNewEmail = newEmail;
            simulatedOtp = res.otp;
            emailVerificationPending = true;
            render();
            showAlert(`Verification code dispatched to ${newEmail}`, 'success');
          } catch (err) {
            showAlert(err.message || 'Failed to request email change.');
          }
        });
      }

      const verifyEmailForm = root.querySelector('#form-verify-email');
      if (verifyEmailForm) {
        verifyEmailForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const otp = root.querySelector('#input-email-otp').value.trim();
          try {
            const updated = authState.verifyNewEmail(currentUser.id, otp);
            currentUser = updated;
            emailVerificationPending = false;
            if (typeof onProfileUpdated === 'function') {
              onProfileUpdated(updated);
            }
            render();
            showAlert('Email address successfully verified and updated!', 'success');
          } catch (err) {
            showAlert(err.message || 'Failed to verify email.');
          }
        });

        const cancelEmailBtn = root.querySelector('#btn-cancel-email-change');
        if (cancelEmailBtn) {
          cancelEmailBtn.addEventListener('click', () => {
            emailVerificationPending = false;
            render();
          });
        }
      }

      const backToInfoBtn = root.querySelector('#btn-back-to-info');
      if (backToInfoBtn) {
        backToInfoBtn.addEventListener('click', () => {
          currentTab = 'info';
          render();
        });
      }
    }
  }

  document.body.appendChild(root);
  render();
}
