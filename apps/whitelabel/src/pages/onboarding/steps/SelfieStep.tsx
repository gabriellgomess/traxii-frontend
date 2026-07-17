/** Etapa 5 — captura e envio da selfie (após a prova de vida). */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { HttpError } from '@traxii/shared';
import {
  uploadSelfie,
  type OpeningProgress,
} from '../../../services/accountOpeningService';
import { SelfieCapture } from '../../../components/liveness/SelfieCapture';
import { FormError, scrollToFirstError, StepButtons } from '../ui';

interface SelfieStepProps {
  progress: OpeningProgress;
  onDone: (progress: OpeningProgress) => void;
}

export function SelfieStep({ progress, onDone }: SelfieStepProps) {
  const alreadyUploaded = progress.documents.selfie.uploaded;

  const [selfie, setSelfie] = useState<File | null>(null);
  const [retaking, setRetaking] = useState(!alreadyUploaded);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleNext(): Promise<void> {
    setFormError('');

    // Selfie já enviada e nenhuma nova captura → apenas avança
    if (!selfie) {
      if (alreadyUploaded && !retaking) {
        onDone(progress);
        return;
      }
      setFormError('Capture sua selfie para continuar.');
      scrollToFirstError();
      return;
    }

    setLoading(true);
    try {
      const updated = await uploadSelfie(selfie);
      onDone(updated);
    } catch (err) {
      if (err instanceof HttpError) {
        setFormError(err.message);
      } else {
        setFormError(
          err instanceof Error ? err.message : 'Não foi possível enviar a selfie.',
        );
      }
      scrollToFirstError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-5 text-center text-sm font-medium leading-relaxed text-muted-2">
        Centralize o rosto na guia, procure um lugar iluminado e evite óculos
        escuros, boné ou máscara.
      </div>

      {!retaking && alreadyUploaded ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-positive/10 text-positive">
            <FontAwesomeIcon icon={faCheck} style={{ width: 26, height: 26 }} />
          </div>
          <div className="font-display text-lg font-bold text-ink">Selfie enviada!</div>
          <button
            type="button"
            onClick={() => setRetaking(true)}
            className="cursor-pointer border-none bg-transparent text-sm font-bold text-primary"
          >
            Tirar outra selfie
          </button>
        </div>
      ) : (
        <SelfieCapture onCapture={setSelfie} />
      )}

      <FormError message={formError} />
      <StepButtons
        onNext={() => void handleNext()}
        nextDisabled={retaking && !selfie}
        loading={loading}
      />
    </div>
  );
}
