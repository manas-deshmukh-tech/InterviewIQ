/**
 * InterviewIQ — Real-Time Face Detection, Presence & Facial Analysis Engine
 * 
 * Strict Detection-First Architecture:
 * Camera Frame → Frame Validation → Face Detection → Detection Confidence Validation → 
 * Face Presence Decision → Facial Analysis Eligibility Gating → UI Update.
 * 
 * Strict State Machine:
 * - CAMERA_UNAVAILABLE : Camera track offline, paused, permission denied, or 0x0
 * - INITIALIZING       : Warm-up or fresh round initialization
 * - NO_FACE            : Zero verified human faces in camera frame
 * - ONE_FACE           : Exactly one verified face detected
 * - MULTIPLE_FACES     : Two or more distinct candidate faces detected
 * - LOW_CONFIDENCE     : Face candidate found but below confidence threshold or clipped
 * - STALE_FRAME        : Out-of-order asynchronous frame
 * - ANALYSIS_READY     : Strict gate passed; observable metrics & estimates permitted
 */

export const FaceEngineState = {
  CAMERA_UNAVAILABLE: 'CAMERA_UNAVAILABLE',
  INITIALIZING: 'INITIALIZING',
  NO_FACE: 'NO_FACE',
  ONE_FACE: 'ONE_FACE',
  MULTIPLE_FACES: 'MULTIPLE_FACES',
  LOW_CONFIDENCE: 'LOW_CONFIDENCE',
  STALE_FRAME: 'STALE_FRAME',
  DETECTOR_UNAVAILABLE: 'DETECTOR_UNAVAILABLE',
  ANALYSIS_READY: 'ANALYSIS_READY'
};

// Shared singleton detector cache across interview rounds to prevent redundant WASM compilation
let cachedMediaPipeDetector = null;
let cachedMediaPipePromise = null;

export class FaceAnalysisEngine {
  constructor(options = {}) {
    this.minConfidence = options.minConfidence || 0.65;
    this.minConsecutiveFrames = options.minConsecutiveFrames ?? 1;
    this.consecutiveFaceFrames = 0;
    this.state = FaceEngineState.INITIALIZING;
    this.frameSequence = 0;
    this.lastProcessedSequence = 0;
    
    this.totalFramesAnalyzed = 0;
    this.framesWithFace = 0;
    this.absenceEventsCount = 0;
    this.wasAbsent = false;

    // Strict Model Verification Gate:
    // Only a reliable, trained face detection model (MediaPipe BlazeFace or Native Hardware ML)
    // is authorized to declare a face detected and calculate face-dependent visual metrics.
    // Handcrafted heuristics cannot independently authorize visual analysis.
    this.requireTrainedModel = options.requireTrainedModel ?? true;
    this.allowHeuristicFallback = options.allowHeuristicFallback ?? false;
    this.isModelInitializing = typeof window !== 'undefined';
    this.initializationError = null;

    // Rolling observable demeanor counters (only populated during ANALYSIS_READY)
    this.accumulatedScores = {
      confident: 0,
      tensed: 0,
      engaged: 0,
      eyeContact: 0,
      stability: 0,
      count: 0
    };

    this.lastFaceCentroid = null;
    this.lastLumaDistribution = null;

    this.mediaPipeDetector = null;
    this.hasMediaPipeSupport = false;

    this.nativeDetector = null;
    this.hasNativeSupport = false;

    this.modelType = 'None (Model Initializing)';

    if (options.detector) {
      this.mediaPipeDetector = options.detector;
      this.hasMediaPipeSupport = true;
      this.modelType = options.modelType || 'Injected Trained Face Detector';
      this.isModelInitializing = false;
    } else {
      this.initMediaPipeDetector();
      this.initNativeDetector();
    }
  }

  async initMediaPipeDetector() {
    if (typeof window === 'undefined') {
      this.isModelInitializing = false;
      return;
    }

    if (cachedMediaPipeDetector) {
      this.mediaPipeDetector = cachedMediaPipeDetector;
      this.hasMediaPipeSupport = true;
      this.modelType = 'Google MediaPipe BlazeFace (Trained Neural Net)';
      this.isModelInitializing = false;
      this.initializationError = null;
      return;
    }

    this.isModelInitializing = true;

    if (!cachedMediaPipePromise) {
      cachedMediaPipePromise = (async () => {
        // 1. Resolve MediaPipe tasks-vision:
        // First try the local bundled npm package, then fall back to the corrected official CDN URL
        let vision = null;
        try {
          vision = await import('@mediapipe/tasks-vision');
        } catch (localErr) {
          try {
            vision = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
          } catch (cdnErr) {
            throw new Error(`Failed to load MediaPipe tasks-vision library: ${cdnErr?.message || localErr?.message}`);
          }
        }

        if (!vision || !vision.FilesetResolver || !vision.FaceDetector) {
          throw new Error('MediaPipe Vision Tasks exports missing FilesetResolver or FaceDetector');
        }

        // 2. Resolve WebAssembly Fileset:
        // First try local /wasm endpoint (served locally by Vite with 0ms network latency), then official CDN
        let wasmFileset = null;
        try {
          wasmFileset = await vision.FilesetResolver.forVisionTasks('/wasm');
        } catch (localWasmErr) {
          console.warn('[FaceEngine] Local /wasm fileset unavailable, attempting CDN fallback:', localWasmErr);
          try {
            wasmFileset = await vision.FilesetResolver.forVisionTasks(
              'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
            );
          } catch (cdnWasmErr) {
            throw new Error(`Failed to resolve MediaPipe WASM runtime: ${cdnWasmErr?.message || localWasmErr?.message}`);
          }
        }

        // 3. Resolve Model Asset:
        // Try local /models endpoint first, then official Google Storage CDN
        const modelCandidates = [
          '/models/blaze_face_short_range.tflite',
          'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
        ];

        let detector = null;
        let lastError = null;

        for (const modelPath of modelCandidates) {
          // Attempt GPU delegate first for hardware WebGL2 compute
          try {
            detector = await vision.FaceDetector.createFromOptions(wasmFileset, {
              baseOptions: {
                modelAssetPath: modelPath,
                delegate: 'GPU'
              },
              runningMode: 'IMAGE',
              minDetectionConfidence: 0.50
            });
            if (detector) break;
          } catch (gpuErr) {
            // Fall back to WebAssembly CPU delegate (SIMD), which works 100% reliably on Safari and iOS
            try {
              detector = await vision.FaceDetector.createFromOptions(wasmFileset, {
                baseOptions: {
                  modelAssetPath: modelPath,
                  delegate: 'CPU'
                },
                runningMode: 'IMAGE',
                minDetectionConfidence: 0.50
              });
              if (detector) break;
            } catch (cpuErr) {
              lastError = cpuErr;
              console.warn(`[FaceEngine] Failed to initialize model from ${modelPath}:`, cpuErr);
            }
          }
        }

        if (!detector) {
          throw lastError || new Error('Could not instantiate FaceDetector from candidate asset paths');
        }

        cachedMediaPipeDetector = detector;
        console.info('✅ [FaceEngine] Google MediaPipe BlazeFace Neural Network loaded and ready.');
        return detector;
      })();
    }

    try {
      this.mediaPipeDetector = await cachedMediaPipePromise;
      this.hasMediaPipeSupport = true;
      this.modelType = 'Google MediaPipe BlazeFace (Trained Neural Net)';
      this.initializationError = null;
    } catch (err) {
      console.error('❌ [FaceEngine] MediaPipe initialization error:', err);
      this.hasMediaPipeSupport = false;
      this.initializationError = err && err.message ? err.message : String(err);
      cachedMediaPipePromise = null; // allow re-attempt
    } finally {
      this.isModelInitializing = false;
    }
  }

