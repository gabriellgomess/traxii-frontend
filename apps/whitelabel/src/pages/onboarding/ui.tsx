/** Blocos de UI reutilizados pelas etapas do wizard de abertura de conta. */

import type { ReactNode } from 'react';

export const inputClass =
  'w-full box-border rounded-xl border-[1.5px] border-field px-3.5 py-[13px] text-sm ' +
  'font-semibold text-ink outline-none focus:border-primary disabled:bg-soft disabled:text-muted';

export const selectClass = inputClass + ' bg-white appearance-none';

interface FieldProps {
  label: string;
  /** Texto auxiliar exibido ao lado do rótulo (ex.: status do CEP) */
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, error, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline gap-2">
        <label className="block text-xs font-bold text-slate-ink">{label}</label>
        {hint}
      </div>
      {children}
      {error && (
        <div data-field-error className="mt-1 text-xs font-semibold text-danger">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Rola a tela até a primeira mensagem de erro visível (marcada com
 * data-field-error). Chamar após setar os erros — o pequeno atraso dá tempo
 * de o React renderizar as mensagens antes da rolagem.
 */
export function scrollToFirstError(): void {
  window.setTimeout(() => {
    document
      .querySelector('[data-field-error]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 60);
}

interface StepButtonsProps {
  onBack?: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  /** Omitido quando o avanço é disparado por submit do form */
  onNext?: () => void;
}

export function StepButtons({
  onBack,
  backLabel = 'Voltar',
  nextLabel = 'Próximo',
  nextDisabled = false,
  loading = false,
  onNext,
}: StepButtonsProps) {
  return (
    <div className="mt-7 flex items-center gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="cursor-pointer rounded-xl border-[1.5px] border-field bg-white px-6 py-[14px] text-sm font-bold text-slate-ink hover:border-primary disabled:opacity-60"
        >
          {backLabel}
        </button>
      )}
      <button
        type={onNext ? 'button' : 'submit'}
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="flex-1 cursor-pointer rounded-xl border-none bg-primary py-[15px] text-[15px] font-bold text-white hover:brightness-110 disabled:opacity-50"
      >
        {loading ? 'Aguarde…' : nextLabel}
      </button>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      data-field-error
      className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
    >
      {message}
    </div>
  );
}
