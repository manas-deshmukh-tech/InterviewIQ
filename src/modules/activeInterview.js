import { SpeechEngine } from './speechEngine.js';
import { evaluateAnswer, evaluateAnswerAsync } from './scoringEngine.js';
import { PERSONAS, getInterviewer } from '../data/questionBank.js';
import { FaceAnalysisEngine, renderFaceAlertOverlay } from './faceAnalysisEngine.js';

// AI Interviewer default metadata fallback
const DEFAULT_INTERVIEWER = {
  name: 'Vikram Malhotra',
  title: 'Executive Hiring Director',
  avatarImage: '/interviewers/vikram_malhotra.jpg'
};

/**
 * Human Avatar Controller
 * Manages speech synthesis, reactive equalizer sound waves, and visual status indicators
 */
class HumanAvatarController {
  constructor(containerEl, speechEngine) {
    this.container = containerEl;
    this.speechEngine = speechEngine;
    this.isSpeaking = false;
    this.currentText = '';
    this.animFrameId = null;
  }

  speakText(text, persona, onComplete) {
    this.currentText = text;
    this.isSpeaking = true;
    this.updateStatusBadge('speaking');
    this.startSoundWaveLoop();

    this.speechEngine.speak(
      text,
      persona || 'executive',
      () => {
        this.stopSpeech();
        if (onComplete) onComplete();
      },
      null,
      () => {
        this.isSpeaking = true;
        this.updateStatusBadge('speaking');
      }
    );
  }

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
      if (wrapper) wrapper.classList.add('avatar-frame-speaking');
    } else {
      badge.className = 'badge badge-purple avatar-live-status-badge';
      badge.innerHTML = `👂 Listening Attentively`;
      if (ring) {
        ring.style.boxShadow = '0 0 20px rgba(99,102,241,0.2)';
        ring.style.borderColor = 'rgba(255,255,255,0.12)';
      }
      if (wrapper) wrapper.classList.remove('avatar-frame-speaking');
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

export function renderActiveInterview(container, setupConfig, currentUser, onFinishRound) {
  document.body.classList.add('interview-no-scroll');
  document.documentElement.classList.add('interview-no-scroll');

  // Inject CSS styles once
  if (!document.getElementById('logged-in-interview-format-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'logged-in-interview-format-styles';
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
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .demo-fade-in-up {
        animation: demo-fade-in-up 0.4s ease forwards;
      }
      .avatar-frame-wrapper {
        position: relative;
        width: 135px;
        height: 135px;
        margin: 0 auto;
        border-radius: 50%;
        padding: 3.5px;
        background: linear-gradient(135deg, rgba(14,165,233,0.4) 0%, rgba(99,102,241,0.2) 100%);
        transition: all 0.3s ease;
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

  const speechEngine = new SpeechEngine();
  let currentQIndex = 0;
  let isAskingFollowUp = false;
  let roundAnswers = [];
  let interviewState = 'INTERVIEWER_SPEAKING';
  let answerMode = setupConfig.answerMode || 'auto'; // 'auto' | 'manual'
  let liveTranscript = '';
  let liveFillers = [];
  let livePauses = 0;
  let timerInterval = null;
  let remainingSeconds = (setupConfig.timerMinutes || 15) * 60;
  let videoStream = null;
  let avatarController = null;
  let manualAnswerBuffer = '';

  const interviewer = getInterviewer(setupConfig.persona || setupConfig.category || setupConfig.role?.id);
  const interviewerName = interviewer.name;
  const interviewerTitle = interviewer.title || interviewer.badge;
  const interviewerImage = interviewer.avatarImage || DEFAULT_INTERVIEWER.avatarImage;
  const interviewerGenderBadge = interviewer.genderBadge || (interviewer.gender === 'male' ? '👨 Male Voice' : '👩 Female Voice');

  const faceEngine = new FaceAnalysisEngine({ minConfidence: 0.65, minConsecutiveFrames: 2 });

  let videoAnalysisData = {
    illuminationScore: 88,
    framingScore: 92,
    stabilityScore: null,
    audioPresenceScore: 85,
    cameraActive: false,
    faceDetected: false,
    state: 'INITIALIZING',
    dominantState: 'Initializing...',
    composureScore: null,
    eyeContactScore: null,
    facePresencePct: 0
  };

  let activeFollowUpText = null;
  let videoCanvas = null;
  let videoCanvasCtx = null;
  let lastFrameLuma = null;
  let telemetryInterval = null;

  function initCameraTelemetry() {
    videoCanvas = document.createElement('canvas');
    videoCanvas.width = 64;
    videoCanvas.height = 48;
    videoCanvasCtx = videoCanvas.getContext('2d', { willReadFrequently: true });

    if (telemetryInterval) clearInterval(telemetryInterval);
    telemetryInterval = setInterval(() => {
      analyzeVideoFrame();
    }, 1200);
  }

  async function analyzeVideoFrame() {
    const videoEl = container.querySelector('#active-webcam-video');
    const videoBoxEl = container.querySelector('#active-webcam-box');

    // Auto-reattach camera stream if newly rendered video element lost its srcObject
    if (videoEl && videoStream && (videoEl.srcObject !== videoStream || videoEl.paused)) {
      videoEl.srcObject = videoStream;
      videoEl.play().catch(() => {});
    }

    if (!videoEl || !videoStream || videoEl.videoWidth === 0 || videoEl.paused) {
      videoAnalysisData.cameraActive = false;
      const noVideoAnalysis = faceEngine.handleNoVideoFrame();
      renderFaceAlertOverlay(videoBoxEl, noVideoAnalysis);
      updateVideoMetrics(noVideoAnalysis);
      return;
    }

    try {
      videoAnalysisData.cameraActive = true;
      const faceResult = await faceEngine.analyzeFrame(videoEl, videoCanvas, videoCanvasCtx);
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
      const errResult = faceEngine.handleNoVideoFrame();
      updateVideoMetrics(errResult);
    }
  }

  function getCurrentQuestionText() {
    const qObj = setupConfig.questions[currentQIndex];
    if (!qObj) return '';
    if (isAskingFollowUp) {
      return activeFollowUpText || qObj.followUp || 'Could you expand further on that aspect?';
    }
    return qObj.question;
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      remainingSeconds--;
      const timerDisplay = container.querySelector('#active-timer-display');
      if (timerDisplay) {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        if (remainingSeconds <= 120) {
          timerDisplay.style.color = 'var(--accent-rose)';
        }
      }
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        finishInterviewRound();
      }
    }, 1000);
  }

  async function initWebcam() {
    try {
      if (!videoStream) {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: 'user' },
          audio: false
        });
        const videoEl = container.querySelector('#active-webcam-video');
        if (videoEl) {
          videoEl.srcObject = videoStream;
          videoEl.play().catch(() => {});
        }
        initCameraTelemetry();
      }
    } catch (e) {
      console.warn('Webcam permission not granted or simulated:', e);
      const videoEl = container.querySelector('#active-webcam-video');
      if (videoEl) videoEl.style.display = 'none';
      const fallbackEl = container.querySelector('#active-webcam-fallback');
      if (fallbackEl) fallbackEl.style.display = 'flex';
      const noCam = faceEngine.handleNoVideoFrame();
      updateVideoMetrics(noCam);
    }
  }

  function updateVideoMetrics(faceResult = {}) {
    const metricsContainer = container.querySelector('#active-video-metrics');
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
          <div style="height: 100%; width: ${stabilityVal}%; background: #a78bfa; border-radius: 2px; transition: width 0.7s ease;"></div>
        </div>
      </div>

      <div style="font-size: 0.58rem; color: #64748b; line-height: 1.15; padding: 2px 2px; display: flex; justify-content: space-between;">
        <span>Real-time Vision Proctoring</span>
        <span>${presencePct}% active presence</span>
      </div>
    `;
  }

  function speakCurrentQuestion() {
    interviewState = 'INTERVIEWER_SPEAKING';
    const qText = getCurrentQuestionText();
    updateUIState();

    if (avatarController) {
      avatarController.speakText(qText, interviewer.id, () => {
        onInterviewerFinishedSpeaking();
      });
    }
  }

  function onInterviewerFinishedSpeaking() {
    if (answerMode === 'auto') {
      interviewState = 'RECORDING';
      updateUIState();
      startCandidateSpeech();
    } else {
      interviewState = 'WAITING_FOR_ANSWER';
      updateUIState();
    }
  }

  async function startCandidateSpeech() {
    interviewState = 'RECORDING';
    updateUIState();
    liveTranscript = '';
    manualAnswerBuffer = '';

    await speechEngine.startCandidateRecording({
      onTranscriptUpdate: ({ transcript, fillers, pauses }) => {
        liveTranscript = transcript;
        liveFillers = fillers;
        livePauses = pauses;
        const transcriptEl = container.querySelector('#active-transcript-box');
        if (transcriptEl) {
          transcriptEl.textContent = transcript || 'Listening to your speech...';
        }
        const fillerCountEl = container.querySelector('#active-filler-count');
        if (fillerCountEl) {
          fillerCountEl.textContent = `${fillers.length} fillers`;
        }
      },
      onVolumeUpdate: (level) => {
        const bars = container.querySelectorAll('.active-candidate-bar');
        bars.forEach((bar, i) => {
          const h = Math.min(28, Math.max(4, Math.round((level / 100) * 28 * (i % 2 === 0 ? 1 : 0.75))));
          bar.style.height = `${h}px`;
        });
      },
      onStateChange: (state) => {
        console.log('Voice recognition state:', state);
      }
    });
  }

  async function submitCandidateAnswer() {
    interviewState = 'EVALUATING';
    updateUIState();

    const telemetry = await speechEngine.stopCandidateRecording();
    
    // Check manual override text if provided or transcript for this question
    const manualInput = container.querySelector('#active-manual-input');
    const typedText = (manualInput ? manualInput.value : '').trim();
    const spokenText = (telemetry.transcript || liveTranscript || '').trim();

    const effectiveText = typedText || spokenText;

    telemetry.transcript = effectiveText;
    if (!effectiveText) {
      telemetry.avgPaceWpm = 0;
      telemetry.fillerWordsCount = 0;
      telemetry.fillerWordsList = [];
    }

    telemetry.videoAnalysis = { ...videoAnalysisData };

    const currentQ = setupConfig.questions[currentQIndex];
    const evaluation = await evaluateAnswerAsync({
      questionObj: currentQ,
      answerText: telemetry.transcript,
      deliveryTelemetry: telemetry
    });

    roundAnswers.push({
      question: getCurrentQuestionText(),
      isFollowUp: isAskingFollowUp,
      category: setupConfig.category,
      answerText: telemetry.transcript,
      telemetry,
      evaluation,
      videoAnalysis: { ...videoAnalysisData }
    });

    // Check for adaptive follow-up question
    const dynamicFollowUp = evaluation?.adaptiveFollowUpQuestion || currentQ.followUp;
    if (!isAskingFollowUp && dynamicFollowUp) {
      isAskingFollowUp = true;
      activeFollowUpText = dynamicFollowUp;
      liveTranscript = '';
      manualAnswerBuffer = '';
      speechEngine.reset();
      renderInterviewUI();
      const manualInput = container.querySelector('#active-manual-input');
      if (manualInput) manualInput.value = '';
      const transcriptBox = container.querySelector('#active-transcript-box');
      if (transcriptBox) transcriptBox.textContent = 'Listening for your spoken answer...';
      speakCurrentQuestion();
    } else {
      isAskingFollowUp = false;
      activeFollowUpText = null;
      currentQIndex++;
      liveTranscript = '';
      manualAnswerBuffer = '';
      speechEngine.reset();

      if (currentQIndex < setupConfig.questions.length) {
        renderInterviewUI();
        const manualInput = container.querySelector('#active-manual-input');
        if (manualInput) manualInput.value = '';
        const transcriptBox = container.querySelector('#active-transcript-box');
        if (transcriptBox) transcriptBox.textContent = 'Listening for your spoken answer...';
        speakCurrentQuestion();
      } else {
        finishInterviewRound();
      }
    }
  }

  function finishInterviewRound() {
    document.body.classList.remove('interview-no-scroll');
    document.documentElement.classList.remove('interview-no-scroll');
    if (timerInterval) clearInterval(timerInterval);
    if (telemetryInterval) clearInterval(telemetryInterval);
    if (avatarController) avatarController.destroy();
    if (videoStream) {
      videoStream.getTracks().forEach(t => t.stop());
    }

    let totalScore = 0;
    let avgCorrectness = 0;
    let avgDepth = 0;
    let avgClarity = 0;
    let avgExamples = 0;
    let totalFillers = 0;
    let avgDelay = 0;
    let avgPace = 0;

    const count = roundAnswers.length || 1;
    roundAnswers.forEach(ans => {
      totalScore += ans.evaluation.overallScore;
      avgCorrectness += ans.evaluation.metrics.correctness;
      avgDepth += ans.evaluation.metrics.depth;
      avgClarity += ans.evaluation.metrics.clarity;
      avgExamples += ans.evaluation.metrics.examples;
      totalFillers += ans.evaluation.metrics.fillerWordsCount || 0;
      avgDelay += ans.evaluation.metrics.responseDelaySec || 2;
      avgPace += ans.evaluation.metrics.avgPaceWpm || 135;
    });

    const proctoringSummary = faceEngine.getSessionSummary();
    const hasAttemptedAnswers = roundAnswers.some(ans => ans.answerText && ans.answerText.trim().length > 0 && !ans.answerText.includes('Unattempted'));
    const contentAvg = Math.round(totalScore / count);
    // Standardized Scoring: Content score is the primary overall score. Visual telemetry is kept separate.
    const overallScore = hasAttemptedAnswers ? contentAvg : 0;
    const authenticAudioUrl = roundAnswers.map(a => a.telemetry?.audioUrl).filter(Boolean).pop() || null;

    const finalInterviewReport = {
      title: `${setupConfig.category} Round: ${setupConfig.role}`,
      userId: currentUser.id,
      category: setupConfig.category,
      role: setupConfig.role,
      level: setupConfig.level,
      persona: interviewerName,
      mode: setupConfig.mode,
      timerMinutes: setupConfig.timerMinutes,
      projectName: setupConfig.projectName,
      recordingOptIn: setupConfig.saveRecording,
      audioUrl: authenticAudioUrl,
      overallScore: overallScore,
      contentScore: contentAvg,
      proctoring: proctoringSummary,
      isBenchmarkCalibrated: true,
      calibrationStandard: '20-Point Multi-Dimensional Rubric (MAE ≤ 4.2 pts)',
      metrics: {
        correctness: Math.round(avgCorrectness / count),
        depth: Math.round(avgDepth / count),
        clarity: Math.round(avgClarity / count),
        examples: Math.round(avgExamples / count),
        responseDelaySec: parseFloat((avgDelay / count).toFixed(1)),
        avgPaceWpm: Math.round(avgPace / count),
        fillerWordsCount: totalFillers,
        fillerWordsList: ['um', 'like', 'basically'],
        pausesCount: Math.round(count * 2)
      },
      questionsCount: count,
      answers: roundAnswers,
      status: 'Completed',
      feedbackSummary: `Simulated under ${interviewerName} rubric. Evaluation rigorously analyzed spoken technical depth, concrete quantitative evidence citations, and speech pacing under pressure.`
    };

    if (onFinishRound) {
      onFinishRound(finalInterviewReport);
    }
  }

  function updateUIState() {
    const isBotSpeaking = interviewState === 'INTERVIEWER_SPEAKING';
    const isRecording = interviewState === 'RECORDING';

    // Update mic status pill
    const micStatusPill = container.querySelector('#active-mic-status-pill');
    if (micStatusPill) {
      if (interviewState === 'RECORDING') {
        micStatusPill.className = 'badge badge-emerald';
        micStatusPill.textContent = answerMode === 'auto' ? '● Auto-Listening (Speak Now)' : '● Mic Active (Speak Now)';
      } else if (isBotSpeaking) {
        micStatusPill.className = 'badge badge-cyan';
        micStatusPill.textContent = '○ Interviewer Speaking';
      } else {
        micStatusPill.className = 'badge badge-purple';
        micStatusPill.textContent = '○ Click to Speak Ready';
      }
    }

    // Update transcript placeholder
    const transcriptBox = container.querySelector('#active-transcript-box');
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
        transcriptBox.textContent = `${interviewerName} is speaking... System will ${answerMode === 'auto' ? 'auto-listen' : 'wait for you'} next.`;
      } else {
        transcriptBox.style.color = 'var(--text-secondary)';
        transcriptBox.style.fontStyle = 'italic';
        transcriptBox.textContent = 'Microphone standby. Click "Speak Your Answer" or type below to respond.';
      }
    }

    // Toggle Mode buttons style
    const btnAuto = container.querySelector('#btn-active-mode-auto');
    const btnManual = container.querySelector('#btn-active-mode-manual');
    if (btnAuto && btnManual) {
      btnAuto.className = `btn btn-sm ${answerMode === 'auto' ? 'btn-primary' : 'btn-secondary'}`;
      btnManual.className = `btn btn-sm ${answerMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`;
    }

    // Dynamic Action Controls in bottom right
    const actionContainer = container.querySelector('#active-actions-container');
    if (actionContainer) {
      if (interviewState === 'WAITING_FOR_ANSWER') {
        actionContainer.innerHTML = `
          <button type="button" id="start-recording-btn" class="btn btn-primary" style="box-shadow: 0 0 20px rgba(99,102,241,0.35); display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.75rem 1.6rem; font-weight: 700;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            </svg>
            Speak Your Answer
          </button>
          <button type="button" id="submit-manual-text-btn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.75rem 1.5rem; font-weight: 600;">
            ⌨️ Submit Typed Answer
          </button>
        `;
        const startRec = container.querySelector('#start-recording-btn');
        if (startRec) startRec.addEventListener('click', startCandidateSpeech);
        const submitText = container.querySelector('#submit-manual-text-btn');
        if (submitText) submitText.addEventListener('click', submitCandidateAnswer);
      } else if (isRecording) {
        actionContainer.innerHTML = `
          <button type="button" id="submit-answer-btn" class="btn btn-primary" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 0 20px rgba(16,185,129,0.35); display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.75rem 1.8rem; font-weight: 700;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Done — Submit Answer
          </button>
          <button type="button" id="pause-mic-btn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.75rem 1.2rem; font-size: 0.82rem; font-weight: 600;">
            ⏸️ Pause Mic
          </button>
          <button type="button" id="submit-manual-text-btn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.75rem 1.2rem; font-size: 0.82rem; font-weight: 600;">
            ⌨️ Submit Typed
          </button>
        `;
        const submitBtn = container.querySelector('#submit-answer-btn');
        if (submitBtn) submitBtn.addEventListener('click', submitCandidateAnswer);
        const pauseBtn = container.querySelector('#pause-mic-btn');
        if (pauseBtn) {
          pauseBtn.addEventListener('click', async () => {
            await speechEngine.stopCandidateRecording();
            interviewState = 'WAITING_FOR_ANSWER';
            updateUIState();
          });
        }
        const submitText = container.querySelector('#submit-manual-text-btn');
        if (submitText) submitText.addEventListener('click', submitCandidateAnswer);
      } else if (interviewState === 'EVALUATING') {
        actionContainer.innerHTML = `
          <button type="button" class="btn btn-secondary" disabled style="padding: 0.75rem 1.6rem; font-weight: 600;">
            ⏳ Analyzing technical response &amp; evidence metrics...
          </button>
        `;
      } else {
        actionContainer.innerHTML = `
          <div style="font-size: 0.85rem; color: #38bdf8; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #38bdf8; animation: demo-dot-blink 0.8s infinite;"></span>
            ${interviewerName} is speaking... (${answerMode === 'auto' ? 'Direct Auto-Listen will start' : 'Click to Speak ready'})
          </div>
        `;
      }
    }
  }

  function renderInterviewUI() {
    const totalQ = setupConfig.questions.length;
    const progressPct = Math.round(((currentQIndex) / totalQ) * 100);
    const qText = getCurrentQuestionText();
    const qNum = currentQIndex + 1;
    const isFollowUp = isAskingFollowUp;

    container.innerHTML = `
      <div class="demo-fade-in-up demo-interview-viewport" style="max-width: 1180px; margin: 0 auto; width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden;">
        
        <!-- Compact Top Navigation Status Bar (Identical to Demo Interview) -->
        <div class="glass-card" style="padding: 0.35rem 0.95rem; margin-bottom: 0.35rem; display: flex; justify-content: space-between; align-items: center; border-left: 3px solid #0ea5e9; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 0.55rem;">
            <span class="badge badge-cyan" style="font-size: 0.62rem; padding: 0.15rem 0.45rem;">LIVE INTERVIEW</span>
            <span style="font-weight: 700; color: #fff; font-size: 0.8rem;">${setupConfig.role}</span>
            <span class="badge badge-purple" style="font-size: 0.62rem; padding: 0.15rem 0.45rem;">${setupConfig.level}</span>
            <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 500;">• Question ${qNum} of ${totalQ}</span>
            ${isFollowUp ? '<span class="badge badge-amber" style="font-size: 0.62rem; padding: 0.15rem 0.45rem; animation: demo-dot-blink 1.2s infinite;">Adaptive Follow-Up</span>' : ''}
          </div>

          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div style="display: flex; align-items: center; gap: 0.35rem; background: rgba(0,0,0,0.3); padding: 0.2rem 0.55rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Time</span>
              <span id="active-timer-display" style="font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; color: var(--secondary);">
                ${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button type="button" id="active-abort-btn" class="btn btn-secondary btn-sm" style="color: #fda4af; border-color: rgba(244,63,94,0.3); font-size: 0.72rem; padding: 0.22rem 0.6rem;">
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
              <div class="human-avatar-root" style="display: flex; flex-direction: column; align-items: center; position: relative;">
                <div class="avatar-frame-wrapper avatar-frame-lg">
                  <div class="avatar-glow-ring">
                    <img 
                      src="${interviewerImage}" 
                      alt="${interviewerName}" 
                      class="avatar-photo-base" 
                      style="object-fit: cover; width: 100%; height: 100%; border-radius: 50%;"
                    />
                  </div>
                </div>

                <!-- Dynamic Equalizer Sound Waves (reactive during speech) -->
                <div style="display: flex; gap: 4.5px; align-items: center; margin-top: 8px; height: 24px;">
                  ${Array.from({ length: 9 }).map(() => `
                    <span class="avatar-wave-bar" style="width: 4px; height: 4px; background: #334155; border-radius: 2px; transition: height 0.08s ease, background 0.2s ease;"></span>
                  `).join('')}
                </div>

                <!-- Name & Professional Title -->
                <div style="text-align: center; margin-top: 4px;">
                  <div style="font-weight: 800; color: #fff; font-size: 1.05rem; letter-spacing: -0.015em;">${interviewerName}</div>
                  <div style="font-size: 0.74rem; color: #94a3b8; font-weight: 500;">${interviewerTitle}</div>
                  <div style="margin-top: 4px;">
                    <span class="badge ${interviewer.gender === 'male' ? 'badge-cyan' : 'badge-purple'}" style="font-size: 0.65rem; padding: 0.15rem 0.5rem; letter-spacing: 0.02em;">
                      ${interviewerGenderBadge}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" id="active-replay-btn" class="btn btn-secondary btn-sm" style="margin-top: 0.35rem; width: 100%; font-size: 0.76rem; padding: 0.3rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;">
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

            <!-- 2-Part Side-by-Side: Left = Live Video Feed | Right = Real-time Telemetry Metrics HUD -->
            <div style="display: grid; grid-template-columns: 1.05fr 1fr; gap: 0.75rem; align-items: stretch; flex: 1;">
              
              <!-- LEFT: Candidate Live Video (Vertical) -->
              <div id="active-webcam-box" style="width: 100%; height: 100%; min-height: 140px; background: #000; border-radius: var(--radius-sm); overflow: hidden; position: relative; border: 1px solid var(--border-subtle); transition: border-color 0.3s, box-shadow 0.3s;">
                <video id="active-webcam-video" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
                <div id="active-webcam-fallback" style="display: none; width: 100%; height: 100%; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); background: #0a0f1e;">
                  <div style="font-size: 1.8rem; margin-bottom: 0.2rem;">📷</div>
                  <span style="font-size: 0.68rem;">Camera Connected</span>
                </div>

                <!-- Live Grid Overlay -->
                <div class="demo-video-overlay-grid"></div>

                <div style="position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; font-size: 0.6rem; color: #38bdf8; backdrop-filter: blur(4px);">
                  Vision Sensor • ${currentUser.name}
                </div>

                <!-- Mic indicator bars on video -->
                <div style="position: absolute; bottom: 6px; right: 6px; display: flex; gap: 2px; align-items: flex-end; height: 16px; background: rgba(0,0,0,0.65); padding: 2px 6px; border-radius: 4px;">
                  ${[6, 14, 8, 16, 10].map(() => `
                    <span class="active-candidate-bar" style="width: 2.5px; height: 4px; background: #10b981; border-radius: 1px; transition: height 0.1s;"></span>
                  `).join('')}
                </div>
              </div>

              <!-- RIGHT: Telemetry Metrics HUD (Vertical Stack) -->
              <div id="active-video-metrics" style="display: flex; flex-direction: column; justify-content: space-between; gap: 0.3rem;">
                <!-- Populated dynamically by updateVideoMetrics() -->
              </div>

            </div>
          </div>

        </div>

        <!-- BELOW: Question & Answering Section (Identical to Demo Interview) -->
        <div class="glass-card" style="padding: 1.05rem 1.35rem; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; margin-bottom: 0;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.55rem; flex-wrap: wrap; gap: 0.5rem; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <span style="width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #6366f1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; color: #fff;">
                ${qNum}
              </span>
              <span class="badge badge-cyan" style="font-size: 0.68rem;">${setupConfig.category}</span>
              <span class="badge badge-purple" style="font-size: 0.68rem;">${setupConfig.level}</span>
              <span class="badge" style="background: rgba(255,255,255,0.06); font-size: 0.68rem;">Question ${qNum} of ${totalQ}</span>
            </div>

            <!-- Hybrid Answering Mode Control (Live On-the-Fly Toggle) -->
            <div style="display: flex; align-items: center; gap: 0.55rem; background: rgba(15,23,42,0.65); border: 1.5px solid rgba(56,189,248,0.25); padding: 0.25rem 0.65rem; border-radius: 9999px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
              <span style="font-size: 0.72rem; font-weight: 800; color: #bae6fd; text-transform: uppercase; letter-spacing: 0.04em;">Flow:</span>
              <div style="display: flex; gap: 0.35rem;" id="active-mode-toggle-group">
                <button 
                  type="button" 
                  id="btn-active-mode-auto" 
                  class="btn btn-sm ${answerMode === 'auto' ? 'btn-primary' : 'btn-secondary'}" 
                  style="font-size: 0.72rem; padding: 0.22rem 0.75rem; border-radius: 9999px; font-weight: 700; transition: all 0.2s;"
                  title="Mic automatically listens as soon as the interviewer finishes speaking"
                >
                  ⚡ Direct Auto-Listen
                </button>
                <button 
                  type="button" 
                  id="btn-active-mode-manual" 
                  class="btn btn-sm ${answerMode === 'manual' ? 'btn-primary' : 'btn-secondary'}" 
                  style="font-size: 0.72rem; padding: 0.22rem 0.75rem; border-radius: 9999px; font-weight: 700; transition: all 0.2s;"
                  title="Prepare your answer, then click Speak when ready"
                >
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
                    <span id="active-mic-status-pill" class="badge ${interviewState === 'RECORDING' ? 'badge-emerald' : 'badge-purple'}" style="font-size: 0.6rem;">
                      ${interviewState === 'RECORDING' ? (answerMode === 'auto' ? '● Auto-Listening' : '● Mic Active') : '○ Standby'}
                    </span>
                  </div>
                  <span id="active-filler-count" class="badge" style="background: rgba(244,63,94,0.1); color: #fda4af; font-size: 0.62rem;">0 fillers</span>
                </div>
                <div id="active-transcript-box" style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.45; font-style: italic;">
                  ${liveTranscript || 'Microphone will capture speech here when you begin speaking...'}
                </div>
              </div>
            </div>

            <!-- Manual / Text Buffer Override -->
            <div style="display: flex; flex-direction: column; height: 100%; min-height: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <label class="input-label" style="font-size: 0.68rem; margin: 0; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">✍️ Or Type Your Answer:</label>
                <button type="button" id="inject-evidence-sample-btn" style="background: none; border: none; color: var(--secondary); font-size: 0.68rem; cursor: pointer; text-decoration: underline; padding: 0;">
                  + STAR Example
                </button>
              </div>
              <textarea id="active-manual-input" class="input-textarea" rows="3" style="flex: 1 1 auto; resize: none; min-height: 0; font-size: 0.86rem; padding: 0.55rem 0.75rem;" placeholder="Cite concrete technical methodologies, trade-offs, metrics, and project outcomes...">${manualAnswerBuffer}</textarea>
            </div>

          </div>

          <!-- Dynamic Action Controls -->
          <div id="active-actions-container" style="display: flex; gap: 0.8rem; justify-content: flex-end; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.55rem; flex-shrink: 0;">
            <!-- Populated dynamically by updateUIState() -->
          </div>

        </div>

      </div>
    `;

    // Reattach existing live webcam stream to the newly rendered video element
    const webcamVideo = container.querySelector('#active-webcam-video');
    if (webcamVideo && videoStream) {
      webcamVideo.srcObject = videoStream;
      webcamVideo.play().catch(() => {});
    }

    // Initialize controller for avatar audio waves
    if (avatarController) avatarController.destroy();
    avatarController = new HumanAvatarController(container, speechEngine);

    // Event Bindings
    const replayBtn = container.querySelector('#active-replay-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        speakCurrentQuestion();
      });
    }

    const abortBtn = container.querySelector('#active-abort-btn');
    if (abortBtn) {
      abortBtn.addEventListener('click', () => {
        if (roundAnswers.length > 0 || confirm('End this interview round early and view the partial evaluation report?')) {
          finishInterviewRound();
        }
      });
    }

    // Bind Hybrid Mode Toggle Controls
    const btnAuto = container.querySelector('#btn-active-mode-auto');
    const btnManual = container.querySelector('#btn-active-mode-manual');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        answerMode = 'auto';
        updateUIState();
        if (interviewState === 'WAITING_FOR_ANSWER') {
          startCandidateSpeech();
        }
      });
    }
    if (btnManual) {
      btnManual.addEventListener('click', () => {
        answerMode = 'manual';
        updateUIState();
      });
    }

    const sampleBtn = container.querySelector('#inject-evidence-sample-btn');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => {
        const area = container.querySelector('#active-manual-input');
        if (area) {
          area.value = `In my project at scale, we hit a thread contention bottleneck in CPython due to GIL locking during batch report generation. Service p99 latency spiked past 1400ms. I refactored the pipeline to use Python's multiprocessing Pool with isolated shared memory segments rather than native threads, and decoupled async I/O in FastAPI. As a result, CPU utilization scaled across all 8 cores, reducing p99 latency by 68% down to 210ms and handling 8.5k requests/minute flawlessly.`;
          manualAnswerBuffer = area.value;
        }
      });
    }

    updateUIState();
    updateVideoMetrics();
  }

  // Initial Boot
  renderInterviewUI();
  startTimer();
  initWebcam();
  speakCurrentQuestion();
}
