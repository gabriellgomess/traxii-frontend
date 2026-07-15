export function formatBRL(n: number): string {
  return (
    'R$ ' +
    n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

/** Converte "1.234,56" / "1234.56" / "R$ 50" em número */
export function parseCurrency(s: string): number {
  const n = parseFloat(
    String(s).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''),
  );
  return isNaN(n) ? 0 : n;
}

export function formatDateTime(date: Date = new Date()): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Valor com sinal, ex.: +R$ 350,00 / -R$ 86,40 */
export function formatSignedBRL(n: number): string {
  return (n >= 0 ? '+' : '-') + formatBRL(Math.abs(n));
}

export function initialOf(name: string): string {
  return name.replace(/[^a-zA-ZÀ-ú]/g, '').charAt(0).toUpperCase() || '•';
}
