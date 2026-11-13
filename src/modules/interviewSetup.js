import { INTERVIEW_ROLES, QUESTION_BANK, PERSONAS, INTERVIEW_MODES, getQuestionsForRole, getInterviewer, getInterviewerForRole, INTERVIEWERS } from '../data/questionBank.js';
import { parseResumeFile } from './resumeParser.js';
import { getAuthHeaders } from './auth.js';
import { SpeechEngine } from './speechEngine.js';

export function renderInterviewSetup(container, currentUser = {}, onStartInterview) {
  const safeUser = currentUser || {};
  const speechEngine = new SpeechEngine();
  let currentStep = 1; // 1: Track & Resume | 2: Experience & Duration | 3: Ready to Begin
  let parsedResumeData = null;
  let customQuestionList = [];
  let selectedRoleId = 'software_developer';
  let customRoleTitle = '';
  let selectedLevel = safeUser.level || 'Mid Level';
  let selectedMode = 'practice';
  let selectedPersona = 'vikram';
  let questionSource = 'builtin'; // 'builtin' | 'resume' | 'custom'
  let timerMinutes = 15;
  let saveRecording = true;
  let assignedProject = 'Core Application Platform';
  let searchQuery = '';
  let activeRoleFilter = 'engineering'; // 'engineering' | 'data' | 'design_business' | 'campus_hr'
  let answerMode = 'auto'; // 'auto' (direct auto-listen) | 'manual' (click to speak)

  const ROLE_CATEGORIES = [
    { 
      id: 'engineering', 
      label: 'Software & Engineering', 
      icon: '💻', 
      description: 'Core programming, full-stack architectures, algorithms, and cybersecurity.',
      roleIds: ['software_developer', 'full_stack_developer', 'python_developer', 'java_developer', 'cybersecurity_analyst'] 
    },
    { 
      id: 'data', 
      label: 'Data & AI', 
      icon: '📊', 
      description: 'Data analytics, data science algorithms, and machine learning architectures.',
      roleIds: ['data_analyst', 'data_scientist', 'aiml_engineer'] 
    },
    { 
      id: 'design_business', 
      label: 'Product & Design', 
      icon: '🎨', 
      description: 'UX/UI product design, prototyping, process modeling, and business analysis.',
      roleIds: ['uiux_designer', 'business_analyst'] 
    },
    { 
      id: 'campus_hr', 
      label: 'General & HR', 
      icon: '👔', 
      description: 'HR behavioral assessments, entry-level campus tracks, and custom roles.',
      roleIds: ['hr_interview', 'general_fresher', 'custom_role'] 
    }
  ];

  const SENIORITY_LEVELS = [
    {
      id: 'Fresher / Entry',
      title: 'Fresher / Entry',
      sub: '0-1 yrs experience',
      icon: '🎓',
      desc: 'Focuses on foundational concepts, academic projects, core problem solving, and aptitude.'
    },
    {
      id: 'Mid Level',
      title: 'Mid Level',
      sub: '2-4 yrs experience',
      icon: '⚡',
      desc: 'Focuses on production implementations, system debugging, API design, and best practices.'
    },
    {
      id: 'Senior',
      title: 'Senior / Lead',
      sub: '5+ yrs experience',
      icon: '🚀',
      desc: 'Focuses on scalability, system architecture, resilience, high availability, and mentoring.'
    },
    {
      id: 'Staff / Architect',
      title: 'Staff / Architect',
      sub: '8+ yrs experience',
      icon: '🏛️',
      desc: 'Focuses on enterprise strategy, cross-system design, technical vision, and business ROI.'
    }
  ];

  const DURATION_PRESETS = [
    { minutes: 5, label: '5 Mins', badge: 'Express Sprint', desc: '2-3 focused questions' },
    { minutes: 15, label: '15 Mins', badge: 'Standard Round', desc: '4-5 calibrated questions' },
    { minutes: 30, label: '30 Mins', badge: 'In-Depth', desc: 'Comprehensive technical exploration' },
    { minutes: 45, label: '45 Mins', badge: 'Full Loop', desc: 'Rigorous complete interview' }
  ];

  function getSelectedRole() {
    return INTERVIEW_ROLES.find(r => r.id === selectedRoleId) || INTERVIEW_ROLES[0];
  }

  function getFilteredRoles() {
    return INTERVIEW_ROLES.filter(role => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = role.title.toLowerCase().includes(query);
        const matchesDesc = role.description.toLowerCase().includes(query);
        const matchesTags = role.tags.some(t => t.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesTags;
      }
      const currentCategoryObj = ROLE_CATEGORIES.find(c => c.id === activeRoleFilter) || ROLE_CATEGORIES[0];
      return currentCategoryObj.roleIds.includes(role.id);
    });
  }

  function render() {
    const selectedRole = getSelectedRole();
    const isCustomRole = selectedRole.id === 'custom_role';
    const effectiveRoleName = isCustomRole ? (customRoleTitle.trim() || 'Custom Role') : selectedRole.title;
    const currentCategoryObj = ROLE_CATEGORIES.find(c => c.roleIds.includes(selectedRole.id)) || ROLE_CATEGORIES[0];

    container.innerHTML = `
      <div class="fade-in" style="max-width: 1200px; margin: 0 auto; padding-bottom: 3.5rem;">
        
        <!-- Header Banner -->
        <div style="margin-bottom: 1.8rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; flex-wrap: wrap;">
            <span class="badge badge-cyan" style="font-weight: 700; letter-spacing: 0.03em;">AI INTERVIEW ORCHESTRATOR</span>
          </div>
          <h1 style="font-size: 2.15rem; font-weight: 800; letter-spacing: -0.03em; color: var(--text-main); margin: 0 0 0.35rem;">
            Setup Your Mock Interview
          </h1>
          <p style="color: var(--text-secondary); max-width: 800px; margin: 0; font-size: 0.96rem; line-height: 1.5;">
            Follow our 3-step setup to calibrate your interview track, experience level, and session duration.
          </p>
        </div>

        <!-- ========================================================
             PROGRESS STEPPER BAR
             ======================================================== -->
        <div class="glass-card" style="padding: 1.15rem 1.6rem; margin-bottom: 2rem; border-radius: var(--radius-lg);">
          <div style="display: flex; align-items: center; justify-content: space-between; position: relative;">
            
            <!-- Step 1 Indicator -->
            <button type="button" class="wizard-step-pill ${currentStep === 1 ? 'active' : (currentStep > 1 ? 'completed' : '')}" data-goto-step="1" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; text-align: left; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); transition: all 0.2s;">
              <div style="
                width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem;
                background: ${currentStep === 1 ? 'linear-gradient(135deg, #0284c7, #6366f1)' : (currentStep > 1 ? '#10b981' : 'rgba(255,255,255,0.06)')};
                color: #ffffff;
                box-shadow: ${currentStep === 1 ? '0 0 16px rgba(2,132,199,0.45)' : 'none'};
              ">
                ${currentStep > 1 ? '✓' : '1'}
              </div>
              <div>
                <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: ${currentStep === 1 ? '#38bdf8' : (currentStep > 1 ? '#34d399' : 'var(--text-muted)')};">Step 1</div>
                <div style="font-size: 0.92rem; font-weight: 800; color: ${currentStep === 1 ? '#ffffff' : 'var(--text-secondary)'};">Interview Track &amp; Resume</div>
              </div>
            </button>

            <!-- Connector Line 1-2 -->
            <div style="flex: 1; height: 2px; margin: 0 1.25rem; background: ${currentStep > 1 ? 'linear-gradient(90deg, #10b981, #0284c7)' : 'rgba(255,255,255,0.08)'}; transition: background 0.3s ease;"></div>

            <!-- Step 2 Indicator -->
            <button type="button" class="wizard-step-pill ${currentStep === 2 ? 'active' : (currentStep > 2 ? 'completed' : '')}" data-goto-step="2" style="background: none; border: none; cursor: ${currentStep >= 2 ? 'pointer' : 'default'}; display: flex; align-items: center; gap: 0.75rem; text-align: left; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); transition: all 0.2s;">
              <div style="
                width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem;
                background: ${currentStep === 2 ? 'linear-gradient(135deg, #0284c7, #6366f1)' : (currentStep > 2 ? '#10b981' : 'rgba(255,255,255,0.06)')};
                color: ${currentStep >= 2 ? '#ffffff' : 'var(--text-muted)'};
                box-shadow: ${currentStep === 2 ? '0 0 16px rgba(2,132,199,0.45)' : 'none'};
              ">
                ${currentStep > 2 ? '✓' : '2'}
              </div>
              <div>
                <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: ${currentStep === 2 ? '#38bdf8' : (currentStep > 2 ? '#34d399' : 'var(--text-muted)')};">Step 2</div>
                <div style="font-size: 0.92rem; font-weight: 800; color: ${currentStep === 2 ? '#ffffff' : 'var(--text-secondary)'};">Seniority &amp; Duration</div>
              </div>
            </button>

            <!-- Connector Line 2-3 -->
            <div style="flex: 1; height: 2px; margin: 0 1.25rem; background: ${currentStep > 2 ? 'linear-gradient(90deg, #10b981, #0284c7)' : 'rgba(255,255,255,0.08)'}; transition: background 0.3s ease;"></div>

            <!-- Step 3 Indicator -->
            <button type="button" class="wizard-step-pill ${currentStep === 3 ? 'active' : ''}" data-goto-step="3" style="background: none; border: none; cursor: ${currentStep >= 3 ? 'pointer' : 'default'}; display: flex; align-items: center; gap: 0.75rem; text-align: left; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); transition: all 0.2s;">
              <div style="
                width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem;
                background: ${currentStep === 3 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.06)'};
                color: ${currentStep === 3 ? '#ffffff' : 'var(--text-muted)'};
                box-shadow: ${currentStep === 3 ? '0 0 16px rgba(16,185,129,0.45)' : 'none'};
              ">
                3
              </div>
              <div>
                <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: ${currentStep === 3 ? '#34d399' : 'var(--text-muted)'};">Step 3</div>
                <div style="font-size: 0.92rem; font-weight: 800; color: ${currentStep === 3 ? '#ffffff' : 'var(--text-secondary)'};">Ready to Begin</div>
              </div>
            </button>

          </div>
        </div>

        <!-- ========================================================
             STEP CONTENT CONTAINER
             ======================================================== -->
        ${renderStepContent(currentStep, selectedRole, effectiveRoleName, currentCategoryObj)}

      </div>
    `;

    bindEvents();
  }

  /**
   * Render individual step content based on current active step
   */
  function renderStepContent(step, selectedRole, effectiveRoleName, currentCategoryObj) {
    if (step === 1) {
      return renderStep1(selectedRole, effectiveRoleName, currentCategoryObj);
    } else if (step === 2) {
      return renderStep2(selectedRole, effectiveRoleName);
    } else {
      return renderStep3(selectedRole, effectiveRoleName);
    }
  }

  /**
   * STEP 1: INTERVIEW TRACK & RESUME PARSER
   */
  function renderStep1(selectedRole, effectiveRoleName, currentCategoryObj) {
    const isCustomRole = selectedRole.id === 'custom_role';
    const filteredRoles = getFilteredRoles();

    return `
      <div class="fade-in">
        
        <!-- Track Category Selector & Roles Grid -->
        <div class="glass-card" style="padding: 1.85rem; margin-bottom: 2rem; border-radius: var(--radius-lg);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.4rem;">
            <div>
              <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin: 0 0 0.25rem;">
                Select Interview Track &amp; Target Role
              </h2>
              <p style="font-size: 0.86rem; color: var(--text-muted); margin: 0;">
                Choose one of the 4 specialization tracks, then click your target role.
              </p>
            </div>

            <!-- Search Filter Bar -->
            <div style="display: flex; align-items: center; gap: 0.65rem; min-width: 320px;">
              <div style="position: relative; width: 100%;">
                <input 
                  type="text" 
                  id="role-search-input" 
                  class="input-text" 
                  value="${searchQuery}" 
                  placeholder="Search by role, skill, or keyword..." 
                  style="padding-left: 2.3rem; padding-top: 0.55rem; padding-bottom: 0.55rem; font-size: 0.88rem; border-radius: 999px;"
                />
                <span style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); font-size: 0.95rem; color: var(--text-muted); pointer-events: none;">🔍</span>
                ${searchQuery ? `<button type="button" id="clear-role-search-btn" style="position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem;">✕</button>` : ''}
              </div>
            </div>
          </div>

          <!-- The 4 Main Track Category Pills -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle);">
            ${ROLE_CATEGORIES.map(cat => {
              const isActive = activeRoleFilter === cat.id;
              return `
                <button 
                  type="button" 
                  class="role-filter-pill ${isActive ? 'active' : ''}" 
                  data-filter="${cat.id}"
                  style="
                    padding: 0.85rem 1rem; 
                    border-radius: var(--radius-md); 
                    font-size: 0.92rem; 
                    font-weight: 700; 
                    cursor: pointer; 
                    border: 1.5px solid ${isActive ? 'var(--secondary)' : 'var(--border-subtle)'}; 
                    background: ${isActive ? 'linear-gradient(135deg, rgba(2,132,199,0.18) 0%, rgba(99,102,241,0.12) 100%)' : 'rgba(255,255,255,0.03)'}; 
                    color: ${isActive ? '#38bdf8' : 'var(--text-main)'}; 
                    box-shadow: ${isActive ? '0 0 16px rgba(2,132,199,0.22)' : 'none'};
                    transition: all 0.2s ease; 
                    display: flex; 
                    align-items: center; 
                    gap: 0.65rem;
                    text-align: left;
                  "
                >
                  <span style="font-size: 1.5rem;">${cat.icon}</span>
                  <div>
                    <div style="line-height: 1.2;">${cat.label}</div>
                    <div style="font-size: 0.72rem; color: ${isActive ? '#93c5fd' : 'var(--text-muted)'}; font-weight: 500; margin-top: 2px;">
                      ${cat.roleIds.length} Roles
                    </div>
                  </div>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Active Category Description -->
          ${!searchQuery.trim() ? `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; padding: 0.75rem 1.1rem; background: rgba(2,132,199,0.06); border-radius: var(--radius-sm); border: 1px solid rgba(2,132,199,0.2);">
              <div style="display: flex; align-items: center; gap: 0.65rem;">
                <span style="font-size: 1.25rem;">${(ROLE_CATEGORIES.find(c => c.id === activeRoleFilter) || ROLE_CATEGORIES[0]).icon}</span>
                <span style="font-size: 0.86rem; color: var(--text-secondary);">
                  <strong style="color: #fff;">${(ROLE_CATEGORIES.find(c => c.id === activeRoleFilter) || ROLE_CATEGORIES[0]).label}:</strong>
                  ${(ROLE_CATEGORIES.find(c => c.id === activeRoleFilter) || ROLE_CATEGORIES[0]).description}
                </span>
              </div>
            </div>
          ` : ''}

          <!-- Roles Grid for Selected Category -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem;" id="roles-grid-container">
            ${filteredRoles.map(role => {
              const isSelected = selectedRoleId === role.id;
              const assignedInterviewer = getInterviewer(role.defaultInterviewerId || role.id);
              return `
                <div 
                  class="role-selection-card ${isSelected ? 'active' : ''}" 
                  data-role-id="${role.id}"
                  style="
                    position: relative;
                    padding: 1.25rem 1.35rem;
                    border-radius: var(--radius-md);
                    border: 1.5px solid ${isSelected ? 'var(--secondary)' : 'var(--border-subtle)'};
                    background: ${isSelected ? 'linear-gradient(145deg, rgba(2,132,199,0.12) 0%, rgba(99,102,241,0.08) 100%)' : 'rgba(15,23,42,0.45)'};
                    box-shadow: ${isSelected ? '0 0 22px rgba(2,132,199,0.25), inset 0 0 12px rgba(2,132,199,0.08)' : 'none'};
                    cursor: pointer;
                    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                  "
                >
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.65rem;">
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.65rem; line-height: 1;">${role.icon}</span>
                        <div>
                          <div style="font-weight: 800; font-size: 1.05rem; color: ${isSelected ? '#38bdf8' : 'var(--text-main)'}; letter-spacing: -0.01em;">
                            ${role.title}
                          </div>
                          <span style="font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${isSelected ? '#93c5fd' : 'var(--text-muted)'};">
                            ${role.badge}
                          </span>
                        </div>
                      </div>

                      <div style="
                        width: 22px; 
                        height: 22px; 
                        border-radius: 50%; 
                        border: 1.5px solid ${isSelected ? 'var(--secondary)' : 'var(--border-subtle)'};
                        background: ${isSelected ? 'var(--secondary)' : 'transparent'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #ffffff;
                        font-size: 0.72rem;
                        font-weight: 800;
                        flex-shrink: 0;
                        transition: all 0.2s ease;
                      ">
                        ${isSelected ? '✓' : ''}
                      </div>
                    </div>

                    <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.48; margin: 0.45rem 0 0.85rem; min-height: 2.8rem;">
                      ${role.description}
                    </p>
                  </div>

                  <div style="padding-top: 0.65rem; border-top: 1px solid ${isSelected ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)'};">
                    <div style="display: flex; flex-wrap: wrap; gap: 0.32rem;">
                      ${role.tags.slice(0, 4).map(tag => `
                        <span style="
                          font-size: 0.7rem; 
                          padding: 0.15rem 0.5rem; 
                          border-radius: 4px; 
                          background: ${isSelected ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)'}; 
                          color: ${isSelected ? '#bae6fd' : 'var(--text-muted)'};
                          border: 1px solid ${isSelected ? 'rgba(56,189,248,0.25)' : 'transparent'};
                        ">
                          ${tag}
                        </span>
                      `).join('')}
                    </div>

                    <!-- Interviewer Avatar & Gender Voice Preview for this track -->
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.65rem; padding-top: 0.5rem; border-top: 1px solid ${isSelected ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)'};">
                      <div style="display: flex; align-items: center; gap: 0.45rem;">
                        <img 
                          src="${assignedInterviewer.avatarImage}" 
                          alt="${assignedInterviewer.name}" 
                          style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.15)'};" 
                        />
                        <span style="font-size: 0.72rem; color: ${isSelected ? '#e0f2fe' : '#cbd5e1'}; font-weight: 700;">${assignedInterviewer.name}</span>
                      </div>
                      <span class="badge ${assignedInterviewer.gender === 'male' ? 'badge-cyan' : 'badge-purple'}" style="font-size: 0.62rem; padding: 0.12rem 0.45rem;">
                        ${assignedInterviewer.gender === 'male' ? '👨 Male Voice' : '👩 Female Voice'}
                      </span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Custom Role Input Box -->
          ${isCustomRole ? `
            <div class="fade-in" style="margin-top: 1.5rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(99,102,241,0.08) 100%); border: 1.5px solid rgba(168,85,247,0.35); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem;">
                <span style="font-size: 1.3rem;">✨</span>
                <div>
                  <strong style="color: #ffffff; font-size: 0.98rem;">Define Your Custom Target Role</strong>
                  <div style="font-size: 0.78rem; color: #d8b4fe;">Enter any job title to generate calibrated AI interview questions and rubrics.</div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 0.75rem; align-items: center; margin-top: 0.75rem;">
                <input 
                  type="text" 
                  id="custom-role-input-box" 
                  class="input-text" 
                  value="${customRoleTitle}" 
                  placeholder="e.g. Cloud DevOps Architect, Mobile iOS Lead, Product Marketing Manager..." 
                  style="font-size: 0.95rem; font-weight: 600; padding: 0.75rem 1rem;" 
                  autofocus
                />
                <button type="button" id="confirm-custom-role-btn" class="btn btn-primary" style="padding: 0.75rem 1.5rem; font-weight: 700; border-radius: var(--radius-sm);">
                  Set Role
                </button>
              </div>
            </div>
          ` : ''}

        </div>

        <!-- Resume Parser Card (Appears in Step 1) -->
        <div class="glass-card" style="padding: 1.85rem; margin-bottom: 2rem; border-radius: var(--radius-lg);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.35rem;">📄</span>
              <h3 style="font-size: 1.2rem; font-weight: 800; color: #fff; margin: 0;">Resume Parser &amp; Project Hook (Optional)</h3>
            </div>
            <span class="badge badge-emerald">PDF / DOCX</span>
          </div>
          <p style="font-size: 0.86rem; color: var(--text-secondary); margin-bottom: 1.25rem; line-height: 1.45;">
            Upload your resume to extract validated skills, projects, and automatically calibrate customized project defense questions for your round.
          </p>

          <div style="display: grid; grid-template-columns: ${parsedResumeData ? '1fr 1fr' : '1fr'}; gap: 1.5rem; align-items: center;">
            <!-- Upload Drop Area -->
            <div id="resume-drop-zone" style="border: 2px dashed rgba(255,255,255,0.18); border-radius: var(--radius-md); padding: 1.8rem 1rem; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(15,23,42,0.45);">
              <input type="file" id="resume-file-input" accept=".pdf,.docx,.txt" style="display: none;" />
              <div style="width: 46px; height: 46px; border-radius: 50%; background: rgba(99,102,241,0.15); color: var(--primary-light); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              </div>
              <div style="font-weight: 700; font-size: 0.95rem; color: #fff;">Click or Drag Resume Here</div>
              <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.25rem;">Supports text-based PDF or Word (.docx)</div>
            </div>

            <!-- Parsed Results -->
            ${parsedResumeData ? `
              <div style="padding: 1.25rem; background: rgba(16,185,129,0.08); border: 1.5px solid rgba(16,185,129,0.3); border-radius: var(--radius-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                  <span style="font-weight: 800; font-size: 0.9rem; color: #34d399;">✓ Extracted from ${parsedResumeData.fileName}</span>
                  <span class="badge badge-emerald" style="font-size: 0.72rem;">${parsedResumeData.skills.length} Skills</span>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.75rem;">
                  ${parsedResumeData.skills.slice(0, 10).map(s => `
                    <span class="badge" style="background: rgba(255,255,255,0.08); font-size: 0.72rem; color: var(--text-main);">${s}</span>
                  `).join('')}
                </div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.6rem;">
                  <strong style="color: #fff;">Projects:</strong> ${parsedResumeData.projects.join(', ') || 'Identified'}
                </div>
                <span class="badge badge-purple" style="font-size: 0.72rem;">${parsedResumeData.generatedQuestions.length} Personalized Project Defense Questions Attached</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Step 1 Bottom Action Bar -->
        <div class="glass-card" style="padding: 1.25rem 1.75rem; border-radius: var(--radius-lg); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.8rem;">${selectedRole.icon}</span>
            <div>
              <div style="font-size: 0.74rem; text-transform: uppercase; font-weight: 700; color: var(--secondary);">Selected Target Role</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">${effectiveRoleName}</div>
            </div>
          </div>

          <button type="button" id="step1-next-btn" class="btn btn-primary btn-lg" style="padding: 0.85rem 2rem; font-weight: 800; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.6rem; box-shadow: 0 0 25px rgba(99,102,241,0.4);">
            <span>Continue to Seniority &amp; Duration</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>

      </div>
    `;
  }

  /**
   * STEP 2: EXPERIENCE SENIORITY ACCORDING TO ROLE & SESSION DURATION
   */
  function renderStep2(selectedRole, effectiveRoleName) {
    const assignedInterviewer = getInterviewer(selectedRole.defaultInterviewerId || selectedRole.id);
    selectedPersona = assignedInterviewer.id;

    return `
      <div class="fade-in">
        
        <!-- Role Banner Recap -->
        <div class="glass-card" style="padding: 1.15rem 1.6rem; margin-bottom: 1.75rem; border-radius: var(--radius-lg); display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--secondary);">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <span style="font-size: 1.8rem;">${selectedRole.icon}</span>
            <div>
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--secondary);">Target Role For This Round</div>
              <div style="font-size: 1.2rem; font-weight: 800; color: #fff;">${effectiveRoleName}</div>
            </div>
          </div>

          <button type="button" id="step2-change-role-btn" class="btn btn-secondary btn-sm" style="border-radius: 9999px; font-weight: 700;">
            ← Change Role
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1.35fr 1fr; gap: 1.75rem; align-items: start; margin-bottom: 2rem;">
          
          <!-- Experience Seniority according to role -->
          <div class="glass-card" style="padding: 1.85rem; border-radius: var(--radius-lg);">
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem;">
              <span style="font-size: 1.3rem;">🎖️</span>
              <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin: 0;">
                Experience Seniority Level
              </h2>
            </div>
            <p style="font-size: 0.86rem; color: var(--text-muted); margin: 0 0 1.35rem;">
              Calibrates the technical rigor, rubric thresholds, and follow-up depth for ${effectiveRoleName}.
            </p>

            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${SENIORITY_LEVELS.map(lvl => {
                const isSelected = selectedLevel === lvl.id;
                return `
                  <div 
                    class="seniority-level-card glass-card ${isSelected ? 'active' : ''}" 
                    data-level="${lvl.id}"
                    style="
                      padding: 1.15rem 1.25rem; 
                      cursor: pointer; 
                      border-radius: var(--radius-md); 
                      border: 1.5px solid ${isSelected ? 'var(--primary-light)' : 'var(--border-subtle)'}; 
                      background: ${isSelected ? 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(2,132,199,0.1) 100%)' : 'rgba(15,23,42,0.4)'}; 
                      box-shadow: ${isSelected ? '0 0 18px rgba(99,102,241,0.25)' : 'none'};
                      transition: all 0.2s ease;
                      display: flex;
                      align-items: center;
                      gap: 1rem;
                    "
                  >
                    <span style="font-size: 1.7rem;">${lvl.icon}</span>
                    <div style="flex: 1;">
                      <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="font-weight: 800; font-size: 1.02rem; color: ${isSelected ? '#ffffff' : 'var(--text-main)'};">
                          ${lvl.title}
                        </div>
                        <span class="badge ${isSelected ? 'badge-cyan' : ''}" style="font-size: 0.72rem;">${lvl.sub}</span>
                      </div>
                      <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.3rem 0 0; line-height: 1.35;">
                        ${lvl.desc}
                      </p>
                    </div>

                    <div style="
                      width: 22px; height: 22px; border-radius: 50%;
                      border: 1.5px solid ${isSelected ? 'var(--primary-light)' : 'var(--border-subtle)'};
                      background: ${isSelected ? 'var(--primary)' : 'transparent'};
                      display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.72rem; font-weight: 800;
                    ">
                      ${isSelected ? '✓' : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Session Duration & Guardrails -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <div class="glass-card" style="padding: 1.85rem; border-radius: var(--radius-lg);">
              <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem;">
                <span style="font-size: 1.3rem;">⏱️</span>
                <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin: 0;">
                  Session Duration
                </h2>
              </div>
              <p style="font-size: 0.86rem; color: var(--text-muted); margin: 0 0 1.25rem;">
                Select your round length to match realistic interview constraints.
              </p>

              <!-- Presets Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
                ${DURATION_PRESETS.map(preset => {
                  const isSelected = timerMinutes === preset.minutes;
                  return `
                    <div 
                      class="duration-preset-card glass-card ${isSelected ? 'active' : ''}" 
                      data-mins="${preset.minutes}"
                      style="
                        padding: 1rem; 
                        cursor: pointer; 
                        border-radius: var(--radius-md); 
                        border: 1.5px solid ${isSelected ? 'var(--secondary)' : 'var(--border-subtle)'}; 
                        background: ${isSelected ? 'rgba(2,132,199,0.18)' : 'rgba(15,23,42,0.4)'}; 
                        box-shadow: ${isSelected ? '0 0 16px rgba(2,132,199,0.25)' : 'none'};
                        text-align: center;
                        transition: all 0.2s ease;
                      "
                    >
                      <div style="font-size: 1.15rem; font-weight: 800; color: ${isSelected ? '#38bdf8' : '#fff'};">
                        ${preset.label}
                      </div>
                      <span class="badge ${isSelected ? 'badge-cyan' : ''}" style="font-size: 0.65rem; margin: 0.25rem 0;">${preset.badge}</span>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${preset.desc}</div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Range Slider -->
              <div class="input-group" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <label class="input-label" style="margin: 0;">Custom Duration Slider</label>
                  <span id="timer-val-display" style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 800; color: var(--secondary);">${timerMinutes} Minutes</span>
                </div>
                <input type="range" id="setup-timer" min="5" max="45" step="5" value="${timerMinutes}" style="width: 100%; accent-color: var(--secondary);" />
              </div>

              <!-- Audio Recording Opt-In -->
              <div style="padding: 0.85rem; background: rgba(0,0,0,0.25); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">
                  <input type="checkbox" id="setup-save-rec" ${saveRecording ? 'checked' : ''} style="margin-top: 3px; accent-color: var(--primary);" />
                  <span>
                    <strong style="color: #fff;">Opt-in Audio Recording:</strong> Replay responses after interview to inspect vocal inflection and pacing.
                  </span>
                </label>
              </div>

            </div>

            <!-- Automatically Allotted AI Evaluator & Voice -->
            <div class="glass-card" style="padding: 1.5rem; border-radius: var(--radius-lg); border-left: 4px solid var(--secondary); background: linear-gradient(135deg, rgba(2,132,199,0.08) 0%, rgba(15,23,42,0.6) 100%);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.95rem;">
                <div>
                  <label class="input-label" style="margin: 0; display: block; font-weight: 800; font-size: 0.95rem; color: #fff;">Calibrated AI Evaluator &amp; Voice</label>
                  <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">Assigned automatically to match your target domain.</div>
                </div>
                <span class="badge badge-emerald" style="font-size: 0.68rem;">✓ Auto-Allotted</span>
              </div>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <img 
                  src="${assignedInterviewer.avatarImage}" 
                  alt="${assignedInterviewer.name}" 
                  style="width: 58px; height: 58px; border-radius: 50%; object-fit: cover; border: 2.5px solid var(--secondary); flex-shrink: 0; box-shadow: 0 4px 14px rgba(0,0,0,0.4);" 
                />
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <span style="font-weight: 800; font-size: 1.08rem; color: #fff;">${assignedInterviewer.name}</span>
                    <span class="badge ${assignedInterviewer.gender === 'male' ? 'badge-cyan' : 'badge-purple'}" style="font-size: 0.64rem; padding: 0.15rem 0.5rem;">
                      ${assignedInterviewer.gender === 'male' ? '👨 Male Voice' : '👩 Female Voice'}
                    </span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--secondary); font-weight: 600; margin-top: 2px;">${assignedInterviewer.title}</div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">${assignedInterviewer.tone}</div>
                </div>
              </div>

              <!-- Note: Hybrid Answering Mode Accessible Live During Interview -->
              <div style="margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 0.65rem; font-size: 0.76rem; color: var(--text-muted);">
                <span style="font-size: 1.15rem;">⚡</span>
                <span style="line-height: 1.4;"><strong style="color: #e2e8f0;">Hybrid Answering Flow:</strong> You can switch freely between <em>Direct Auto-Listen</em> and <em>Click to Speak</em> anytime directly inside the active interview screen.</span>
              </div>
            </div>

          </div>

        </div>

        <!-- Step 2 Bottom Navigation -->
        <div class="glass-card" style="padding: 1.25rem 1.75rem; border-radius: var(--radius-lg); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <button type="button" id="step2-back-btn" class="btn btn-secondary" style="padding: 0.8rem 1.8rem; font-weight: 700; border-radius: 9999px;">
            ← Back to Track &amp; Resume
          </button>

          <button type="button" id="step2-next-btn" class="btn btn-primary btn-lg" style="padding: 0.85rem 2.2rem; font-weight: 800; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.6rem; box-shadow: 0 0 25px rgba(99,102,241,0.4);">
            <span>Review &amp; Ready to Begin</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>

      </div>
    `;
  }

  /**
   * STEP 3: READY TO BEGIN (ASK USER TO START INTERVIEW)
   */
  function renderStep3(selectedRole, effectiveRoleName) {
    const questions = getQuestionsForRole(selectedRole.categoryKey, customRoleTitle, selectedLevel);
    const activePersonaObj = getInterviewer(selectedPersona);

    return `
      <div class="fade-in">
        
        <div class="glass-card" style="padding: 2.25rem; margin-bottom: 2rem; border-radius: var(--radius-lg); text-align: center; border: 1.5px solid rgba(16,185,129,0.35); background: linear-gradient(180deg, rgba(16,185,129,0.06) 0%, rgba(15,23,42,0.6) 100%);">
          
          <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(2,132,199,0.2) 100%); border: 2px solid rgba(16,185,129,0.5); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 1.25rem; box-shadow: 0 0 30px rgba(16,185,129,0.3);">
            🎯
          </div>

          <h2 style="font-size: 1.9rem; font-weight: 800; color: #fff; margin: 0 0 0.5rem; letter-spacing: -0.02em;">
            Ready to Begin Your Interview
          </h2>
          <p style="font-size: 1.02rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 2rem; line-height: 1.5;">
            Your AI interviewer and real-time proctoring telemetry are calibrated. Please review your round specifications below before starting.
          </p>

          <!-- Specifications Summary Grid -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.85rem; max-width: 1000px; margin: 0 auto 2.25rem; text-align: left;">
            
            <div style="padding: 1rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: var(--secondary); margin-bottom: 0.35rem;">Target Role</div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="font-size: 1.25rem;">${selectedRole.icon}</span>
                <strong style="color: #fff; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${effectiveRoleName}</strong>
              </div>
            </div>

            <div style="padding: 1rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: var(--primary-light); margin-bottom: 0.35rem;">Seniority Level</div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="font-size: 1.25rem;">🎖️</span>
                <strong style="color: #fff; font-size: 0.92rem;">${selectedLevel}</strong>
              </div>
            </div>

            <div style="padding: 1rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: #34d399; margin-bottom: 0.35rem;">Duration</div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="font-size: 1.25rem;">⏱️</span>
                <strong style="color: #fff; font-size: 0.92rem;">${timerMinutes} Minutes</strong>
              </div>
            </div>

            <div style="padding: 1rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: #38bdf8; margin-bottom: 0.35rem;">Answering Flow</div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="font-size: 1.25rem;">⚡</span>
                <div>
                  <strong style="color: #fff; font-size: 0.92rem; display: block;">Hybrid Active</strong>
                  <span style="font-size: 0.66rem; color: #7dd3fc; font-weight: 600;">Switchable live</span>
                </div>
              </div>
            </div>

            <div style="padding: 1rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: #d8b4fe; margin-bottom: 0.35rem;">Allotted Interviewer</div>
              <div style="display: flex; align-items: center; gap: 0.55rem;">
                <img 
                  src="${activePersonaObj.avatarImage}" 
                  alt="${activePersonaObj.name}" 
                  style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid rgba(255,255,255,0.25);" 
                />
                <div style="min-width: 0;">
                  <strong style="color: #fff; font-size: 0.92rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${activePersonaObj.name}</strong>
                  <span style="font-size: 0.66rem; color: ${activePersonaObj.gender === 'male' ? '#38bdf8' : '#e879f9'}; font-weight: 700;">
                    ${activePersonaObj.gender === 'male' ? '👨 Male Voice' : '👩 Female Voice'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <!-- Readiness Checklist -->
          <div style="max-width: 720px; margin: 0 auto 2.25rem; padding: 1.25rem; background: rgba(0,0,0,0.3); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.86rem; color: #34d399;">
              <span>✓</span> Microphone Ready
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.86rem; color: #34d399;">
              <span>✓</span> Camera &amp; AI Proctoring Active
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.86rem; color: #34d399;">
              <span>✓</span> Speech Engine Calibrated
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.86rem; color: #34d399;">
              <span>✓</span> Rubric Loaded (${questions.length} Questions)
            </div>
          </div>

          <!-- The Start Interview Prompt & Main Launch Button -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <button 
              type="button" 
              id="launch-interview-btn" 
              class="btn btn-primary" 
              style="
                padding: 1.15rem 3.5rem; 
                font-size: 1.15rem; 
                font-weight: 800; 
                border-radius: 9999px; 
                background: linear-gradient(135deg, #10b981 0%, #0284c7 100%); 
                box-shadow: 0 0 40px rgba(16,185,129,0.5); 
                display: inline-flex; 
                align-items: center; 
                gap: 0.75rem; 
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              "
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Start Interview Now</span>
            </button>

            <button type="button" id="step3-back-btn" class="btn btn-secondary btn-sm" style="border-radius: 9999px; margin-top: 0.5rem; color: var(--text-muted);">
              ← Back to Modify Settings
            </button>
          </div>

        </div>

      </div>
    `;
  }

  function bindEvents() {
    // Stepper navigation buttons
    container.querySelectorAll('.wizard-step-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const targetStep = parseInt(pill.dataset.gotoStep, 10);
        if (targetStep <= currentStep || targetStep === currentStep + 1) {
          currentStep = targetStep;
          render();
        }
      });
    });

    // Step 1: Role Category Filter Pills
    container.querySelectorAll('.role-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        activeRoleFilter = pill.dataset.filter;
        render();
      });
    });

    // Step 1: Role Card Selection
    container.querySelectorAll('.role-selection-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedRoleId = card.dataset.roleId;
        const roleObj = INTERVIEW_ROLES.find(r => r.id === selectedRoleId);
        if (roleObj) {
          selectedPersona = roleObj.defaultInterviewerId || getInterviewerForRole(roleObj.id).id;
        }
        render();
      });
    });

    // Step 1: Search Input
    const searchInput = container.querySelector('#role-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
        const newSearchInput = container.querySelector('#role-search-input');
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(searchQuery.length, searchQuery.length);
        }
      });
    }

    const clearSearchBtn = container.querySelector('#clear-role-search-btn');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchQuery = '';
        render();
      });
    }

    // Custom Role Input
    const customRoleInput = container.querySelector('#custom-role-input-box');
    const confirmCustomBtn = container.querySelector('#confirm-custom-role-btn');
    if (customRoleInput) {
      customRoleInput.addEventListener('input', (e) => {
        customRoleTitle = e.target.value;
      });
      customRoleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          render();
        }
      });
    }
    if (confirmCustomBtn) {
      confirmCustomBtn.addEventListener('click', () => render());
    }

    // Step 1: Resume Drop & File Select
    const dropZone = container.querySelector('#resume-drop-zone');
    const fileInput = container.querySelector('#resume-file-input');
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--secondary)';
        dropZone.style.background = 'rgba(6,182,212,0.1)';
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'rgba(255,255,255,0.18)';
        dropZone.style.background = 'rgba(15,23,42,0.45)';
      });

      dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          await handleResumeFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
          await handleResumeFile(e.target.files[0]);
        }
      });
    }

    // Step 1: Next Button -> Step 2
    const step1NextBtn = container.querySelector('#step1-next-btn');
    if (step1NextBtn) {
      step1NextBtn.addEventListener('click', () => {
        currentStep = 2;
        render();
      });
    }

    // Step 2: Seniority Level Card Selection
    container.querySelectorAll('.seniority-level-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedLevel = card.dataset.level;
        render();
      });
    });

    // Step 2: Duration Presets
    container.querySelectorAll('.duration-preset-card').forEach(card => {
      card.addEventListener('click', () => {
        timerMinutes = parseInt(card.dataset.mins, 10);
        render();
      });
    });

    // Step 2: Duration Slider
    const timerSlider = container.querySelector('#setup-timer');
    const timerDisplay = container.querySelector('#timer-val-display');
    if (timerSlider && timerDisplay) {
      timerSlider.addEventListener('input', (e) => {
        timerMinutes = parseInt(e.target.value, 10);
        timerDisplay.textContent = `${timerMinutes} Minutes`;
      });
    }

    // Step 2: Opt-in Recording
    const recCheckbox = container.querySelector('#setup-save-rec');
    if (recCheckbox) {
      recCheckbox.addEventListener('change', (e) => {
        saveRecording = e.target.checked;
      });
    }

    // Step 2 Navigation
    const step2BackBtn = container.querySelector('#step2-back-btn');
    if (step2BackBtn) {
      step2BackBtn.addEventListener('click', () => {
        currentStep = 1;
        render();
      });
    }

    const step2ChangeRoleBtn = container.querySelector('#step2-change-role-btn');
    if (step2ChangeRoleBtn) {
      step2ChangeRoleBtn.addEventListener('click', () => {
        currentStep = 1;
        render();
      });
    }

    const step2NextBtn = container.querySelector('#step2-next-btn');
    if (step2NextBtn) {
      step2NextBtn.addEventListener('click', () => {
        currentStep = 3;
        render();
      });
    }

    // Step 3 Navigation & Launch
    const step3BackBtn = container.querySelector('#step3-back-btn');
    if (step3BackBtn) {
      step3BackBtn.addEventListener('click', () => {
        currentStep = 2;
        render();
      });
    }

    const launchBtn = container.querySelector('#launch-interview-btn');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        const selectedRole = getSelectedRole();
        const effectiveTitle = (selectedRole.id === 'custom_role' && customRoleTitle.trim()) 
          ? customRoleTitle.trim() 
          : selectedRole.title;

        let questions = [];
        if (questionSource === 'resume' && parsedResumeData) {
          questions = [...parsedResumeData.generatedQuestions];
        } else if (questionSource === 'custom' && customQuestionList.length > 0) {
          questions = [...customQuestionList];
        } else {
          questions = getQuestionsForRole(selectedRole.categoryKey, customRoleTitle, selectedLevel);
        }

        const setupPayload = {
          role: effectiveTitle,
          roleId: selectedRole.id,
          level: selectedLevel,
          category: selectedRole.categoryKey,
          mode: selectedMode,
          persona: selectedPersona,
          answerMode,
          timerMinutes,
          saveRecording,
          projectName: assignedProject,
          questions,
          parsedResumeData
        };

        if (onStartInterview) {
          onStartInterview(setupPayload);
        }
      });
    }
  }

  async function handleResumeFile(file) {
    const dropZone = container.querySelector('#resume-drop-zone');
    if (dropZone) {
      dropZone.innerHTML = `<div style="color: var(--secondary);">Parsing & extracting skills from ${file.name}...</div>`;
    }
    parsedResumeData = await parseResumeFile(file);
    if (parsedResumeData.projects[0]) {
      assignedProject = parsedResumeData.projects[0];
    }

    // Connect to AI question generation endpoint for resume projects
    try {
      const selectedRole = getSelectedRole();
      const res = await fetch('http://localhost:8000/api/ai/generate-questions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          role: selectedRole.title,
          level: selectedLevel,
          category: selectedRole.categoryKey,
          resumeText: `${parsedResumeData.rawText || ''}\nSkills: ${(parsedResumeData.skills || []).join(', ')}\nProjects: ${(parsedResumeData.projects || []).join(', ')}`,
          count: 3
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.questions?.length) {
          parsedResumeData.generatedQuestions = [
            ...json.questions,
            ...parsedResumeData.generatedQuestions
          ];
        }
      }
    } catch (e) {
      // Local parsed questions remain intact
    }

    questionSource = 'resume';
    render();
  }

  render();
}
