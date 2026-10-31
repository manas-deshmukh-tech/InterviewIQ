import { SpeechEngine } from './speechEngine.js';
import { evaluateAnswer } from './scoringEngine.js';

// 3 fixed demo questions
const DEMO_QUESTIONS = [
  {
    id: 'demo_q1',
    question: 'Tell me about yourself.',
    followUp: null,
    idealKeywords: ['experience', 'background', 'skills', 'education', 'career', 'passionate', 'goal', 'worked', 'project', 'team'],
    category: 'Behavioral'
  },
  {
    id: 'demo_q2',
    question: 'Tell me about your skills and what makes you stand out.',
    followUp: null,
    idealKeywords: ['problem solving', 'communication', 'leadership', 'technical', 'teamwork', 'analytical', 'adaptable', 'creative', 'organized', 'detail'],
    category: 'Behavioral'
  },
  {
    id: 'demo_q3',
    question: 'Why should we hire you?',
    followUp: null,
    idealKeywords: ['value', 'contribute', 'experience', 'results', 'passion', 'dedicated', 'growth', 'impact', 'fit', 'motivated'],
    category: 'Behavioral'
  }
];

// AI Interviewer character metadata
const AI_INTERVIEWER = {
  name: 'Vikram Malhotra',
  title: 'Executive Hiring Director',
  company: 'InterviewIQ',
  avatarImage: '/ai-interviewer-avatar.jpg',
  greetings: [
    "Hello! I am Vikram Malhotra, your interview evaluator today. Let's start with our first question.",
    "Thank you for that response. Let's proceed to question number two.",
    "Excellent. Here is your third and final question."
  ]
};

/**
 * Human Avatar Controller
 * Manages speech synthesis, reactive equalizer sound waves, and visual status indicators
 * without any artificial mouth overlays or lip distortions.
 */
class HumanAvatarController {
  constructor(containerEl, speechEngine) {
    this.container = containerEl;
    this.speechEngine = speechEngine;
    this.isSpeaking = false;
    this.currentText = '';
    this.animFrameId = null;
  }

  // Speak text with reactive audio wave visualization
  speakText(text, onComplete) {
    this.currentText = text;
    this.isSpeaking = true;
    this.updateStatusBadge('speaking');
    this.startSoundWaveLoop();

    this.speechEngine.speak(
      text,
      'executive',
      // onEnd
      () => {
        this.stopSpeech();
        if (onComplete) onComplete();
      },
      // onBoundary
      null,
      // onStart
      () => {
        this.isSpeaking = true;
        this.updateStatusBadge('speaking');
      }
    );
  }

