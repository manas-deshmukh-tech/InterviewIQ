// Speech Synthesis (Interviewer voice), Speech Recognition (Candidate voice),
// Audio recording, and Delivery telemetry (Response delay, Pace WPM, Filler words, Pauses)
import { getInterviewer } from '../data/questionBank.js';

export class SpeechEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.cachedVoices = [];
    if (this.synth) {
      this.cachedVoices = this.synth.getVoices();
      if (typeof this.synth.addEventListener === 'function') {
        this.synth.addEventListener('voiceschanged', () => {
          this.cachedVoices = this.synth.getVoices();
        });
      } else {
        this.synth.onvoiceschanged = () => {
          this.cachedVoices = this.synth.getVoices();
        };
      }
    }
    this.recognition = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordedAudioBlob = null;
    this.recordedAudioUrl = null;

    // Delivery Telemetry Variables
    this.questionStartTime = 0;
    this.firstWordTime = 0;
    this.answerStartTime = 0;
    this.answerEndTime = 0;
    this.recognizedTranscript = '';
    this.fillerWordsLog = [];
    this.pauseEvents = 0;
    this.lastSpeechTimestamp = 0;
    this.isListening = false;

    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      } catch (err) {
        console.warn('Error initializing SpeechRecognition:', err);
      }
    } else {
      console.warn('SpeechRecognition API not natively available in this browser.');
    }
  }

  findMatchingVoice(gender = 'male', interviewerId = 'vikram') {
    if (!this.synth) return null;
    const voices = (this.cachedVoices && this.cachedVoices.length > 0) 
      ? this.cachedVoices 
      : this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    const femaleDisqualifiers = ['female', 'woman', 'girl', 'samantha', 'victoria', 'karen', 'zira', 'hazel', 'susan', 'linda', 'heather', 'catherine', 'fiona', 'moira', 'tessa', 'stephanie', 'alice', 'helena', 'sarah', 'ava', 'zoe', 'sonia', 'jenny'];
    const maleDisqualifiers = ['male', 'guy', 'david', 'daniel', 'alex', 'fred', 'oliver', 'george', 'james', 'christopher', 'ryan', 'mark', 'rishi', 'tom', 'lee', 'richard'];

    if (gender === 'male') {
      const maleCandidates = pool.filter(v => {
        const n = v.name.toLowerCase();
        return !femaleDisqualifiers.some(d => n.includes(d));
      });

      const priority = interviewerId === 'vikram'
        ? ['daniel', 'google uk english male', 'alex', 'oliver', 'david', 'guy', 'george', 'ryan', 'male']
        : ['alex', 'google us english male', 'fred', 'christopher', 'davis', 'rishi', 'male', 'daniel'];

      for (const token of priority) {
        const found = maleCandidates.find(v => v.name.toLowerCase().includes(token));
        if (found) return found;
      }
      if (maleCandidates.length > 0) return maleCandidates[0];
    } else {
      const femaleCandidates = pool.filter(v => {
        const n = v.name.toLowerCase();
        return !maleDisqualifiers.some(d => n.includes(d));
      });

      const priority = interviewerId === 'priya'
        ? ['google uk english female', 'google us english', 'samantha', 'victoria', 'karen', 'sonia', 'jenny', 'female']
        : interviewerId === 'ananya'
        ? ['fiona', 'moira', 'google uk english female', 'samantha', 'libby', 'maisie', 'victoria', 'female']
        : ['victoria', 'karen', 'google uk english female', 'steffan', 'samantha', 'tessa', 'female'];

      for (const token of priority) {
        const found = femaleCandidates.find(v => v.name.toLowerCase().includes(token));
        if (found) return found;
      }
      if (femaleCandidates.length > 0) return femaleCandidates[0];
    }

    return null;
  }

  speak(text, personaType = 'vikram', onEndCallback = null, onBoundaryCallback = null, onStartCallback = null) {
    if (!this.synth) return;
    this.synth.cancel(); // cancel previous utterance

    const interviewer = getInterviewer(personaType);
    const gender = interviewer?.gender || 'male';
    const config = interviewer?.voiceConfig || {};

    const utterance = new SpeechSynthesisUtterance(text);
    const matchedVoice = this.findMatchingVoice(gender, interviewer?.id);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    // Set gender-calibrated pitch and rate
    if (gender === 'male') {
      utterance.pitch = config.pitch || (interviewer?.id === 'vikram' ? 0.90 : 1.02);
      utterance.rate = config.rate || (interviewer?.id === 'vikram' ? 0.98 : 1.04);
    } else {
      utterance.pitch = config.pitch || (interviewer?.id === 'priya' ? 1.12 : interviewer?.id === 'kavita' ? 0.98 : 1.06);
      utterance.rate = config.rate || (interviewer?.id === 'ananya' ? 0.96 : 1.02);
    }

    utterance.onstart = () => {
      if (onStartCallback) onStartCallback();
    };

    utterance.onboundary = (event) => {
      if (onBoundaryCallback) {
        const charIdx = event.charIndex || 0;
        const remaining = text.slice(charIdx);
        const match = remaining.match(/^(\w+)/);
        const word = match ? match[1] : '';
        onBoundaryCallback({ charIndex: charIdx, word, text });
      }
    };

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      if (onEndCallback) onEndCallback();
    };

    this.synth.speak(utterance);
  }

  testVoice(interviewerId = 'vikram', sampleText = null, onEnd = null) {
    const interviewer = getInterviewer(interviewerId);
    const text = sampleText || interviewer?.voiceConfig?.sampleText || `Hello! I am ${interviewer?.name || 'your interviewer'}, ready to evaluate your responses.`;
    this.speak(text, interviewerId, onEnd);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  async startCandidateRecording({ onTranscriptUpdate, onVolumeUpdate, onStateChange }) {
    this.recognizedTranscript = '';
    this.fillerWordsLog = [];
    this.pauseEvents = 0;
    this.questionStartTime = Date.now();
    this.firstWordTime = 0;
    this.answerStartTime = 0;
    this.lastSpeechTimestamp = 0;
    this.audioChunks = [];
    this.recordedAudioBlob = null;
    this.recordedAudioUrl = null;
    this.isListening = true;

    // 1. Microphone Audio Stream for recording & visualizer
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };
      this.mediaRecorder.onstop = () => {
        this.recordedAudioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.recordedAudioUrl = URL.createObjectURL(this.recordedAudioBlob);
        if (stream) stream.getTracks().forEach(t => t.stop());
      };
      this.mediaRecorder.start();

      // Audio analysis for volume levels
      this.setupAudioAnalysis(stream, onVolumeUpdate);
    } catch (e) {
      console.warn('Microphone access denied or simulated:', e);
    }

    // 2. Speech-to-text recognition
    if (this.recognition) {
      this.recognition.onstart = () => {
        if (onStateChange) onStateChange('LISTENING');
      };

      this.recognition.onresult = (event) => {
        const now = Date.now();
        if (!this.firstWordTime) {
          this.firstWordTime = now;
        }

        // Pause detection (> 1.6s of silence between words)
        if (this.lastSpeechTimestamp && now - this.lastSpeechTimestamp > 1600) {
          this.pauseEvents++;
        }
        this.lastSpeechTimestamp = now;

        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.recognizedTranscript += trans + ' ';
            this.detectFillerWords(trans);
          } else {
            interimTranscript += trans;
          }
        }

        const fullDisplay = (this.recognizedTranscript + ' ' + interimTranscript).trim();
        if (onTranscriptUpdate) {
          onTranscriptUpdate({
            transcript: fullDisplay,
            fillers: this.fillerWordsLog,
            pauses: this.pauseEvents
          });
        }
      };

      this.recognition.onerror = (e) => {
        console.warn('Speech recognition error event:', e);
      };

      try {
        this.recognition.start();
      } catch (err) {
        console.warn('Recognition already active:', err);
      }
    }
  }

  setupAudioAnalysis(stream, onVolumeUpdate) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!this.isListening) {
          audioCtx.close();
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        if (onVolumeUpdate) onVolumeUpdate(normalized);
        requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      console.warn('Web Audio volume meter unsupported:', e);
    }
  }

  detectFillerWords(textChunk) {
    const fillerPatterns = [
      /\b(um|uh|er|ah)\b/gi,
      /\b(like)\b(?=\s+[a-z])/gi,
      /\b(you know)\b/gi,
      /\b(basically)\b/gi,
      /\b(actually)\b/gi,
      /\b(sort of|kind of)\b/gi,
      /\b(i mean)\b/gi
    ];

    fillerPatterns.forEach(pattern => {
      const matches = textChunk.match(pattern);
      if (matches) {
        matches.forEach(word => {
          this.fillerWordsLog.push(word.toLowerCase());
        });
      }
    });
  }

  reset() {
    this.isListening = false;
    this.recognizedTranscript = '';
    this.fillerWordsLog = [];
    this.pauseEvents = 0;
    this.audioChunks = [];
    this.recordedAudioBlob = null;
    this.recordedAudioUrl = null;
    this.firstWordTime = 0;
    this.answerStartTime = 0;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
  }

  async stopCandidateRecording() {
    this.isListening = false;
    this.answerEndTime = Date.now();

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // silent
      }
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }

    // Capture telemetry from current question before resetting
    const currentTranscript = (this.recognizedTranscript || '').trim();
    const durationSec = Math.max(1, ((this.answerEndTime - (this.firstWordTime || this.questionStartTime)) / 1000));
    const responseDelaySec = this.firstWordTime ? ((this.firstWordTime - this.questionStartTime) / 1000) : 2.5;

    // Word count & pace
    const words = currentTranscript.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const avgPaceWpm = Math.round((wordCount / (durationSec / 60))) || 0;
    const fillerWords = [...this.fillerWordsLog];
    const audioUrl = this.recordedAudioUrl;

    // CRITICAL RESET: Wipe transcript buffer immediately so previous answers NEVER leak to the next question
    this.recognizedTranscript = '';
    this.fillerWordsLog = [];
    this.audioChunks = [];
    this.firstWordTime = 0;

    return {
      transcript: currentTranscript,
      wordCount,
      durationSec: Math.round(durationSec),
      responseDelaySec: parseFloat(responseDelaySec.toFixed(1)),
      avgPaceWpm,
      fillerWordsCount: fillerWords.length,
      fillerWordsList: Array.from(new Set(fillerWords)),
      pausesCount: this.pauseEvents,
      audioUrl
    };
  }
}
