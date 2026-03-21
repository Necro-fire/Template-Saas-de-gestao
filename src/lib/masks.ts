// Centralized input masks for CNPJ, CPF, CEP, phone, celular

export function maskCnpj(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function maskCpf(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function maskCep(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

export function maskCelular(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 3) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d[2]} ${d.slice(3)}`;
  return `(${d.slice(0, 2)}) ${d[2]} ${d.slice(3, 7)}-${d.slice(7)}`;
}

export function unmask(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCnpj(value: string): boolean {
  return unmask(value).length === 14;
}

export function isValidCpf(value: string): boolean {
  return unmask(value).length === 11;
}

export function isValidCep(value: string): boolean {
  return unmask(value).length === 8;
}

export const ESTADOS_BR = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
] as const;

/**
 * Format an integer (cents) as Brazilian currency string: "1.234,56"
 * Input is the raw cents value (e.g. 12345 → "123,45")
 */
export function formatCentsToDisplay(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const intPart = Math.floor(abs / 100).toString();
  const decPart = (abs % 100).toString().padStart(2, "0");
  // Add thousand separators
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${withSep},${decPart}`;
}

/**
 * Mask a raw input string as Brazilian currency.
 * Strips non-digits, treats as cents, and formats.
 * Returns formatted string like "1.234,56"
 */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "0,00";
  const cents = parseInt(digits, 10);
  return formatCentsToDisplay(cents);
}

/**
 * Parse a masked currency string back to a number (float).
 * "1.234,56" → 1234.56
 */
export function parseCurrency(masked: string): number {
  const digits = masked.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}
