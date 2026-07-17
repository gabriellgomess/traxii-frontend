/**
 * Captura de selfie com a câmera frontal (padrão do projeto onboarding_bank:
 * frame espelhado desenhado em canvas e exportado como JPEG).
 */

import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import {
  cameraErrorMessage,
  INSECURE_CONTEXT_MESSAGE,
  isCameraSupported,
} from './cameraError';

interface SelfieCaptureProps {
  onCapture: (selfie: File | null) => void;
}

export function SelfieCapture({ onCapture }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (!isCameraSupported()) {
        setError(INSECURE_CONTEXT_MESSAGE);
        return;
      }

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
              if (!cancelled) setCameraReady(true);
            });
          };
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[selfie] Falha ao iniciar a câmera:', err);
        setError(cameraErrorMessage(err));
      }
    };

    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function capture(): void {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Espelha o frame para a selfie ficar natural (como no espelho)
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `selfie_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        setPreview(canvas.toDataURL('image/jpeg', 0.8));
        onCapture(file);
      },
      'image/jpeg',
      0.95,
    );
  }

  function retake(): void {
    setPreview(null);
    onCapture(null);
  }

  if (error) {
    return (
      <div className="rounded-xl bg-danger/10 px-4 py-3 text-center text-sm font-semibold text-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          className={`h-full w-full scale-x-[-1] object-cover ${preview ? 'hidden' : ''}`}
          playsInline
          muted
        />
        {preview && (
          <img src={preview} alt="Selfie capturada" className="h-full w-full object-cover" />
        )}
        {!cameraReady && !preview && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/25 border-t-primary" />
          </div>
        )}
        {cameraReady && !preview && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <svg className="h-full w-3/4 text-white/60" fill="none" viewBox="0 0 100 140">
              <ellipse
                cx="50"
                cy="70"
                rx="38"
                ry="52"
                stroke="currentColor"
                strokeDasharray="6 6"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}
      </div>

      {preview ? (
        <button
          type="button"
          onClick={retake}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-bold text-slate-ink hover:border-primary"
        >
          <FontAwesomeIcon icon={faRotateLeft} style={{ width: 14, height: 14 }} />
          Tirar outra
        </button>
      ) : (
        <button
          type="button"
          onClick={capture}
          disabled={!cameraReady}
          className="flex cursor-pointer items-center gap-2 rounded-full border-none bg-primary px-7 py-3.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faCamera} style={{ width: 15, height: 15 }} />
          Capturar selfie
        </button>
      )}
    </div>
  );
}
