import type { StatementFilter, StatementGroup, Transaction } from '@traxii/shared';
import { MOCK_STATEMENT } from '../mocks/db';
import { delay } from './api';

/** GET /api/transactions?filter= */
export async function getStatement(
  filter: StatementFilter = 'todos',
): Promise<StatementGroup[]> {
  await delay(250);
  return MOCK_STATEMENT.map((g) => ({
    date: g.date,
    items: g.items.filter(
      (t) =>
        filter === 'todos' || (filter === 'entradas' ? t.value >= 0 : t.value < 0),
    ),
  })).filter((g) => g.items.length > 0);
}

/** GET /api/transactions/recent */
export async function getRecent(limit = 4): Promise<Transaction[]> {
  await delay(250);
  return MOCK_STATEMENT.flatMap((g) => g.items).slice(0, limit);
}
