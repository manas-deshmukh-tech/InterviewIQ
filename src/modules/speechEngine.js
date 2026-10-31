// Speech Synthesis (Interviewer voice), Speech Recognition (Candidate voice),
// Audio recording, and Delivery telemetry (Response delay, Pace WPM, Filler words, Pauses)

export class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis;
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    } else {
      console.warn('SpeechRecognition API not natively available in this browser.');
    }
  }

  speak(text, personaType = 'strict', onEndCallback = null, onBoundaryCallback = null, onStartCallback = null) {
    if (!this.synth) return;
    this.synth.cancel(); // cancel previous utterance

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = this.synth.getVoices();

    // Voice tuning based on persona
    if (personaType === 'executive' || personaType === 'strict') {
      utterance.pitch = 0.94;
      utterance.rate = 1.02;
      const maleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Rishi') || v.name.includes('Alex') || v.name.includes('Male') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('Guy') || v.name.includes('George')));
      if (maleVoice) utterance.voice = maleVoice;
    } else if (personaType === 'collaborative') {
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
      const friendlyVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Victoria') || v.name.includes('Karen')));
      if (friendlyVoice) utterance.voice = friendlyVoice;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    utterance.onstart = () => {
      if (onStartCallback) onStartCallback();
    };

    utterance.onboundary = (event) => {
      if (onBoundaryCallback) {
        // Extract word from text based on charIndex
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
      this.mediaRecorder.stop();
    }

    // Compute delivery telemetry
    const durationSec = Math.max(1, ((this.answerEndTime - (this.firstWordTime || this.questionStartTime)) / 1000));
    const responseDelaySec = this.firstWordTime ? ((this.firstWordTime - this.questionStartTime) / 1000) : 2.5;

    // Word count & pace
    const words = this.recognizedTranscript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const avgPaceWpm = Math.round((wordCount / (durationSec / 60))) || 0;

    return {
      transcript: this.recognizedTranscript.trim(),
      wordCount,
      durationSec: Math.round(durationSec),
      responseDelaySec: parseFloat(responseDelaySec.toFixed(1)),
      avgPaceWpm,
      fillerWordsCount: this.fillerWordsLog.length,
      fillerWordsList: Array.from(new Set(this.fillerWordsLog)),
      pausesCount: this.pauseEvents,
      audioUrl: this.recordedAudioUrl
    };
  }
}
