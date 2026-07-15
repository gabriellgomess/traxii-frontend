import type { Bill, FinanceSummary } from '../types';
import { MOCK_ACCOUNT_LIMIT, MOCK_BALANCE, MOCK_BILLS, MOCK_FINANCE_SUMMARY } from '../mocks/db';
import { delay } from './api';

/** GET /api/account/balance */
export async function getBalance(): Promise<{ balance: number; limit: number }> {
  await delay(200);
  return { balance: MOCK_BALANCE, limit: MOCK_ACCOUNT_LIMIT };
}

/** GET /api/account/finance-summary */
export async function getFinanceSummary(): Promise<FinanceSummary> {
  await delay(200);
  return MOCK_FINANCE_SUMMARY;
}

/** GET /api/account/bills */
export async function getBills(): Promise<Bill[]> {
  await delay(200);
  return MOCK_BILLS;
}
