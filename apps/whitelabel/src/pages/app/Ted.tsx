import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@traxii/shared';
import { BANKS } from '../../mocks/db';
import * as tedService from '../../services/tedService';
import type { TedReceipt } from '@traxii/shared';
import { formatBRL, parseCurrency } from '@traxii/shared';

const inputClass =
  'w-full box-border rounded-xl border-[1.5px] border-field p-[13px] text-sm font-semibold text-ink outline-none focus:border-primary';
const labelClass = 'mb-1.5 block text-xs font-bold text-slate-ink';

interface TedForm {
  bank: string;
  agency: string;
  account: string;
  name: string;
  document: string;
  value: string;
}

const EMPTY_FORM: TedForm = {
  bank: '',
  agency: '',
  account: '',
  name: '',
  document: '',
  value: '',
};

export function Ted() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<TedForm>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<TedReceipt | null>(null);

  const amount = parseCurrency(form.value);

  function set<K extends keyof TedForm>(field: K, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
    setError('');
  }

  function next() {
    if (!form.bank) return setError('Selecione o banco de destino.');
    if (!form.agency.trim() || !form.account.trim())
      return setError('Informe agência e conta.');
    if (!form.name.trim() || !form.document.trim())
      return setError('Informe o nome e o CPF/CNPJ do favorecido.');
    if (amount <= 0) return setError('Informe um valor maior que zero.');
    setError('');
    setStep(1);
  }

  async function confirm() {
    setLoading(true);
    setError('');
    try {
      const r = await tedService.sendTed({
        bank: form.bank,
        agency: form.agency,
        account: form.account,
        recipientName: form.name,
        document: form.document,
        amount,
      });
      setReceipt(r);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar a TED.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setForm(EMPTY_FORM);
    setError('');
    setReceipt(null);
    setStep(0);
  }

  return (
    <div className="max-w-[600px]">
      <div className="animate-fade-up rounded-[18px] bg-white p-7 shadow-sm">
        <div className="mb-5 flex items-center gap-2.5 text-primary">
          <Icon name="ted" size={24} />
          <div className="font-display text-xl font-bold text-ink">TED</div>
        </div>

        {step === 0 && (
          <>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="col-span-2">
                <label className={labelClass}>Banco</label>
                <select
                  value={form.bank}
                  onChange={(e) => set('bank', e.target.value)}
                  className={inputClass + ' bg-white'}
                >
                  <option value="">Selecione o banco</option>
                  {BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Agência</label>
                <input
                  value={form.agency}
                  onChange={(e) => set('agency', e.target.value)}
                  placeholder="0000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Conta com dígito</label>
                <input
                  value={form.account}
                  onChange={(e) => set('account', e.target.value)}
                  placeholder="00000-0"
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Nome do favorecido</label>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Nome completo"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>CPF/CNPJ</label>
                <input
                  value={form.document}
                  onChange={(e) => set('document', e.target.value)}
                  placeholder="000.000.000-00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Valor</label>
                <input
                  value={form.value}
                  onChange={(e) => set('value', e.target.value)}
                  placeholder="R$ 0,00"
                  className={inputClass}
                />
              </div>
            </div>
            {error && (
              <div className="mt-3 text-xs font-semibold text-danger">{error}</div>
            )}
            <div className="mt-3.5 rounded-[10px] bg-primary-soft px-3.5 py-2.5 text-xs font-semibold text-primary">
              TEDs são processadas em dias úteis, das 6h30 às 17h. Fora desse horário, o
              envio fica agendado.
            </div>
            <button
              onClick={next}
              className="mt-5 w-full cursor-pointer rounded-xl border-none bg-primary py-[15px] text-[15px] font-bold text-white hover:brightness-110"
            >
              Continuar
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="mb-[18px] text-[17px] font-bold text-ink">
              Confirme os dados da TED
            </div>
            <div className="flex flex-col gap-3 rounded-[14px] bg-[#f7f8fb] p-[18px] text-[13.5px] font-semibold">
              <div className="flex justify-between">
                <span className="text-muted">Banco</span>
                <span className="text-ink">{form.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Agência / Conta</span>
                <span className="text-ink">
                  {form.agency} / {form.account}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Favorecido</span>
                <span className="text-ink">{form.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">CPF/CNPJ</span>
                <span className="text-ink">{form.document}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Valor</span>
                <span className="font-extrabold text-ink">{formatBRL(amount)}</span>
              </div>
            </div>
            {error && (
              <div className="mt-2 text-xs font-semibold text-danger">{error}</div>
            )}
            <div className="mt-[22px] flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 cursor-pointer rounded-xl border-none bg-soft py-[15px] text-sm font-bold text-slate-ink"
              >
                Voltar
              </button>
              <button
                onClick={confirm}
                disabled={loading}
                className="flex-[2] cursor-pointer rounded-xl border-none bg-primary py-[15px] text-[15px] font-bold text-white hover:brightness-110 disabled:opacity-60"
              >
                {loading ? 'Enviando…' : 'Confirmar TED'}
              </button>
            </div>
          </>
        )}

        {step === 2 && receipt && (
          <>
            <div className="pb-1 pt-2.5 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 animate-pop place-items-center rounded-full bg-primary text-white">
                <Icon name="check" size={30} />
              </div>
              <div className="mb-1 font-display text-[22px] font-bold text-ink">
                TED enviada!
              </div>
              <div className="mb-[22px] text-[13px] font-semibold text-muted">
                {receipt.date}
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-[14px] bg-[#f7f8fb] p-[18px] text-[13.5px] font-semibold">
              <div className="flex justify-between">
                <span className="text-muted">Valor</span>
                <span className="font-extrabold text-ink">
                  {formatBRL(receipt.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Para</span>
                <span className="text-ink">{receipt.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Banco</span>
                <span className="text-ink">{receipt.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Autenticação</span>
                <span className="font-mono text-xs text-ink">{receipt.authCode}</span>
              </div>
            </div>
            <div className="mt-[22px] flex gap-3">
              <button
                onClick={reset}
                className="flex-1 cursor-pointer rounded-xl border-none bg-soft py-[15px] text-sm font-bold text-slate-ink"
              >
                Nova TED
              </button>
              <button
                onClick={() => navigate('/app')}
                className="flex-1 cursor-pointer rounded-xl border-none bg-primary py-[15px] text-sm font-bold text-white"
              >
                Voltar ao início
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
