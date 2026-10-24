import { QUESTION_BANK, PERSONAS, INTERVIEW_MODES } from '../data/questionBank.js';
import { parseResumeFile } from './resumeParser.js';

export function renderInterviewSetup(container, currentUser, onStartInterview) {
  let parsedResumeData = null;
  let customQuestionList = [];
  let selectedCategory = 'Python';
  let selectedLevel = 'Mid Level';
  let selectedMode = 'practice';
  let selectedPersona = 'strict';
  let questionSource = 'builtin'; // 'builtin' | 'resume' | 'custom'
  let timerMinutes = 15;
  let saveRecording = true;
  let assignedProject = 'Distributed Backend Core';

  function render() {
    container.innerHTML = `
      <div class="fade-in">
        <!-- Header Banner -->
        <div style="margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem;">
            <span class="badge badge-cyan">AI Simulation Orchestrator</span>
            <span class="badge badge-purple">${currentUser.role} Mode</span>
          </div>
          <h1 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.03em; color: #fff;">
            Configure Your Mock Interview
          </h1>
          <p style="color: var(--text-secondary); max-width: 780px; margin-top: 0.4rem; font-size: 1rem;">
            Select your target specialization, assign an evaluation persona, optionally upload your resume to extract real project hooks, and configure rigorous explainable scoring rubrics.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 1.8rem; align-items: start;">
          <!-- Left Column: Core Setup Controls -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">

            <!-- Section 1: Role, Level & Category -->
            <div class="glass-card" style="padding: 1.8rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.6rem;">
                <span style="color: var(--primary-light);">01</span> Target Specialization & Track
              </h3>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.25rem;">
                <div class="input-group" style="margin: 0;">
                  <label class="input-label">Target Role</label>
                  <input type="text" id="setup-target-role" class="input-text" value="${currentUser.targetRole || 'Full Stack Engineer'}" placeholder="e.g. Backend Software Engineer" />
                </div>

                <div class="input-group" style="margin: 0;">
                  <label class="input-label">Experience Seniority</label>
                  <select id="setup-level" class="input-select">
                    <option value="Fresher / Entry" ${selectedLevel === 'Fresher / Entry' ? 'selected' : ''}>Fresher / Entry (0-1 yrs)</option>
                    <option value="Mid Level" ${selectedLevel === 'Mid Level' ? 'selected' : ''}>Mid Level (2-4 yrs)</option>
                    <option value="Senior" ${selectedLevel === 'Senior' ? 'selected' : ''}>Senior / Lead (5+ yrs)</option>
                    <option value="Staff / Architect" ${selectedLevel === 'Staff / Architect' ? 'selected' : ''}>Staff / Architect</option>
                  </select>
                </div>
              </div>

              <div class="input-group" style="margin: 0;">
                <label class="input-label">Core Interview Category</label>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; margin-top: 0.35rem;">
                  ${['Python', 'SQL', 'Aptitude', 'HR', 'Behavioral'].map(cat => `
                    <button type="button" class="category-btn glass-card ${selectedCategory === cat ? 'active' : ''}" data-cat="${cat}" style="padding: 0.75rem 0.5rem; text-align: center; border: 1px solid ${selectedCategory === cat ? 'var(--secondary)' : 'var(--border-subtle)'}; background: ${selectedCategory === cat ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.4)'}; cursor: pointer; border-radius: var(--radius-sm); transition: all 0.2s;">
                      <div style="font-weight: 700; font-size: 0.95rem; color: ${selectedCategory === cat ? '#38bdf8' : 'var(--text-main)'};">${cat}</div>
                      <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${QUESTION_BANK[cat] ? QUESTION_BANK[cat].length + ' questions' : 'Custom'}</div>
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Section 2: Persona & Mode -->
            <div class="glass-card" style="padding: 1.8rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.6rem;">
                <span style="color: var(--secondary);">02</span> Evaluation Persona & Mode
              </h3>

              <div style="margin-bottom: 1.5rem;">
                <label class="input-label" style="margin-bottom: 0.5rem; display: block;">Interviewer Persona</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                  ${PERSONAS.map(p => `
                    <div class="persona-card glass-card ${selectedPersona === p.id ? 'active' : ''}" data-persona="${p.id}" style="padding: 1rem; cursor: pointer; border: 1px solid ${selectedPersona === p.id ? 'var(--primary)' : 'var(--border-subtle)'}; background: ${selectedPersona === p.id ? 'rgba(99,102,241,0.12)' : 'rgba(15,23,42,0.4)'}; border-radius: var(--radius-sm); transition: all 0.2s;">
                      <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
                        <span style="font-size: 1.4rem;">${p.avatar}</span>
                        <div>
                          <div style="font-weight: 700; font-size: 0.95rem; color: #fff;">${p.name}</div>
                          <span class="badge" style="background: rgba(255,255,255,0.06); font-size: 0.65rem; color: var(--text-secondary);">${p.badge}</span>
                        </div>
                      </div>
                      <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.3;">${p.tone}</p>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div>
                <label class="input-label" style="margin-bottom: 0.5rem; display: block;">Simulation Mode</label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem;">
                  ${INTERVIEW_MODES.map(m => `
                    <div class="mode-card glass-card ${selectedMode === m.id ? 'active' : ''}" data-mode="${m.id}" style="padding: 1rem; cursor: pointer; border: 1px solid ${selectedMode === m.id ? 'var(--accent-purple)' : 'var(--border-subtle)'}; background: ${selectedMode === m.id ? 'rgba(168,85,247,0.12)' : 'rgba(15,23,42,0.4)'}; border-radius: var(--radius-sm); transition: all 0.2s;">
                      <div style="font-weight: 700; font-size: 0.9rem; color: #fff; margin-bottom: 0.2rem;">${m.name}</div>
                      <span class="badge" style="background: rgba(168,85,247,0.2); color: #d8b4fe; font-size: 0.65rem; margin-bottom: 0.4rem;">${m.badge}</span>
                      <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.3;">${m.description}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Section 3: Question Bank & Project Assignment -->
            <div class="glass-card" style="padding: 1.8rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.6rem;">
                <span style="color: var(--accent-emerald);">03</span> Question Sourcing & Project Assignment
              </h3>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.2rem;">
                <div class="input-group" style="margin: 0;">
                  <label class="input-label">Assign To Project</label>
                  <input type="text" id="setup-project-name" class="input-text" value="${assignedProject}" placeholder="e.g. Distributed Task Queue" />
                  <span style="font-size: 0.72rem; color: var(--text-muted);">Links questions and defense rubrics to this portfolio item</span>
                </div>

                <div class="input-group" style="margin: 0;">
                  <label class="input-label">Question Bank Origin</label>
                  <select id="setup-qsource" class="input-select">
                    <option value="builtin" ${questionSource === 'builtin' ? 'selected' : ''}>Standard Peer-Reviewed Bank</option>
                    <option value="resume" ${questionSource === 'resume' ? 'selected' : ''} ${!parsedResumeData ? 'disabled' : ''}>Resume Parsed Questions ${parsedResumeData ? '✓' : '(Upload first)'}</option>
                    <option value="custom" ${questionSource === 'custom' ? 'selected' : ''}>Add Custom Question Prompts</option>
                  </select>
                </div>
              </div>

              <!-- Optional Custom Question Input -->
              <div id="custom-question-box" style="display: ${questionSource === 'custom' ? 'block' : 'none'}; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); border: 1px dashed var(--border-subtle); margin-top: 0.5rem;">
                <label class="input-label">Custom Question Prompt</label>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
                  <input type="text" id="custom-q-input" class="input-text" style="flex: 1;" placeholder="Enter your own specific technical prompt..." />
                  <button type="button" id="add-custom-q-btn" class="btn btn-secondary btn-sm">Add</button>
                </div>
                <div id="custom-q-list" style="margin-top: 0.8rem; display: flex; flex-direction: column; gap: 0.4rem;">
                  ${customQuestionList.map((q, idx) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.82rem;">
                      <span>${idx + 1}. ${q.question}</span>
                      <button type="button" class="del-custom-q" data-idx="${idx}" style="background: none; border: none; color: #fda4af; cursor: pointer;">✕</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column: Resume Parser & Telemetry Privacy -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Resume Parsing Card -->
            <div class="glass-card" style="padding: 1.8rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">Resume Parser</h3>
                <span class="badge badge-emerald">PDF / DOCX</span>
              </div>
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1.2rem;">
                Upload your resume to extract validated skills, projects, and automatically generate tailored project defense questions.
              </p>

              <!-- Upload Drop Area -->
              <div id="resume-drop-zone" style="border: 2px dashed rgba(255,255,255,0.15); border-radius: var(--radius-md); padding: 1.8rem 1rem; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(15,23,42,0.4);">
                <input type="file" id="resume-file-input" accept=".pdf,.docx,.txt" style="display: none;" />
                <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(99,102,241,0.15); color: var(--primary-light); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                </div>
                <div style="font-weight: 600; font-size: 0.95rem; color: #fff;">Click or Drag Resume Here</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem;">Supports text-based PDF or Word (.docx)</div>
              </div>

              <!-- Parsed Results Output -->
              ${parsedResumeData ? `
                <div style="margin-top: 1.25rem; padding: 1rem; background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.25); border-radius: var(--radius-sm);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                    <span style="font-weight: 700; font-size: 0.85rem; color: #34d399;">✓ Extracted from ${parsedResumeData.fileName}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${parsedResumeData.skills.length} Skills</span>
                  </div>

                  <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.75rem;">
                    ${parsedResumeData.skills.map(s => `
                      <span class="badge" style="background: rgba(255,255,255,0.08); font-size: 0.7rem; color: var(--text-main);">${s}</span>
                    `).join('')}
                  </div>

                  <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
                    <strong style="color: #fff;">Identified Projects:</strong> ${parsedResumeData.projects.join(', ')}
                  </div>

                  <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08);">
                    <span class="badge badge-purple" style="font-size: 0.68rem; margin-bottom: 0.4rem;">${parsedResumeData.generatedQuestions.length} Personalized Questions Ready</span>
                    <button type="button" id="use-resume-q-btn" class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 0.3rem;">
                      Apply to Active Interview Bank
                    </button>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Privacy, Timer & Session Controls -->
            <div class="glass-card" style="padding: 1.8rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem;">
                Session Guardrails & Privacy
              </h3>

              <div class="input-group">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label class="input-label">Optional Timer Duration</label>
                  <span id="timer-val-display" style="font-family: var(--font-mono); font-size: 0.9rem; font-weight: 700; color: var(--secondary);">${timerMinutes} Minutes</span>
                </div>
                <input type="range" id="setup-timer" min="5" max="45" step="5" value="${timerMinutes}" style="width: 100%; accent-color: var(--secondary);" />
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted);">
                  <span>5m (Express)</span>
                  <span>15m (Standard)</span>
                  <span>45m (Full Round)</span>
                </div>
              </div>

              <div style="margin: 1.2rem 0; padding: 0.9rem; background: rgba(0,0,0,0.25); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">
                  <input type="checkbox" id="setup-save-rec" ${saveRecording ? 'checked' : ''} style="margin-top: 3px; accent-color: var(--primary);" />
                  <span>
                    <strong style="color: #fff;">Opt-in Audio Recording:</strong> Save audio replay locally so you and your mentor can inspect vocal inflections. (You can download or permanently delete this at any time).
                  </span>
                </label>
              </div>

              <!-- Start Interview Button -->
              <button type="button" id="launch-interview-btn" class="btn btn-primary btn-lg" style="width: 100%; box-shadow: 0 0 30px rgba(99,102,241,0.4);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Launch Voice Interview Round
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Category selection
    container.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.dataset.cat;
        render();
      });
    });

    // Persona selection
    container.querySelectorAll('.persona-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedPersona = card.dataset.persona;
        render();
      });
    });

    // Mode selection
    container.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedMode = card.dataset.mode;
        render();
      });
    });

    // Seniority selection
    const levelSelect = container.querySelector('#setup-level');
    if (levelSelect) {
      levelSelect.addEventListener('change', (e) => { selectedLevel = e.target.value; });
    }

    // Question source selection
    const qSourceSelect = container.querySelector('#setup-qsource');
    if (qSourceSelect) {
      qSourceSelect.addEventListener('change', (e) => {
        questionSource = e.target.value;
        const box = container.querySelector('#custom-question-box');
        if (box) box.style.display = questionSource === 'custom' ? 'block' : 'none';
      });
    }

    // Timer slider
    const timerSlider = container.querySelector('#setup-timer');
    const timerDisplay = container.querySelector('#timer-val-display');
    if (timerSlider && timerDisplay) {
      timerSlider.addEventListener('input', (e) => {
        timerMinutes = parseInt(e.target.value, 10);
        timerDisplay.textContent = `${timerMinutes} Minutes`;
      });
    }

    // Opt-in recording checkbox
    const recCheckbox = container.querySelector('#setup-save-rec');
    if (recCheckbox) {
      recCheckbox.addEventListener('change', (e) => {
        saveRecording = e.target.checked;
      });
    }

    // Project Name
    const projInput = container.querySelector('#setup-project-name');
    if (projInput) {
      projInput.addEventListener('input', (e) => { assignedProject = e.target.value; });
    }

    // Resume Drop & File Select
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
        dropZone.style.borderColor = 'rgba(255,255,255,0.15)';
        dropZone.style.background = 'rgba(15,23,42,0.4)';
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

    // Apply resume parsed questions
    const useResumeBtn = container.querySelector('#use-resume-q-btn');
    if (useResumeBtn && parsedResumeData) {
      useResumeBtn.addEventListener('click', () => {
        questionSource = 'resume';
        if (parsedResumeData.projects[0]) {
          assignedProject = parsedResumeData.projects[0];
        }
        render();
      });
    }

    // Add custom question
    const addCustomBtn = container.querySelector('#add-custom-q-btn');
    const customInput = container.querySelector('#custom-q-input');
    if (addCustomBtn && customInput) {
      addCustomBtn.addEventListener('click', () => {
        const text = customInput.value.trim();
        if (text) {
          customQuestionList.push({
            id: 'custom_' + Date.now(),
            question: text,
            category: selectedCategory,
            level: selectedLevel,
            idealKeywords: ['architecture', 'trade-offs', 'latency', 'resilience'],
            rubric: {
              correctness: 'Factual accuracy and relevant domain concepts.',
              depth: 'System level depth and edge case management.',
              clarity: 'Structured explanation without rambling.',
              examples: 'Concrete scenarios and metrics.'
            },
            followUp: `What metrics or monitoring alert would you put in place to verify this in real-time?`
          });
          customInput.value = '';
          render();
        }
      });
    }

    // Delete custom question
    container.querySelectorAll('.del-custom-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        customQuestionList.splice(idx, 1);
        render();
      });
    });

    // Launch Interview Button
    const launchBtn = container.querySelector('#launch-interview-btn');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        // Prepare questions array
        let questions = [];
        if (questionSource === 'resume' && parsedResumeData) {
          questions = [...parsedResumeData.generatedQuestions];
        } else if (questionSource === 'custom' && customQuestionList.length > 0) {
          questions = [...customQuestionList];
        } else {
          // Fallback to builtin category
          questions = QUESTION_BANK[selectedCategory] || QUESTION_BANK['Python'];
        }

        const setupPayload = {
          role: container.querySelector('#setup-target-role').value || 'Full Stack Engineer',
          level: selectedLevel,
          category: selectedCategory,
          mode: selectedMode,
          persona: selectedPersona,
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
    render();
  }

  render();
}
