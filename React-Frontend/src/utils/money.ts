// src/utils/money.ts

const MAX_CENTS = 100_000_000_00; // $100,000,000 limit per transaction; adjust as a team

/**
 * Converts user-entered dollars ("100", "100.5", "100.50", "1,000.25") to integer cents.
 * Returns null if the input isn't a valid positive amount.
 */
export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.trim().replace(/,/g, '').replace(/^\$/, '');

  // Digits, optionally followed by a decimal point and 1–2 digits
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;

  const dollars = Number(match[1]);
  const cents = Number((match[2] ?? '').padEnd(2, '0'));
  const total = dollars * 100 + cents;

  if (total <= 0 || total > MAX_CENTS) return null;
  return total;
}

/** Formats integer cents for display: 10050 → "$100.50" */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/** True if the value is a valid positive whole number of cents (use in services). */
export function isValidCents(value: number): boolean {
  return Number.isInteger(value) && value > 0 && value <= MAX_CENTS;
}