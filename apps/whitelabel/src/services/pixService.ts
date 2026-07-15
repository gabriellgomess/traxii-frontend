import type { PixReceipt, PixRequest } from '@traxii/shared';
import { MOCK_BALANCE, PIX_KEY_TYPES } from '../mocks/db';
import { ApiError, delay, genAuthCode, genId } from './api';
import { formatDateTime } from '@traxii/shared';

/** POST /api/pix/transfers */
export async function sendPix(request: PixRequest): Promise<PixReceipt> {
  await delay();
  if (!request.key.trim()) {
    throw new ApiError('Informe a chave Pix do destinatário.');
  }
  if (request.amount <= 0) {
    throw new ApiError('Informe um valor maior que zero.');
  }
  if (request.amount > MOCK_BALANCE) {
    throw new ApiError('Valor maior que o saldo disponível.');
  }
  const keyType = PIX_KEY_TYPES.find((k) => k.id === request.keyType);
  return {
    id: genId('pix_'),
    authCode: genAuthCode(),
    date: formatDateTime(),
    amount: request.amount,
    key: request.key,
    keyTypeLabel: keyType?.label ?? request.keyType,
    recipientName: 'Maria Oliveira Santos',
    institution: 'Banco 260 · Nu Pagamentos',
    message: request.message,
  };
}
