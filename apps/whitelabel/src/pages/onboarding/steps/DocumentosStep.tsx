/** Etapa 3 — upload de documento (frente/verso) e comprovante de residência. */

import { useRef, useState, type ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { HttpError } from '@traxii/shared';
import {
  uploadDocuments,
  type OpeningProgress,
} from '../../../services/accountOpeningService';
import { FormError, scrollToFirstError, StepButtons } from '../ui';

type Slot = 'document_front' | 'document_back' | 'address_proof';

const SLOTS: Array<{ id: Slot; title: string; hint: string }> = [
  { id: 'document_front', title: 'Documento — frente', hint: 'RG ou CNH aberto, com foto visível' },
  { id: 'document_back', title: 'Documento — verso', hint: 'Verso do mesmo documento' },
  { id: 'address_proof', title: 'Comprovante de residência', hint: 'Conta de luz, água ou telefone (até 90 dias)' },
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 8;

interface DocumentosStepProps {
  progress: OpeningProgress;
  onDone: (progress: OpeningProgress) => void;
}

export function DocumentosStep({ progress, onDone }: DocumentosStepProps) {
  const inputRefs = useRef<Record<Slot, HTMLInputElement | null>>({
    document_front: null,
    document_back: null,
    address_proof: null,
  });

  const [selected, setSelected] = useState<Partial<Record<Slot, File>>>({});
  const [errors, setErrors] = useState<Partial<Record<Slot, string>>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  function isSlotReady(slot: Slot): boolean {
    return Boolean(selected[slot]) || progress.documents[slot].uploaded;
  }

  const allReady = SLOTS.every((slot) => isSlotReady(slot.id));

  function handleFile(slot: Slot, e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [slot]: 'Formato não permitido (use JPG, PNG, WEBP ou PDF).',
      }));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [slot]: `O arquivo deve ter no máximo ${MAX_SIZE_MB} MB.` }));
      e.target.value = '';
      return;
    }

    setErrors((prev) => ({ ...prev, [slot]: '' }));
    setSelected((prev) => ({ ...prev, [slot]: file }));
  }

  function slotLabel(slot: Slot): string {
    const newFile = selected[slot];
    if (newFile) return newFile.name;
    const uploaded = progress.documents[slot];
    if (uploaded.uploaded) return uploaded.original_name ?? 'Arquivo enviado';
    return 'Toque para enviar ou fotografar';
  }

  async function handleNext(): Promise<void> {
    setFormError('');

    // Nada novo selecionado e tudo já enviado → apenas avança
    const newFiles = Object.fromEntries(
      Object.entries(selected).filter(([, file]) => file !== undefined),
    ) as Partial<Record<Slot, File>>;

    if (Object.keys(newFiles).length === 0) {
      onDone(progress);
      return;
    }

    setLoading(true);
    try {
      const updated = await uploadDocuments(newFiles);
      setSelected({});
      onDone(updated);
    } catch (err) {
      if (err instanceof HttpError && err.errors) {
        const serverErrors: Partial<Record<Slot, string>> = {};
        for (const [field, messages] of Object.entries(err.errors)) {
          serverErrors[field as Slot] = messages[0];
        }
        setErrors(serverErrors);
      } else {
        setFormError(
          err instanceof Error ? err.message : 'Não foi possível enviar os documentos.',
        );
      }
      scrollToFirstError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3.5">
        {SLOTS.map((slot) => {
          const ready = isSlotReady(slot.id);
          return (
            <div key={slot.id}>
              <button
                type="button"
                onClick={() => inputRefs.current[slot.id]?.click()}
                className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border-[1.5px] border-dashed px-4 py-4 text-left transition-colors ${
                  ready ? 'border-positive/50 bg-positive/5' : 'border-field bg-white hover:border-primary'
                }`}
              >
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                    ready ? 'bg-positive text-white' : 'bg-primary-soft text-primary'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={ready ? faCheck : faFileArrowUp}
                    style={{ width: 17, height: 17 }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-ink">{slot.title}</div>
                  <div className="truncate text-xs font-semibold text-muted-2">
                    {ready ? slotLabel(slot.id) : slot.hint}
                  </div>
                  {ready && (
                    <div className="mt-0.5 text-[11px] font-bold text-primary">
                      Toque para substituir
                    </div>
                  )}
                </div>
              </button>
              <input
                ref={(el) => {
                  inputRefs.current[slot.id] = el;
                }}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => handleFile(slot.id, e)}
                className="hidden"
              />
              {errors[slot.id] && (
                <div data-field-error className="mt-1 text-xs font-semibold text-danger">
                  {errors[slot.id]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs font-medium leading-relaxed text-muted">
        Formatos aceitos: JPG, PNG, WEBP e PDF, com até {MAX_SIZE_MB} MB por arquivo.
        Seus documentos são armazenados de forma segura e usados apenas na análise do cadastro.
      </div>

      <FormError message={formError} />
      <StepButtons
        onNext={() => void handleNext()}
        nextDisabled={!allReady}
        loading={loading}
      />
    </div>
  );
}
