import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@traxii/shared';
import { PIX_KEY_TYPES } from '../../mocks/db';
import * as pixService from '../../services/pixService';
import type { PixKeyType, PixReceipt } from '@traxii/shared';
import { formatBRL, parseCurrency } from '@traxii/shared';

const inputClass =
  'w-full box-border rounded-xl border-[1.5px] border-field p-3.5 text-[15px] font-semibold text-ink outline-none focus:border-primary';

export function Pix() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [keyType, setKeyType] = useState<PixKeyType>('cpf');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<PixReceipt | null>(null);

  const amount = parseCurrency(value);
  const current = PIX_KEY_TYPES.find((k) => k.id === keyType) ?? PIX_KEY_TYPES[0];

  function next() {
    if (step === 0) {
      if (!key.trim()) return setError('Informe a chave Pix do destinatário.');
      setError('');
      setStep(1);
    } else if (step === 1) {
      if (amount <= 0) return setError('Informe um valor maior que zero.');
      if (amount > 8421.1)
        return setError('Valor maior que o saldo disponível (R$ 8.421,10).');
      setError('');
      setStep(2);
    }
  }

  async function confirm() {
    setLoading(true);
    setError('');
    try {
      const r = await pixService.sendPix({ keyType, key, amount, message });
      setReceipt(r);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar o Pix.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(0);
    setKey('');
    setValue('');
    setMessage('');
    setError('');
    setReceipt(null);
  }

  return (
    <div className="max-w-[600px]">
      <div className="animate-fade-up rounded-[18px] bg-white p-7 shadow-sm">
        <div className="mb-1.5 flex items-center gap-2.5 text-primary">
          <Icon name="pix" size={24} />
          <div className="font-display text-xl font-bold text-ink">Pix</div>
        </div>

        {/* progresso */}
        <div className="mb-[26px] mt-4 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={
                'h-1.5 flex-1 rounded-full ' + (i <= step ? 'bg-primary' : 'bg-[#e4e7ee]')
              }
            />
          ))}
        </div>

        {step === 0 && (
          <>
            <div className="mb-4 text-[17px] font-bold text-ink">
              Para quem você quer transferir?
            </div>
            <div className="mb-[18px] flex flex-wrap gap-2">
              {PIX_KEY_TYPES.map((k) => (
                <button
                  key={k.id}
                  onClick={() => {
                    setKeyType(k.id);
                    setError('');
                  }}
                  className={
                    'cursor-pointer rounded-full px-4 py-2 text-[12.5px] font-bold ' +
                    (keyType === k.id
                      ? 'border-[1.5px] border-primary bg-primary text-white'
                      : 'border-[1.5px] border-field bg-white text-slate-ink')
                  }
                >
                  {k.label}
                </button>
              ))}
            </div>
            <label className="mb-1.5 block text-xs font-bold text-slate-ink">
              Chave Pix
            </label>
            <input
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError('');
              }}
              placeholder={current.placeholder}
              className={inputClass}
            />
            {error && (
              <div className="mt-2 text-xs font-semibold text-danger">{error}</div>
            )}
            <button
              onClick={next}
              className="mt-[22px] w-full cursor-pointer rounded-xl border-none bg-primary py-[15px] text-[15px] font-bold text-white hover:brightness-110"
            >
              Continuar
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="mb-1 text-[17px] font-bold text-ink">Qual o valor?</div>
            <div className="mb-[18px] text-[13px] font-semibold text-muted">
              Enviando para <b className="text-primary">{key}</b>
            </div>
            <div className="mb-[18px] flex items-baseline gap-2 border-b-2 border-primary pb-2">
              <span className="font-display text-xl font-bold text-ink">R$</span>
              <input
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError('');
                }}
                placeholder="0,00"
                className="w-full border-none bg-transparent font-display text-[34px] font-bold text-ink outline-none"
              />
            </div>
            <label className="mb-1.5 block text-xs font-bold text-slate-ink">
              Mensagem (opcional)
            </label>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex.: almoço de sábado"
              className={inputClass}
            />
            {error && (
              <div className="mt-2 text-xs font-semibold text-danger">{error}</div>
            )}
            <div className="mt-[22px] flex gap-3">
              <button
                onClick={() => {
                  setStep(0);
                  setError('');
                }}
                className="flex-1 cursor-pointer rounded-xl border-none bg-soft py-[15px] text-sm font-bold text-slate-ink"
              >
                Voltar
              </button>
              <button
                onClick={next}
                className="flex-[2] cursor-pointer rounded-xl border-none bg-primary py-[15px] text-[15px] font-bold text-white hover:brightness-110"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-[18px] text-[17px] font-bold text-ink">
              Confirme os dados do Pix
            </div>
            <div className="flex flex-col gap-3 rounded-[14px] bg-[#f7f8fb] p-[18px] text-[13.5px] font-semibold">
              <div className="flex justify-between">
                <span className="text-muted">Chave ({current.label})</span>
                <span className="text-ink">{key}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Favorecido</span>
                <span className="text-ink">Maria Oliveira Santos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Instituição</span>
                <span className="text-ink">Banco 260 · Nu Pagamentos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Valor</span>
                <span className="font-extrabold text-ink">{formatBRL(amount)}</span>
              </div>
              {message && (
                <div className="flex justify-between">
                  <span className="text-muted">Mensagem</span>
                  <span className="text-ink">{message}</span>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-2 text-xs font-semibold text-danger">{error}</div>
            )}
            <div className="mt-[22px] flex gap-3">
              <button
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
                className="flex-1 cursor-pointer rounded-xl border-none bg-soft py-[15px] text-sm font-bold text-slate-ink"
              >
                Voltar
              </button>
              <button
                onClick={confirm}
                disabled={loading}
                className="flex-[2] cursor-pointer rounded-xl border-none bg-primary py-[15px] text-[15px] font-bold text-white hover:brightness-110 disabled:opacity-60"
              >
                {loading ? 'Enviando…' : 'Confirmar Pix'}
              </button>
            </div>
          </>
        )}

        {step === 3 && receipt && (
          <>
            <div className="pb-1 pt-2.5 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 animate-pop place-items-center rounded-full bg-primary text-white">
                <Icon name="check" size={30} />
              </div>
              <div className="mb-1 font-display text-[22px] font-bold text-ink">
                Pix enviado!
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
                <span className="text-muted">Chave</span>
                <span className="text-ink">{receipt.key}</span>
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
                Fazer outro Pix
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