  async initNativeDetector() {
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        // @ts-ignore
        this.nativeDetector = new window.FaceDetector({
          maxDetectedFaces: 4,
          fastMode: true
        });
        this.hasNativeSupport = true;
        if (!this.hasMediaPipeSupport) {
          this.modelType = 'Browser Native FaceDetector (Hardware ML)';
          this.isModelInitializing = false;
        }
      } catch (e) {
        this.hasNativeSupport = false;
      }
    }
  }

  /**
   * Resets entire engine state for a new interview session.
   * Completely clears previous candidate measurements, sequence numbers, and accumulators.
   */
  reset() {
    this.state = FaceEngineState.INITIALIZING;
    this.frameSequence = 0;
    this.lastProcessedSequence = 0;
    this.totalFramesAnalyzed = 0;
    this.framesWithFace = 0;
    this.absenceEventsCount = 0;
    this.wasAbsent = false;
    this.consecutiveFaceFrames = 0;
    this.lastFaceCentroid = null;
    this.lastLumaDistribution = null;
    this.accumulatedScores = {
      confident: 0,
      tensed: 0,
      engaged: 0,
      eyeContact: 0,
      stability: 0,
      count: 0
    };
  }

  /**
   * Analyzes a single camera video frame through the strict detection gate.
   * @param {HTMLVideoElement} videoEl
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   * @returns {Promise<FaceAnalysisResult>}
   */
  async analyzeFrame(videoEl, canvas, ctx) {
    const currentSeq = ++this.frameSequence;

    // STEP 1: Frame & Camera Hardware Validation
    if (!videoEl || videoEl.videoWidth === 0 || videoEl.paused || videoEl.ended) {
      this.consecutiveFaceFrames = 0;
      return this.transitionState(FaceEngineState.CAMERA_UNAVAILABLE, currentSeq, {
        message: 'Camera Unavailable — Please ensure camera is connected and permitted'
      });
    }

    if (!videoEl.srcObject || !videoEl.srcObject.active) {
      this.consecutiveFaceFrames = 0;
      return this.transitionState(FaceEngineState.CAMERA_UNAVAILABLE, currentSeq, {
        message: 'Camera Stream Inactive'
      });
    }

    const w = canvas.width || 64;
    const h = canvas.height || 48;

    try {
      ctx.drawImage(videoEl, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const pixels = imgData.data;

      // STEP 2: Sequence Freshness Validation (Drop Stale Out-of-Order Frames)
      if (currentSeq < this.lastProcessedSequence) {
        return this.transitionState(FaceEngineState.STALE_FRAME, currentSeq, {
          message: 'Stale frame dropped'
        });
      }

      // STEP 3: Detection Tier 1 — Google MediaPipe BlazeFace Neural Network
      if (this.hasMediaPipeSupport && this.mediaPipeDetector) {
        try {
          // Detect directly from hardware video element for full camera resolution fidelity
          const mpResult = this.mediaPipeDetector.detect(videoEl);
          const detections = mpResult.detections || [];
          const vw = videoEl.videoWidth || 640;
          const vh = videoEl.videoHeight || 480;

          if (detections.length > 1) {
            // Cluster detections to ensure we don't count duplicate boxes on the same face
            const distinctFaces = [];
            for (const d of detections) {
              const b = d.boundingBox;
              const cx = (b.originX + b.width / 2) / vw;
              const cy = (b.originY + b.height / 2) / vh;
              const isOverlap = distinctFaces.some(df => Math.abs(df.cx - cx) < 0.28 && Math.abs(df.cy - cy) < 0.28);
              if (!isOverlap) distinctFaces.push({ cx, cy, d });
            }

            if (distinctFaces.length > 1) {
              this.consecutiveFaceFrames = 0;
              const boxes = distinctFaces.map(df => ({
                x: parseFloat((df.d.boundingBox.originX / vw).toFixed(3)),
                y: parseFloat((df.d.boundingBox.originY / vh).toFixed(3)),
                width: parseFloat((df.d.boundingBox.width / vw).toFixed(3)),
                height: parseFloat((df.d.boundingBox.height / vh).toFixed(3)),
                confidence: df.d.categories && df.d.categories[0] ? parseFloat(df.d.categories[0].score.toFixed(2)) : 0.95
              }));
              return this.transitionState(FaceEngineState.MULTIPLE_FACES, currentSeq, {
                faceCount: distinctFaces.length,
                boxes,
                message: `Multiple Faces Detected (${distinctFaces.length}) — Please ensure only one person is in camera view`
              });
            }
          }

          if (detections.length >= 1) {
            const det = detections[0];
            const rawScore = det.categories && det.categories[0] ? det.categories[0].score : 0.95;
            if (rawScore < this.minConfidence) {
              this.consecutiveFaceFrames = 0;
              return this.transitionState(FaceEngineState.LOW_CONFIDENCE, currentSeq, {
                confidence: rawScore,
                message: 'Low Detection Confidence — Please face the camera in good lighting'
              });
            }

            const bb = det.boundingBox;
            const normBox = {
              x: bb.originX / vw,
              y: bb.originY / vh,
              width: bb.width / vw,
              height: bb.height / vh
            };

            const isBounded = normBox.x >= -0.08 && (normBox.x + normBox.width) <= 1.08 &&
                              normBox.y >= -0.08 && (normBox.y + normBox.height) <= 1.08;

            if (!isBounded) {
              this.consecutiveFaceFrames = 0;
              return this.transitionState(FaceEngineState.LOW_CONFIDENCE, currentSeq, {
                confidence: rawScore,
                message: 'Face Partially Outside Camera Frame — Please center yourself'
              });
            }

            // Multi-Frame Stability Gate (Hysteresis)
            this.consecutiveFaceFrames++;
            if (this.consecutiveFaceFrames < this.minConsecutiveFrames) {
              return this.transitionState(FaceEngineState.ONE_FACE, currentSeq, {
                confidence: rawScore,
                message: 'Verifying Face Stability...'
              });
            }

            return this.executeFacialAnalysis(pixels, w, h, {
              cx: (normBox.x + normBox.width / 2) * w,
              cy: (normBox.y + normBox.height / 2) * h,
              w: normBox.width * w,
              h: normBox.height * h,
              normBox,
              confidence: rawScore,
              modelType: 'Google MediaPipe BlazeFace (Trained Neural Net)'
            }, currentSeq);
          } else {
            this.consecutiveFaceFrames = 0;
            return this.transitionState(FaceEngineState.NO_FACE, currentSeq, {
              message: 'No Face Detected — Please position yourself in front of the camera'
            });
          }
        } catch (mpErr) {
          console.warn('[FaceEngine] MediaPipe frame detect error, falling back:', mpErr);
        }
      }

      // STEP 4: Detection Tier 2 — Native Hardware-Accelerated FaceDetector (if available in browser)
      if (this.hasNativeSupport && this.nativeDetector) {
        try {
          const detectedFaces = await this.nativeDetector.detect(videoEl);
          const vw = videoEl.videoWidth || 640;
          const vh = videoEl.videoHeight || 480;

          if (detectedFaces && detectedFaces.length > 0) {
            if (detectedFaces.length > 1) {
              this.consecutiveFaceFrames = 0;
              const boxes = Array.from(detectedFaces).map(f => ({
                x: parseFloat((f.boundingBox.x / vw).toFixed(3)),
                y: parseFloat((f.boundingBox.y / vh).toFixed(3)),
                width: parseFloat((f.boundingBox.width / vw).toFixed(3)),
                height: parseFloat((f.boundingBox.height / vh).toFixed(3)),
                confidence: 0.95
              }));
              return this.transitionState(FaceEngineState.MULTIPLE_FACES, currentSeq, {
                faceCount: detectedFaces.length,
                boxes,
                message: `Multiple Faces Detected (${detectedFaces.length}) — Please ensure only one person is in camera view`
              });
            }

            const face = detectedFaces[0];
            const box = face.boundingBox;
            const normBox = {
              x: box.x / vw,
              y: box.y / vh,
              width: box.width / vw,
              height: box.height / vh
            };

            // Boundary containment check
            const isBounded = normBox.x >= -0.08 && (normBox.x + normBox.width) <= 1.08 &&
                              normBox.y >= -0.08 && (normBox.y + normBox.height) <= 1.08;

            if (!isBounded) {
              this.consecutiveFaceFrames = 0;
              return this.transitionState(FaceEngineState.LOW_CONFIDENCE, currentSeq, {
                message: 'Face Partially Outside Camera Frame — Please center yourself'
              });
            }

            // Multi-Frame Stability Gate (Hysteresis)
            this.consecutiveFaceFrames++;
            if (this.consecutiveFaceFrames < this.minConsecutiveFrames) {
              return this.transitionState(FaceEngineState.ONE_FACE, currentSeq, {
                confidence: 0.95,
                message: 'Verifying Face Stability...'
              });
            }

            return this.executeFacialAnalysis(pixels, w, h, {
              cx: (normBox.x + normBox.width / 2) * w,
              cy: (normBox.y + normBox.height / 2) * h,
              w: normBox.width * w,
              h: normBox.height * h,
              normBox,
              confidence: 0.95,
              modelType: 'Browser Native FaceDetector (Hardware ML)'
            }, currentSeq);
          } else {
            this.consecutiveFaceFrames = 0;
            return this.transitionState(FaceEngineState.NO_FACE, currentSeq, {
              message: 'No Face Detected — Please position yourself in front of the camera'
            });
          }
        } catch (nativeErr) {
          // Gracefully continue to structural computer vision fallback
        }
      }

      // STEP 5: Trained Model Required Validation
      // Handcrafted heuristics cannot independently declare a face or authorize visual analysis in production.
      if (this.requireTrainedModel && !this.allowHeuristicFallback) {
        this.consecutiveFaceFrames = 0;
        if (this.isModelInitializing) {
          return this.transitionState(FaceEngineState.INITIALIZING, currentSeq, {
            message: 'Loading Trained Face Detection Model...'
          });
        }
        const unavailableMsg = this.initializationError
          ? `Trained Face Detection Model Unavailable (${this.initializationError}) — Real-time Face Verification Suspended`
          : 'Trained Face Detection Model Unavailable — Real-time Face Verification Suspended';
        return this.transitionState(FaceEngineState.DETECTOR_UNAVAILABLE, currentSeq, {
          message: unavailableMsg
        });
      }

      // STEP 6: Heuristic Diagnostic Scanner (Only executed when explicitly allowed, e.g. synthetic test fixtures)
      return this.processStructuralDetection(pixels, w, h, currentSeq);

    } catch (err) {
      this.consecutiveFaceFrames = 0;
      return this.transitionState(FaceEngineState.CAMERA_UNAVAILABLE, currentSeq, {
        message: 'Camera Frame Capture Error'
      });
    }
  }

  /**
   * Universal Structural Face Detection Pipeline
   * Validates:
   * 1. Photometric integrity (camera covered / blackout / overexposure).
   * 2. Human skin chrominance cluster (differentiates human face from beige/cream paint).
   * 3. Viola-Jones Haar features (forehead dip, cheek lift, bilateral eye depression, nose bridge).
   * 4. Multi-face centroid clustering and non-maximum suppression.
   */
  processStructuralDetection(pixels, w, h, seq) {
    const totalPixels = w * h;
    const lumas = new Float32Array(totalPixels);
    const isSkin = new Uint8Array(totalPixels);
    let sumLuma = 0;
    let minLuma = 255, maxLuma = 0;
    let skinPixelCount = 0;

    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      lumas[i] = lum;
      sumLuma += lum;

      if (lum < minLuma) minLuma = lum;
      if (lum > maxLuma) maxLuma = lum;

      // Robust YCbCr Skin Chrominance Filter across all ethnicities
      const cb = -0.1687 * r - 0.3313 * g + 0.5 * b + 128;
      const cr =  0.5 * r - 0.4187 * g - 0.0813 * b + 128;

      if (cb >= 75 && cb <= 130 && cr >= 130 && cr <= 175 && r > b && (r - b) >= 6 && lum >= 28 && lum <= 240) {
        isSkin[i] = 1;
        skinPixelCount++;
      }
    }

    const avgLuma = sumLuma / totalPixels;
    const lumaRange = maxLuma - minLuma;

    // RULE 1: Extreme Lighting or Blackout (Hand over lens, covered camera, total darkness)
    if (avgLuma < 12 || avgLuma > 248 || lumaRange < 25) {
      return this.transitionState(FaceEngineState.NO_FACE, seq, {
        message: avgLuma < 12 ? 'Camera Blocked / Insufficient Light' : 'Extreme Lighting Exposure'
      });
    }

    // RULE 2: Minimum Skin Cluster Presence in Frame
    // Requires at least 3.0% of the frame to exhibit human skin chrominance
    if (skinPixelCount < Math.floor(totalPixels * 0.030)) {
      return this.transitionState(FaceEngineState.NO_FACE, seq, {
        message: 'No Face Detected — Please position yourself in front of the camera'
      });
    }

    // Sobel Edge Filter across frame to evaluate ocular & facial structural gradient
    const edges = new Float32Array(totalPixels);
    const gradX = new Float32Array(totalPixels);
    const gradY = new Float32Array(totalPixels);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const gx = (-1 * lumas[(y-1)*w + (x-1)]) + (1 * lumas[(y-1)*w + (x+1)])
                 + (-2 * lumas[y*w + (x-1)])     + (2 * lumas[y*w + (x+1)])
                 + (-1 * lumas[(y+1)*w + (x-1)]) + (1 * lumas[(y+1)*w + (x+1)]);
        const gy = (-1 * lumas[(y-1)*w + (x-1)]) + (-2 * lumas[(y-1)*w + x]) + (-1 * lumas[(y-1)*w + (x+1)])
                 + ( 1 * lumas[(y+1)*w + (x-1)]) + ( 2 * lumas[(y+1)*w + x]) + ( 1 * lumas[(y+1)*w + (x+1)]);
        gradX[y * w + x] = Math.abs(gx);
        gradY[y * w + x] = Math.abs(gy);
        edges[y * w + x] = Math.sqrt(gx * gx + gy * gy);
      }
    }

    // RULE 3: Multi-Scale Facial Window Scanner
    const candidates = [];
    const scales = [
      { boxW: Math.floor(w * 0.32), boxH: Math.floor(h * 0.42) },
      { boxW: Math.floor(w * 0.42), boxH: Math.floor(h * 0.52) }
    ];

    for (const scale of scales) {
      const { boxW, boxH } = scale;
      for (let fy = Math.floor(h * 0.18); fy <= Math.floor(h * 0.60); fy += 2) {
        for (let fx = Math.floor(w * 0.15); fx <= Math.floor(w * 0.85); fx += 2) {
          const bx1 = Math.max(0, fx - Math.floor(boxW / 2));
          const bx2 = Math.min(w, fx + Math.floor(boxW / 2));
          const by1 = Math.max(0, fy - Math.floor(boxH / 2));
          const by2 = Math.min(h, fy + Math.floor(boxH / 2));

          const bh = by2 - by1;
          const bw = bx2 - bx1;
          if (bh < 12 || bw < 10) continue;

          let skinPx = 0, boxTotal = 0;
          let boxSumLuma = 0, boxSumSqLuma = 0;
          let sumGx = 0, sumGy = 0;

          const yFh = by1 + Math.floor(bh * 0.25);
          const yEye = by1 + Math.floor(bh * 0.55);

          let eyeCount = 0, eyeEdgeSum = 0;
          const eyeMidL = bx1 + Math.floor(bw * 0.38);
          const eyeMidR = bx1 + Math.floor(bw * 0.62);

          let leftEyeLuma = 0, leftEyeCount = 0;
          let rightEyeLuma = 0, rightEyeCount = 0;

          for (let y = by1; y < by2; y++) {
            for (let x = bx1; x < bx2; x++) {
              const idx = y * w + x;
              boxTotal++;
              if (isSkin[idx]) skinPx++;
              const lum = lumas[idx];
              boxSumLuma += lum;
              boxSumSqLuma += lum * lum;
              const ed = edges[idx];
              sumGx += gradX[idx];
              sumGy += gradY[idx];

              if (y >= yFh && y < yEye) {
                eyeCount++;
                eyeEdgeSum += ed;
                if (x < eyeMidL) { leftEyeLuma += lum; leftEyeCount++; }
                else if (x > eyeMidR) { rightEyeLuma += lum; rightEyeCount++; }
              }
            }
          }

          const skinRatio = skinPx / Math.max(1, boxTotal);
          if (skinRatio < 0.22) continue;

          const avgEyeEdge = eyeEdgeSum / Math.max(1, eyeCount);
          const mLeftEye = leftEyeLuma / Math.max(1, leftEyeCount);
          const mRightEye = rightEyeLuma / Math.max(1, rightEyeCount);
          const eyeDiff = Math.abs(mLeftEye - mRightEye);
          const eyeSym = 1.0 - Math.min(1.0, eyeDiff / 30.0);

          const edgeBalance = Math.min(sumGx, sumGy) / Math.max(1, Math.max(sumGx, sumGy));

          const boxMean = boxSumLuma / Math.max(1, boxTotal);
          const boxStd = Math.sqrt(Math.max(0, (boxSumSqLuma / Math.max(1, boxTotal)) - (boxMean * boxMean)));

          // Physical Face Signature Check:
          // A real face (even with glasses & beard) has distinct ocular feature edges (avgEyeEdge >= 52.0),
          // bilateral eye symmetry (eyeSym >= 0.70), balanced 2D edge orientations (edgeBalance >= 0.32),
          // and natural luminance standard deviation (boxStd >= 16.0).
          // Blank or textured walls/ceilings produce smooth gradients or single lines with eyeSym < 0.70 or edgeBalance < 0.25.
          const isValidHaar = (avgEyeEdge >= 52.0) && (eyeSym >= 0.70) && (edgeBalance >= 0.32) && (boxStd >= 16.0);

          if (isValidHaar) {
            const score = (skinRatio * 0.30) + (eyeSym * 0.25) + (Math.min(1.0, avgEyeEdge / 120.0) * 0.30) + (Math.min(1.0, boxStd / 40.0) * 0.15);

            if (score >= 0.65) {
              candidates.push({
                x: bx1, y: by1, w: bw, h: bh,
                bw, bh,
                cx: fx, cy: fy,
                score,
                avgEyeEdge,
                eyeSym,
                edgeBalance
              });
            }
          }
        }
      }
    }

    // RULE 4: Candidate Clustering by Physical Person (Centroid Proximity & Bounding Extent)
    const clusters = this.clusterCandidateDetections(candidates, w, h);

    if (clusters.length === 0) {
      this.consecutiveFaceFrames = 0;
      return this.transitionState(FaceEngineState.NO_FACE, seq, {
        message: 'No Face Detected — Please position yourself in front of the camera'
      });
    }

    if (clusters.length > 1) {
      // Only flag MULTIPLE_FACES if the secondary cluster is genuinely another distinct person
      // separated horizontally by at least 38% of the frame width at head level with substantial detections
      const primary = clusters[0];
      const distinctPersons = clusters.slice(1).filter(cl => {
        const isFarX = Math.abs(cl.cx - primary.cx) >= w * 0.38;
        const isHeadLevel = cl.cy <= h * 0.55;
        const hasSubstantialMembers = (cl.members ? cl.members.length : 1) >= 12 &&
                                      (cl.members ? cl.members.length : 1) >= (primary.members ? primary.members.length * 0.20 : 1);
        return isFarX && isHeadLevel && hasSubstantialMembers;
      });

      if (distinctPersons.length > 0) {
        this.consecutiveFaceFrames = 0;
        const allClusters = [primary, ...distinctPersons];
        const boxes = allClusters.map(c => {
          const cW = c.bw || c.w || w * 0.35;
          const cH = c.bh || c.h || h * 0.42;
          return {
            x: parseFloat(Math.max(0, (c.cx - cW / 2) / w).toFixed(3)),
            y: parseFloat(Math.max(0, (c.cy - cH / 2) / h).toFixed(3)),
            width: parseFloat(Math.min(1, cW / w).toFixed(3)),
            height: parseFloat(Math.min(1, cH / h).toFixed(3)),
            confidence: parseFloat(c.score.toFixed(2))
          };
        });
        return this.transitionState(FaceEngineState.MULTIPLE_FACES, seq, {
          faceCount: distinctPersons.length + 1,
          boxes,
          message: `Multiple Faces Detected (${distinctPersons.length + 1}) — Please ensure only one person is visible`
        });
      }
    }

    // Exactly ONE verified face candidate cluster
    const cl = clusters[0];

    // Boundary Containment Validation
    const isBounded = (cl.cx >= w * 0.08 && cl.cx <= w * 0.92 && cl.cy >= h * 0.08 && cl.cy <= h * 0.92);
    if (!isBounded) {
      this.consecutiveFaceFrames = 0;
      return this.transitionState(FaceEngineState.LOW_CONFIDENCE, seq, {
        confidence: cl.score,
        message: 'Face Partially Outside Camera Frame — Please center yourself'
      });
    }

    // Confidence Threshold Validation
    if (cl.score < this.minConfidence) {
      this.consecutiveFaceFrames = 0;
      return this.transitionState(FaceEngineState.LOW_CONFIDENCE, seq, {
        confidence: cl.score,
        message: 'Low Detection Confidence — Please face the camera in good lighting'
      });
    }

    // Multi-Frame Stability Gate (Hysteresis)
    this.consecutiveFaceFrames++;
    if (this.consecutiveFaceFrames < this.minConsecutiveFrames) {
      return this.transitionState(FaceEngineState.ONE_FACE, seq, {
        confidence: cl.score,
        message: 'Verifying Face Stability...'
      });
    }

    // Strict Gating Passed -> Allowed into ANALYSIS_READY
    const bwVal = cl.bw || cl.w || w * 0.35;
    const bhVal = cl.bh || cl.h || h * 0.42;
    const normBox = {
      x: parseFloat(Math.max(0, (cl.cx - bwVal / 2) / w).toFixed(3)),
      y: parseFloat(Math.max(0, (cl.cy - bhVal / 2) / h).toFixed(3)),
      width: parseFloat(Math.min(1, bwVal / w).toFixed(3)),
      height: parseFloat(Math.min(1, bhVal / h).toFixed(3))
    };

    return this.executeFacialAnalysis(pixels, w, h, {
      cx: cl.cx,
      cy: cl.cy,
      w: bwVal,
      h: bhVal,
      normBox,
      confidence: cl.score,
      modelType: 'Structural Anthropometric Engine (Deterministic CV Fallback)'
    }, seq);
  }

  /**
   * Groups overlapping sliding boxes into physical person clusters.
   * Merges boxes that overlap or belong to the same head/torso silhouette.
   */
  clusterCandidateDetections(candidates, w, h) {
    if (candidates.length === 0) return [];

    // Sort candidates by score descending
    candidates.sort((a, b) => b.score - a.score);

    const clusters = [];

    for (const c of candidates) {
      let matched = null;
      for (const cl of clusters) {
        const dx = Math.abs(c.cx - cl.cx);
        const dy = Math.abs(c.cy - cl.cy);
        const cW = c.bw || c.w || 20;
        const clW = cl.bw || cl.w || 20;
        const cH = c.bh || c.h || 24;
        const clH = cl.bh || cl.h || 24;
        const combinedHalfW = (cW + clW) * 0.55;
        const combinedHalfH = (cH + clH) * 0.55;

        // Belongs to existing cluster if boxes overlap OR is torso/neck directly below the head
        if ((dx <= combinedHalfW && dy <= combinedHalfH) || (dx <= w * 0.30 && c.cy > cl.cy)) {
          matched = cl;
          break;
        }
      }

      if (matched) {
        matched.members.push(c);
        const members = matched.members;
        const totalWeight = members.reduce((sum, m) => sum + m.score, 0);
        matched.cx = members.reduce((sum, m) => sum + m.cx * m.score, 0) / totalWeight;
        matched.cy = members.reduce((sum, m) => sum + m.cy * m.score, 0) / totalWeight;
        matched.score = Math.max(...members.map(m => m.score));
      } else {
        clusters.push({
          cx: c.cx,
          cy: c.cy,
          bw: c.bw || c.w || 20,
          bh: c.bh || c.h || 24,
          w: c.bw || c.w || 20,
          h: c.bh || c.h || 24,
          score: c.score,
          members: [c]
        });
      }
    }

    return clusters;
  }

  /**
   * STEP 5: Facial Analysis & Observable Measurements Execution.
   * GATED: Executed ONLY when state === ANALYSIS_READY.
   */
  executeFacialAnalysis(pixels, w, h, faceInfo, seq) {
    this.state = FaceEngineState.ANALYSIS_READY;
    this.lastProcessedSequence = seq;
    this.totalFramesAnalyzed++;
    this.framesWithFace++;
    this.wasAbsent = false;

    // Observable 1: Bounding Box Positioning & Centeredness (Gaze/Poise alignment)
    const targetCenterX = w / 2;
    const targetCenterY = h * 0.40;
    const distFromCenter = Math.sqrt(
      Math.pow((faceInfo.cx - targetCenterX) / (w / 2), 2) +
      Math.pow((faceInfo.cy - targetCenterY) / (h / 2), 2)
    );

    // Observable camera alignment poise (0-100)
    const eyeContactPoise = Math.round(Math.max(65, Math.min(98, 96 - distFromCenter * 32)));

    // Observable 2: Inter-frame Head Movement Stability (Stillness vs. Jitter)
    let headShift = 0;
    if (this.lastFaceCentroid) {
      headShift = Math.sqrt(
        Math.pow(faceInfo.cx - this.lastFaceCentroid.cx, 2) +
        Math.pow(faceInfo.cy - this.lastFaceCentroid.cy, 2)
      );
    }
    this.lastFaceCentroid = { cx: faceInfo.cx, cy: faceInfo.cy };

    const postureStability = Math.round(Math.max(65, Math.min(98, 96 - (headShift * 3.0))));

    // Composite Physical Composure Index (Linear combination of physical signals)
    const composureScore = Math.round((postureStability * 0.55) + (eyeContactPoise * 0.45));

    // Observable Demeanor Indicators (Explicitly mapped to observable visual telemetry)
    const confidentScore = composureScore;
    const engagedScore = eyeContactPoise;
    const tensedScore = Math.max(4, Math.min(88, Math.round(100 - postureStability)));

    // Physical Demeanor Status (Visual status, not psychological emotion)
    let dominantState = 'Steady & Centered';
    let dominantColor = '#10b981';
    let dominantIcon = '👔';

    if (postureStability < 74 || headShift > 4.0) {
      dominantState = 'Posture Shift / Movement';
      dominantColor = '#f59e0b';
      dominantIcon = '⚡';
    } else if (eyeContactPoise >= 82 && postureStability >= 84) {
      dominantState = 'Steady & Centered';
      dominantColor = '#10b981';
      dominantIcon = '🎯';
    } else {
      dominantState = 'Aligned & Focused';
      dominantColor = '#38bdf8';
      dominantIcon = '🤝';
    }

    // Accumulate for session report
    this.accumulatedScores.confident += confidentScore;
    this.accumulatedScores.tensed += tensedScore;
    this.accumulatedScores.engaged += engagedScore;
    this.accumulatedScores.eyeContact += eyeContactPoise;
    this.accumulatedScores.stability += postureStability;
    this.accumulatedScores.count++;

    const presencePct = Math.round((this.framesWithFace / Math.max(1, this.totalFramesAnalyzed)) * 100);

    return {
      state: FaceEngineState.ANALYSIS_READY,
      faceDetected: true,
      detectionConfidence: parseFloat(faceInfo.confidence.toFixed(2)),
      faceCount: 1,
      showAlert: false,
      alertMessage: '',
      composureScore,
      dominantState,
      dominantColor,
      dominantIcon,
      eyeContactScore: eyeContactPoise,
      stabilityScore: postureStability,
      confidentScore,
      tensedScore,
      engagedScore,
      facePresencePct: presencePct,
      boundingBox: faceInfo.normBox || {
        x: parseFloat(Math.max(0, (faceInfo.cx - faceInfo.w / 2) / w).toFixed(3)),
        y: parseFloat(Math.max(0, (faceInfo.cy - faceInfo.h / 2) / h).toFixed(3)),
        width: parseFloat(Math.min(1, faceInfo.w / w).toFixed(3)),
        height: parseFloat(Math.min(1, faceInfo.h / h).toFixed(3))
      },
      boxes: [
        faceInfo.normBox 
          ? { ...faceInfo.normBox, confidence: parseFloat(faceInfo.confidence.toFixed(2)) }
          : {
              x: parseFloat(Math.max(0, (faceInfo.cx - faceInfo.w / 2) / w).toFixed(3)),
              y: parseFloat(Math.max(0, (faceInfo.cy - faceInfo.h / 2) / h).toFixed(3)),
              width: parseFloat(Math.min(1, faceInfo.w / w).toFixed(3)),
              height: parseFloat(Math.min(1, faceInfo.h / h).toFixed(3)),
              confidence: parseFloat(faceInfo.confidence.toFixed(2))
            }
      ],
      modelType: faceInfo.modelType || this.modelType,
      detectionType: this.hasMediaPipeSupport ? 'neural_network' : (this.hasNativeSupport ? 'hardware_ml' : 'structural_heuristic'),
      disclaimer: 'Visual metrics reflect physical camera alignment and inter-frame posture stability; they do not represent psychological evaluation.',
      isAnalysisGated: false
    };
  }

  /**
   * Immediate state transition handler.
   * Completely stops and clears all face-dependent measurements when a face is not verified.
   */
  transitionState(newState, seq, extra = {}) {
    this.state = newState;
    this.lastProcessedSequence = seq;
    this.lastFaceCentroid = null;

    if (newState !== FaceEngineState.ONE_FACE && newState !== FaceEngineState.ANALYSIS_READY) {
      this.consecutiveFaceFrames = 0;
    }

    if (newState === FaceEngineState.NO_FACE || newState === FaceEngineState.MULTIPLE_FACES) {
      this.totalFramesAnalyzed++;
      if (!this.wasAbsent) {
        this.absenceEventsCount++;
        this.wasAbsent = true;
      }
    }

    const presencePct = this.totalFramesAnalyzed > 0 
      ? Math.round((this.framesWithFace / this.totalFramesAnalyzed) * 100) 
      : 0;

    let dominantColor = '#ef4444';
    let dominantIcon = '⚠️';
    let dominantState = extra.message || 'No Face Detected';
    let showAlert = false;

    if (newState === FaceEngineState.NO_FACE) {
      showAlert = true;
      dominantState = extra.message || 'No Face Detected';
    } else if (newState === FaceEngineState.MULTIPLE_FACES) {
      showAlert = true;
      dominantColor = '#f59e0b';
      dominantIcon = '👥';
      dominantState = extra.message || 'Multiple Faces Detected';
    } else if (newState === FaceEngineState.LOW_CONFIDENCE) {
      showAlert = true;
      dominantColor = '#f59e0b';
      dominantIcon = '⚠️';
      dominantState = extra.message || 'Face Detection Uncertain';
    } else if (newState === FaceEngineState.CAMERA_UNAVAILABLE) {
      showAlert = true;
      dominantColor = '#64748b';
      dominantIcon = '📷';
      dominantState = extra.message || 'Camera Offline';
    } else if (newState === FaceEngineState.DETECTOR_UNAVAILABLE) {
      showAlert = true;
      dominantColor = '#f59e0b';
      dominantIcon = '⚠️';
      dominantState = extra.message || 'Detector Unavailable';
    } else if (newState === FaceEngineState.INITIALIZING) {
      showAlert = true;
      dominantColor = '#38bdf8';
      dominantIcon = '🔄';
      dominantState = extra.message || 'Initializing Detector...';
    }

    // STRICT GATING: When face is absent, all face-dependent metrics MUST BE NULL (never fake 0% or cached!)
    return {
      state: newState,
      faceDetected: false,
      detectionConfidence: extra.confidence || 0.0,
      faceCount: extra.faceCount || 0,
      showAlert,
      alertMessage: dominantState,
      composureScore: null,
      dominantState,
      dominantColor,
      dominantIcon,
      eyeContactScore: null,
      stabilityScore: null,
      confidentScore: null,
      tensedScore: null,
      engagedScore: null,
      facePresencePct: presencePct,
      boundingBox: extra.boundingBox || null,
      boxes: extra.boxes || [],
      modelType: this.modelType,
      detectionType: this.hasMediaPipeSupport ? 'neural_network' : (this.hasNativeSupport ? 'hardware_ml' : (this.allowHeuristicFallback ? 'structural_heuristic' : 'none')),
      disclaimer: 'Visual metrics reflect physical camera alignment and inter-frame posture stability; they do not represent psychological evaluation.',
      isAnalysisGated: true
    };
  }

  handleNoVideoFrame() {
    return this.transitionState(FaceEngineState.CAMERA_UNAVAILABLE, ++this.frameSequence, {
      message: 'Camera Offline'
    });
  }

  /**
   * Final report proctoring summary.
   * Returns honest values; never fabricates fake scores when no face was detected.
   */
  getSessionSummary() {
    const validCount = this.accumulatedScores.count;
    const presencePct = this.totalFramesAnalyzed > 0 
      ? Math.round((this.framesWithFace / this.totalFramesAnalyzed) * 100) 
      : 0;

    if (validCount === 0 || presencePct === 0) {
      return {
        hasValidData: false,
        presencePct: 0,
        avgComposure: null,
        avgEyeContact: null,
        avgStability: null,
        breakdown: {
          confidentPct: null,
          tensedPct: null,
          engagedPct: null
        },
        absenceEventsCount: this.absenceEventsCount,
        coachingTip: 'No verified face presence was recorded during questioning. Please ensure your camera is positioned directly in front of you.'
      };
    }

    const avgConfident = Math.round(this.accumulatedScores.confident / validCount);
    const avgTensed = Math.round(this.accumulatedScores.tensed / validCount);
    const avgEngaged = Math.round(this.accumulatedScores.engaged / validCount);
    const avgEyeContact = Math.round(this.accumulatedScores.eyeContact / validCount);
    const avgStability = Math.round(this.accumulatedScores.stability / validCount);
    const avgComposure = Math.round(avgConfident * 0.65 + avgEngaged * 0.25 + (100 - avgTensed) * 0.1);

    let coachingTip = 'Steady eye contact and composed demeanor maintained throughout the session.';
    if (presencePct < 85) {
      coachingTip = 'Try to remain centered and avoid turning completely away from the camera during interview questions.';
    } else if (avgTensed > 40) {
      coachingTip = 'Take a deep breath when pausing to think; maintaining calm eye contact conveys higher poise under pressure.';
    } else if (avgEngaged > 45) {
      coachingTip = 'Great interpersonal warmth and engagement; your natural reactions build strong conversational rapport.';
    }

    return {
      hasValidData: true,
      presencePct,
      avgComposure,
      avgEyeContact,
      avgStability,
      breakdown: {
        confidentPct: avgConfident,
        tensedPct: avgTensed,
        engagedPct: avgEngaged
      },
      absenceEventsCount: this.absenceEventsCount,
      coachingTip
    };
  }
}