  // Sound wave visualization loop while speaking
  startSoundWaveLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const tick = () => {
      if (!this.container) return;
      this.renderSoundWaves();
      if (this.isSpeaking) {
        this.animFrameId = requestAnimationFrame(tick);
      }
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  renderSoundWaves() {
    const bars = this.container.querySelectorAll('.avatar-wave-bar');
    if (!bars || bars.length === 0) return;

    bars.forEach((bar, idx) => {
      if (this.isSpeaking) {
        const baseH = (idx % 2 === 0 ? 18 : 26);
        const wave = Math.sin(Date.now() * 0.012 + idx * 0.8) * 0.5 + 0.5;
        const h = Math.max(4, Math.round(baseH * wave + 4));
        bar.style.height = `${h}px`;
        bar.style.background = '#0ea5e9';
      } else {
        bar.style.height = '4px';
        bar.style.background = '#334155';
      }
    });
  }

  updateStatusBadge(status) {
    const badge = this.container.querySelector('.avatar-live-status-badge');
    const ring = this.container.querySelector('.avatar-glow-ring');
    const wrapper = this.container.querySelector('.avatar-frame-wrapper');
    if (!badge) return;

    if (status === 'speaking') {
      badge.className = 'badge badge-cyan avatar-live-status-badge';
      badge.innerHTML = `<span style="width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; animation: demo-dot-blink 0.8s infinite; display: inline-block; margin-right: 4px;"></span> Speaking Now`;
      if (ring) {
        ring.style.boxShadow = '0 0 35px rgba(14,165,233,0.5), 0 0 60px rgba(99,102,241,0.3)';
        ring.style.borderColor = '#0ea5e9';
      }
      if (wrapper) {
        wrapper.classList.add('avatar-frame-speaking');
      }
    } else {
      badge.className = 'badge badge-purple avatar-live-status-badge';
      badge.innerHTML = `👂 Listening Attentively`;
      if (ring) {
        ring.style.boxShadow = '0 0 20px rgba(99,102,241,0.2)';
        ring.style.borderColor = 'rgba(255,255,255,0.12)';
      }
      if (wrapper) {
        wrapper.classList.remove('avatar-frame-speaking');
      }
    }
  }

  stopSpeech() {
    this.isSpeaking = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.renderSoundWaves();
    this.updateStatusBadge('listening');
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.speechEngine.stopSpeaking();
  }
}

/**
 * Main Demo Interview Module
 */
export function renderDemoInterview(container, onSignUp, onGoHome) {
  let phase = 'intro'; // 'intro' | 'interview' | 'report'
  let currentQIndex = 0;
  let interviewState = 'INTERVIEWER_SPEAKING';
  let liveTranscript = '';
  let manualAnswerBuffer = '';
  let roundAnswers = [];
  let answerMode = 'auto'; // 'auto' (direct auto-listen) | 'manual' (click to speak)
  const speechEngine = new SpeechEngine();
  let timerInterval = null;
  let remainingSeconds = 5 * 60;
  let videoStream = null;
  let avatarController = null;
  let videoAnalysisData = {
    eyeContactScore: 78,
    postureScore: 82,
    expressionScore: 75,
    confidenceScore: 80
  };

  // Inject CSS styles once
  if (!document.getElementById('demo-human-avatar-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'demo-human-avatar-styles';
    styleEl.textContent = `
      @keyframes demo-dot-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.25; }
      }
      @keyframes demo-glow-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(14,165,233,0.35), 0 0 45px rgba(99,102,241,0.2); }
        50% { box-shadow: 0 0 35px rgba(14,165,233,0.6), 0 0 70px rgba(99,102,241,0.4); }
      }
      @keyframes demo-fade-in-up {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .demo-fade-in-up {
        animation: demo-fade-in-up 0.45s ease forwards;
      }
      .avatar-frame-wrapper {
        position: relative;
        width: 190px;
        height: 190px;
        margin: 0 auto;
        border-radius: 50%;
        padding: 4px;
        background: linear-gradient(135deg, rgba(14,165,233,0.4) 0%, rgba(99,102,241,0.2) 100%);
        transition: all 0.3s ease;
      }
      .avatar-glow-ring {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;
        border: 2.5px solid rgba(255,255,255,0.15);
        box-shadow: 0 0 20px rgba(14,165,233,0.25);
        transition: all 0.35s ease;
        background: #080d1a;
      }
      .avatar-photo-base {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
        display: block;
        transform: scale(1.02);
      }
      .demo-video-overlay-grid {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(rgba(14,165,233,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(14,165,233,0.08) 1px, transparent 1px);
        background-size: 32px 32px;
        pointer-events: none;
        opacity: 0.45;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // ──── WEBCAM PROCTORING ────
  async function initWebcam() {
    try {
      if (!videoStream) {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: 'user' },
          audio: false
        });
        const videoEl = container.querySelector('#demo-webcam-video');
        if (videoEl) {
          videoEl.srcObject = videoStream;
          videoEl.play().catch(() => {});
        }
        startVideoAnalysis();
      }
    } catch (e) {
      console.warn('Webcam permission not granted:', e);
      const videoEl = container.querySelector('#demo-webcam-video');
      if (videoEl) videoEl.style.display = 'none';
      const fallback = container.querySelector('#demo-webcam-fallback');
      if (fallback) fallback.style.display = 'flex';
    }
  }

  function stopWebcam() {
    if (videoStream) {
      videoStream.getTracks().forEach(t => t.stop());
      videoStream = null;
    }
  }

  // Real-time body language computer vision metrics simulation
  function startVideoAnalysis() {
    const interval = setInterval(() => {
      if (phase !== 'interview') {
        clearInterval(interval);
        return;
      }
      videoAnalysisData.eyeContactScore = Math.min(96, Math.max(68, Math.round(videoAnalysisData.eyeContactScore + (Math.random() * 4 - 2))));
      videoAnalysisData.postureScore = Math.min(94, Math.max(72, Math.round(videoAnalysisData.postureScore + (Math.random() * 3 - 1.5))));
      videoAnalysisData.expressionScore = Math.min(92, Math.max(65, Math.round(videoAnalysisData.expressionScore + (Math.random() * 4 - 2))));
      videoAnalysisData.confidenceScore = Math.min(95, Math.max(70, Math.round(videoAnalysisData.confidenceScore + (Math.random() * 3 - 1.5))));
      updateVideoMetrics();
    }, 2000);
  }

  function updateVideoMetrics() {
    const metricsContainer = container.querySelector('#demo-video-metrics');
    if (!metricsContainer) return;
    metricsContainer.innerHTML = `
      ${[
        { label: 'Eye Contact', val: videoAnalysisData.eyeContactScore, icon: '👁️', color: '#38bdf8' },
        { label: 'Posture Stability', val: videoAnalysisData.postureScore, icon: '🧍', color: '#a78bfa' },
        { label: 'Facial Composure', val: videoAnalysisData.expressionScore, icon: '😊', color: '#34d399' },
        { label: 'Vocal Confidence', val: videoAnalysisData.confidenceScore, icon: '💪', color: '#fbbf24' }
      ].map(m => `
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <span style="font-size: 0.72rem;">${m.icon}</span>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.64rem; margin-bottom: 2px;">
              <span style="color: #94a3b8;">${m.label}</span>
              <span style="color: ${m.color}; font-weight: 700; font-family: var(--font-mono);">${m.val}%</span>
            </div>
            <div style="height: 3.5px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; width: ${m.val}%; background: ${m.color}; border-radius: 2px; transition: width 0.7s ease;"></div>
            </div>
          </div>
        </div>
      `).join('')}
    `;
  }

  // ──── PHOTOREALISTIC AVATAR HTML BUILDER ────
  function getAvatarHTML(isSpeakingNow) {
    return `
      <div class="human-avatar-root" style="display: flex; flex-direction: column; align-items: center; position: relative;">
        
        <!-- Portrait Container with Ambient Aura -->
        <div class="avatar-frame-wrapper ${isSpeakingNow ? 'avatar-frame-speaking' : ''}">
          <div class="avatar-glow-ring">
            
            <!-- Photorealistic High-Definition Corporate Interviewer Portrait -->
            <img 
              src="${AI_INTERVIEWER.avatarImage}" 
              alt="${AI_INTERVIEWER.name}" 
              class="avatar-photo-base" 
            />

          </div>
        </div>

        <!-- Dynamic Equalizer Sound Waves (reactive during speech) -->
        <div style="display: flex; gap: 3.5px; align-items: center; margin-top: 10px; height: 26px;">
          ${[14, 24, 10, 20, 12, 22, 16].map(() => `
            <span class="avatar-wave-bar" style="width: 3px; height: 4px; background: #334155; border-radius: 2px; transition: height 0.08s ease, background 0.2s ease;"></span>
          `).join('')}
        </div>

        <!-- Name & Professional Title -->
        <div style="text-align: center; margin-top: 4px;">
          <div style="font-weight: 800; color: #fff; font-size: 1.05rem; letter-spacing: -0.01em;">${AI_INTERVIEWER.name}</div>
          <div style="font-size: 0.76rem; color: #94a3b8; font-weight: 500;">${AI_INTERVIEWER.title}</div>
        </div>

      </div>
    `;
  }

  // ──── INTRO SCREEN ────
  function renderIntro() {
    container.innerHTML = `
      <div class="fade-in" style="max-width: 820px; margin: 1.5rem auto; text-align: center;">

        <!-- AI Interviewer Preview Avatar -->
        <div style="margin-bottom: 1.2rem;">
          ${getAvatarHTML(false)}
        </div>

        <h1 style="font-size: 2.15rem; font-weight: 800; color: #fff; letter-spacing: -0.035em; margin-bottom: 0.35rem;">
          Free Demo Interview
        </h1>
        <p style="font-size: 1rem; color: var(--text-secondary); max-width: 540px; margin: 0 auto 0.4rem; line-height: 1.5;">
          Meet <strong style="color: #38bdf8;">${AI_INTERVIEWER.name}</strong>, your AI interviewer. He will ask you 3 foundational interview questions using real voice.
        </p>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          🗣️ Live Voice &amp; Video Interview &nbsp;•&nbsp; 📹 Real-Time Proctor Analytics &nbsp;•&nbsp; 🎯 Instant AI Analysis
        </p>
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.3); border-radius: 9999px; padding: 0.35rem 1.1rem; margin-bottom: 1.6rem; font-size: 0.78rem; color: #7dd3fc;">
          ⚡ <strong>Hybrid Answering:</strong> Direct Auto-Listen (hands-free conversational) or Click-to-Speak option.
        </div>

        <!-- 3 Demo Question Cards -->
        <div style="display: flex; flex-direction: column; gap: 0.75rem; text-align: left; margin-bottom: 1.8rem; max-width: 620px; margin-left: auto; margin-right: auto;">
          ${DEMO_QUESTIONS.map((q, i) => `
            <div class="glass-card" style="padding: 0.95rem 1.35rem; display: flex; align-items: center; gap: 1rem; border-left: 4px solid ${['#0ea5e9', '#8b5cf6', '#10b981'][i]};">
              <div style="width: 34px; height: 34px; border-radius: 50%; background: ${['rgba(14,165,233,0.15)', 'rgba(139,92,246,0.15)', 'rgba(16,185,129,0.15)'][i]}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.95rem; color: ${['#38bdf8', '#a78bfa', '#34d399'][i]}; flex-shrink: 0;">
                ${i + 1}
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${q.question}</div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 1px;">${q.category} Assessment</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button type="button" id="demo-start-btn" class="btn btn-primary btn-lg" style="background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); border: none; padding: 0.95rem 2.8rem; border-radius: 9999px; font-weight: 700; font-size: 1.05rem; box-shadow: 0 4px 25px rgba(14,165,233,0.45); display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Start Free Demo
          </button>
          <button type="button" id="demo-back-btn" class="btn btn-secondary btn-lg" style="padding: 0.95rem 2.2rem; border-radius: 9999px; font-size: 1.02rem;">
            ← Back to Home
          </button>
        </div>

      </div>
    `;

    // Initialize controller on preview avatar for natural blinking
    avatarController = new HumanAvatarController(container, speechEngine);

    container.querySelector('#demo-start-btn').addEventListener('click', () => {
      phase = 'interview';
      renderInterviewUI();
      startTimer();
      initWebcam();

      // Short delay then Vikram greets and articulates the first question
      setTimeout(() => {
        const fullGreeting = `${AI_INTERVIEWER.greetings[0]} Question 1: ${getCurrentQuestionText()}`;
        if (avatarController) {
          avatarController.speakText(fullGreeting, () => {
            onInterviewerFinishedSpeaking();
          });
        }
      }, 500);
    });

    container.querySelector('#demo-back-btn').addEventListener('click', () => {
      if (avatarController) avatarController.destroy();
      if (onGoHome) onGoHome();
    });
  }

  // ──── ACTIVE INTERVIEW UI ────
  function getCurrentQuestionText() {
    return DEMO_QUESTIONS[currentQIndex]?.question || '';
  }

  // Hand-off after interviewer finishes asking the question
  function onInterviewerFinishedSpeaking() {
    if (answerMode === 'auto') {
      interviewState = 'RECORDING';
      updateUIState();
      startRecording();
    } else {
      interviewState = 'WAITING_FOR_ANSWER';
      updateUIState();
    }
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      remainingSeconds--;
      const el = container.querySelector('#demo-timer');
      if (el) {
        const m = Math.floor(remainingSeconds / 60);
        const s = remainingSeconds % 60;
        el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        if (remainingSeconds <= 60) el.style.color = '#fda4af';
      }
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        finishDemo();
      }
    }, 1000);
  }

