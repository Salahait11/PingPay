// utils.ts
export function formatNumber(n: number): string {
  return n?.toLocaleString('en-US');
}

export function formatCurrency(n: number): string {
  if (typeof n !== 'number') return '';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}