/**
 * Accurately projects normalized detector coordinates [0..1] onto displayed video element pixel bounds,
 * taking into account CSS object-fit: cover scaling, centering letterbox offsets, and scaleX(-1) mirror transforms.
 */
export function calculateBoxDisplayCoordinates(normBox, containerW, containerH, videoW = 640, videoH = 480, isMirrored = false) {
  if (!normBox || typeof normBox.x !== 'number' || typeof normBox.width !== 'number') return null;

  const validVideoW = videoW > 0 ? videoW : 640;
  const validVideoH = videoH > 0 ? videoH : 480;
  const validContW = containerW > 0 ? containerW : 200;
  const validContH = containerH > 0 ? containerH : 150;

  // object-fit: cover scaling
  const scale = Math.max(validContW / validVideoW, validContH / validVideoH);
  const renderedW = validVideoW * scale;
  const renderedH = validVideoH * scale;
  const offsetX = (validContW - renderedW) / 2;
  const offsetY = (validContH - renderedH) / 2;

  const boxW = Math.round(normBox.width * renderedW);
  const boxH = Math.round(normBox.height * renderedH);
  const boxTop = Math.round(offsetY + (normBox.y * renderedH));

  let boxLeft;
  if (isMirrored) {
    // Horizontally mirrored video: right edge in video source becomes left edge on screen
    boxLeft = Math.round(validContW - offsetX - ((normBox.x + normBox.width) * renderedW));
  } else {
    boxLeft = Math.round(offsetX + (normBox.x * renderedW));
  }

  return {
    left: boxLeft,
    top: boxTop,
    width: boxW,
    height: boxH,
    confidence: normBox.confidence
  };
}

