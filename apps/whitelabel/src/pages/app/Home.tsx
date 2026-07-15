import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '@traxii/shared';
import { TransactionRow } from '../../components/TransactionRow';
import * as accountService from '../../services/accountService';
import * as transactionService from '../../services/transactionService';
import type { Bill, FinanceSummary, Transaction } from '@traxii/shared';
import { formatBRL } from '@traxii/shared';

const SHORTCUTS: { label: string; icon: IconName; to: string }[] = [
  { label: 'pix e transferir', icon: 'pix', to: '/app/pix' },
  { label: 'fazer TED', icon: 'ted', to: '/app/ted' },
  { label: 'extrato', icon: 'extrato', to: '/app/extrato' },
  { label: 'ajuda', icon: 'ajuda', to: '/app/ajuda' },
];

export function Home() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<{ balance: number; limit: number } | null>(null);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);

  useEffect(() => {
    accountService.getBalance().then(setBalance);
    accountService.getFinanceSummary().then(setFinance);
    accountService.getBills().then(setBills);
    transactionService.getRecent().then(setRecent);
  }, []);

  return (
    <div className="grid items-start gap-[22px] xl:grid-cols-[390px_1fr]">
      <div className="flex flex-col gap-[22px]">
        {/* saldo */}
        <div className="rounded-[18px] bg-white p-[22px] shadow-sm">
          <div className="flex items-baseline justify-between">
            <div className="text-[15px] font-bold text-ink">saldo em conta</div>
            <div className="font-display text-xl font-extrabold text-ink">
              {balance ? formatBRL(balance.balance) : '—'}
            </div>
          </div>
          <div className="my-4 h-px bg-[#eceef2]" />
          <button
            onClick={() => navigate('/app/extrato')}
            className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-sm font-bold text-primary"
          >
            conferir extrato <span className="text-base">›</span>
          </button>
          <div className="mt-3.5 flex justify-between rounded-[10px] bg-soft px-3.5 py-2.5 text-xs font-semibold text-muted-2">
            <span>Limite da conta disponível</span>
            <span>{balance ? formatBRL(balance.limit) : '—'}</span>
          </div>
        </div>

        {/* minhas finanças */}
        <div className="rounded-[18px] bg-white p-[22px] shadow-sm">
          <div className="mb-4 text-[15px] font-bold text-ink">minhas finanças</div>
          <div className="flex items-center gap-5 rounded-2xl bg-primary p-5">
            <svg width="110" height="110" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="16" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#fff" strokeWidth="16" strokeDasharray="155 283" strokeLinecap="round" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="var(--s)" strokeWidth="16" strokeDasharray="60 283" strokeDashoffset="-165" strokeLinecap="round" transform="rotate(-90 60 60)" />
            </svg>
            <div className="flex flex-col gap-[5px] text-[12.5px] font-semibold text-white">
              <div className="text-sm font-extrabold">{finance?.month ?? '—'}</div>
              <div>
                entrada: <b>{finance ? formatBRL(finance.income) : '—'}</b>
              </div>
              <div>
                investido: <b>{finance ? formatBRL(finance.invested) : '—'}</b>
              </div>
              <div>
                saída: <b>{finance ? formatBRL(finance.expenses) : '—'}</b>
              </div>
              <div className="mt-1.5 flex cursor-pointer items-center gap-1.5 text-[12.5px] font-bold">
                mais detalhes <span>›</span>
              </div>
            </div>
          </div>
        </div>

        {/* contas a pagar */}
        <div className="rounded-[18px] bg-white p-[22px] shadow-sm">
          <div className="mb-3.5 text-[15px] font-bold text-ink">contas a pagar</div>
          {bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-ink">{bill.description}</div>
                <div className="text-xs font-semibold text-muted">{bill.dueDate}</div>
              </div>
              <div className="text-[15px] font-extrabold text-ink">
                {formatBRL(bill.value)}
              </div>
            </div>
          ))}
          <div className="my-3.5 h-px bg-[#eceef2]" />
          <div className="flex cursor-pointer items-center gap-1.5 text-[13px] font-bold text-primary">
            mais detalhes <span>›</span>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-[22px]">
        {/* lançamentos */}
        <div className="rounded-[18px] bg-white p-[22px] shadow-sm">
          <div className="mb-3.5 flex items-center">
            <div className="text-base font-bold text-ink">Lançamentos</div>
            <div className="flex-1" />
            <button
              onClick={() => navigate('/app/extrato')}
              className="cursor-pointer border-none bg-transparent text-[13px] font-bold text-primary"
            >
              ver extrato completo ›
            </button>
          </div>
          <div className="mb-3.5 flex gap-[18px] text-[13px] font-bold">
            <span className="border-b-[2.5px] border-primary pb-[5px] text-ink">
              recentes
            </span>
            <span className="text-[#a2a8b8]">futuros</span>
          </div>
          <div className="flex flex-col gap-1">
            {recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} showDate />
            ))}
          </div>
        </div>

        {/* atalhos */}
        <div
          className="rounded-[18px] bg-primary p-[22px]"
          style={{ boxShadow: '0 14px 34px -16px var(--p)' }}
        >
          <div className="mb-4 text-[15px] font-bold text-white">atalhos</div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {SHORTCUTS.map((sh) => (
              <Link
                key={sh.to + sh.label}
                to={sh.to}
                className="flex cursor-pointer flex-col items-center gap-2.5 rounded-[14px] border-none bg-white px-2.5 py-4 text-primary no-underline transition-transform hover:-translate-y-0.5"
              >
                <Icon name={sh.icon} />
                <span className="text-center text-xs font-bold text-ink">{sh.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
