/** Etapa 6 — aceites obrigatórios (LGPD) e envio do cadastro para análise. */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import {
  submitOpening,
  type OpeningProgress,
} from '../../../services/accountOpeningService';
import { FormError, scrollToFirstError, StepButtons } from '../ui';

interface ConfirmacaoStepProps {
  onSubmitted: (progress: OpeningProgress, message: string) => void;
}

// Documentos placeholder em public/docs — substituir pelos oficiais no lançamento
const ACCEPTANCES = [
  {
    key: 'terms' as const,
    label: 'Li e aceito os Termos de Uso',
    description: 'Condições de uso da conta digital e dos serviços oferecidos.',
    docUrl: '/docs/termos-de-uso.html',
    docLabel: 'Ler os Termos de Uso',
  },
  {
    key: 'privacy' as const,
    label: 'Li e aceito a Política de Privacidade',
    description:
      'Tratamento dos seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD).',
    docUrl: '/docs/politica-de-privacidade.html',
    docLabel: 'Ler a Política de Privacidade',
  },
  {
    key: 'truthfulness' as const,
    label: 'Declaro que as informações fornecidas são verdadeiras',
    description:
      'Declaração de veracidade dos dados e documentos enviados neste cadastro.',
    docUrl: null,
    docLabel: null,
  },
];

export function ConfirmacaoStep({ onSubmitted }: ConfirmacaoStepProps) {
  const [checked, setChecked] = useState({ terms: false, privacy: false, truthfulness: false });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const allChecked = Object.values(checked).every(Boolean);

  async function handleSubmit(): Promise<void> {
    setFormError('');
    setLoading(true);
    try {
      const { progress, message } = await submitOpening();
      onSubmitted(progress, message);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Não foi possível finalizar o cadastro.',
      );
      scrollToFirstError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-5 text-sm font-medium leading-relaxed text-muted-2">
        Falta pouco! Revise e confirme os aceites abaixo para enviar seu cadastro
        para análise.
      </div>

      <div className="flex flex-col gap-3">
        {ACCEPTANCES.map((item) => (
          <label
            key={item.key}
            className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border-[1.5px] p-4 transition-colors ${
              checked[item.key] ? 'border-primary bg-primary-soft' : 'border-field bg-white'
            }`}
          >
            <input
              type="checkbox"
              checked={checked[item.key]}
              onChange={(e) =>
                setChecked((prev) => ({ ...prev, [item.key]: e.target.checked }))
              }
              className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[var(--p)]"
            />
            <span>
              <span className="block text-sm font-bold text-ink">{item.label}</span>
              <span className="mt-0.5 block text-xs font-medium leading-relaxed text-muted-2">
                {item.description}
              </span>
              {item.docUrl && (
                <a
                  href={item.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white no-underline hover:brightness-110"
                >
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                    style={{ width: 10, height: 10 }}
                  />
                  {item.docLabel}
                </a>
              )}
            </span>
          </label>
        ))}
      </div>

      <FormError message={formError} />
      <StepButtons
        onNext={() => void handleSubmit()}
        nextLabel="Finalizar cadastro"
        nextDisabled={!allChecked}
        loading={loading}
      />
    </div>
  );
}