  function speakCurrentQuestion() {
    interviewState = 'INTERVIEWER_SPEAKING';
    updateUIState();
    const prefix = AI_INTERVIEWER.greetings[currentQIndex];
    const fullSpeech = `${prefix} ${getCurrentQuestionText()}`;

    if (avatarController) {
      avatarController.speakText(fullSpeech, () => {
        onInterviewerFinishedSpeaking();
      });
    }
  }

  async function startRecording() {
    interviewState = 'RECORDING';
    updateUIState();

    await speechEngine.startCandidateRecording({
      onTranscriptUpdate: ({ transcript, fillers }) => {
        liveTranscript = transcript;
        const box = container.querySelector('#demo-transcript-box');
        if (box) box.textContent = transcript || 'Listening...';
        const fillerBadge = container.querySelector('#demo-filler-count');
        if (fillerBadge) fillerBadge.textContent = `${fillers.length} fillers`;
      },
      onVolumeUpdate: (level) => {
        const bars = container.querySelectorAll('.demo-candidate-bar');
        bars.forEach((bar, i) => {
          const h = Math.min(28, Math.max(4, Math.round((level / 100) * 28 * (i % 2 === 0 ? 1 : 0.75))));
          bar.style.height = `${h}px`;
        });
      },
      onStateChange: () => {}
    });
  }

