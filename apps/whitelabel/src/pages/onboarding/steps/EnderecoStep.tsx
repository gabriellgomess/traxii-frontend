/** Etapa 2 — endereço com preenchimento automático pelo CEP (ViaCEP). */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { HttpError } from '@traxii/shared';
import {
  updateAddress,
  type OpeningProgress,
} from '../../../services/accountOpeningService';
import { fetchAddressByCep } from '../../../services/cepService';
import { maskCep, onlyDigits } from '../../../utils/masks';
import { isValidCep, UFS } from '../../../utils/validators';
import {
  Field,
  FormError,
  inputClass,
  scrollToFirstError,
  selectClass,
  StepButtons,
} from '../ui';

interface EnderecoStepProps {
  progress: OpeningProgress;
  onDone: (progress: OpeningProgress) => void;
}

export function EnderecoStep({ progress, onDone }: EnderecoStepProps) {
  const saved = progress.address;

  const [form, setForm] = useState({
    zip_code: saved.zip_code ? maskCep(saved.zip_code) : '',
    street: saved.street ?? '',
    number: saved.number ?? '',
    complement: saved.complement ?? '',
    neighborhood: saved.neighborhood ?? '',
    city: saved.city ?? '',
    state: saved.state ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cepHint, setCepHint] = useState('');
  const cepHintTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(cepHintTimer.current), []);

  function set<K extends keyof typeof form>(key: K, value: string): void {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  /** Consulta o ViaCEP apenas ao sair do campo (blur); campos seguem editáveis. */
  async function handleCepBlur(): Promise<void> {
    if (onlyDigits(form.zip_code).length !== 8) return;

    setCepHint('Buscando endereço…');
    const address = await fetchAddressByCep(form.zip_code);

    if (address) {
      setForm((prev) => ({
        ...prev,
        street: address.street || prev.street,
        neighborhood: address.neighborhood || prev.neighborhood,
        city: address.city || prev.city,
        state: address.state || prev.state,
      }));
      // Dica temporária ao lado do rótulo — some sozinha depois de alguns segundos
      setCepHint('Endereço preenchido');
      window.clearTimeout(cepHintTimer.current);
      cepHintTimer.current = window.setTimeout(() => setCepHint(''), 3000);
    } else {
      setCepHint('');
      setErrors((prev) => ({
        ...prev,
        zip_code: 'CEP não encontrado. Preencha o endereço manualmente.',
      }));
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!isValidCep(form.zip_code)) next.zip_code = 'Informe um CEP válido.';
    if (form.street.trim() === '') next.street = 'Informe o logradouro.';
    if (form.number.trim() === '') next.number = 'Informe o número.';
    if (form.neighborhood.trim() === '') next.neighborhood = 'Informe o bairro.';
    if (form.city.trim() === '') next.city = 'Informe a cidade.';
    if (form.state === '') next.state = 'Informe o estado.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setFormError('');
    if (!validate()) {
      scrollToFirstError();
      return;
    }

    setLoading(true);
    try {
      const updated = await updateAddress({
        zip_code: onlyDigits(form.zip_code),
        street: form.street.trim(),
        number: form.number.trim(),
        complement: form.complement.trim(),
        neighborhood: form.neighborhood.trim(),
        city: form.city.trim(),
        state: form.state,
      });
      onDone(updated);
    } catch (err) {
      if (err instanceof HttpError && err.errors) {
        const serverErrors: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.errors)) {
          serverErrors[field] = messages[0];
        }
        setErrors(serverErrors);
      } else {
        setFormError(err instanceof Error ? err.message : 'Não foi possível salvar o endereço.');
      }
      scrollToFirstError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4">
        <Field
          label="CEP"
          hint={
            cepHint && (
              <span className="animate-fade-up text-xs font-semibold text-primary">
                {cepHint}
              </span>
            )
          }
          error={errors.zip_code}
        >
          <input
            value={form.zip_code}
            onChange={(e) => set('zip_code', maskCep(e.target.value))}
            onBlur={() => void handleCepBlur()}
            placeholder="00000-000"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={9}
            className={inputClass}
          />
        </Field>

        <Field label="Logradouro" error={errors.street}>
          <input
            value={form.street}
            onChange={(e) => set('street', e.target.value)}
            placeholder="Avenida Paulista"
            maxLength={150}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-[130px_1fr] gap-4">
          <Field label="Número" error={errors.number}>
            <input
              value={form.number}
              onChange={(e) => set('number', e.target.value)}
              placeholder="1000"
              maxLength={10}
              className={inputClass}
            />
          </Field>
          <Field label="Complemento (opcional)" error={errors.complement}>
            <input
              value={form.complement}
              onChange={(e) => set('complement', e.target.value)}
              placeholder="Apto 12"
              maxLength={100}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Bairro" error={errors.neighborhood}>
          <input
            value={form.neighborhood}
            onChange={(e) => set('neighborhood', e.target.value)}
            placeholder="Bela Vista"
            maxLength={100}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-[1fr_110px] gap-4">
          <Field label="Cidade" error={errors.city}>
            <input
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="São Paulo"
              maxLength={100}
              className={inputClass}
            />
          </Field>
          <Field label="Estado" error={errors.state}>
            <select
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              className={selectClass}
            >
              <option value="">UF</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <FormError message={formError} />
      <StepButtons loading={loading} />
    </form>
  );
}