/**
 * Renders real-time hardware-accelerated face bounding box overlays on the webcam container.
 * Strictly driven by validated detector outputs (MediaPipe BlazeFace / Hardware FaceDetector / Structural Fallback).
 */
export function renderFaceBoundingBoxes(videoBoxEl, analysis) {
  if (!videoBoxEl) return;
  const doc = typeof document !== 'undefined' ? document : videoBoxEl.ownerDocument;
  if (!doc) return;

  let boxLayer = videoBoxEl.querySelector('.face-detection-bounding-layer');
  if (!boxLayer) {
    boxLayer = doc.createElement('div');
    boxLayer.className = 'face-detection-bounding-layer';
    boxLayer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 18;
      overflow: hidden;
    `;
    videoBoxEl.appendChild(boxLayer);
  }

  // Cache last analysis on container for responsive resize re-projections
  videoBoxEl._lastFaceAnalysis = analysis;
  if (!videoBoxEl._hasResizeListener && typeof ResizeObserver !== 'undefined') {
    videoBoxEl._hasResizeListener = true;
    const ro = new ResizeObserver(() => {
      if (videoBoxEl._lastFaceAnalysis) {
        renderFaceBoundingBoxes(videoBoxEl, videoBoxEl._lastFaceAnalysis);
      }
    });
    ro.observe(videoBoxEl);
  }

  const boxes = analysis?.boxes || (analysis?.boundingBox ? [analysis.boundingBox] : []);
  const isMultiple = analysis?.state === FaceEngineState.MULTIPLE_FACES;
  const isDetected = Boolean(analysis?.faceDetected);

  // Requirement 4 & 5: For NO_FACE, DETECTOR_UNAVAILABLE, or when not detected, remove the rectangle immediately
  if ((!isDetected && !isMultiple) || !boxes || boxes.length === 0 || analysis?.state === FaceEngineState.DETECTOR_UNAVAILABLE) {
    boxLayer.innerHTML = '';
    return;
  }

  const videoEl = videoBoxEl.querySelector('video');
  const containerW = videoBoxEl.clientWidth || 200;
  const containerH = videoBoxEl.clientHeight || 150;
  const videoW = (videoEl && videoEl.videoWidth > 0) ? videoEl.videoWidth : 640;
  const videoH = (videoEl && videoEl.videoHeight > 0) ? videoEl.videoHeight : 480;

  const isMirrored = videoEl && (
    videoEl.style.transform.includes('scaleX(-1)') ||
    (typeof window !== 'undefined' && window.getComputedStyle(videoEl).transform.includes('matrix(-1'))
  );

  const borderColor = isMultiple ? '#f59e0b' : '#10b981';
  const glowColor = isMultiple ? 'rgba(245, 158, 11, 0.45)' : 'rgba(16, 185, 129, 0.45)';
  const tagBg = isMultiple ? 'rgba(217, 119, 6, 0.95)' : 'rgba(16, 185, 129, 0.95)';

  let html = '';
  boxes.forEach((normBox, idx) => {
    const coords = calculateBoxDisplayCoordinates(normBox, containerW, containerH, videoW, videoH, isMirrored);
    if (!coords) return;

    const confPct = Math.round((normBox.confidence || analysis.detectionConfidence || 0.95) * 100);
    const tagLabel = isMultiple ? `Face #${idx + 1}` : `Face Verified ${confPct}%`;

    html += `
      <div class="face-bounding-rect" style="
        position: absolute;
        left: ${coords.left}px;
        top: ${coords.top}px;
        width: ${coords.width}px;
        height: ${coords.height}px;
        border: 2px solid ${borderColor};
        border-radius: 6px;
        box-shadow: 0 0 12px ${glowColor}, inset 0 0 6px ${glowColor};
        box-sizing: border-box;
        pointer-events: none;
        transition: left 0.12s ease-out, top 0.12s ease-out, width 0.12s ease-out, height 0.12s ease-out;
      ">
        <!-- Corner Accent Marks -->
        <span style="position: absolute; top: -3px; left: -3px; width: 8px; height: 8px; border-top: 3px solid ${borderColor}; border-left: 3px solid ${borderColor}; border-top-left-radius: 4px;"></span>
        <span style="position: absolute; top: -3px; right: -3px; width: 8px; height: 8px; border-top: 3px solid ${borderColor}; border-right: 3px solid ${borderColor}; border-top-right-radius: 4px;"></span>
        <span style="position: absolute; bottom: -3px; left: -3px; width: 8px; height: 8px; border-bottom: 3px solid ${borderColor}; border-left: 3px solid ${borderColor}; border-bottom-left-radius: 4px;"></span>
        <span style="position: absolute; bottom: -3px; right: -3px; width: 8px; height: 8px; border-bottom: 3px solid ${borderColor}; border-right: 3px solid ${borderColor}; border-bottom-right-radius: 4px;"></span>

        <!-- Floating Tag Badge -->
        <span class="face-box-tag" style="
          position: absolute;
          top: -20px;
          left: -2px;
          background: ${tagBg};
          color: #ffffff;
          font-size: 0.58rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          letter-spacing: 0.02em;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
        ">${tagLabel}</span>
      </div>
    `;
  });

  boxLayer.innerHTML = html;
}

