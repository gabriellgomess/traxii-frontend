import { useEffect, useState } from 'react';
import { Icon } from '../../components/Icon';
import { TransactionRow } from '../../components/TransactionRow';
import * as accountService from '../../services/accountService';
import * as transactionService from '../../services/transactionService';
import type { StatementFilter, StatementGroup } from '../../types';
import { formatBRL } from '../../utils/format';

const FILTERS: { id: StatementFilter; label: string }[] = [
  { id: 'todos', label: 'todos' },
  { id: 'entradas', label: 'entradas' },
  { id: 'saidas', label: 'saídas' },
];

export function Extrato() {
  const [filter, setFilter] = useState<StatementFilter>('todos');
  const [groups, setGroups] = useState<StatementGroup[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    accountService.getBalance().then((b) => setBalance(b.balance));
  }, []);

  useEffect(() => {
    transactionService.getStatement(filter).then(setGroups);
  }, [filter]);

  return (
    <div className="max-w-[760px]">
      <div className="animate-fade-up rounded-[18px] bg-white p-7 shadow-sm">
        <div className="mb-[18px] flex items-center gap-2.5">
          <span className="text-primary">
            <Icon name="extrato" size={24} />
          </span>
          <div className="font-display text-xl font-bold text-ink">Extrato</div>
          <div className="flex-1" />
          <div className="text-[13px] font-semibold text-muted">
            saldo: <b className="text-ink">{balance !== null ? formatBRL(balance) : '—'}</b>
          </div>
        </div>

        <div className="mb-5 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={
                'cursor-pointer rounded-full px-[18px] py-2 text-[12.5px] font-bold capitalize ' +
                (filter === f.id
                  ? 'border-[1.5px] border-primary bg-primary text-white'
                  : 'border-[1.5px] border-field bg-white text-slate-ink')
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-[18px]">
          {groups.map((g) => (
            <div key={g.date}>
              <div className="mb-1.5 text-[13px] font-bold text-primary">{g.date}</div>
              <div className="flex flex-col">
                {g.items.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="py-6 text-center text-[13px] font-semibold text-muted">
              Nenhum lançamento encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
