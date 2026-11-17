import { SpeechEngine } from './speechEngine.js';
import { evaluateAnswer, evaluateAnswerAsync } from './scoringEngine.js';
import { FaceAnalysisEngine, renderFaceAlertOverlay } from './faceAnalysisEngine.js';

// 3 fixed demo questions with comprehensive ideal answers and concept keywords
const DEMO_QUESTIONS = [
  {
    id: 'demo_q1',
    question: 'Tell me about yourself.',
    followUp: null,
    idealKeywords: ['experience', 'background', 'skills', 'education', 'career', 'passionate', 'goal', 'worked', 'project', 'team', 'technologies', 'software', 'developer'],
    idealAnswer: 'I have a strong background in computer science, software engineering, and application development. In my previous work and projects, I have designed and implemented full-stack applications, worked with databases, and developed APIs. I am passionate about solving complex engineering challenges, collaborating effectively within agile teams, and continuously learning new technologies to build scalable, high-impact products.',
    category: 'Behavioral'
  },
  {
    id: 'demo_q2',
    question: 'Tell me about your skills and what makes you stand out.',
    followUp: null,
    idealKeywords: ['problem solving', 'communication', 'leadership', 'technical', 'teamwork', 'analytical', 'adaptable', 'creative', 'organized', 'detail', 'architecture', 'clean code', 'troubleshooting'],
    idealAnswer: 'My core technical strengths include software engineering, architecture, clean code design, and problem-solving across modern frontend and backend stacks. What makes me stand out is my strong analytical capability, fast learning curve with new frameworks, proactive ownership of project deliverables, and ability to troubleshoot critical bottlenecks under tight deadlines.',
    category: 'Behavioral'
  },
  {
    id: 'demo_q3',
    question: 'Why should we hire you?',
    followUp: null,
    idealKeywords: ['value', 'contribute', 'experience', 'results', 'passion', 'dedicated', 'growth', 'impact', 'fit', 'motivated', 'ownership', 'deliver', 'work ethic', 'goals'],
    idealAnswer: 'You should hire me because I combine solid technical engineering execution with a proactive, collaborative work ethic. I have proven experience taking software projects from requirements to deployment, delivering clean maintainable solutions on time, and collaborating seamlessly with cross-functional teams to achieve measurable business impact.',
    category: 'Behavioral'
  }
];