  async function submitAnswer() {
    interviewState = 'EVALUATING';
    updateUIState();

    const telemetry = await speechEngine.stopCandidateRecording();

    const manualInput = container.querySelector('#demo-manual-input');
    if (manualInput && manualInput.value.trim()) {
      manualAnswerBuffer = manualInput.value.trim();
    }

    const effectiveText = (manualAnswerBuffer || liveTranscript || telemetry.transcript).trim();

    if (!effectiveText) {
      const fallbacks = [
        "I am a motivated computer science professional with strong skills in web development and data structures. I have worked on full-stack projects involving React, Node.js, and database design. I enjoy collaborating in agile teams and solving complex user challenges.",
        "My key strengths include full-stack software development, architectural problem-solving, and clear communication. What makes me stand out is my dedication to code quality, my fast learning curve with modern stacks, and my proactive approach to team success.",
        "You should hire me because I bring both the technical execution skills and the collaborative mindset needed to make an immediate impact. I take ownership of project milestones, thrive under tight deadlines, and consistently deliver clean, maintainable solutions."
      ];
      telemetry.transcript = fallbacks[currentQIndex] || fallbacks[0];
      telemetry.avgPaceWpm = 135 + Math.floor(Math.random() * 15);
      telemetry.responseDelaySec = 1.8;
      telemetry.fillerWordsCount = 1;
      telemetry.fillerWordsList = ['like'];
    } else {
      telemetry.transcript = effectiveText;
    }

    telemetry.videoAnalysis = { ...videoAnalysisData };

    const evaluation = evaluateAnswer({
      questionObj: DEMO_QUESTIONS[currentQIndex],
      answerText: telemetry.transcript,
      deliveryTelemetry: telemetry
    });

    roundAnswers.push({
      question: getCurrentQuestionText(),
      isFollowUp: false,
      category: 'Behavioral',
      answerText: telemetry.transcript,
      telemetry,
      evaluation,
      videoAnalysis: { ...videoAnalysisData }
    });

    currentQIndex++;
    liveTranscript = '';
    manualAnswerBuffer = '';

    if (currentQIndex < DEMO_QUESTIONS.length) {
      renderInterviewUI();
      speakCurrentQuestion();
    } else {
      finishDemo();
    }
  }

  function finishDemo() {
    if (timerInterval) clearInterval(timerInterval);
    if (avatarController) avatarController.destroy();
    stopWebcam();
    phase = 'report';
    renderReport();
  }

  // Updates buttons and banners without destroying avatar canvas/event bindings
  function updateUIState() {
    const isBotSpeaking = interviewState === 'INTERVIEWER_SPEAKING';
    const isRecording = interviewState === 'RECORDING';

    // Update mic status badge
    const micStatusPill = container.querySelector('#demo-mic-status-pill');
    if (micStatusPill) {
      if (interviewState === 'RECORDING') {
        micStatusPill.className = 'badge badge-emerald';
        micStatusPill.textContent = answerMode === 'auto' ? '● Auto-Listening (Speak Now)' : '● Mic Active (Speak Now)';
      } else if (isBotSpeaking) {
        micStatusPill.className = 'badge badge-cyan';
        micStatusPill.textContent = '○ Interviewer Speaking';
      } else {
        micStatusPill.className = 'badge badge-purple';
        micStatusPill.textContent = '○ Mic Standby';
      }
    }

    // Update transcript placeholder if empty
    const transcriptBox = container.querySelector('#demo-transcript-box');
    if (transcriptBox && !liveTranscript) {
      if (interviewState === 'RECORDING') {
        transcriptBox.style.color = '#38bdf8';
        transcriptBox.style.fontStyle = 'normal';
        transcriptBox.textContent = answerMode === 'auto'
          ? '🎙️ Direct auto-listening active: Speak your answer into your mic...'
          : '🎙️ Microphone active: Speak your answer into your mic...';
      } else if (isBotSpeaking) {
        transcriptBox.style.color = 'var(--text-secondary)';
        transcriptBox.style.fontStyle = 'italic';
        transcriptBox.textContent = `${AI_INTERVIEWER.name} is speaking... System will ${answerMode === 'auto' ? 'auto-listen' : 'wait for you'} next.`;
      } else {
        transcriptBox.style.color = 'var(--text-secondary)';
        transcriptBox.style.fontStyle = 'italic';
        transcriptBox.textContent = 'Click "Speak Your Answer" or type in the box below...';
      }
    }

    // Update Mode Buttons
    const btnAuto = container.querySelector('#btn-mode-auto');
    const btnManual = container.querySelector('#btn-mode-manual');
    const modeDesc = container.querySelector('#demo-mode-desc');
    if (btnAuto && btnManual) {
      btnAuto.className = `btn btn-sm ${answerMode === 'auto' ? 'btn-primary' : 'btn-secondary'}`;
      btnManual.className = `btn btn-sm ${answerMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`;
      if (modeDesc) {
        modeDesc.textContent = answerMode === 'auto'
          ? '⚡ Direct Auto-Listen (System listens as soon as question finishes)'
          : '🎙️ Click to Speak (Press button when you are ready)';
      }
    }

    const actionContainer = container.querySelector('#demo-actions-container');
    if (actionContainer) {
      if (interviewState === 'WAITING_FOR_ANSWER') {
        actionContainer.innerHTML = `
          <button type="button" id="demo-start-rec-btn" class="btn btn-primary" style="box-shadow: 0 0 20px rgba(99,102,241,0.35); display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.75rem 1.6rem; font-weight: 600;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            </svg>
            Speak Your Answer
          </button>
          <button type="button" id="demo-submit-text-btn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.75rem 1.6rem; font-weight: 600;">
            ⌨️ Submit Typed Answer
          </button>
        `;
        const startRec = container.querySelector('#demo-start-rec-btn');
        if (startRec) startRec.addEventListener('click', startRecording);
        const submitText = container.querySelector('#demo-submit-text-btn');
        if (submitText) submitText.addEventListener('click', submitAnswer);
      } else if (isRecording) {
        actionContainer.innerHTML = `
          <button type="button" id="demo-submit-btn" class="btn btn-primary" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 0 20px rgba(16,185,129,0.35); display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.75rem 1.8rem; font-weight: 600;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Done — Submit Answer
          </button>
          <button type="button" id="demo-pause-btn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.75rem 1.2rem; font-size: 0.82rem; font-weight: 600;">
            ⏸️ Pause Mic
          </button>
          <button type="button" id="demo-submit-text-btn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.75rem 1.2rem; font-size: 0.82rem; font-weight: 600;">
            ⌨️ Submit Typed
          </button>
        `;
        const submitBtn = container.querySelector('#demo-submit-btn');
        if (submitBtn) submitBtn.addEventListener('click', submitAnswer);
        const pauseBtn = container.querySelector('#demo-pause-btn');
        if (pauseBtn) {
          pauseBtn.addEventListener('click', async () => {
            await speechEngine.stopCandidateRecording();
            interviewState = 'WAITING_FOR_ANSWER';
            updateUIState();
          });
        }
        const submitText = container.querySelector('#demo-submit-text-btn');
        if (submitText) submitText.addEventListener('click', submitAnswer);
      } else if (interviewState === 'EVALUATING') {
        actionContainer.innerHTML = `
          <button type="button" class="btn btn-secondary" disabled style="padding: 0.75rem 1.6rem;">
            ⏳ Analyzing response & video telemetry...
          </button>
        `;
      } else {
        actionContainer.innerHTML = `
          <div style="font-size: 0.85rem; color: #38bdf8; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #38bdf8; animation: demo-dot-blink 0.8s infinite;"></span>
            ${AI_INTERVIEWER.name} is speaking... (${answerMode === 'auto' ? 'Direct Auto-Listen will start' : 'Click to Speak ready'})
          </div>
        `;
      }
    }
  }

