/** Etapa 3 — upload de documento (frente/verso) e comprovante de residência. */

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { HttpError } from '@traxii/shared';
import {
  updatePersonalData,
  uploadDocuments,
  type OpeningProgress,
} from '../../../services/accountOpeningService';
import { FormError, scrollToFirstError, selectClass, StepButtons } from '../ui';

type Slot = 'document_front' | 'document_back' | 'address_proof';

interface SlotConfig {
  id: Slot;
  title: string;
  hint: string;
}

const ADDRESS_PROOF_SLOT: SlotConfig = {
  id: 'address_proof',
  title: 'Comprovante de residência',
  hint: 'Conta de luz, água ou telefone (até 90 dias)',
};

/**
 * Monta os slots do documento de identificação — rótulos genéricos, sem
 * menção a RG/CNH. RG sempre pede frente e verso separados. CNH pergunta
 * antes, via o checkbox "Frente e verso": marcado = um único arquivo com os
 * dois lados (ex.: CNH digital em PDF); desmarcado = frente e verso
 * separados. O comprovante de residência é sempre exibido à parte, mesmo
 * antes de escolher o tipo de documento.
 */
function buildDocumentSlots(documentType: 'rg' | 'cnh', combinedFile: boolean): SlotConfig[] {
  if (documentType === 'cnh' && combinedFile) {
    return [
      { id: 'document_front', title: 'Documento', hint: 'PDF ou imagem com frente e verso no mesmo arquivo' },
    ];
  }

  return [
    { id: 'document_front', title: 'Documento (Frente)', hint: 'Foto ou scan da frente' },
    { id: 'document_back', title: 'Documento (Verso)', hint: 'Foto ou scan do verso' },
  ];
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 8;

interface DocumentosStepProps {
  progress: OpeningProgress;
  /** Atualiza o progresso no componente pai sem avançar de etapa (ex.: troca de tipo de documento). */
  onUpdate: (progress: OpeningProgress) => void;
  onDone: (progress: OpeningProgress) => void;
}

export function DocumentosStep({ progress, onUpdate, onDone }: DocumentosStepProps) {
  const persistedType = progress.personal_data.document_type;

  // Select e checkbox sempre começam sem nada marcado — os campos de upload
  // só aparecem depois que o usuário escolhe o tipo aqui nesta tela.
  const [selectedType, setSelectedType] = useState<'' | 'rg' | 'cnh'>('');
  const [combinedFile, setCombinedFile] = useState(false);
  const [docTypeSaving, setDocTypeSaving] = useState(false);

  const isCnh = selectedType === 'cnh';
  // Comprovante de residência sempre visível; os slots do documento de
  // identificação só aparecem depois que o tipo é escolhido acima.
  const documentSlots = selectedType === '' ? [] : buildDocumentSlots(selectedType, combinedFile);
  const SLOTS = [...documentSlots, ADDRESS_PROOF_SLOT];

  const inputRefs = useRef<Record<Slot, HTMLInputElement | null>>({
    document_front: null,
    document_back: null,
    address_proof: null,
  });

  const [selected, setSelected] = useState<Partial<Record<Slot, File>>>({});
  const [errors, setErrors] = useState<Partial<Record<Slot, string>>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ao trocar de tipo de documento ou o checkbox "Frente e verso", descarta
  // seleção que não corresponde mais a nenhum slot visível (ex.: verso
  // selecionado antes de marcar "Frente e verso" novamente)
  useEffect(() => {
    const visibleIds = new Set(SLOTS.map((slot) => slot.id));
    setSelected((prev) => {
      const next = Object.fromEntries(
        Object.entries(prev).filter(([id]) => visibleIds.has(id as Slot)),
      ) as Partial<Record<Slot, File>>;
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, combinedFile]);

  async function handleDocumentTypeChange(newType: 'rg' | 'cnh'): Promise<void> {
    if (docTypeSaving) return;

    // Revela os campos de upload na hora; só espera a API se o tipo mudou
    // de verdade em relação ao que já está salvo.
    setSelectedType(newType);
    if (newType === persistedType) return;

    setFormError('');
    setDocTypeSaving(true);
    try {
      const updated = await updatePersonalData({ ...progress.personal_data, document_type: newType });
      onUpdate(updated);
    } catch (err) {
      setFormError(
        err instanceof HttpError
          ? err.message
          : 'Não foi possível alterar o tipo de documento.',
      );
      setSelectedType('');
    } finally {
      setDocTypeSaving(false);
    }
  }

  function isSlotReady(slot: Slot): boolean {
    return Boolean(selected[slot]) || progress.documents[slot].uploaded;
  }

  const allReady = selectedType !== '' && SLOTS.every((slot) => isSlotReady(slot.id));

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
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-bold text-slate-ink">
          Tipo de documento
        </label>
        <select
          value={selectedType}
          onChange={(e) => void handleDocumentTypeChange(e.target.value as 'rg' | 'cnh')}
          disabled={docTypeSaving}
          className={selectClass}
        >
          <option value="" disabled hidden>
            Selecione o tipo de documento
          </option>
          <option value="rg">RG (Carteira de Identidade)</option>
          <option value="cnh">CNH</option>
        </select>

        {isCnh && (
          <label className="mt-3 flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={combinedFile}
              onChange={(e) => setCombinedFile(e.target.checked)}
              className="h-[18px] w-[18px] cursor-pointer accent-primary"
            />
            <span className="text-sm font-semibold text-ink">Frente e verso</span>
          </label>
        )}
      </div>

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
