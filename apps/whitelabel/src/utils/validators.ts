/**
 * Validações client-side do wizard de abertura de conta.
 * Espelham as regras da API (que é a autoridade final).
 */

import { onlyDigits } from './masks';

/** DDDs em uso no Brasil (Anatel). */
const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
  37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64,
  65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
  89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
] as const;

export function isValidFullName(name: string): boolean {
  const words = name.trim().split(/\s+/);
  return words.filter((w) => w.replace(/[^\p{L}]/gu, '').length >= 2).length >= 2;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Validação matemática do CPF (dígitos verificadores). */
export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  for (const length of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += parseInt(cpf[i], 10) * (length + 1 - i);
    }
    const check = ((10 * sum) % 11) % 10;
    if (check !== parseInt(cpf[length], 10)) return false;
  }
  return true;
}

export function isValidCellPhone(value: string): boolean {
  const phone = onlyDigits(value);
  return (
    phone.length === 11 &&
    VALID_DDDS.has(parseInt(phone.slice(0, 2), 10)) &&
    phone[2] === '9'
  );
}

export function isAdult(birthDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return false;
  const date = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const limit = new Date();
  limit.setFullYear(limit.getFullYear() - 18);
  return date <= limit;
}

export interface PasswordChecks {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  symbol: boolean;
}

/** Política de senha forte — mesma da API (min 8, maiúscula, minúscula, número, símbolo). */
export function checkPassword(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function isStrongPassword(password: string): boolean {
  return Object.values(checkPassword(password)).every(Boolean);
}

export function isValidCep(value: string): boolean {
  return onlyDigits(value).length === 8;
}