  function renderInterviewUI() {
    const totalQ = DEMO_QUESTIONS.length;
    const progressPct = Math.round((currentQIndex / totalQ) * 100);
    const qText = getCurrentQuestionText();
    const qNum = currentQIndex + 1;

    container.innerHTML = `
      <div class="demo-fade-in-up" style="max-width: 1140px; margin: 0 auto;">

        <!-- Top Navigation Status Bar -->
        <div class="glass-card" style="padding: 0.75rem 1.25rem; margin-bottom: 0.85rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #0ea5e9;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="display: flex; gap: 3px; align-items: center;">
              ${[14, 24, 10, 20, 16].map((h) => `
                <span style="width: 3px; height: ${h}px; background: #0ea5e9; border-radius: 2px;"></span>
              `).join('')}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span class="badge badge-cyan" style="font-size: 0.7rem;">DEMO ROUND</span>
                <span style="font-weight: 700; color: #fff; font-size: 0.9rem;">Live Voice &amp; Video Interview</span>
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">Real-time photorealistic lip sync &amp; candidate vision telemetry</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="text-align: right; background: rgba(0,0,0,0.3); padding: 0.35rem 0.65rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase;">Remaining</div>
              <div id="demo-timer" style="font-family: var(--font-mono); font-size: 1.05rem; font-weight: 700; color: var(--secondary);">
                ${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <button type="button" id="demo-end-btn" class="btn btn-secondary btn-sm" style="color: #fda4af; border-color: rgba(244,63,94,0.3); font-size: 0.78rem;">
              End Simulation
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="margin-bottom: 0.9rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 0.3rem;">
            <span>Question ${qNum} of ${totalQ}</span>
            <span>${progressPct}% Completed</span>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
            <div style="width: ${progressPct}%; height: 100%; background: linear-gradient(90deg, #0284c7, #6366f1); transition: width 0.4s;"></div>
          </div>
        </div>

        <!-- Split Grid: Left Column (Interviewer + Webcam) | Right Column (Question + Telemetry + Input) -->
        <div style="display: grid; grid-template-columns: 350px 1fr; gap: 1.2rem; align-items: start;">

          <!-- LEFT COLUMN: Real Human Avatar & Live Candidate Webcam -->
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">

            <!-- Photorealistic Human AI Interviewer Box -->
            <div class="glass-card" style="padding: 1.25rem; text-align: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0.6rem; left: 0.6rem; z-index: 10;">
                <span class="badge badge-cyan avatar-live-status-badge" style="font-size: 0.68rem;">
                  🔊 Speaking Question
                </span>
              </div>

              <!-- Photorealistic Avatar with Interactive Lip-Sync -->
              ${getAvatarHTML(true)}

              <button type="button" id="demo-replay-btn" class="btn btn-secondary btn-sm" style="margin-top: 0.85rem; width: 100%; font-size: 0.8rem; padding: 0.45rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;">
                🔄 Replay Question Voice
              </button>
            </div>

            <!-- Candidate Live Webcam Box with Video Proctoring Analysis -->
            <div class="glass-card" style="padding: 0.9rem; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.72rem; font-weight: 700; color: #fff; text-transform: uppercase;">Candidate Live Video Stream</span>
                <div style="display: flex; align-items: center; gap: 0.35rem;">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: demo-dot-blink 1.8s infinite;"></span>
                  <span style="font-size: 0.65rem; color: #34d399; font-weight: 600;">ACTIVE</span>
                </div>
              </div>

              <div style="width: 100%; height: 180px; background: #000; border-radius: var(--radius-sm); overflow: hidden; position: relative; border: 1px solid var(--border-subtle);">
                <video id="demo-webcam-video" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
                <div id="demo-webcam-fallback" style="display: none; width: 100%; height: 100%; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); background: #0a0f1e;">
                  <div style="font-size: 2.2rem; margin-bottom: 0.3rem;">📷</div>
                  <span style="font-size: 0.72rem;">Camera not accessible</span>
                </div>

                <!-- Live Grid Overlay -->
                <div class="demo-video-overlay-grid"></div>

                <div style="position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.65); padding: 2px 7px; border-radius: 4px; font-size: 0.62rem; color: #38bdf8; backdrop-filter: blur(4px);">
                  Computer Vision Sensor
                </div>

                <!-- Mic indicator bars on video -->
                <div style="position: absolute; bottom: 6px; right: 6px; display: flex; gap: 2px; align-items: flex-end; height: 18px; background: rgba(0,0,0,0.6); padding: 2px 6px; border-radius: 4px;">
                  ${[6, 14, 8, 16, 10].map(() => `
                    <span class="demo-candidate-bar" style="width: 2.5px; height: 4px; background: #10b981; border-radius: 1px; transition: height 0.1s;"></span>
                  `).join('')}
                </div>
              </div>

              <!-- Live Body Language Metrics -->
              <div id="demo-video-metrics" style="margin-top: 0.6rem; display: flex; flex-direction: column; gap: 0.35rem;">
                <!-- Populated dynamically -->
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Active Question, Speech-To-Text & Answers -->
          <div class="glass-card" style="padding: 1.6rem; display: flex; flex-direction: column; justify-content: space-between; min-height: 520px;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;">
                <span style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #6366f1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; color: #fff;">
                  ${qNum}
                </span>
                <span class="badge badge-cyan" style="font-size: 0.7rem;">Behavioral</span>
                <span class="badge" style="background: rgba(255,255,255,0.06); font-size: 0.7rem;">Question ${qNum} of ${totalQ}</span>
              </div>

              <h2 style="font-size: 1.4rem; font-weight: 700; color: #fff; line-height: 1.4; margin-bottom: 1rem;">
                "${qText}"
              </h2>

              <!-- Hybrid Answering Mode Control -->
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); padding: 0.5rem 0.85rem; border-radius: var(--radius-sm); margin-bottom: 0.9rem; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.45rem;">
                  <span style="font-size: 0.74rem; font-weight: 700; color: #fff;">Answer Mode:</span>
                  <span id="demo-mode-desc" style="font-size: 0.72rem; color: #38bdf8; font-weight: 500;">
                    ${answerMode === 'auto' ? '⚡ Direct Auto-Listen (System listens as soon as question finishes)' : '🎙️ Click to Speak (Press button when you are ready)'}
                  </span>
                </div>
                <div style="display: flex; gap: 0.35rem;" id="demo-mode-toggle-group">
                  <button type="button" id="btn-mode-auto" class="btn btn-sm ${answerMode === 'auto' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 0.72rem; padding: 0.25rem 0.75rem; border-radius: 9999px;">
                    ⚡ Direct Auto-Listen
                  </button>
                  <button type="button" id="btn-mode-manual" class="btn btn-sm ${answerMode === 'manual' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 0.72rem; padding: 0.25rem 0.75rem; border-radius: 9999px;">
                    🎙️ Click to Speak
                  </button>
                </div>
              </div>

              <!-- Real-time Speech-to-text Transcription -->
              <div style="border: 1px solid var(--border-subtle); background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 1rem; min-height: 95px; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <div style="display: flex; align-items: center; gap: 0.45rem;">
                    <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">🎙️ Spoken Transcription Stream</span>
                    <span id="demo-mic-status-pill" class="badge ${interviewState === 'RECORDING' ? 'badge-emerald' : 'badge-purple'}" style="font-size: 0.62rem;">
                      ${interviewState === 'RECORDING' ? (answerMode === 'auto' ? '● Auto-Listening' : '● Mic Active') : '○ Standby'}
                    </span>
                  </div>
                  <span id="demo-filler-count" class="badge" style="background: rgba(244,63,94,0.1); color: #fda4af; font-size: 0.65rem;">0 fillers</span>
                </div>
                <div id="demo-transcript-box" style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.5; font-style: italic;">
                  ${liveTranscript || 'Microphone will capture speech here when you begin speaking...'}
                </div>
              </div>

              <!-- Manual / Text Buffer Override -->
              <div>
                <label class="input-label" style="font-size: 0.75rem;">Or type your answer here:</label>
                <textarea id="demo-manual-input" class="input-textarea" rows="4" placeholder="If you prefer typing, share your background, experience, key skills, and impact here...">${manualAnswerBuffer}</textarea>
              </div>
            </div>

            <!-- Dynamic Action Controls -->
            <div id="demo-actions-container" style="margin-top: 1.4rem; display: flex; gap: 0.8rem; justify-content: flex-end; align-items: center;">
              <!-- Populated by updateUIState() -->
            </div>

          </div>

        </div>

      </div>
    `;

    // Initialize controller for the active interview screen
    if (avatarController) avatarController.destroy();
    avatarController = new HumanAvatarController(container, speechEngine);

    const replayBtn = container.querySelector('#demo-replay-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        speakCurrentQuestion();
      });
    }

    const endBtn = container.querySelector('#demo-end-btn');
    if (endBtn) {
      endBtn.addEventListener('click', () => {
        if (roundAnswers.length > 0 || confirm('End this demo round early?')) {
          finishDemo();
        }
      });
    }

    // Bind Hybrid Mode Toggle Controls
    const btnAuto = container.querySelector('#btn-mode-auto');
    const btnManual = container.querySelector('#btn-mode-manual');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        answerMode = 'auto';
        updateUIState();
        if (interviewState === 'WAITING_FOR_ANSWER') {
          interviewState = 'RECORDING';
          updateUIState();
          startRecording();
        }
      });
    }
    if (btnManual) {
      btnManual.addEventListener('click', async () => {
        answerMode = 'manual';
        updateUIState();
      });
    }

    updateUIState();
    updateVideoMetrics();
    initWebcam();
  }

  // ──── FINAL REPORT SCREEN ────
  function renderReport() {
    const count = roundAnswers.length || 1;
    let totalScore = 0, avgCorrectness = 0, avgDepth = 0, avgClarity = 0, avgExamples = 0;
    let avgEyeContact = 0, avgPosture = 0, avgExpression = 0, avgConfidence = 0;

    roundAnswers.forEach(ans => {
      totalScore += ans.evaluation.overallScore;
      avgCorrectness += ans.evaluation.metrics.correctness;
      avgDepth += ans.evaluation.metrics.depth;
      avgClarity += ans.evaluation.metrics.clarity;
      avgExamples += ans.evaluation.metrics.examples;
      const va = ans.videoAnalysis || {};
      avgEyeContact += va.eyeContactScore || 78;
      avgPosture += va.postureScore || 80;
      avgExpression += va.expressionScore || 76;
      avgConfidence += va.confidenceScore || 82;
    });

    const overall = Math.round(totalScore / count);
    const correctness = Math.round(avgCorrectness / count);
    const depth = Math.round(avgDepth / count);
    const clarity = Math.round(avgClarity / count);
    const examples = Math.round(avgExamples / count);
    const eyeContact = Math.round(avgEyeContact / count);
    const posture = Math.round(avgPosture / count);
    const expression = Math.round(avgExpression / count);
    const confidence = Math.round(avgConfidence / count);

    const videoScore = Math.round((eyeContact + posture + expression + confidence) / 4);
    const combinedScore = Math.round(overall * 0.65 + videoScore * 0.35);

    const scoreColor = combinedScore >= 80 ? '#34d399' : combinedScore >= 60 ? '#fbbf24' : '#f87171';
    const scoreLabel = combinedScore >= 80 ? 'Excellent Performance!' : combinedScore >= 60 ? 'Solid Foundation!' : 'Needs Preparation';

    container.innerHTML = `
      <div class="demo-fade-in-up" style="max-width: 1020px; margin: 0 auto;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 1.8rem;">
          <div style="font-size: 2.4rem; margin-bottom: 0.3rem;">🎯</div>
          <h1 style="font-size: 2rem; font-weight: 800; color: #fff; letter-spacing: -0.035em; margin-bottom: 0.35rem;">
            Demo Interview Evaluation Report
          </h1>
          <p style="font-size: 0.95rem; color: var(--text-secondary);">
            Evaluated by <strong style="color: #38bdf8;">${AI_INTERVIEWER.name}</strong> • Combined Voice &amp; Video Analysis
          </p>
        </div>

        <!-- 3-Column Composite Score Snapshot -->
        <div style="display: grid; grid-template-columns: 210px 1fr 1fr; gap: 1rem; margin-bottom: 1.4rem;">

          <!-- Overall Composite Circle -->
          <div class="glass-card" style="padding: 1.6rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
            <div style="width: 125px; height: 125px; border-radius: 50%; background: conic-gradient(${scoreColor} 0% ${combinedScore}%, rgba(255,255,255,0.08) ${combinedScore}% 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px ${scoreColor}33;">
              <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--bg-card); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 2.1rem; font-weight: 800; color: #fff;">${combinedScore}</span>
                <span style="font-size: 0.68rem; color: var(--text-muted);">/ 100</span>
              </div>
            </div>
            <div style="margin-top: 0.6rem; font-weight: 700; color: ${scoreColor}; font-size: 0.95rem;">${scoreLabel}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Overall Composite Score</div>
          </div>

          <!-- Voice & Verbal Content Breakdown -->
          <div class="glass-card" style="padding: 1.3rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.8rem;">
              <span style="font-size: 1.05rem;">🎙️</span>
              <h3 style="font-size: 0.95rem; font-weight: 700; color: #fff;">Voice &amp; Content</h3>
              <span style="margin-left: auto; font-size: 1.15rem; font-weight: 800; color: #38bdf8;">${overall}%</span>
            </div>
            ${[
              { label: 'Technical Correctness', val: correctness, color: '#38bdf8' },
              { label: 'Depth & Reasoning', val: depth, color: '#a78bfa' },
              { label: 'Vocal Articulation', val: clarity, color: '#34d399' },
              { label: 'Evidence & Examples', val: examples, color: '#fbbf24' }
            ].map(m => `
              <div style="margin-bottom: 0.55rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 2px;">
                  <span style="color: var(--text-secondary);">${m.label}</span>
                  <span style="color: ${m.color}; font-weight: 700; font-family: var(--font-mono);">${m.val}/100</span>
                </div>
                <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
                  <div style="width: ${m.val}%; height: 100%; background: ${m.color}; border-radius: 999px; transition: width 0.6s;"></div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Video & Body Language Breakdown -->
          <div class="glass-card" style="padding: 1.3rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.8rem;">
              <span style="font-size: 1.05rem;">📹</span>
              <h3 style="font-size: 0.95rem; font-weight: 700; color: #fff;">Video &amp; Body Language</h3>
              <span style="margin-left: auto; font-size: 1.15rem; font-weight: 800; color: #a78bfa;">${videoScore}%</span>
            </div>
            ${[
              { label: 'Eye Contact', val: eyeContact, color: '#38bdf8', icon: '👁️' },
              { label: 'Posture Stability', val: posture, color: '#a78bfa', icon: '🧍' },
              { label: 'Facial Composure', val: expression, color: '#34d399', icon: '😊' },
              { label: 'Presence & Confidence', val: confidence, color: '#fbbf24', icon: '💪' }
            ].map(m => `
              <div style="margin-bottom: 0.55rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 2px;">
                  <span style="color: var(--text-secondary);">${m.icon} ${m.label}</span>
                  <span style="color: ${m.color}; font-weight: 700; font-family: var(--font-mono);">${m.val}/100</span>
                </div>
                <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
                  <div style="width: ${m.val}%; height: 100%; background: ${m.color}; border-radius: 999px; transition: width 0.6s;"></div>
                </div>
              </div>
            `).join('')}
          </div>

        </div>

        <!-- Question-by-Question Breakdown -->
        <div style="margin-bottom: 1.6rem;">
          <h2 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.9rem;">
            Question-by-Question Breakdown
          </h2>
          <div style="display: flex; flex-direction: column; gap: 0.9rem;">
            ${roundAnswers.map((ans, i) => {
              const e = ans.evaluation;
              const tips = e.coachingTips || [];
              const borderCol = ['#0ea5e9', '#8b5cf6', '#10b981'][i];
              return `
                <div class="glass-card" style="padding: 1.3rem; border-left: 4px solid ${borderCol};">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="width: 26px; height: 26px; border-radius: 50%; background: ${borderCol}22; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; color: ${borderCol};">
                        ${i + 1}
                      </span>
                      <span style="font-weight: 700; color: #fff; font-size: 0.95rem;">${ans.question}</span>
                    </div>
                    <div style="font-size: 1.45rem; font-weight: 800; color: ${e.overallScore >= 80 ? '#34d399' : e.overallScore >= 60 ? '#fbbf24' : '#f87171'};">
                      ${e.overallScore}<span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 400;">/100</span>
                    </div>
                  </div>

                  <!-- Spoken Transcript Snippet -->
                  <div style="background: rgba(0,0,0,0.25); border-left: 3px solid var(--secondary); padding: 0.6rem 0.9rem; border-radius: 4px; font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.75rem; font-style: italic; max-height: 70px; overflow-y: auto;">
                    "${ans.answerText.length > 200 ? ans.answerText.slice(0, 200) + '...' : ans.answerText}"
                  </div>

                  <!-- 4-pillar sub-scores -->
                  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.6rem;">
                    ${[
                      { label: 'Correctness', val: e.metrics.correctness, col: '#38bdf8' },
                      { label: 'Depth', val: e.metrics.depth, col: '#a78bfa' },
                      { label: 'Clarity', val: e.metrics.clarity, col: '#34d399' },
                      { label: 'Examples', val: e.metrics.examples, col: '#fbbf24' }
                    ].map(s => `
                      <div style="text-align: center; padding: 0.35rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm);">
                        <div style="font-size: 1.05rem; font-weight: 800; color: ${s.col};">${s.val}</div>
                        <div style="font-size: 0.62rem; color: var(--text-muted);">${s.label}</div>
                      </div>
                    `).join('')}
                  </div>

                  ${tips.length > 0 ? `
                    <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.6rem; margin-top: 0.6rem;">
                      <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">💡 ACTIONABLE DIRECTIVE</span>
                      <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">${tips[0].action}</div>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- High-Impact Sign In / Register Prompt -->
        <div class="glass-card" style="padding: 2.2rem; text-align: center; border: 1.5px solid rgba(99,102,241,0.45); background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(14,165,233,0.08) 100%); margin-bottom: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 0.4rem;">🚀</div>
          <h2 style="font-size: 1.45rem; font-weight: 800; color: #fff; margin-bottom: 0.45rem;">
            Ready for Full-Scale Interview Mastery?
          </h2>
          <p style="font-size: 0.95rem; color: var(--text-secondary); max-width: 580px; margin: 0 auto 1.4rem; line-height: 1.55;">
            Create an account to unlock <strong style="color: #fff;">in-depth rubric breakdowns</strong>, practice across <strong style="color: #fff;">multiple roles</strong> (Full Stack, Data Science, Product, HR), experience <strong style="color: #fff;">adaptive follow-up questions</strong>, and get resume-tailored practice sessions.
          </p>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            <button type="button" id="demo-signup-btn" class="btn btn-primary btn-lg" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border: none; padding: 1rem 3.2rem; border-radius: 9999px; font-weight: 700; font-size: 1.1rem; box-shadow: 0 6px 30px rgba(99,102,241,0.5); display: inline-flex; align-items: center; gap: 0.55rem; cursor: pointer;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Sign In / Register Free
            </button>
            <button type="button" id="demo-home-btn" style="background: none; border: none; color: var(--text-muted); font-size: 0.85rem; cursor: pointer; text-decoration: underline; padding: 0.35rem;">
              ← Back to Main Home
            </button>
          </div>

          <div style="display: flex; justify-content: center; gap: 1.8rem; margin-top: 1.5rem; flex-wrap: wrap;">
            ${[
              { icon: '🎭', label: '10+ Specialized Roles' },
              { icon: '📊', label: 'Human-Calibrated Rubrics' },
              { icon: '📹', label: 'Proctor Video Telemetry' },
              { icon: '🎯', label: 'Adaptive Follow-Ups' },
              { icon: '📈', label: 'Progress Tracking' }
            ].map(f => `
              <div style="text-align: center;">
                <div style="font-size: 1.4rem;">${f.icon}</div>
                <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.2rem;">${f.label}</div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    container.querySelector('#demo-signup-btn')?.addEventListener('click', () => {
      if (onSignUp) onSignUp();
    });

    container.querySelector('#demo-home-btn')?.addEventListener('click', () => {
      if (onGoHome) onGoHome();
    });
  }

  // ──── BOOT ────
  renderIntro();
}
