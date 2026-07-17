/**
 * Prova de vida (liveness) — port do padrão do projeto onboarding_bank:
 * detecção facial com TensorFlow.js + BlazeFace, 4 desafios de movimento e
 * anti-spoofing (consistência 3D dos landmarks + variância de textura).
 * Os modelos são carregados sob demanda (import dinâmico) para não inflar
 * o bundle inicial do whitelabel.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faArrowsUpDown,
  faMagnifyingGlassPlus,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  cameraErrorMessage,
  INSECURE_CONTEXT_MESSAGE,
  isCameraSupported,
} from './cameraError';

// ========================================
// CONFIGURAÇÕES DE CALIBRAGEM (mesmos valores do projeto de referência)
// ========================================
const CONFIG = {
  YAW_THRESHOLD: 35,
  FACE_SIZE_INCREASE_THRESHOLD: 40,
  PITCH_RANGE_THRESHOLD: 25,
  PITCH_HISTORY_SIZE: 30,
  PITCH_MIN_FRAMES: 15,
  CHALLENGE_COMPLETE_DELAY: 1500,
  FINAL_SUCCESS_DELAY: 1000,
  FACE_DETECTION_MIN_FRAMES: 30,
  ENABLE_ANTI_SPOOFING: true,
  LANDMARK_MOVEMENT_THRESHOLD: 0.5,
  TEXTURE_VARIANCE_THRESHOLD: 50,
  CONSISTENCY_CHECK_FRAMES: 20,
  SPOOF_STRIKE_THRESHOLD: 5,
};

interface FacePrediction {
  topLeft: [number, number];
  bottomRight: [number, number];
  landmarks: number[][];
}

interface FaceDetector {
  estimateFaces(
    input: HTMLVideoElement,
    returnTensors: boolean,
  ): Promise<FacePrediction[]>;
}

interface Challenge {
  id: string;
  name: string;
  instruction: string;
  icon: IconDefinition;
}

const CHALLENGES: Challenge[] = [
  { id: 'turnLeft', name: 'Vire a cabeça para a direita', instruction: 'Vire seu rosto para a direita', icon: faArrowRight },
  { id: 'turnRight', name: 'Vire a cabeça para a esquerda', instruction: 'Vire seu rosto para a esquerda', icon: faArrowLeft },
  { id: 'moveCloser', name: 'Aproxime o rosto', instruction: 'Aproxime seu rosto da câmera', icon: faMagnifyingGlassPlus },
  { id: 'nod', name: 'Acene com a cabeça', instruction: 'Mova a cabeça para cima e para baixo', icon: faArrowsUpDown },
];

export interface LivenessResult {
  completed: true;
  timestamp: string;
  challengesCompleted: string[];
}

interface LivenessDetectionProps {
  onComplete: (result: LivenessResult) => void;
}

export function LivenessDetection({ onComplete }: LivenessDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<FaceDetector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);

  const currentChallengeRef = useRef(0);
  const transitioningRef = useRef(false);
  const completeRef = useRef(false);
  const onCompleteCalledRef = useRef(false);
  const nodMovementRef = useRef({ up: false, down: false });
  const initialFaceSizeRef = useRef<number | null>(null);
  const pitchHistoryRef = useRef<number[]>([]);
  const landmarkHistoryRef = useRef<number[][][]>([]);
  const spoofStrikesRef = useRef(0);
  const frameCountRef = useRef(0);

  const [isLoading, setIsLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [message, setMessage] = useState('Carregando modelo de detecção…');
  const [spoofDetected, setSpoofDetected] = useState(false);
  const [ovalSuccess, setOvalSuccess] = useState(false);
  const [livenessComplete, setLivenessComplete] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [loadErrorDetail, setLoadErrorDetail] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  /* ---------- Geometria facial ---------- */

  const calculateHeadRotation = (prediction: FacePrediction) => {
    const [leftEye, rightEye, nose] = prediction.landmarks;
    const eyeCenterX = (leftEye[0] + rightEye[0]) / 2;
    const eyeCenterY = (leftEye[1] + rightEye[1]) / 2;

    // Espelhamento: no frame espelhado o olho esquerdo tem X maior
    const isMirroredFrame = leftEye[0] > rightEye[0];
    const yawRaw = nose[0] - eyeCenterX;

    return {
      yaw: isMirroredFrame ? -yawRaw : yawRaw,
      pitch: nose[1] - eyeCenterY,
    };
  };

  const detectNod = (prediction: FacePrediction) => {
    const { pitch } = calculateHeadRotation(prediction);
    pitchHistoryRef.current.push(pitch);
    if (pitchHistoryRef.current.length > CONFIG.PITCH_HISTORY_SIZE) {
      pitchHistoryRef.current.shift();
    }

    if (pitchHistoryRef.current.length >= CONFIG.PITCH_MIN_FRAMES) {
      const range =
        Math.max(...pitchHistoryRef.current) - Math.min(...pitchHistoryRef.current);
      if (range > CONFIG.PITCH_RANGE_THRESHOLD) {
        nodMovementRef.current = { up: true, down: true };
      }
    }
  };

  /* ---------- Anti-spoofing ---------- */

  const check3DConsistency = (prediction: FacePrediction): boolean => {
    if (!CONFIG.ENABLE_ANTI_SPOOFING) return true;

    landmarkHistoryRef.current.push(prediction.landmarks);
    if (landmarkHistoryRef.current.length > CONFIG.CONSISTENCY_CHECK_FRAMES) {
      landmarkHistoryRef.current.shift();
    }
    const history = landmarkHistoryRef.current;
    if (history.length < 15) return true;

    let totalMovement = 0;
    let maxMovement = 0;
    const movements: number[] = [];

    for (let i = 1; i < history.length; i++) {
      let frameMovement = 0;
      for (let j = 0; j < history[i].length; j++) {
        const dx = history[i][j][0] - history[i - 1][j][0];
        const dy = history[i][j][1] - history[i - 1][j][1];
        frameMovement += Math.sqrt(dx * dx + dy * dy);
      }
      movements.push(frameMovement);
      totalMovement += frameMovement;
      maxMovement = Math.max(maxMovement, frameMovement);
    }

    const landmarksCount = prediction.landmarks.length;
    const avgMovement = totalMovement / (history.length - 1) / landmarksCount;
    const avgFrameMovement = totalMovement / movements.length;
    const variance = Math.sqrt(
      movements.reduce((sum, m) => sum + (m - avgFrameMovement) ** 2, 0) /
        movements.length,
    );

    let confidence = 0;
    if (avgMovement > CONFIG.LANDMARK_MOVEMENT_THRESHOLD * 0.8) confidence += 0.33;
    if (maxMovement / landmarksCount > CONFIG.LANDMARK_MOVEMENT_THRESHOLD * 2) confidence += 0.33;
    if (variance / landmarksCount > 0.5) confidence += 0.34;

    return confidence >= 0.6;
  };

  const checkTextureVariance = (video: HTMLVideoElement): boolean => {
    if (!CONFIG.ENABLE_ANTI_SPOOFING) return true;

    const sampleSize = 50;
    const canvas = document.createElement('canvas');
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;

    ctx.drawImage(
      video,
      (video.videoWidth - sampleSize) / 2,
      (video.videoHeight - sampleSize) / 2,
      sampleSize,
      sampleSize,
      0,
      0,
      sampleSize,
      sampleSize,
    );

    const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const grayscale: number[] = [];
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      grayscale.push(gray);
      sum += gray;
    }
    const mean = sum / grayscale.length;
    const variance =
      grayscale.reduce((acc, g) => acc + (g - mean) ** 2, 0) / grayscale.length;

    // Fotos impressas/telas tendem a ter baixa variância de textura
    return variance >= CONFIG.TEXTURE_VARIANCE_THRESHOLD;
  };

  /* ---------- Fluxo de desafios ---------- */

  const completeChallenge = () => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;

    const index = currentChallengeRef.current;
    setMessage('Desafio concluído!');
    setOvalSuccess(true);

    if (index + 1 < CHALLENGES.length) {
      setTimeout(() => {
        const next = index + 1;
        currentChallengeRef.current = next;
        setCurrentChallenge(next);
        nodMovementRef.current = { up: false, down: false };
        pitchHistoryRef.current = [];
        initialFaceSizeRef.current = null;
        setOvalSuccess(false);
        setMessage(CHALLENGES[next].instruction);
        transitioningRef.current = false;
      }, CONFIG.CHALLENGE_COMPLETE_DELAY);
    } else {
      setTimeout(() => {
        if (onCompleteCalledRef.current) return;
        onCompleteCalledRef.current = true;
        completeRef.current = true;
        setLivenessComplete(true);
        setMessage('Prova de vida concluída com sucesso!');
        stopCamera();
        onComplete({
          completed: true,
          timestamp: new Date().toISOString(),
          challengesCompleted: CHALLENGES.map((c) => c.id),
        });
      }, CONFIG.FINAL_SUCCESS_DELAY);
    }
  };

  const checkChallengeCompletion = (prediction: FacePrediction) => {
    const index = currentChallengeRef.current;
    if (index >= CHALLENGES.length || transitioningRef.current) return;

    switch (CHALLENGES[index].id) {
      case 'turnLeft': {
        if (calculateHeadRotation(prediction).yaw < -CONFIG.YAW_THRESHOLD) {
          completeChallenge();
        } else {
          setMessage('Vire para a direita');
        }
        break;
      }
      case 'turnRight': {
        if (calculateHeadRotation(prediction).yaw > CONFIG.YAW_THRESHOLD) {
          completeChallenge();
        } else {
          setMessage('Vire para a esquerda');
        }
        break;
      }
      case 'moveCloser': {
        const [x1, y1] = prediction.topLeft;
        const [x2, y2] = prediction.bottomRight;
        const faceSize = (x2 - x1) * (y2 - y1);

        if (initialFaceSizeRef.current === null) {
          initialFaceSizeRef.current = faceSize;
          setMessage('Aproxime seu rosto da câmera');
        } else {
          const increase =
            ((faceSize - initialFaceSizeRef.current) / initialFaceSizeRef.current) * 100;
          if (increase > CONFIG.FACE_SIZE_INCREASE_THRESHOLD) {
            completeChallenge();
          } else {
            setMessage('Aproxime seu rosto');
          }
        }
        break;
      }
      case 'nod': {
        detectNod(prediction);
        if (nodMovementRef.current.up && nodMovementRef.current.down) {
          completeChallenge();
        } else {
          setMessage('Mova a cabeça para cima e para baixo');
        }
        break;
      }
    }
  };

  /* ---------- Loop de detecção ---------- */

  const detectLoop = useCallback(async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!video || !detector || completeRef.current) return;

    if (video.readyState >= 2 && !video.paused) {
      frameCountRef.current += 1;
      try {
        const predictions = await detector.estimateFaces(video, false);

        if (predictions.length > 0) {
          const prediction = predictions[0];

          if (
            CONFIG.ENABLE_ANTI_SPOOFING &&
            frameCountRef.current > CONFIG.FACE_DETECTION_MIN_FRAMES
          ) {
            const consistent = check3DConsistency(prediction);
            const textureOk =
              currentChallengeRef.current === 0 && frameCountRef.current % 60 === 0
                ? checkTextureVariance(video)
                : true;

            if (!consistent || !textureOk) {
              spoofStrikesRef.current += 1;
              if (spoofStrikesRef.current >= CONFIG.SPOOF_STRIKE_THRESHOLD) {
                setSpoofDetected(true);
                setMessage('Possível fraude detectada. Use seu rosto real.');
                rafRef.current = requestAnimationFrame(() => void detectLoop());
                return;
              }
            } else {
              spoofStrikesRef.current = Math.max(0, spoofStrikesRef.current - 1);
              setSpoofDetected(false);
            }
          }

          checkChallengeCompletion(prediction);
        } else if (frameCountRef.current > CONFIG.FACE_DETECTION_MIN_FRAMES) {
          setMessage('Nenhum rosto detectado. Posicione-se na frente da câmera.');
        }
      } catch {
        setMessage('Erro na detecção facial. Tente novamente.');
      }
    }

    rafRef.current = requestAnimationFrame(() => void detectLoop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // 1) Contexto seguro — getUserMedia só existe em localhost/HTTPS
      if (!isCameraSupported()) {
        setIsLoading(false);
        setLoadError(INSECURE_CONTEXT_MESSAGE);
        return;
      }

      // 2) Modelo de detecção — servido pelo próprio app (public/models/
      //    blazeface), sem depender de CDN externo; TF Hub fica como fallback
      try {
        const tf = await import('@tensorflow/tfjs');
        const blazeface = await import('@tensorflow-models/blazeface');
        await tf.ready();
        // WebGL é o ideal; sem ele (drivers antigos), cai para CPU
        const webglOk = await tf.setBackend('webgl').catch(() => false);
        if (!webglOk) await tf.setBackend('cpu');
        await tf.ready();
        const detector = await blazeface
          .load({ modelUrl: '/models/blazeface/model.json' })
          .catch(() => blazeface.load());
        if (cancelled) return;
        detectorRef.current = detector as unknown as FaceDetector;
      } catch (err) {
        if (cancelled) return;
        console.error('[liveness] Falha ao carregar o modelo de detecção:', err);
        setIsLoading(false);
        setLoadError(
          'Não foi possível carregar o modelo de detecção facial. Verifique sua conexão com a internet e tente novamente.',
        );
        setLoadErrorDetail(err instanceof Error ? err.message : String(err));
        return;
      }

      // 3) Câmera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            void video.play().then(() => {
              if (cancelled) return;
              setCameraActive(true);
              setIsLoading(false);
              setMessage(CHALLENGES[0].instruction);
              void detectLoop();
            });
          };
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[liveness] Falha ao iniciar a câmera:', err);
        setIsLoading(false);
        setLoadError(cameraErrorMessage(err));
      }
    };

    void init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  /* ---------- UI ---------- */

  return (
    <div className="flex flex-col gap-4">
      {/* Câmera com guia oval */}
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          className="h-full w-full scale-x-[-1] object-cover"
          playsInline
          muted
        />
        {(isLoading || loadError) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center text-white">
            {loadError ? (
              <>
                <div className="text-sm font-semibold">{loadError}</div>
                {loadErrorDetail && (
                  <div className="max-w-full break-words text-[11px] font-medium text-white/50">
                    Detalhe técnico: {loadErrorDetail}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setLoadError('');
                    setLoadErrorDetail('');
                    setIsLoading(true);
                    setRetryKey((key) => key + 1);
                  }}
                  className="cursor-pointer rounded-full border-none bg-primary px-6 py-2.5 text-sm font-bold text-white hover:brightness-110"
                >
                  Tentar novamente
                </button>
              </>
            ) : (
              <>
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/25 border-t-primary" />
                <div className="text-sm font-semibold">
                  Carregando detecção facial…
                </div>
              </>
            )}
          </div>
        )}
        {cameraActive && !livenessComplete && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <svg className="h-full w-3/4" fill="none" viewBox="0 0 100 140">
              <ellipse
                cx="50"
                cy="70"
                rx="38"
                ry="52"
                stroke="currentColor"
                strokeDasharray="6 6"
                strokeWidth="2"
                className={
                  ovalSuccess
                    ? 'text-positive'
                    : spoofDetected
                      ? 'text-danger'
                      : 'text-white/60'
                }
              />
            </svg>
          </div>
        )}
      </div>

      {/* Instruções abaixo da câmera — desafios revelados um a um,
          sem antecipar os próximos passos */}
      <div className="mx-auto w-full max-w-[340px]">
        <div
          className={`mb-3 rounded-xl px-4 py-3 text-center text-sm font-bold ${
            spoofDetected ? 'bg-danger/10 text-danger' : 'bg-primary-soft text-primary'
          }`}
        >
          {message}
        </div>

        {/* Apenas a ação atual fica visível — as concluídas somem na hora
            (evita print revelando a sequência de desafios) */}
        {!livenessComplete && !ovalSuccess && currentChallenge < CHALLENGES.length && (
          <div
            key={CHALLENGES[currentChallenge].id}
            className="animate-fade-up flex items-center gap-3.5 rounded-xl border border-primary bg-primary-soft px-4 py-3"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white">
              <FontAwesomeIcon
                icon={CHALLENGES[currentChallenge].icon}
                style={{ width: 15, height: 15 }}
              />
            </div>
            <div className="text-sm font-bold text-ink">
              {CHALLENGES[currentChallenge].name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
