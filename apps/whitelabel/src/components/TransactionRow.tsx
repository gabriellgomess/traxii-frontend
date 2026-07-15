import type { Transaction } from '@traxii/shared';
import { formatSignedBRL, initialOf } from '@traxii/shared';

interface TransactionRowProps {
  tx: Transaction;
  /** linha secundária: "data · tipo" ou apenas "tipo" */
  showDate?: boolean;
}

export function TransactionRow({ tx, showDate = false }: TransactionRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-soft px-1 py-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-primary-soft text-[13px] font-extrabold text-primary">
        {initialOf(tx.name)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13.5px] font-bold text-ink">{tx.name}</div>
        <div className="text-[11.5px] font-semibold text-muted">
          {showDate ? `${tx.date} · ${tx.kind}` : tx.kind}
        </div>
      </div>
      <div className="flex-1" />
      <div
        className={
          'text-[13.5px] font-extrabold ' +
          (tx.value >= 0 ? 'text-positive' : 'text-ink')
        }
      >
        {formatSignedBRL(tx.value)}
      </div>
    </div>
  );
}
