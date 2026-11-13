import confetti from 'canvas-confetti';

export function renderFeedbackReport(container, report, onReturnHome) {
  // Trigger celebration confetti if overall score >= 75
  if (report && report.overallScore >= 75) {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // silent
    }
  }

  const metrics = report?.metrics || {
    correctness: 0,
    depth: 0,
    clarity: 0,
    examples: 0,
    avgPaceWpm: 0,
    responseDelaySec: 0,
    fillerWordsCount: 0,
    pausesCount: 0
  };

  // Extract answers array
  const rawAnswers = Array.isArray(report?.answers) ? report.answers : [];
  const answers = rawAnswers.length > 0 ? rawAnswers : [
    {
      question: report?.title || 'Technical Interview Question',
      answerText: '',
      evaluation: {
        overallScore: report?.overallScore ?? 0,
        metrics: metrics,
        explainableRubric: null,
        evidenceDossier: null,
        coachingTips: []
      }
    }
  ];

  // Authentic Audio Recording verification:
  // Only accept non-empty string URLs starting with http, https, blob, or data
  const candidateAudioUrl = report?.audioUrl || answers.map(a => a.telemetry?.audioUrl || a.audioUrl).filter(u => typeof u === 'string' && u.length > 0 && /^(https?|blob|data):/i.test(u)).pop() || null;

  // Tab state: number (0 to answers.length - 1) or 'all'
  let selectedTab = 0;

  function getScoreColor(score) {
    if (typeof score !== 'number') return '#94a3b8';
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  }

  function renderSingleQuestion(ans, idx, total) {
    const qText = ans.question || ans.questionText || `Question ${idx + 1}`;
    const ansText = (ans.answerText || ans.text || '').trim();
    const isUnattempted = !ansText || ansText === '(No answer submitted / Unattempted)';
    const evaluation = ans.evaluation;
    const hasEval = evaluation && typeof evaluation === 'object';

    // Scoring determination
    let scoreDisplay = '';
    let scoreColor = '#94a3b8';
    if (isUnattempted) {
      scoreDisplay = '0 / 100';
      scoreColor = '#ef4444';
    } else if (!hasEval || typeof evaluation.overallScore !== 'number') {
      scoreDisplay = 'Evaluation Unavailable';
      scoreColor = '#94a3b8';
    } else {
      scoreDisplay = `${evaluation.overallScore} / 100`;
      scoreColor = getScoreColor(evaluation.overallScore);
    }

    // 4-Pillar breakdown
    const qMetrics = evaluation?.metrics || {};
    const rubric = evaluation?.explainableRubric;

    return `
      <div class="glass-card question-card-item" data-question-index="${idx}" style="padding: 1.8rem; margin-bottom: 1.6rem; border: 1px solid rgba(255,255,255,0.08); border-left: 4px solid ${scoreColor};">
        
        <!-- Question Header & Score Badge -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.1rem; flex-wrap: wrap;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
              <span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-secondary); font-size: 0.74rem;">
                Question ${idx + 1} of ${total}
              </span>
              ${ans.isFollowUp ? `
                <span class="badge badge-purple" style="font-size: 0.72rem;">
                  ⚡ Adaptive Follow-Up
                </span>
              ` : ''}
              ${ans.category ? `
                <span class="badge badge-cyan" style="font-size: 0.72rem;">
                  ${ans.category}
                </span>
              ` : ''}
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; line-height: 1.4; margin: 0;">
              ${qText}
            </h3>
          </div>

          <div style="text-align: right; flex-shrink: 0;">
            <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: ${scoreColor}18; border: 1.5px solid ${scoreColor}55; padding: 0.35rem 0.85rem; border-radius: var(--radius-full);">
              <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Question Score:</span>
              <strong style="font-size: 1.15rem; font-weight: 800; color: ${scoreColor}; font-family: var(--font-mono);">${scoreDisplay}</strong>
            </div>
          </div>
        </div>

        <!-- Candidate Submitted Response -->
        <div style="margin-bottom: 1.4rem;">
          <label style="font-size: 0.74rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.04em;">
            Candidate Submitted Response
          </label>
          <div style="margin-top: 0.4rem; padding: 0.85rem 1.1rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-sm); font-size: 0.88rem; color: ${isUnattempted ? '#fda4af' : '#e2e8f0'}; line-height: 1.5; font-style: italic;">
            ${isUnattempted 
              ? '⚠️ (No answer submitted / Unattempted)' 
              : `"${ansText}"`
            }
          </div>
        </div>

        <!-- 4-Pillar Rubric Breakdown -->
        <div style="margin-bottom: 1.4rem;">
          <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; margin-bottom: 0.75rem;">
            4-Pillar Rubric Breakdown (Standardized Weights: Correctness 40% • Depth 25% • Clarity 15% • Examples 20%)
          </div>

          ${isUnattempted ? `
            <div style="padding: 1rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-sm); font-size: 0.84rem; color: #fda4af;">
              ⚠️ Question was not attempted. No technical content was provided to evaluate, resulting in 0/100 marks for all rubric pillars.
            </div>
          ` : (!hasEval ? `
            <div style="padding: 1rem; background: rgba(148, 163, 184, 0.08); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: var(--radius-sm); font-size: 0.84rem; color: #94a3b8;">
              ℹ️ Evaluation data unavailable for this answer. Scores and evidence were not recorded or returned by the scoring service.
            </div>
          ` : `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
              
              <!-- Pillar 1: Correctness (40%) -->
              <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); padding: 1.1rem; border-radius: var(--radius-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <div>
                    <span style="font-size: 0.68rem; color: #38bdf8; text-transform: uppercase; font-weight: 700;">Pillar 1 (Weight 40%)</span>
                    <div style="font-weight: 700; font-size: 0.95rem; color: #fff;">Technical Correctness</div>
                  </div>
                  <div style="font-size: 1.3rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                    ${rubric?.correctness?.score ?? qMetrics.correctness ?? '—'}%
                  </div>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                  ${rubric?.correctness?.benchmark || 'Human Benchmark: 82%'}
                </div>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin: 0 0 0.5rem;">
                  ${rubric?.correctness?.explanation || 'Conceptual mastery evaluated against technical question rubric.'}
                </p>
                ${rubric?.correctness?.evidence ? `
                  <div style="background: rgba(56,189,248,0.08); border-left: 2px solid #38bdf8; padding: 0.35rem 0.55rem; font-size: 0.74rem; color: #7dd3fc;">
                    ${rubric.correctness.evidence}
                  </div>
                ` : ''}
              </div>

              <!-- Pillar 2: Depth (25%) -->
              <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); padding: 1.1rem; border-radius: var(--radius-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <div>
                    <span style="font-size: 0.68rem; color: #c084fc; text-transform: uppercase; font-weight: 700;">Pillar 2 (Weight 25%)</span>
                    <div style="font-weight: 700; font-size: 0.95rem; color: #fff;">Engineering Depth</div>
                  </div>
                  <div style="font-size: 1.3rem; font-weight: 800; color: #c084fc; font-family: var(--font-mono);">
                    ${rubric?.depth?.score ?? qMetrics.depth ?? '—'}%
                  </div>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                  ${rubric?.depth?.benchmark || 'Human Benchmark: 78%'}
                </div>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin: 0 0 0.5rem;">
                  ${rubric?.depth?.explanation || 'Architecture depth and runtime reasoning evaluated.'}
                </p>
                ${rubric?.depth?.evidence ? `
                  <div style="background: rgba(192,132,252,0.08); border-left: 2px solid #c084fc; padding: 0.35rem 0.55rem; font-size: 0.74rem; color: #e9d5ff;">
                    ${rubric.depth.evidence}
                  </div>
                ` : ''}
              </div>

              <!-- Pillar 3: Clarity (15%) -->
              <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); padding: 1.1rem; border-radius: var(--radius-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <div>
                    <span style="font-size: 0.68rem; color: #34d399; text-transform: uppercase; font-weight: 700;">Pillar 3 (Weight 15%)</span>
                    <div style="font-weight: 700; font-size: 0.95rem; color: #fff;">Articulation &amp; Clarity</div>
                  </div>
                  <div style="font-size: 1.3rem; font-weight: 800; color: #34d399; font-family: var(--font-mono);">
                    ${rubric?.clarity?.score ?? qMetrics.clarity ?? '—'}%
                  </div>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                  ${rubric?.clarity?.benchmark || 'Human Benchmark: 85%'}
                </div>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin: 0 0 0.5rem;">
                  ${rubric?.clarity?.explanation || 'Delivery pacing, coherence, and filler word control evaluated.'}
                </p>
                ${rubric?.clarity?.evidence ? `
                  <div style="background: rgba(52,211,153,0.08); border-left: 2px solid #34d399; padding: 0.35rem 0.55rem; font-size: 0.74rem; color: #a7f3d0;">
                    ${rubric.clarity.evidence}
                  </div>
                ` : ''}
              </div>

              <!-- Pillar 4: Examples (20%) -->
              <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); padding: 1.1rem; border-radius: var(--radius-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <div>
                    <span style="font-size: 0.68rem; color: #fbbf24; text-transform: uppercase; font-weight: 700;">Pillar 4 (Weight 20%)</span>
                    <div style="font-weight: 700; font-size: 0.95rem; color: #fff;">Examples &amp; Evidence</div>
                  </div>
                  <div style="font-size: 1.3rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">
                    ${rubric?.examples?.score ?? qMetrics.examples ?? '—'}%
                  </div>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                  ${rubric?.examples?.benchmark || 'Human Benchmark: 75%'}
                </div>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin: 0 0 0.5rem;">
                  ${rubric?.examples?.explanation || 'Real-world project citations and empirical production metrics.'}
                </p>
                ${rubric?.examples?.evidence ? `
                  <div style="background: rgba(251,191,36,0.08); border-left: 2px solid #fbbf24; padding: 0.35rem 0.55rem; font-size: 0.74rem; color: #fde68a;">
                    ${rubric.examples.evidence}
                  </div>
                ` : ''}
              </div>

            </div>
          `)}
        </div>

        <!-- Empirical Evidence Dossier & STAR Alignment -->
        ${isUnattempted ? '' : (hasEval && evaluation.evidenceDossier ? `
          <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-sm); padding: 1rem 1.25rem; margin-bottom: 1.2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem;">
              <span style="font-size: 0.76rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase;">
                Empirical Evidence Extracted From Answer
              </span>
              <span style="font-size: 0.74rem; color: var(--secondary); font-weight: 700;">
                STAR Completeness: ${evaluation.evidenceDossier.starAlignment?.completenessPct ?? 0}%
              </span>
            </div>

            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
              ${['Situation', 'Task', 'Action', 'Result'].map(phase => {
                const detected = evaluation.evidenceDossier.starAlignment?.phasesDetected?.includes(phase);
                return `
                  <span class="badge" style="background: ${detected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)'}; color: ${detected ? 'var(--primary-light)' : 'var(--text-muted)'}; border: 1px solid ${detected ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}; font-size: 0.7rem;">
                    ${detected ? '✓' : '○'} ${phase}
                  </span>
                `;
              }).join('')}
            </div>

            ${evaluation.evidenceDossier.exactCandidateQuotes && evaluation.evidenceDossier.exactCandidateQuotes.length > 0 ? `
              <div style="margin-bottom: 0.5rem;">
                <label style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Verified Quotes:</label>
                <div style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.25rem;">
                  ${evaluation.evidenceDossier.exactCandidateQuotes.map(q => `
                    <div style="background: rgba(0,0,0,0.2); border-left: 2px solid var(--secondary); padding: 0.4rem 0.65rem; border-radius: 3px; font-size: 0.78rem; color: #e2e8f0; font-style: italic;">
                      "${q}"
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${evaluation.evidenceDossier.quantitativeMetricsCited && evaluation.evidenceDossier.quantitativeMetricsCited.length > 0 ? `
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem;">
                <span>Quantitative Proof:</span>
                ${evaluation.evidenceDossier.quantitativeMetricsCited.map(m => `
                  <span class="badge badge-emerald" style="font-family: var(--font-mono); font-size: 0.75rem;">${m}</span>
                `).join('')}
              </div>
            ` : ''}
          </div>
        ` : '')}

        <!-- Question-Specific Coaching Directives -->
        ${hasEval && Array.isArray(evaluation.coachingTips) && evaluation.coachingTips.length > 0 ? `
          <div>
            <div style="font-size: 0.74rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.5rem;">
              Coaching Recommendations for this Question
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${evaluation.coachingTips.map(tip => `
                <div style="padding: 0.65rem 0.9rem; background: rgba(255,255,255,0.02); border-left: 3px solid var(--primary); border-radius: 3px; font-size: 0.8rem;">
                  <strong style="color: #fff;">${tip.type || 'Recommendation'}:</strong> <span style="color: var(--text-secondary);">${tip.action || tip}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;
  }

  function render() {
    container.innerHTML = `
      <div class="fade-in" style="max-width: 1100px; margin: 0 auto; padding-bottom: 3rem;">
        
        <!-- Top Action Navigation -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.8rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
              <span class="badge badge-emerald">InterviewIQ Verified Audit</span>
              <span class="badge badge-purple">${report.category || 'Technical'} Track</span>
              <span class="badge" style="background: rgba(255,255,255,0.08);">${report.mode || 'Technical Practice'}</span>
              ${answers[0]?.evaluation?.isPythonEngine ? `
                <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                  🐍 Python NLP Engine (FastAPI)
                </span>
              ` : ''}
            </div>
            <h1 style="font-size: 1.85rem; font-weight: 800; color: #fff; margin: 0;">${report.title || 'Interview Evaluation Report'}</h1>
            <p style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 0.2rem;">
              Evaluated under <strong>${report.persona || 'AI Interviewer'}</strong> • Project Anchor: <strong>${report.projectName || 'Production Architecture'}</strong>
            </p>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            ${candidateAudioUrl ? `
              <button type="button" id="download-audio-btn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Voice Recording
              </button>
            ` : (report.recordingOptIn ? `
              <button type="button" class="btn btn-secondary" disabled style="opacity: 0.55; cursor: not-allowed; display: inline-flex; align-items: center; gap: 6px;" title="No authentic audio recording stream was captured for this session">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Voice Recording Unavailable
              </button>
            ` : '')}

            <button type="button" id="return-dashboard-btn" class="btn btn-primary">
              Return to Practice Dashboard
            </button>
          </div>
        </div>

        <!-- Hero Score & Standardized Scoring Summary -->
        <div class="glass-card" style="padding: 1.8rem; margin-bottom: 1.6rem; display: grid; grid-template-columns: 200px 1fr 270px; gap: 1.8rem; align-items: center;">
          <!-- Score Dial -->
          <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div class="score-circle" style="--score-pct: ${report.overallScore ?? 0};">
              <div class="score-inner-text">
                ${report.overallScore ?? 0}
                <span>/ 100</span>
              </div>
            </div>
            <div style="margin-top: 0.65rem; font-weight: 700; color: #fff; font-size: 0.95rem;">Composite Score</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Standardized Content Evaluation</div>
          </div>

          <!-- Score Summary -->
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--radius-full); padding: 0.25rem 0.75rem; margin-bottom: 0.65rem;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span style="font-size: 0.75rem; font-weight: 600; color: #34d399;">
                Calibrated Scoring Engine • Standardized 4-Pillar Rubric
              </span>
            </div>

            <h3 style="font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">
              Technical &amp; Communication Evaluation Summary
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
              ${report.feedbackSummary || `Simulated under ${report.persona || 'AI Interviewer'} rubric. Performance evaluated across all ${answers.length} question${answers.length > 1 ? 's' : ''} for correctness, depth, articulation, and evidence.`}
            </p>
          </div>

          <!-- Quick Telemetry Snapshot -->
          <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.15rem;">
            <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Delivery Telemetry</span>
            
            <div style="margin-top: 0.7rem; display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
                <span style="color: var(--text-secondary);">Avg Speech Pace:</span>
                <strong style="color: #38bdf8;">${metrics.avgPaceWpm ? `${metrics.avgPaceWpm} WPM` : '—'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
                <span style="color: var(--text-secondary);">Response Delay:</span>
                <strong style="color: #fff;">${typeof metrics.responseDelaySec === 'number' ? `${metrics.responseDelaySec}s` : '—'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
                <span style="color: var(--text-secondary);">Filler Words:</span>
                <strong style="color: ${(metrics.fillerWordsCount || 0) > 4 ? '#fda4af' : '#34d399'};">${metrics.fillerWordsCount ?? 0} words</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
                <span style="color: var(--text-secondary);">Hesitancy Pauses:</span>
                <strong style="color: #fff;">${metrics.pausesCount ?? 0} events</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Executive Demeanor & Facial Proctoring Telemetry (Separate Section) -->
        <div class="glass-card" style="padding: 1.6rem; margin-bottom: 1.8rem; border-left: 4px solid #10b981;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <span class="badge badge-emerald" style="margin-bottom: 0.25rem;">Visual Proctoring Telemetry</span>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">
                Face Demeanor &amp; Posture Stability Telemetry
              </h3>
            </div>
            <div style="display: flex; gap: 0.6rem;">
              <span class="badge" style="background: ${report.proctoring?.presencePct > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color: ${report.proctoring?.presencePct > 0 ? '#34d399' : '#ef4444'}; border: 1px solid ${report.proctoring?.presencePct > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}; font-weight: 700;">
                Face Presence: ${report.proctoring?.presencePct ? `${report.proctoring.presencePct}%` : '0% (No Face)'}
              </span>
              <span class="badge" style="background: ${report.proctoring?.avgComposure !== null && report.proctoring?.avgComposure !== undefined ? 'rgba(56,189,248,0.15)' : 'rgba(100,116,139,0.15)'}; color: ${report.proctoring?.avgComposure !== null && report.proctoring?.avgComposure !== undefined ? '#38bdf8' : '#94a3b8'}; border: 1px solid ${report.proctoring?.avgComposure !== null && report.proctoring?.avgComposure !== undefined ? 'rgba(56,189,248,0.3)' : 'rgba(100,116,139,0.3)'}; font-weight: 700;">
                Composure: ${report.proctoring?.avgComposure !== null && report.proctoring?.avgComposure !== undefined ? `${report.proctoring.avgComposure}/100` : 'Unavailable'}
              </span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.85rem; margin-bottom: 1rem;">
            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.8rem; border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 1.2rem;">👔</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: ${report.proctoring?.avgComposure !== null && report.proctoring?.avgComposure !== undefined ? '#10b981' : '#64748b'}; margin-top: 2px;">
                ${report.proctoring?.avgComposure !== null && report.proctoring?.avgComposure !== undefined ? `${report.proctoring.avgComposure}%` : '—'}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">Overall Composure</div>
            </div>

            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.8rem; border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 1.2rem;">✨</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: ${report.proctoring?.breakdown?.confidentPct !== null && report.proctoring?.breakdown?.confidentPct !== undefined ? '#38bdf8' : '#64748b'}; margin-top: 2px;">
                ${report.proctoring?.breakdown?.confidentPct !== null && report.proctoring?.breakdown?.confidentPct !== undefined ? `${report.proctoring.breakdown.confidentPct}%` : '—'}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">Steady &amp; Centered</div>
            </div>

            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.8rem; border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 1.2rem;">⚡</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: ${report.proctoring?.breakdown?.tensedPct !== null && report.proctoring?.breakdown?.tensedPct !== undefined ? (report.proctoring.breakdown.tensedPct > 35 ? '#f43f5e' : '#f59e0b') : '#64748b'}; margin-top: 2px;">
                ${report.proctoring?.breakdown?.tensedPct !== null && report.proctoring?.breakdown?.tensedPct !== undefined ? `${report.proctoring.breakdown.tensedPct}%` : '—'}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">Movement / Shifts</div>
            </div>

            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.8rem; border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 1.2rem;">👁️</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: ${report.proctoring?.avgEyeContact !== null && report.proctoring?.avgEyeContact !== undefined ? '#a78bfa' : '#64748b'}; margin-top: 2px;">
                ${report.proctoring?.avgEyeContact !== null && report.proctoring?.avgEyeContact !== undefined ? `${report.proctoring.avgEyeContact}%` : '—'}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">Eye Contact Poise</div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 0.65rem 0.95rem; border-radius: var(--radius-sm); font-size: 0.74rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <span>ℹ️ Visual proctoring evaluates physical stillness and camera alignment; it is displayed for candidate awareness and does not deduct from your content score.</span>
            <span style="font-family: var(--font-mono); font-size: 0.72rem;">${(report.proctoring?.absenceEventsCount ?? 0) === 0 ? '✓ 0 Absence Alerts' : `⚠️ ${report.proctoring.absenceEventsCount} Absence Alerts`}</span>
          </div>
        </div>

        <!-- Question-by-Question Evaluation Section -->
        <div style="margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h2 style="font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0;">
                Question-Wise Comprehensive Report (${answers.length} Question${answers.length > 1 ? 's' : ''})
              </h2>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.2rem 0 0;">
                Examine specific questions, exact answers, 4-pillar scores, evidence quotes, and coaching directives.
              </p>
            </div>

            <!-- Tab Switcher -->
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;" id="question-tabs-container">
              ${answers.map((ans, idx) => {
                const isUnatt = !ans.answerText || ans.answerText.trim() === '' || ans.answerText === '(No answer submitted / Unattempted)';
                const s = isUnatt ? 0 : (ans.evaluation?.overallScore ?? null);
                const scoreLabel = isUnatt ? '0%' : (typeof s === 'number' ? `${s}%` : 'N/A');
                const col = isUnatt ? '#ef4444' : (typeof s === 'number' ? getScoreColor(s) : '#94a3b8');
                const isActive = selectedTab === idx;
                return `
                  <button type="button" class="btn btn-sm question-tab-btn" data-index="${idx}" style="background: ${isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}; color: ${isActive ? '#fff' : 'var(--text-secondary)'}; border: 1px solid ${isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; font-weight: 700; font-size: 0.75rem; padding: 0.35rem 0.75rem;">
                    Q${idx + 1} <span style="color: ${isActive ? '#fff' : col}; margin-left: 2px;">(${scoreLabel})</span>
                  </button>
                `;
              }).join('')}
              <button type="button" class="btn btn-sm question-tab-btn" data-index="all" style="background: ${selectedTab === 'all' ? 'var(--secondary)' : 'rgba(255,255,255,0.05)'}; color: ${selectedTab === 'all' ? '#000' : 'var(--text-secondary)'}; border: 1px solid ${selectedTab === 'all' ? 'var(--secondary)' : 'rgba(255,255,255,0.1)'}; font-weight: 700; font-size: 0.75rem; padding: 0.35rem 0.75rem;">
                View All (${answers.length})
              </button>
            </div>
          </div>

          <!-- Question Evaluation Content Container -->
          <div id="question-evaluation-display">
            ${selectedTab === 'all' 
              ? answers.map((ans, idx) => renderSingleQuestion(ans, idx, answers.length)).join('')
              : renderSingleQuestion(answers[selectedTab] || answers[0], typeof selectedTab === 'number' ? selectedTab : 0, answers.length)
            }
          </div>
        </div>

      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const returnBtn = container.querySelector('#return-dashboard-btn');
    if (returnBtn) {
      returnBtn.addEventListener('click', () => {
        if (onReturnHome) onReturnHome();
      });
    }

    const downloadAudioBtn = container.querySelector('#download-audio-btn');
    if (downloadAudioBtn && candidateAudioUrl) {
      downloadAudioBtn.addEventListener('click', () => {
        try {
          const a = document.createElement('a');
          a.href = candidateAudioUrl;
          a.download = `${report.category || 'interview'}_recording.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (e) {
          console.warn('Audio download execution error:', e);
        }
      });
    }

    const tabButtons = container.querySelectorAll('.question-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idxAttr = e.currentTarget.getAttribute('data-index');
        selectedTab = idxAttr === 'all' ? 'all' : parseInt(idxAttr, 10);
        render();
      });
    });
  }

  render();
}
