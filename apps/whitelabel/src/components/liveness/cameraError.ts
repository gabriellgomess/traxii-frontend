/** Traduz falhas de getUserMedia em mensagens acionáveis para o usuário. */
export function cameraErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return 'Permita o acesso à câmera para continuar.';
      case 'NotFoundError':
      case 'OverconstrainedError':
        return 'Nenhuma câmera foi encontrada no dispositivo.';
      case 'NotReadableError':
      case 'AbortError':
        return 'A câmera está em uso por outro aplicativo (Teams, Zoom…). Feche-o e tente novamente.';
    }
  }
  return 'Não foi possível acessar a câmera do dispositivo.';
}

/** getUserMedia só existe em contexto seguro (localhost ou HTTPS). */
export function isCameraSupported(): boolean {
  return Boolean(navigator.mediaDevices?.getUserMedia);
}

export const INSECURE_CONTEXT_MESSAGE =
  'Câmera indisponível neste contexto. Acesse pelo endereço localhost ou por HTTPS.';