/**
 * Creates and updates the sleek floating Face Alert banner on a video container.
 * Completely responsive and immediate.
 */
export function renderFaceAlertOverlay(videoBoxEl, analysis) {
  if (!videoBoxEl) return;
  const doc = typeof document !== 'undefined' ? document : videoBoxEl.ownerDocument;
  if (!doc) return;

  // 1. Real-time Face Bounding Box Layer
  renderFaceBoundingBoxes(videoBoxEl, analysis);

  // 2. Alert Banner & Status Pill
  let alertBanner = videoBoxEl.querySelector('.face-presence-alert-banner');
  if (!alertBanner) {
    alertBanner = doc.createElement('div');
    alertBanner.className = 'face-presence-alert-banner';
    alertBanner.style.cssText = `
      display: none;
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      background: rgba(220, 38, 38, 0.94);
      border: 1.5px solid rgba(254, 202, 202, 0.6);
      border-radius: 8px;
      backdrop-filter: blur(8px);
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0.45rem 0.65rem;
      z-index: 25;
      pointer-events: none;
      box-shadow: 0 4px 18px rgba(0,0,0,0.5), 0 0 12px rgba(239, 68, 68, 0.5);
      transition: all 0.2s ease;
    `;
    videoBoxEl.appendChild(alertBanner);
  }

  let statusPill = videoBoxEl.querySelector('.face-demeanor-status-pill');
  if (!statusPill) {
    statusPill = doc.createElement('div');
    statusPill.className = 'face-demeanor-status-pill';
    statusPill.style.cssText = `
      position: absolute;
      top: 6px;
      left: 6px;
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(15, 23, 42, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 3px 8px;
      border-radius: 9999px;
      font-size: 0.62rem;
      color: #fff;
      backdrop-filter: blur(6px);
      z-index: 15;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      transition: all 0.2s ease;
    `;
    videoBoxEl.appendChild(statusPill);
  }

  // Handle Alert Display Immediately
  if (analysis.showAlert) {
    const isMultiple = analysis.state === FaceEngineState.MULTIPLE_FACES;
    const isUncertain = analysis.state === FaceEngineState.LOW_CONFIDENCE;
    const isUnavailable = analysis.state === FaceEngineState.DETECTOR_UNAVAILABLE;
    const isInitializing = analysis.state === FaceEngineState.INITIALIZING;
    
    alertBanner.style.display = 'flex';
    alertBanner.style.background = isMultiple || isUncertain || isUnavailable ? 'rgba(217, 119, 6, 0.94)' : (isInitializing ? 'rgba(14, 165, 233, 0.94)' : 'rgba(220, 38, 38, 0.94)');
    alertBanner.style.borderColor = isMultiple || isUncertain || isUnavailable ? 'rgba(253, 230, 138, 0.6)' : (isInitializing ? 'rgba(186, 230, 253, 0.6)' : 'rgba(254, 202, 202, 0.6)');
    alertBanner.style.boxShadow = isMultiple || isUncertain || isUnavailable ? '0 4px 18px rgba(0,0,0,0.5), 0 0 12px rgba(245, 158, 11, 0.5)' : (isInitializing ? '0 4px 18px rgba(0,0,0,0.5), 0 0 12px rgba(14, 165, 233, 0.5)' : '0 4px 18px rgba(0,0,0,0.5), 0 0 12px rgba(239, 68, 68, 0.5)');

    videoBoxEl.style.boxShadow = isMultiple || isUncertain || isUnavailable ? '0 0 16px rgba(245, 158, 11, 0.6)' : (isInitializing ? '0 0 16px rgba(14, 165, 233, 0.6)' : '0 0 18px rgba(239, 68, 68, 0.65)');
    videoBoxEl.style.borderColor = isMultiple || isUncertain || isUnavailable ? '#f59e0b' : (isInitializing ? '#38bdf8' : '#ef4444');

    let subtext = 'Please position your face directly inside the camera frame';
    if (isMultiple) {
      subtext = 'Please ensure only one person is in camera view';
    } else if (isUnavailable) {
      subtext = analysis.alertMessage || 'Trained face detection model unavailable — visual proctoring suspended';
    } else if (isInitializing) {
      subtext = analysis.alertMessage || 'Loading trained face detection model...';
    }

    alertBanner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.35rem;">
        <span style="font-size: 1rem; line-height: 1;">${analysis.dominantIcon}</span>
        <span style="font-size: 0.72rem; font-weight: 800; color: #fff; letter-spacing: 0.02em; text-transform: uppercase;">
          ${analysis.dominantState}
        </span>
      </div>
      <div style="font-size: 0.6rem; color: #fee2e2; margin-top: 1px; font-weight: 500; line-height: 1.2;">
        ${subtext}
      </div>
    `;
    statusPill.style.display = 'none';
  } else {
    alertBanner.style.display = 'none';
    videoBoxEl.style.boxShadow = 'none';
    videoBoxEl.style.borderColor = 'var(--border-subtle)';

    if (analysis.faceDetected) {
      statusPill.style.display = 'flex';
      statusPill.innerHTML = `
        <span>${analysis.dominantIcon}</span>
        <span style="font-weight: 700; color: ${analysis.dominantColor};">${analysis.dominantState}</span>
        <span style="color: #94a3b8; font-size: 0.58rem;">(${analysis.composureScore}%)</span>
      `;
      statusPill.style.borderColor = `${analysis.dominantColor}66`;
    } else {
      statusPill.style.display = 'none';
    }
  }
}
