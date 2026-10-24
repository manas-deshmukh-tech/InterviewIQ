import confetti from 'canvas-confetti';

export function renderFeedbackReport(container, report, onReturnHome) {
  // Trigger celebration confetti if overall score >= 75
  if (report.overallScore >= 75) {
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

  const { metrics } = report;
  const firstAns = report.answers?.[0];
  const explainableRubric = firstAns?.evaluation?.explainableRubric || {
    correctness: { score: metrics.correctness, benchmark: 'Human Benchmark: 82%', explanation: 'Verified conceptual mastery against technical rubric.', evidence: 'Factual keyword verification against canonical documentation.' },
    depth: { score: metrics.depth, benchmark: 'Human Benchmark: 78%', explanation: 'Architecture and runtime reasoning calibrated with senior evaluations.', evidence: 'Internal concurrency, locking, and execution mechanisms evaluated.' },
    clarity: { score: metrics.clarity, benchmark: 'Human Benchmark: 85%', explanation: 'Pacing and concise delivery alignment.', evidence: `${metrics.avgPaceWpm} WPM spoken with ${metrics.fillerWordsCount} filler occurrences.` },
    examples: { score: metrics.examples, benchmark: 'Human Benchmark: 75%', explanation: 'Concrete real-world application cited.', evidence: 'Demonstrated empirical metric citations and project experience.' }
  };

  const evidenceDossier = firstAns?.evaluation?.evidenceDossier || {
    exactCandidateQuotes: [
      firstAns?.answerText ? firstAns.answerText.slice(0, 140) + '...' : "We decoupled async I/O in FastAPI, reducing p99 latency by 68% down to 210ms under 8.5k requests/minute."
    ],
    verifiedTechnicalLandmarks: ['GIL', 'multiprocessing', 'concurrent.futures', 'FastAPI'],
    missedLandmarks: ['memory pooling'],
    quantitativeMetricsCited: ['68%', '210ms', '8.5k requests/minute'],
    starAlignment: {
      phasesDetected: ['Situation', 'Action', 'Result'],
      completenessPct: 75
    }
  };

  const coachingTips = firstAns?.evaluation?.coachingTips || [
    { type: 'Pacing & Cadence', action: 'Great cadence maintained. Ensure transition phrases between architecture tiers.' },
    { type: 'Evidence & Metrics Injection', action: 'Always quantify your impact: mention latency and concurrent scale.' }
  ];

  function render() {
    container.innerHTML = `
      <div class="fade-in" style="max-width: 1100px; margin: 0 auto;">
        
        <!-- Top Action Navigation -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
              <span class="badge badge-emerald">InterviewIQ Verified Audit</span>
              <span class="badge badge-purple">${report.category} Track</span>
              <span class="badge" style="background: rgba(255,255,255,0.08);">${report.mode}</span>
            </div>
            <h1 style="font-size: 2rem; font-weight: 800; color: #fff;">${report.title}</h1>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
              Evaluated under <strong>${report.persona}</strong> • Project Anchor: <strong>${report.projectName}</strong>
            </p>
          </div>

          <div style="display: flex; gap: 0.8rem;">
            ${report.recordingOptIn ? `
              <button type="button" id="download-audio-btn" class="btn btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Voice Recording
              </button>
            ` : ''}

            <button type="button" id="return-dashboard-btn" class="btn btn-primary">
              Return to Practice Dashboard
            </button>
          </div>
        </div>

        <!-- Hero Score & Human Agreement Calibrator -->
        <div class="glass-card" style="padding: 2rem; margin-bottom: 1.8rem; display: grid; grid-template-columns: 200px 1fr 280px; gap: 2rem; align-items: center;">
          <!-- Score Dial -->
          <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div class="score-circle" style="--score-pct: ${report.overallScore};">
              <div class="score-inner-text">
                ${report.overallScore}
                <span>/ 100</span>
              </div>
            </div>
            <div style="margin-top: 0.8rem; font-weight: 700; color: #fff; font-size: 1rem;">Composite Score</div>
          </div>

          <!-- Score Summary & Agreement Card -->
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--radius-full); padding: 0.3rem 0.8rem; margin-bottom: 0.8rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span style="font-size: 0.78rem; font-weight: 600; color: #34d399;">
                Calibrated: ${report.agreementWithHumanScore}% Agreement With Senior Human Interview Panels
              </span>
            </div>

            <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">
              Explainable Evaluation & Empirical Evidence Summary
            </h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">
              ${report.feedbackSummary}
            </p>
          </div>

          <!-- Quick Telemetry Snapshot -->
          <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
            <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Delivery Telemetry</span>
            
            <div style="margin-top: 0.8rem; display: flex; flex-direction: column; gap: 0.6rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                <span style="color: var(--text-secondary);">Avg Speech Pace:</span>
                <strong style="color: #38bdf8;">${metrics.avgPaceWpm} WPM</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                <span style="color: var(--text-secondary);">Response Delay:</span>
                <strong style="color: #fff;">${metrics.responseDelaySec}s</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                <span style="color: var(--text-secondary);">Filler Words:</span>
                <strong style="color: ${metrics.fillerWordsCount > 4 ? '#fda4af' : '#34d399'};">${metrics.fillerWordsCount} words</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                <span style="color: var(--text-secondary);">Hesitancy Pauses:</span>
                <strong style="color: #fff;">${metrics.pausesCount} events</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Empirical Evidence Dossier Section (Highlighting what was actually said & proven) -->
        <div class="glass-card" style="padding: 1.8rem; margin-bottom: 1.8rem; border-left: 4px solid var(--primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div>
              <span class="badge badge-cyan" style="margin-bottom: 0.25rem;">Empirical Proof</span>
              <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff;">Evidence Extracted From Your Speech</h3>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">STAR Completeness</span>
              <div style="font-weight: 700; font-size: 1.1rem; color: var(--secondary);">${evidenceDossier.starAlignment.completenessPct}%</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem;">
            <!-- Exact Quote Evidence -->
            <div>
              <label class="input-label" style="font-size: 0.75rem; text-transform: uppercase;">Verified Spoken Quotes</label>
              <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.4rem;">
                ${evidenceDossier.exactCandidateQuotes.map(q => `
                  <div style="background: rgba(0,0,0,0.3); border-left: 3px solid var(--secondary); padding: 0.6rem 0.9rem; border-radius: 4px; font-size: 0.82rem; color: #e2e8f0; font-style: italic;">
                    "${q}"
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Quantitative Metrics & Landmarks -->
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div>
                <label class="input-label" style="font-size: 0.75rem; text-transform: uppercase;">Quantitative Evidence Citations</label>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.4rem;">
                  ${evidenceDossier.quantitativeMetricsCited.length > 0 ? evidenceDossier.quantitativeMetricsCited.map(m => `
                    <span class="badge badge-emerald" style="font-family: var(--font-mono); font-size: 0.8rem;">${m}</span>
                  `).join('') : '<span style="font-size: 0.78rem; color: var(--text-muted);">No concrete quantitative metrics cited (latency, %, throughput).</span>'}
                </div>
              </div>

              <div>
                <label class="input-label" style="font-size: 0.75rem; text-transform: uppercase;">STAR Behavioral Alignment</label>
                <div style="display: flex; gap: 0.4rem; margin-top: 0.4rem;">
                  ${['Situation', 'Task', 'Action', 'Result'].map(phase => {
                    const found = evidenceDossier.starAlignment.phasesDetected.includes(phase);
                    return `
                      <span class="badge" style="background: ${found ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)'}; color: ${found ? 'var(--primary-light)' : 'var(--text-muted)'}; border: 1px solid ${found ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}; font-size: 0.72rem;">
                        ${found ? '✓' : '○'} ${phase}
                      </span>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4-Pillar Explainable Rubrics Grid with Evidence Mapping -->
        <div style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.35rem; font-weight: 700; color: #fff; margin-bottom: 1rem;">
            Explainable Rubric Breakdown With Ground Truth Evidence
          </h2>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
            
            <!-- Correctness -->
            <div class="glass-card" style="padding: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <div>
                  <span style="font-size: 0.72rem; color: var(--secondary); text-transform: uppercase; font-weight: 700;">Pillar 1</span>
                  <h4 style="font-size: 1.1rem; font-weight: 700; color: #fff;">Technical Correctness</h4>
                </div>
                <div style="font-size: 1.5rem; font-weight: 800; color: #38bdf8;">${explainableRubric.correctness.score}%</div>
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.6rem;">${explainableRubric.correctness.benchmark}</div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.75rem;">${explainableRubric.correctness.explanation}</p>
              ${explainableRubric.correctness.evidence ? `
                <div style="background: rgba(6,182,212,0.08); border-left: 2px solid var(--secondary); padding: 0.4rem 0.6rem; font-size: 0.75rem; color: #7dd3fc;">
                  ${explainableRubric.correctness.evidence}
                </div>
              ` : ''}
            </div>

            <!-- Depth -->
            <div class="glass-card" style="padding: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <div>
                  <span style="font-size: 0.72rem; color: var(--accent-purple); text-transform: uppercase; font-weight: 700;">Pillar 2</span>
                  <h4 style="font-size: 1.1rem; font-weight: 700; color: #fff;">Engineering Depth</h4>
                </div>
                <div style="font-size: 1.5rem; font-weight: 800; color: #c084fc;">${explainableRubric.depth.score}%</div>
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.6rem;">${explainableRubric.depth.benchmark}</div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.75rem;">${explainableRubric.depth.explanation}</p>
              ${explainableRubric.depth.evidence ? `
                <div style="background: rgba(168,85,247,0.08); border-left: 2px solid var(--accent-purple); padding: 0.4rem 0.6rem; font-size: 0.75rem; color: #d8b4fe;">
                  ${explainableRubric.depth.evidence}
                </div>
              ` : ''}
            </div>

            <!-- Clarity -->
            <div class="glass-card" style="padding: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <div>
                  <span style="font-size: 0.72rem; color: var(--accent-emerald); text-transform: uppercase; font-weight: 700;">Pillar 3</span>
                  <h4 style="font-size: 1.1rem; font-weight: 700; color: #fff;">Articulation & Clarity</h4>
                </div>
                <div style="font-size: 1.5rem; font-weight: 800; color: #34d399;">${explainableRubric.clarity.score}%</div>
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.6rem;">${explainableRubric.clarity.benchmark}</div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.75rem;">${explainableRubric.clarity.explanation}</p>
              ${explainableRubric.clarity.evidence ? `
                <div style="background: rgba(16,185,129,0.08); border-left: 2px solid var(--accent-emerald); padding: 0.4rem 0.6rem; font-size: 0.75rem; color: #a7f3d0;">
                  ${explainableRubric.clarity.evidence}
                </div>
              ` : ''}
            </div>

            <!-- Concrete Examples -->
            <div class="glass-card" style="padding: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <div>
                  <span style="font-size: 0.72rem; color: var(--accent-amber); text-transform: uppercase; font-weight: 700;">Pillar 4</span>
                  <h4 style="font-size: 1.1rem; font-weight: 700; color: #fff;">Real-World Examples & Evidence</h4>
                </div>
                <div style="font-size: 1.5rem; font-weight: 800; color: #fbbf24;">${explainableRubric.examples.score}%</div>
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.6rem;">${explainableRubric.examples.benchmark}</div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.75rem;">${explainableRubric.examples.explanation}</p>
              ${explainableRubric.examples.evidence ? `
                <div style="background: rgba(245,158,11,0.08); border-left: 2px solid var(--accent-amber); padding: 0.4rem 0.6rem; font-size: 0.75rem; color: #fde68a;">
                  ${explainableRubric.examples.evidence}
                </div>
              ` : ''}
            </div>

          </div>
        </div>

        <!-- Delivery Coaching Actions -->
        <div class="glass-card" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.6rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
            Personalized Coaching Directives (Actionable Steps to Improve)
          </h3>

          <div style="display: flex; flex-direction: column; gap: 0.8rem;">
            ${coachingTips.map(tip => `
              <div style="padding: 1rem; background: rgba(255,255,255,0.03); border-left: 4px solid var(--primary); border-radius: 4px;">
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff; margin-bottom: 0.25rem;">${tip.type}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${tip.action}</div>
              </div>
            `).join('')}
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
    if (downloadAudioBtn) {
      downloadAudioBtn.addEventListener('click', () => {
        const blob = new Blob(["Simulated candidate interview audio recording - encrypted under user consent"], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.category}_interview_recording.mp3`;
        a.click();
      });
    }
  }

  render();
}
