import type { TedReceipt, TedRequest } from '@traxii/shared';
import { ApiError, delay, genAuthCode, genId } from './api';
import { formatDateTime } from '@traxii/shared';

/** POST /api/ted/transfers */
export async function sendTed(request: TedRequest): Promise<TedReceipt> {
  await delay();
  if (!request.bank) throw new ApiError('Selecione o banco de destino.');
  if (!request.agency.trim() || !request.account.trim()) {
    throw new ApiError('Informe agência e conta.');
  }
  if (!request.recipientName.trim() || !request.document.trim()) {
    throw new ApiError('Informe o nome e o CPF/CNPJ do favorecido.');
  }
  if (request.amount <= 0) throw new ApiError('Informe um valor maior que zero.');

  return {
    id: genId('ted_'),
    authCode: genAuthCode(),
    date: formatDateTime(),
    amount: request.amount,
    recipientName: request.recipientName,
    bank: request.bank,
  };
}
