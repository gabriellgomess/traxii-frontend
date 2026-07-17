/** Etapa 4 — prova de vida (liveness) com desafios de movimento. */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import {
  completeLiveness,
  type OpeningProgress,
} from '../../../services/accountOpeningService';
import {
  LivenessDetection,
  type LivenessResult,
} from '../../../components/liveness/LivenessDetection';
import { FormError, scrollToFirstError, StepButtons } from '../ui';

const INSTRUCTIONS = [
  'Permita o acesso à câmera quando o navegador solicitar',
  'Fique em um ambiente bem iluminado',
  'Posicione o rosto dentro da guia oval',
  'Complete os 4 desafios de movimento',
];

interface ProvaVidaStepProps {
  progress: OpeningProgress;
  /** Captura em andamento — controlada pelo shell (o "Cancelar" fica no cabeçalho) */
  running: boolean;
  onRunningChange: (running: boolean) => void;
  onDone: (progress: OpeningProgress) => void;
}

export function ProvaVidaStep({
  progress,
  running,
  onRunningChange,
  onDone,
}: ProvaVidaStepProps) {
  const [completed, setCompleted] = useState(progress.liveness_completed);
  const [updatedProgress, setUpdatedProgress] = useState(progress);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleLivenessComplete(result: LivenessResult): Promise<void> {
    setSaving(true);
    setFormError('');
    try {
      const updated = await completeLiveness(result.challengesCompleted);
      setUpdatedProgress(updated);
      setCompleted(true);
      onRunningChange(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Não foi possível registrar a prova de vida.',
      );
      onRunningChange(false);
      scrollToFirstError();
    } finally {
      setSaving(false);
    }
  }

  if (completed) {
    return (
      <div>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-positive/10 text-positive">
            <FontAwesomeIcon icon={faCheck} style={{ width: 26, height: 26 }} />
          </div>
          <div className="font-display text-lg font-bold text-ink">
            Prova de vida concluída!
          </div>
          <div className="max-w-[340px] text-sm font-medium text-muted-2">
            Sua identidade foi validada. Agora vamos capturar sua selfie.
          </div>
        </div>
        <FormError message={formError} />
        <StepButtons onNext={() => onDone(updatedProgress)} />
      </div>
    );
  }

  if (running) {
    return (
      <div>
        <LivenessDetection onComplete={(result) => void handleLivenessComplete(result)} />
        {saving && (
          <div className="mt-4 text-center text-sm font-semibold text-muted-2">
            Registrando prova de vida…
          </div>
        )}
        <FormError message={formError} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col items-center gap-3 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary">
          <FontAwesomeIcon icon={faShieldHalved} style={{ width: 26, height: 26 }} />
        </div>
        <div className="max-w-[360px] text-sm font-medium leading-relaxed text-muted-2">
          Para a sua segurança, validamos que é você mesmo abrindo a conta, direto
          pela câmera do seu dispositivo.
        </div>
      </div>

      <div className="rounded-2xl bg-soft p-5">
        <div className="mb-3 text-sm font-bold text-ink">Como funciona</div>
        <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
          {INSTRUCTIONS.map((text, index) => (
            <li key={text} className="flex items-start gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">
                {index + 1}
              </span>
              <span className="text-[13px] font-semibold leading-relaxed text-slate-ink">
                {text}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <FormError message={formError} />
      <StepButtons onNext={() => onRunningChange(true)} nextLabel="Iniciar prova de vida" />
    </div>
  );
}
