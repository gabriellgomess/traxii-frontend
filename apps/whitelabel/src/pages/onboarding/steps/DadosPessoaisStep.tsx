/** Etapa 1 — dados pessoais (cria o rascunho ou edita um existente). */

import { useState, type FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { HttpError } from '@traxii/shared';
import {
  getOpeningSession,
  startOpening,
  updatePersonalData,
  type OpeningProgress,
  type PersonalDataPayload,
} from '../../../services/accountOpeningService';
import { maskCpf, maskPhone, onlyDigits } from '../../../utils/masks';
import {
  isAdult,
  isValidCellPhone,
  isValidCpf,
  isValidEmail,
  isValidFullName,
  UFS,
} from '../../../utils/validators';
import {
  Field,
  FormError,
  inputClass,
  scrollToFirstError,
  selectClass,
  StepButtons,
} from '../ui';

interface DadosPessoaisStepProps {
  progress: OpeningProgress | null;
  onDone: (progress: OpeningProgress) => void;
}

export function DadosPessoaisStep({ progress, onDone }: DadosPessoaisStepProps) {
  const saved = progress?.personal_data;
  const isEditing = getOpeningSession() !== null && saved !== undefined;

  const [form, setForm] = useState({
    full_name: saved?.full_name ?? '',
    email: saved?.email ?? '',
    cpf: saved ? maskCpf(saved.cpf) : '',
    document_type: saved?.document_type ?? ('rg' as 'rg' | 'cnh'),
    document_number: saved?.document_number ?? '',
    document_issuer: saved?.document_issuer ?? '',
    document_issuer_uf: saved?.document_issuer_uf ?? '',
    birth_date: saved?.birth_date ?? '',
    phone: saved ? maskPhone(saved.phone) : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!isValidFullName(form.full_name)) {
      next.full_name = 'Informe seu nome completo (nome e sobrenome).';
    }
    if (!isValidEmail(form.email)) next.email = 'Informe um e-mail válido.';
    if (!isValidCpf(form.cpf)) next.cpf = 'CPF inválido.';
    if (onlyDigits(form.document_number).length === 0 || form.document_number.trim().length < 3) {
      next.document_number = 'Informe o número do documento.';
    }
    if (form.document_issuer.trim() === '') next.document_issuer = 'Informe o órgão emissor.';
    if (form.document_issuer_uf === '') next.document_issuer_uf = 'Informe a UF.';
    if (!form.birth_date) {
      next.birth_date = 'Informe sua data de nascimento.';
    } else if (!isAdult(form.birth_date)) {
      next.birth_date = 'É preciso ter 18 anos ou mais para abrir a conta.';
    }
    if (!isValidCellPhone(form.phone)) {
      next.phone = 'Informe um celular válido com DDD.';
    }

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

    const payload: PersonalDataPayload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      cpf: onlyDigits(form.cpf),
      document_type: form.document_type,
      document_number: form.document_number.trim(),
      document_issuer: form.document_issuer.trim(),
      document_issuer_uf: form.document_issuer_uf,
      birth_date: form.birth_date,
      phone: onlyDigits(form.phone),
    };

    setLoading(true);
    try {
      const updated = isEditing
        ? await updatePersonalData(payload)
        : await startOpening(payload);
      onDone(updated);
    } catch (err) {
      if (err instanceof HttpError && err.errors) {
        const serverErrors: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.errors)) {
          serverErrors[field] = messages[0];
        }
        setErrors(serverErrors);
      } else {
        setFormError(err instanceof Error ? err.message : 'Não foi possível salvar seus dados.');
      }
      scrollToFirstError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4">
        <Field label="Nome completo" error={errors.full_name}>
          <input
            value={form.full_name}
            onChange={(e) => set('full_name', e.target.value)}
            placeholder="Maria da Silva"
            autoComplete="name"
            maxLength={120}
            className={inputClass}
          />
        </Field>

        <Field label="E-mail" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
            maxLength={255}
            className={inputClass}
          />
        </Field>

        <Field label="CPF" error={errors.cpf}>
          <input
            value={form.cpf}
            onChange={(e) => set('cpf', maskCpf(e.target.value))}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de documento" error={errors.document_type}>
            <select
              value={form.document_type}
              onChange={(e) => set('document_type', e.target.value as 'rg' | 'cnh')}
              className={selectClass}
            >
              <option value="rg">RG</option>
              <option value="cnh">CNH</option>
            </select>
          </Field>
          <Field label="Número do documento" error={errors.document_number}>
            <input
              value={form.document_number}
              onChange={(e) => set('document_number', e.target.value)}
              placeholder={form.document_type === 'rg' ? '12.345.678-9' : '00000000000'}
              maxLength={20}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-[1fr_110px] gap-4">
          <Field label="Órgão emissor" error={errors.document_issuer}>
            <input
              value={form.document_issuer}
              onChange={(e) => set('document_issuer', e.target.value)}
              placeholder={form.document_type === 'rg' ? 'SSP' : 'DETRAN'}
              maxLength={20}
              className={inputClass}
            />
          </Field>
          <Field label="UF de emissão" error={errors.document_issuer_uf}>
            <select
              value={form.document_issuer_uf}
              onChange={(e) => set('document_issuer_uf', e.target.value)}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data de nascimento" error={errors.birth_date}>
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => set('birth_date', e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
          </Field>
          <Field label="Celular" error={errors.phone}>
            <input
              value={form.phone}
              onChange={(e) => set('phone', maskPhone(e.target.value))}
              placeholder="(11) 98888-7777"
              inputMode="tel"
              autoComplete="tel-national"
              maxLength={15}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {!isEditing && (
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-primary-soft p-3.5">
          <FontAwesomeIcon
            icon={faCircleInfo}
            style={{ width: 16, height: 16, marginTop: 2 }}
            className="shrink-0 text-primary"
          />
          <div className="text-xs font-semibold leading-relaxed text-slate-ink">
            Analisaremos seus dados e enviaremos o acesso por e-mail.
          </div>
        </div>
      )}

      <FormError message={formError} />
      <StepButtons loading={loading} nextLabel="Próximo" />
    </form>
  );
}