// AI Interviewer character metadata
const AI_INTERVIEWER = {
  name: 'Vikram Malhotra',
  title: 'Executive Hiring Director',
  company: 'InterviewIQ',
  avatarImage: '/interviewers/vikram_malhotra.jpg',
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
      'vikram',
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
  const demoFaceEngine = new FaceAnalysisEngine({ minConfidence: 0.65, minConsecutiveFrames: 2 });
  let videoAnalysisData = {
    illuminationScore: 88,
    framingScore: 92,
    stabilityScore: 90,
    audioPresenceScore: 85,
    cameraActive: false,
    faceDetected: false,
    dominantState: 'Initializing...',
    composureScore: 0,
    eyeContactScore: 0,
    facePresencePct: 0
  };

  let demoCanvas = null;
  let demoCanvasCtx = null;
  let demoLastLuma = null;
  let demoTelemetryInterval = null;

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
      .avatar-frame-wrapper.avatar-frame-lg {
        width: 135px;
        height: 135px;
        padding: 3.5px;
      }
      .avatar-frame-speaking {
        animation: demo-glow-pulse 2s infinite ease-in-out;
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

  // Real-time camera & framing computer vision telemetry
  function startVideoAnalysis() {
    demoCanvas = document.createElement('canvas');
    demoCanvas.width = 64;
    demoCanvas.height = 48;
    demoCanvasCtx = demoCanvas.getContext('2d', { willReadFrequently: true });

    if (demoTelemetryInterval) clearInterval(demoTelemetryInterval);
    demoTelemetryInterval = setInterval(async () => {
      if (phase !== 'interview') {
        clearInterval(demoTelemetryInterval);
        return;
      }
      const videoEl = container.querySelector('#demo-webcam-video');
      const videoBoxEl = container.querySelector('#demo-webcam-box');

      // Auto-reattach camera stream if newly rendered video element lost its srcObject
      if (videoEl && videoStream && (videoEl.srcObject !== videoStream || videoEl.paused)) {
        videoEl.srcObject = videoStream;
        videoEl.play().catch(() => {});
      }

      if (!videoEl || !videoStream || videoEl.videoWidth === 0 || videoEl.paused) {
        videoAnalysisData.cameraActive = false;
        const noVideo = demoFaceEngine.handleNoVideoFrame();
        renderFaceAlertOverlay(videoBoxEl, noVideo);
        updateVideoMetrics(noVideo);
        return;
      }

      try {
        videoAnalysisData.cameraActive = true;
        const faceResult = await demoFaceEngine.analyzeFrame(videoEl, demoCanvas, demoCanvasCtx);
        renderFaceAlertOverlay(videoBoxEl, faceResult);

        videoAnalysisData.faceDetected = faceResult.faceDetected;
        videoAnalysisData.state = faceResult.state;
        videoAnalysisData.dominantState = faceResult.dominantState;
        videoAnalysisData.dominantColor = faceResult.dominantColor;
        videoAnalysisData.composureScore = faceResult.composureScore;
        videoAnalysisData.eyeContactScore = faceResult.eyeContactScore;
        videoAnalysisData.stabilityScore = faceResult.stabilityScore;
        videoAnalysisData.facePresencePct = faceResult.facePresencePct;
        videoAnalysisData.confidentScore = faceResult.confidentScore;
        videoAnalysisData.tensedScore = faceResult.tensedScore;
        videoAnalysisData.engagedScore = faceResult.engagedScore;
        videoAnalysisData.detectionConfidence = faceResult.detectionConfidence;

        // Audio presence
        videoAnalysisData.audioPresenceScore = interviewState === 'RECORDING' ? (liveTranscript ? 92 : 82) : 78;

        updateVideoMetrics(faceResult);
      } catch (e) {
        const errResult = demoFaceEngine.handleNoVideoFrame();
        updateVideoMetrics(errResult);
      }
    }, 1200);
  }

  function updateVideoMetrics(faceResult = {}) {
    const metricsContainer = container.querySelector('#demo-video-metrics');
    if (!metricsContainer) return;

    const isDetected = Boolean(faceResult.faceDetected);
    let presenceLabel = 'No Face Detected';
    let presenceColor = '#ef4444';
    let presenceIcon = '⚠️';

    if (isDetected) {
      const confPct = Math.round((faceResult.detectionConfidence || 0.95) * 100);
      presenceLabel = `Face Verified (${confPct}%)`;
      presenceColor = '#34d399';
      presenceIcon = '👤';
    } else if (faceResult.state === 'MULTIPLE_FACES') {
      presenceLabel = 'Multiple Faces Detected';
      presenceColor = '#f59e0b';
      presenceIcon = '👥';
    } else if (faceResult.state === 'LOW_CONFIDENCE') {
      presenceLabel = 'Detection Uncertain';
      presenceColor = '#f59e0b';
      presenceIcon = '⚠️';
    } else if (faceResult.state === 'CAMERA_UNAVAILABLE') {
      presenceLabel = 'Camera Offline';
      presenceColor = '#64748b';
      presenceIcon = '📷';
    } else if (faceResult.state === 'DETECTOR_UNAVAILABLE') {
      presenceLabel = 'Detector Unavailable';
      presenceColor = '#f59e0b';
      presenceIcon = '⚠️';
    } else if (faceResult.state === 'INITIALIZING') {
      presenceLabel = 'Initializing Model...';
      presenceColor = '#38bdf8';
      presenceIcon = '🔄';
    } else {
      presenceLabel = 'No Face Detected';
      presenceColor = '#ef4444';
      presenceIcon = '⚠️';
    }

    // STRICT GATING: When face is not detected, all face-dependent metrics are Unavailable (—)
    const composureVal = isDetected && faceResult.composureScore !== null ? `${faceResult.composureScore}%` : '—';
    const composureWidth = isDetected && faceResult.composureScore !== null ? `${faceResult.composureScore}%` : '0%';
    const demeanorLabel = isDetected ? (faceResult.dominantState || 'Confident & Composed') : 'Unavailable';
    const demeanorColor = isDetected ? (faceResult.dominantColor || '#10b981') : '#64748b';

    const eyeContactVal = isDetected && faceResult.eyeContactScore !== null ? `${faceResult.eyeContactScore}%` : '—';
    const eyeContactWidth = isDetected && faceResult.eyeContactScore !== null ? `${faceResult.eyeContactScore}%` : '0%';

    const stabilityVal = isDetected && faceResult.stabilityScore !== null ? `${faceResult.stabilityScore}%` : '—';
    const stabilityWidth = isDetected && faceResult.stabilityScore !== null ? `${faceResult.stabilityScore}%` : '0%';

    const presencePct = faceResult.facePresencePct ?? 0;

    metricsContainer.innerHTML = `
      <!-- Face Presence & Proctoring Status -->
      <div style="background: rgba(0,0,0,0.35); padding: 0.3rem 0.55rem; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; justify-content: center; flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; margin-bottom: 2px;">
          <span style="color: #94a3b8; display: flex; align-items: center; gap: 0.25rem;">
            <span>${presenceIcon}</span> Face Presence
          </span>
          <span style="color: ${presenceColor}; font-weight: 700; font-family: var(--font-mono); font-size: 0.68rem;">
            ${presenceLabel}
          </span>
        </div>
        <div style="height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; width: ${presencePct}%; background: ${presenceColor}; border-radius: 2px; transition: width 0.7s ease;"></div>
        </div>
      </div>

      <!-- Facial Composure & Demeanor -->
      <div style="background: rgba(0,0,0,0.35); padding: 0.3rem 0.55rem; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; justify-content: center; flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; margin-bottom: 2px;">
          <span style="color: #94a3b8; display: flex; align-items: center; gap: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <span>${isDetected ? (faceResult.dominantIcon || '👔') : '—'}</span> Composure: <strong style="color: ${demeanorColor}; margin-left: 2px;">${demeanorLabel}</strong>
          </span>
          <span style="color: ${demeanorColor}; font-weight: 700; font-family: var(--font-mono);">${composureVal}</span>
        </div>
        <div style="height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; width: ${composureWidth}; background: ${demeanorColor}; border-radius: 2px; transition: width 0.7s ease;"></div>
        </div>
      </div>

      <!-- Eye Contact Alignment -->
      <div style="background: rgba(0,0,0,0.35); padding: 0.3rem 0.55rem; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; justify-content: center; flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; margin-bottom: 2px;">
          <span style="color: #94a3b8; display: flex; align-items: center; gap: 0.25rem;">
            <span>👁️</span> Eye Contact Poise
          </span>
          <span style="color: ${isDetected ? '#38bdf8' : '#64748b'}; font-weight: 700; font-family: var(--font-mono);">${eyeContactVal}</span>
        </div>
        <div style="height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; width: ${eyeContactWidth}; background: #38bdf8; border-radius: 2px; transition: width 0.7s ease;"></div>
        </div>
      </div>

      <!-- Head & Posture Stability -->
      <div style="background: rgba(0,0,0,0.35); padding: 0.3rem 0.55rem; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; justify-content: center; flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; margin-bottom: 2px;">
          <span style="color: #94a3b8; display: flex; align-items: center; gap: 0.25rem;">
            <span>🎥</span> Posture Stability
          </span>
          <span style="color: ${isDetected ? '#a78bfa' : '#64748b'}; font-weight: 700; font-family: var(--font-mono);">${stabilityVal}</span>
        </div>
        <div style="height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; width: ${stabilityWidth}; background: #a78bfa; border-radius: 2px; transition: width 0.7s ease;"></div>
        </div>
      </div>

      <div style="font-size: 0.58rem; color: #64748b; line-height: 1.15; padding: 2px 2px; display: flex; justify-content: space-between;">
        <span>Real-time Vision Proctoring</span>
        <span>${presencePct}% active presence</span>
      </div>
    `;
  }

  // ──── PHOTOREALISTIC AVATAR HTML BUILDER ────
  function getAvatarHTML(isSpeakingNow, isLarge = false, customSize = null) {
    const waveCount = 9;
    const sizeStyle = customSize ? `width: ${customSize}px; height: ${customSize}px;` : '';
    return `
      <div class="human-avatar-root" style="display: flex; flex-direction: column; align-items: center; position: relative;">
        
        <!-- Portrait Container with Ambient Aura -->
        <div class="avatar-frame-wrapper ${isLarge ? 'avatar-frame-lg' : ''} ${isSpeakingNow ? 'avatar-frame-speaking' : ''}" style="${sizeStyle}">
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
        <div style="display: flex; gap: 4.5px; align-items: center; margin-top: ${customSize ? '9px' : '10px'}; height: ${customSize ? '26px' : '26px'};">
          ${Array.from({ length: waveCount }).map(() => `
            <span class="avatar-wave-bar" style="width: 4px; height: 4px; background: #334155; border-radius: 2px; transition: height 0.08s ease, background 0.2s ease;"></span>
          `).join('')}
        </div>

        <!-- Name & Professional Title -->
        <div style="text-align: center; margin-top: 5px;">
          <div style="font-weight: 800; color: #fff; font-size: ${customSize ? '1.35rem' : '1.05rem'}; letter-spacing: -0.015em;">${AI_INTERVIEWER.name}</div>
          <div style="font-size: ${customSize ? '0.94rem' : '0.76rem'}; color: #94a3b8; font-weight: 500;">${AI_INTERVIEWER.title}</div>
        </div>

      </div>
    `;
  }

  // ──── INTRO SCREEN ────
  function renderIntro() {
    document.body.classList.add('interview-no-scroll');
    document.documentElement.classList.add('interview-no-scroll');

    container.innerHTML = `
      <div class="demo-fade-in-up demo-interview-viewport" style="max-width: 1260px; margin: 0 auto; width: 100%; height: 100%; display: flex !important; flex-direction: column !important; justify-content: space-evenly !important; align-items: center !important; text-align: center; overflow: hidden; padding: 0.5rem 1.5rem; box-sizing: border-box;">

        <!-- AI Interviewer Preview Avatar -->
        <div style="flex-shrink: 0;">
          ${getAvatarHTML(false, false, 196)}
        </div>

        <!-- Title & Subtitle Info -->
        <div style="flex-shrink: 0; max-width: 900px;">
          <h1 style="font-size: 2.6rem; font-weight: 800; color: #fff; letter-spacing: -0.035em; margin: 0 0 0.4rem; line-height: 1.15;">
            Free Demo Interview
          </h1>
          <p style="font-size: 1.2rem; color: var(--text-secondary); margin: 0 auto 0.55rem; line-height: 1.45;">
            Meet <strong style="color: #38bdf8;">${AI_INTERVIEWER.name}</strong>, your AI interviewer. He will ask you 3 foundational interview questions using real voice.
          </p>
          <div style="display: inline-flex; align-items: center; gap: 1.15rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); padding: 0.48rem 1.6rem; border-radius: 9999px; font-size: 0.96rem; color: var(--text-secondary); font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.25);">
            <span style="display: inline-flex; align-items: center; gap: 0.45rem;">🗣️ Live Voice &amp; Video Interview</span>
            <span style="color: rgba(255,255,255,0.3);">•</span>
            <span style="display: inline-flex; align-items: center; gap: 0.45rem;">📹 Real-Time Proctor Analytics</span>
            <span style="color: rgba(255,255,255,0.3);">•</span>
            <span style="display: inline-flex; align-items: center; gap: 0.45rem;">🎯 Instant AI Analysis</span>
          </div>
        </div>

        <!-- 3 Demo Question Cards (Horizontal 3-Column Preview) -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; width: 100%; max-width: 1200px; margin: 0 auto; flex-shrink: 0;">
          ${DEMO_QUESTIONS.map((q, i) => `
            <div class="glass-card" style="padding: 1.25rem 1.55rem; border-top: 4.5px solid ${['#0ea5e9', '#8b5cf6', '#10b981'][i]}; border-radius: var(--radius-md); text-align: left; display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.85); border-left: 1px solid rgba(255,255,255,0.09); border-right: 1px solid rgba(255,255,255,0.09); border-bottom: 1px solid rgba(255,255,255,0.09); box-shadow: 0 10px 30px rgba(0,0,0,0.35);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <div style="width: 36px; height: 36px; border-radius: 9px; background: ${['rgba(14,165,233,0.2)', 'rgba(139,92,246,0.2)', 'rgba(16,185,129,0.2)'][i]}; border: 1.5px solid ${['rgba(14,165,233,0.5)', 'rgba(139,92,246,0.5)', 'rgba(16,185,129,0.5)'][i]}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.05rem; color: ${['#38bdf8', '#a78bfa', '#34d399'][i]};">
                  ${i + 1}
                </div>
                <span class="badge" style="background: rgba(255,255,255,0.08); font-size: 0.78rem; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.25rem 0.75rem; border-radius: 9999px;">${q.category}</span>
              </div>
              <div>
                <div style="font-weight: 700; color: #fff; font-size: 1.18rem; line-height: 1.42; margin-bottom: 6px;">${q.question}</div>
                <div style="font-size: 0.86rem; color: var(--text-muted); font-weight: 500;">Behavioral Assessment</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 1.35rem; justify-content: center; align-items: center; flex-shrink: 0;">
          <button type="button" id="demo-start-btn" class="btn btn-primary" style="background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); border: none; padding: 1.05rem 4.2rem; border-radius: 9999px; font-weight: 800; font-size: 1.25rem; box-shadow: 0 8px 32px rgba(14,165,233,0.6); display: inline-flex; align-items: center; gap: 0.65rem; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Start Free Demo
          </button>
          <button type="button" id="demo-back-btn" class="btn btn-secondary" style="padding: 1.05rem 3.2rem; border-radius: 9999px; font-size: 1.15rem; font-weight: 600; cursor: pointer;">
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
      document.body.classList.remove('interview-no-scroll');
      document.documentElement.classList.remove('interview-no-scroll');
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
    liveTranscript = '';
    manualAnswerBuffer = '';

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
    const typedText = (manualInput ? manualInput.value : '').trim();
    const spokenText = (telemetry.transcript || liveTranscript || '').trim();

    // Prioritize explicitly typed text if entered; otherwise use spoken transcript for THIS question
    const effectiveText = typedText || spokenText;

    telemetry.transcript = effectiveText;
    if (!effectiveText) {
      telemetry.avgPaceWpm = 0;
      telemetry.fillerWordsCount = 0;
      telemetry.fillerWordsList = [];
    }

    telemetry.videoAnalysis = { ...videoAnalysisData };

    const evaluation = await evaluateAnswerAsync({
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
    speechEngine.reset();

    if (currentQIndex < DEMO_QUESTIONS.length) {
      renderInterviewUI();
      const manualInput = container.querySelector('#demo-manual-input');
      if (manualInput) manualInput.value = '';
      const transcriptBox = container.querySelector('#demo-transcript-box');
      if (transcriptBox) transcriptBox.textContent = 'Microphone will capture speech here when you begin speaking...';
      speakCurrentQuestion();
    } else {
      finishDemo();
    }
  }

  function finishDemo() {
    document.body.classList.remove('interview-no-scroll');
    document.documentElement.classList.remove('interview-no-scroll');
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
    document.body.classList.add('interview-no-scroll');
    document.documentElement.classList.add('interview-no-scroll');

    const totalQ = DEMO_QUESTIONS.length;
    const progressPct = Math.round((currentQIndex / totalQ) * 100);
    const qText = getCurrentQuestionText();
    const qNum = currentQIndex + 1;

    container.innerHTML = `
      <div class="demo-fade-in-up demo-interview-viewport" style="max-width: 1180px; margin: 0 auto; width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden;">

        <!-- Compact Top Navigation Status Bar -->
        <div class="glass-card" style="padding: 0.35rem 0.95rem; margin-bottom: 0.35rem; display: flex; justify-content: space-between; align-items: center; border-left: 3px solid #0ea5e9; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 0.55rem;">
            <span class="badge badge-cyan" style="font-size: 0.62rem; padding: 0.15rem 0.45rem;">DEMO ROUND</span>
            <span style="font-weight: 700; color: #fff; font-size: 0.8rem;">Live Voice &amp; Video</span>
            <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 500;">• Question ${qNum} of ${totalQ}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div style="display: flex; align-items: center; gap: 0.35rem; background: rgba(0,0,0,0.3); padding: 0.2rem 0.55rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Time</span>
              <span id="demo-timer" style="font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; color: var(--secondary);">
                ${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button type="button" id="demo-end-btn" class="btn btn-secondary btn-sm" style="color: #fda4af; border-color: rgba(244,63,94,0.3); font-size: 0.72rem; padding: 0.22rem 0.6rem;">
              End Simulation
            </button>
          </div>
        </div>

        <!-- Slim Progress Bar -->
        <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; margin-bottom: 0.55rem; flex-shrink: 0;">
          <div style="width: ${progressPct}%; height: 100%; background: linear-gradient(90deg, #0284c7, #6366f1); transition: width 0.4s;"></div>
        </div>

        <!-- TOP ROW: Side-by-Side Video Feeds (Left: AI Interviewer | Right: Candidate Live Video Stream) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.65rem; align-items: stretch; flex-shrink: 0;">

          <!-- LEFT: AI Executive Interviewer Card -->
          <div class="glass-card" style="padding: 0.75rem 1.1rem; text-align: center; position: relative; overflow: hidden; background: radial-gradient(circle at 50% 25%, rgba(14,165,233,0.14) 0%, rgba(15,23,42,0.85) 75%), var(--bg-surface); border: 1px solid rgba(14,165,233,0.3); box-shadow: 0 10px 25px -8px rgba(0,0,0,0.5); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
              <span style="font-size: 0.7rem; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.04em;">AI Executive Interviewer</span>
              <span class="badge badge-cyan avatar-live-status-badge" style="font-size: 0.68rem; padding: 0.18rem 0.5rem;">
                🔊 Speaking Question
              </span>
            </div>

            <!-- Photorealistic Avatar Centered -->
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0.15rem 0;">
              ${getAvatarHTML(true, true)}
            </div>

            <button type="button" id="demo-replay-btn" class="btn btn-secondary btn-sm" style="margin-top: 0.35rem; width: 100%; font-size: 0.76rem; padding: 0.3rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;">
              🔄 Replay Question Voice
            </button>
          </div>

          <!-- RIGHT: Candidate Live Video Stream Card -->
          <div class="glass-card" style="padding: 0.75rem 1.1rem; position: relative; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <span style="font-size: 0.7rem; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.04em;">Candidate Live Video Stream</span>
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: demo-dot-blink 1.8s infinite;"></span>
                <span style="font-size: 0.65rem; color: #34d399; font-weight: 600;">ACTIVE</span>
              </div>
            </div>

            <!-- 2-Part Side-by-Side: Left = Live Video Feed | Right = Real-time Telemetry Metrics -->
            <div style="display: grid; grid-template-columns: 1.05fr 1fr; gap: 0.75rem; align-items: stretch; flex: 1;">
              
              <!-- LEFT: Candidate Live Video (Vertical) -->
              <div id="demo-webcam-box" style="width: 100%; height: 100%; min-height: 140px; background: #000; border-radius: var(--radius-sm); overflow: hidden; position: relative; border: 1px solid var(--border-subtle); transition: border-color 0.3s, box-shadow 0.3s;">
                <video id="demo-webcam-video" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
                <div id="demo-webcam-fallback" style="display: none; width: 100%; height: 100%; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); background: #0a0f1e;">
                  <div style="font-size: 1.8rem; margin-bottom: 0.2rem;">📷</div>
                  <span style="font-size: 0.68rem;">Camera not accessible</span>
                </div>

                <!-- Live Grid Overlay -->
                <div class="demo-video-overlay-grid"></div>

                <div style="position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; font-size: 0.6rem; color: #38bdf8; backdrop-filter: blur(4px);">
                  Vision Sensor
                </div>

                <!-- Mic indicator bars on video -->
                <div style="position: absolute; bottom: 6px; right: 6px; display: flex; gap: 2px; align-items: flex-end; height: 16px; background: rgba(0,0,0,0.65); padding: 2px 6px; border-radius: 4px;">
                  ${[6, 14, 8, 16, 10].map(() => `
                    <span class="demo-candidate-bar" style="width: 2.5px; height: 4px; background: #10b981; border-radius: 1px; transition: height 0.1s;"></span>
                  `).join('')}
                </div>
              </div>

              <!-- RIGHT: Telemetry Metrics HUD (Vertical Stack) -->
              <div id="demo-video-metrics" style="display: flex; flex-direction: column; justify-content: space-between; gap: 0.3rem;">
                <!-- Populated dynamically -->
              </div>

            </div>
          </div>

        </div>

        <!-- BELOW: Question & Answering Section -->
        <div class="glass-card" style="padding: 1.05rem 1.35rem; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; margin-bottom: 0;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.55rem; flex-wrap: wrap; gap: 0.5rem; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <span style="width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #6366f1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; color: #fff;">
                ${qNum}
              </span>
              <span class="badge badge-cyan" style="font-size: 0.68rem;">Behavioral</span>
              <span class="badge" style="background: rgba(255,255,255,0.06); font-size: 0.68rem;">Question ${qNum} of ${totalQ}</span>
            </div>

            <!-- Hybrid Answering Mode Control -->
            <div style="display: flex; align-items: center; gap: 0.45rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); padding: 0.25rem 0.65rem; border-radius: var(--radius-sm);">
              <span style="font-size: 0.72rem; font-weight: 700; color: #fff;">Answer Mode:</span>
              <span id="demo-mode-desc" style="display: none;">${answerMode === 'auto' ? '⚡ Direct Auto-Listen' : '🎙️ Click to Speak'}</span>
              <div style="display: flex; gap: 0.3rem;" id="demo-mode-toggle-group">
                <button type="button" id="btn-mode-auto" class="btn btn-sm ${answerMode === 'auto' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 0.7rem; padding: 0.2rem 0.65rem; border-radius: 9999px;">
                  ⚡ Direct Auto-Listen
                </button>
                <button type="button" id="btn-mode-manual" class="btn btn-sm ${answerMode === 'manual' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 0.7rem; padding: 0.2rem 0.65rem; border-radius: 9999px;">
                  🎙️ Click to Speak
                </button>
              </div>
            </div>
          </div>

          <h2 style="font-size: 1.22rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 0.65rem; flex-shrink: 0;">
            "${qText}"
          </h2>

          <!-- 2-Column Answering Area: Left = Spoken Stream | Right = Manual Typing -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.95rem; align-items: stretch; flex: 1 1 auto; min-height: 0; margin-bottom: 0.55rem;">
            
            <!-- Real-time Speech-to-text Transcription -->
            <div style="border: 1px solid var(--border-subtle); background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.75rem 0.9rem; display: flex; flex-direction: column; justify-content: space-between; height: 100%; min-height: 0; overflow-y: auto;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">🎙️ Spoken Transcription</span>
                    <span id="demo-mic-status-pill" class="badge ${interviewState === 'RECORDING' ? 'badge-emerald' : 'badge-purple'}" style="font-size: 0.6rem;">
                      ${interviewState === 'RECORDING' ? (answerMode === 'auto' ? '● Auto-Listening' : '● Mic Active') : '○ Standby'}
                    </span>
                  </div>
                  <span id="demo-filler-count" class="badge" style="background: rgba(244,63,94,0.1); color: #fda4af; font-size: 0.62rem;">0 fillers</span>
                </div>
                <div id="demo-transcript-box" style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.45; font-style: italic;">
                  ${liveTranscript || 'Microphone will capture speech here when you begin speaking...'}
                </div>
              </div>
            </div>

            <!-- Manual / Text Buffer Override -->
            <div style="display: flex; flex-direction: column; height: 100%; min-height: 0;">
              <label class="input-label" style="font-size: 0.68rem; margin-bottom: 0.25rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">✍️ Or Type Your Answer:</label>
              <textarea id="demo-manual-input" class="input-textarea" rows="3" style="flex: 1 1 auto; resize: none; min-height: 0; font-size: 0.86rem; padding: 0.55rem 0.75rem;" placeholder="If you prefer typing, share your background, experience, key skills, and impact here...">${manualAnswerBuffer}</textarea>
            </div>

          </div>

          <!-- Dynamic Action Controls -->
          <div id="demo-actions-container" style="display: flex; gap: 0.8rem; justify-content: flex-end; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.55rem; flex-shrink: 0;">
            <!-- Populated by updateUIState() -->
          </div>

        </div>

      </div>
    `;

    // Reattach existing live webcam stream to the newly rendered video element
    const webcamVideo = container.querySelector('#demo-webcam-video');
    if (webcamVideo && videoStream) {
      webcamVideo.srcObject = videoStream;
      webcamVideo.play().catch(() => {});
    }

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
    let effectiveAnswers = [...roundAnswers];

    // Targeted coaching tips per question
    const DEFAULT_COACHING_TIPS = [
      "Strong narrative structure. Quantify your team impact with concrete metrics (e.g. 35% speedup) to make your introduction memorable.",
      "Solid technical breadth. Cite an architectural trade-off or high-stakes bug to demonstrate senior-level problem solving.",
      "Compelling value proposition. Link your ownership mindset directly to the company's tech stack and upcoming roadmap."
    ];

    // If the candidate ended early or skipped questions, record them accurately as unattempted (0 score)
    if (effectiveAnswers.length < 3) {
      for (let i = effectiveAnswers.length; i < 3; i++) {
        effectiveAnswers.push({
          question: DEMO_QUESTIONS[i].question,
          category: DEMO_QUESTIONS[i].category,
          answerText: '(No answer submitted / Unattempted)',
          evaluation: {
            overallScore: 0,
            metrics: { correctness: 0, depth: 0, clarity: 0, examples: 0 },
            coachingTips: [{ action: 'Attempt all questions to receive an evaluation. Leaving a question blank results in 0 marks.' }]
          },
          videoAnalysis: {
            illuminationScore: 0,
            framingScore: 0,
            stabilityScore: 0,
            audioPresenceScore: 0,
            cameraActive: false
          }
        });
      }
    }

    const count = effectiveAnswers.length || 1;
    let totalScore = 0, avgCorrectness = 0, avgDepth = 0, avgClarity = 0, avgExamples = 0;
    let avgLighting = 0, avgFraming = 0, avgStability = 0, avgAudio = 0;
    let activeCameraCount = 0;

    effectiveAnswers.forEach(ans => {
      const qScore = typeof ans.evaluation?.overallScore === 'number' ? ans.evaluation.overallScore : 0;
      totalScore += qScore;
      avgCorrectness += typeof ans.evaluation?.metrics?.correctness === 'number' ? ans.evaluation.metrics.correctness : 0;
      avgDepth += typeof ans.evaluation?.metrics?.depth === 'number' ? ans.evaluation.metrics.depth : 0;
      avgClarity += typeof ans.evaluation?.metrics?.clarity === 'number' ? ans.evaluation.metrics.clarity : 0;
      avgExamples += typeof ans.evaluation?.metrics?.examples === 'number' ? ans.evaluation.metrics.examples : 0;

      const va = ans.videoAnalysis || {};
      if (va.cameraActive) {
        activeCameraCount++;
        avgLighting += typeof va.illuminationScore === 'number' ? va.illuminationScore : 0;
        avgFraming += typeof va.framingScore === 'number' ? va.framingScore : 0;
        avgStability += typeof va.stabilityScore === 'number' ? va.stabilityScore : 0;
        avgAudio += typeof va.audioPresenceScore === 'number' ? va.audioPresenceScore : 0;
      }
    });

    const overall = Math.round(totalScore / count);
    const correctness = Math.round(avgCorrectness / count);
    const depth = Math.round(avgDepth / count);
    const clarity = Math.round(avgClarity / count);
    const examples = Math.round(avgExamples / count);

    const proctoring = demoFaceEngine.getSessionSummary();
    const hasAttemptedAnswers = effectiveAnswers.some(ans => ans.answerText && ans.answerText !== '(No answer submitted / Unattempted)');

    const hasValidVideo = Boolean(proctoring.hasValidData && proctoring.presencePct > 0 && proctoring.avgComposure !== null && activeCameraCount > 0);
    const presenceVal = (activeCameraCount > 0 && hasAttemptedAnswers) ? proctoring.presencePct : 0;
    const composureVal = hasValidVideo ? proctoring.avgComposure : null;
    const eyeContactVal = hasValidVideo ? proctoring.avgEyeContact : null;
    const stabilityVal = hasValidVideo ? proctoring.avgStability : null;

    const videoScore = hasValidVideo ? composureVal : null;
    // Standardized Scoring: Content score is the primary overall score. Visual telemetry is separate.
    const combinedScore = !hasAttemptedAnswers ? 0 : overall;

    const scoreColor = combinedScore >= 80 ? '#10b981' : combinedScore >= 60 ? '#f59e0b' : '#ef4444';
    const scoreLabel = !hasAttemptedAnswers ? 'Unattempted / Incomplete' : combinedScore >= 80 ? 'Excellent Performance!' : combinedScore >= 60 ? 'Solid Foundation!' : 'Needs Preparation';

    document.body.classList.add('interview-no-scroll');
    document.documentElement.classList.add('interview-no-scroll');

    container.innerHTML = `
      <div class="demo-fade-in-up demo-interview-viewport" style="max-width: 1240px; margin: 0 auto; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; padding: 0.3rem 0.5rem; box-sizing: border-box;">

        <!-- 1. HEADER SECTION -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.45rem 0.85rem; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-md); backdrop-filter: blur(8px); flex-shrink: 0; margin-bottom: 0.55rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 36px; height: 36px; border-radius: 9px; background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35);">
              🎯
            </div>
            <div>
              <h1 style="font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1.2; margin: 0; letter-spacing: -0.02em;">
                Demo Interview Evaluation Report
              </h1>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.15rem 0 0;">
                Evaluated by <strong style="color: #38bdf8;">${AI_INTERVIEWER.name}</strong> • Combined Voice &amp; Video Proctoring Analysis
              </p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <span style="font-size: 0.72rem; color: var(--text-muted); background: rgba(255,255,255,0.04); padding: 0.25rem 0.65rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.08);">
              Free Diagnostic Round
            </span>
            <span class="badge" style="background: ${scoreColor}22; color: ${scoreColor}; border: 1.5px solid ${scoreColor}66; font-size: 0.82rem; padding: 0.32rem 0.95rem; font-weight: 700; border-radius: 9999px; box-shadow: 0 0 16px ${scoreColor}22;">
              ${scoreLabel}
            </span>
          </div>
        </div>

        <!-- 2. COMPOSITE SCORE SNAPSHOT (3 CARDS) -->
        <div style="display: grid; grid-template-columns: 215px 1fr 1fr; gap: 0.75rem; margin-bottom: 0.55rem; flex-shrink: 0;">

          <!-- Overall Composite Score Card -->
          <div class="glass-card" style="padding: 0.75rem 0.9rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.09);">
            <div style="width: 86px; height: 86px; border-radius: 50%; background: conic-gradient(${scoreColor} 0% ${combinedScore}%, rgba(255,255,255,0.08) ${combinedScore}% 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px ${scoreColor}33;">
              <div style="width: 70px; height: 70px; border-radius: 50%; background: var(--bg-card); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 1.75rem; font-weight: 800; color: #fff; line-height: 1;">${combinedScore}</span>
                <span style="font-size: 0.62rem; color: var(--text-muted); line-height: 1; margin-top: 2px;">/ 100</span>
              </div>
            </div>
            <div style="margin-top: 0.4rem; font-weight: 700; color: ${scoreColor}; font-size: 0.85rem; letter-spacing: -0.01em;">${scoreLabel}</div>
            <div style="font-size: 0.66rem; color: var(--text-muted); margin-top: 1px;">Overall Composite Score</div>
          </div>

          <!-- Voice & Verbal Content Card -->
          <div class="glass-card" style="padding: 0.85rem 1.15rem; display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.09);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.45rem;">
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="font-size: 1.1rem;">🎙️</span>
                <h3 style="font-size: 0.92rem; font-weight: 700; color: #fff; margin: 0;">Voice &amp; Content</h3>
              </div>
              <span class="badge" style="background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); font-size: 0.88rem; font-weight: 800; padding: 0.18rem 0.6rem;">
                ${overall}%
              </span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.95rem;">
              ${[
                { label: 'Technical Correctness', val: correctness, color: '#38bdf8' },
                { label: 'Depth & Reasoning', val: depth, color: '#a78bfa' },
                { label: 'Vocal Articulation', val: clarity, color: '#34d399' },
                { label: 'Evidence & Examples', val: examples, color: '#fbbf24' }
              ].map(m => `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.74rem; margin-bottom: 3px;">
                    <span style="color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-weight: 500;">${m.label}</span>
                    <span style="color: ${m.color}; font-weight: 700; font-family: var(--font-mono); margin-left: 4px;">${m.val}/100</span>
                  </div>
                  <div style="height: 5px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden;">
                    <div style="width: ${m.val}%; height: 100%; background: ${m.color}; border-radius: 999px; transition: width 0.6s;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Video & Proctoring Telemetry Card -->
          <div class="glass-card" style="padding: 0.85rem 1.15rem; display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.09);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.45rem;">
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="font-size: 1.1rem;">📹</span>
                <h3 style="font-size: 0.92rem; font-weight: 700; color: #fff; margin: 0;">Face Demeanor &amp; Proctoring</h3>
              </div>
              <span class="badge" style="background: rgba(167,139,250,0.15); color: ${hasValidVideo ? '#a78bfa' : '#64748b'}; border: 1px solid rgba(167,139,250,0.3); font-size: 0.88rem; font-weight: 800; padding: 0.18rem 0.6rem;">
                ${hasValidVideo ? `${videoScore}%` : 'Unavailable'}
              </span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.95rem;">
              ${[
                { label: 'Face In-View Rate', val: presenceVal, color: '#38bdf8', icon: '👤', isPct: true },
                { label: 'Composure & Poise', val: composureVal, color: '#10b981', icon: '👔' },
                { label: 'Eye Contact Alignment', val: eyeContactVal, color: '#a78bfa', icon: '👁️' },
                { label: 'Posture Stability', val: stabilityVal, color: '#fbbf24', icon: '🎥' }
              ].map(m => `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.74rem; margin-bottom: 3px;">
                    <span style="color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-weight: 500;">${m.icon} ${m.label}</span>
                    <span style="color: ${m.val !== null ? m.color : '#64748b'}; font-weight: 700; font-family: var(--font-mono); margin-left: 4px;">${m.val !== null ? (m.isPct ? `${m.val}%` : `${m.val}/100`) : '—'}</span>
                  </div>
                  <div style="height: 5px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden;">
                    <div style="width: ${m.val !== null ? m.val : 0}%; height: 100%; background: ${m.val !== null ? m.color : 'transparent'}; border-radius: 999px; transition: width 0.6s;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- 3. QUESTION-BY-QUESTION BREAKDOWN (3 HORIZONTAL CARDS) -->
        <div style="display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; margin-bottom: 0.55rem;">
          <div style="font-size: 0.88rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; padding: 0 0.25rem;">
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <span>📋</span>
              <span>Question-by-Question Breakdown (${effectiveAnswers.length} Questions)</span>
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">Multi-Pillar Rubric Scoring</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(${Math.max(1, effectiveAnswers.length)}, 1fr); gap: 0.75rem; flex: 1 1 auto; min-height: 0;">
            ${effectiveAnswers.map((ans, i) => {
              const e = ans.evaluation || { overallScore: 0, metrics: { correctness: 0, depth: 0, clarity: 0, examples: 0 } };
              const borderCol = ['#0ea5e9', '#8b5cf6', '#10b981'][i] || '#0ea5e9';
              
              // Pick personalized coaching tip
              const tipText = (e.coachingTips && e.coachingTips[0]?.action && !e.coachingTips[0].action.includes('cut p99 from'))
                ? e.coachingTips[0].action
                : DEFAULT_COACHING_TIPS[i] || 'Structure past experiences strictly using Situation -> Task -> Action -> Result.';

              const scoreCol = e.overallScore >= 80 ? '#10b981' : e.overallScore >= 60 ? '#f59e0b' : '#ef4444';

              return `
                <div class="glass-card" style="padding: 0.75rem 0.95rem; border-top: 3px solid ${borderCol}; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between; min-height: 0; overflow: hidden; background: rgba(15, 23, 42, 0.75); border-left: 1px solid rgba(255,255,255,0.07); border-right: 1px solid rgba(255,255,255,0.07); border-bottom: 1px solid rgba(255,255,255,0.07);">
                  <div>
                    <!-- Question Title & Score Badge -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                      <div style="display: flex; align-items: center; gap: 0.45rem; overflow: hidden; flex: 1; padding-right: 0.5rem;">
                        <span style="width: 22px; height: 22px; border-radius: 6px; background: ${borderCol}22; border: 1px solid ${borderCol}55; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.72rem; color: ${borderCol}; flex-shrink: 0;">
                          ${i + 1}
                        </span>
                        <span style="font-weight: 700; color: #fff; font-size: 0.84rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${ans.question}">${ans.question}</span>
                      </div>
                      <div style="background: ${scoreCol}18; border: 1px solid ${scoreCol}55; padding: 0.18rem 0.55rem; border-radius: 9999px; display: flex; align-items: baseline; gap: 2px; flex-shrink: 0;">
                        <span style="font-size: 0.95rem; font-weight: 800; color: ${scoreCol}; line-height: 1;">${e.overallScore}</span>
                        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 600;">/100</span>
                      </div>
                    </div>

                    <!-- Spoken Transcript Excerpt -->
                    <div style="background: rgba(0,0,0,0.35); border-left: 2.5px solid ${borderCol}; padding: 0.35rem 0.6rem; border-radius: 4px; font-size: 0.74rem; color: #cbd5e1; margin-bottom: 0.45rem; font-style: italic; max-height: 44px; line-height: 1.35; overflow-y: auto;">
                      "${ans.answerText.length > 130 ? ans.answerText.slice(0, 130) + '...' : ans.answerText}"
                    </div>

                    <!-- 4-Pillar Sub-Scores Grid -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.3rem; margin-bottom: 0.35rem;">
                      ${[
                        { label: 'Correct', val: e.metrics.correctness, col: '#38bdf8' },
                        { label: 'Depth', val: e.metrics.depth, col: '#a78bfa' },
                        { label: 'Clarity', val: e.metrics.clarity, col: '#34d399' },
                        { label: 'Example', val: e.metrics.examples, col: '#fbbf24' }
                      ].map(s => `
                        <div style="text-align: center; padding: 0.25rem 0.15rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px;">
                          <div style="font-size: 0.92rem; font-weight: 800; color: ${s.col}; line-height: 1.1;">${s.val}</div>
                          <div style="font-size: 0.6rem; color: var(--text-muted); margin-top: 1px; font-weight: 500;">${s.label}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Actionable Coaching Tip -->
                  <div style="border-top: 1px solid rgba(255,255,255,0.07); padding-top: 0.35rem; display: flex; align-items: flex-start; gap: 0.35rem;">
                    <span style="font-size: 0.66rem; color: #38bdf8; font-weight: 800; white-space: nowrap;">💡 TIP:</span>
                    <span style="font-size: 0.72rem; color: var(--text-secondary); line-height: 1.35;">${tipText}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 4. HORIZONTAL FULL-SCALE INTERVIEW MASTERY BANNER -->
        <div class="glass-card" style="padding: 0.85rem 1.4rem; border: 1.5px solid rgba(99,102,241,0.45); background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(14,165,233,0.1) 100%); flex-shrink: 0; display: flex; flex-direction: column; gap: 0.55rem; border-radius: var(--radius-md); box-shadow: 0 8px 30px -8px rgba(99,102,241,0.25);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 1.25rem;">
            <!-- Left: Headline & Description -->
            <div style="display: flex; align-items: center; gap: 0.85rem; flex: 1; text-align: left;">
              <div style="font-size: 2rem; flex-shrink: 0;">🚀</div>
              <div>
                <h2 style="font-size: 1.18rem; font-weight: 800; color: #fff; margin: 0 0 0.15rem; letter-spacing: -0.015em;">
                  Ready for Full-Scale Interview Mastery?
                </h2>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.4; max-width: 740px;">
                  Create an account to unlock <strong style="color: #fff;">in-depth rubric breakdowns</strong>, practice across <strong style="color: #fff;">multiple roles</strong> (Full Stack, Data Science, Product, HR), experience <strong style="color: #fff;">adaptive follow-up questions</strong>, and get resume-tailored practice sessions.
                </p>
              </div>
            </div>

            <!-- Right: Action Buttons -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.3rem; flex-shrink: 0;">
              <button type="button" id="demo-signup-btn" class="btn btn-primary" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border: none; padding: 0.68rem 2.2rem; border-radius: 9999px; font-weight: 700; font-size: 0.96rem; box-shadow: 0 6px 20px rgba(99,102,241,0.45); display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; white-space: nowrap; transition: transform 0.2s, box-shadow 0.2s;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Sign In / Register Free
              </button>
              <button type="button" id="demo-home-btn" style="background: none; border: none; color: var(--text-muted); font-size: 0.8rem; cursor: pointer; text-decoration: underline; padding: 0.15rem;">
                ← Back to Main Home
              </button>
            </div>
          </div>

          <!-- Bottom: 5 Horizontal Features Strip -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.45rem; gap: 0.5rem;">
            ${[
              { icon: '🎭', label: '10+ Specialized Roles' },
              { icon: '📊', label: 'Human-Calibrated Rubrics' },
              { icon: '📹', label: 'Proctor Video Telemetry' },
              { icon: '🎯', label: 'Adaptive Follow-Ups' },
              { icon: '📈', label: 'Progress Tracking' }
            ].map(f => `
              <div style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.76rem; color: var(--text-secondary); font-weight: 600; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 0.24rem 0.65rem; border-radius: 9999px;">
                <span style="font-size: 0.95rem;">${f.icon}</span>
                <span>${f.label}</span>
              </div>
            `).join('')}
          </div>

        </div>

      </div>
    `;

    container.querySelector('#demo-signup-btn')?.addEventListener('click', () => {
      document.body.classList.remove('interview-no-scroll');
      document.documentElement.classList.remove('interview-no-scroll');
      if (onSignUp) onSignUp();
    });

    container.querySelector('#demo-home-btn')?.addEventListener('click', () => {
      document.body.classList.remove('interview-no-scroll');
      document.documentElement.classList.remove('interview-no-scroll');
      if (onGoHome) onGoHome();
    });
  }

  // ──── BOOT ────
  renderIntro();
}
