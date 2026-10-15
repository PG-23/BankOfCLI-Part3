import type { ApiError, DepositRequest, Transaction, TransactionResponse } from '../models';
import { db, delay } from '../mocks/db';
import { formatCents, isValidCents } from '../utils/money';

// Per-deposit limits from the Figma design ("between $1.00 and $25,000.00")
export const DEPOSIT_MIN_CENTS = 100;
export const DEPOSIT_MAX_CENTS = 2_500_000;

function fail(code: ApiError['code'], message: string, field?: string): never {
  throw { code, message, field } satisfies ApiError;
}

// Contract format: TXN-YYYYMMDD-NNNNNN, where NNNNNN keeps counting across all
// transactions (matches the seed data in transactions.json), so IDs never repeat.
function nextTransactionId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const lastSeq = Math.max(0, ...db.transactions.map(t => Number(t.id.slice(-6)) || 0));
  return `TXN-${date}-${String(lastSeq + 1).padStart(6, '0')}`;
}

// POST /transactions/deposit
export async function deposit(req: DepositRequest): Promise<TransactionResponse> {
  await delay();

  if (!isValidCents(req.amountCents) || req.amountCents < DEPOSIT_MIN_CENTS || req.amountCents > DEPOSIT_MAX_CENTS)
    fail(
      'INVALID_AMOUNT',
      `Deposits must be between ${formatCents(DEPOSIT_MIN_CENTS)} and ${formatCents(DEPOSIT_MAX_CENTS)}.`,
      'amountCents',
    );

  const account = db.accounts.find(a => a.accountNumber === req.accountNumber);
  if (!account) fail('ACCOUNT_NOT_FOUND', 'No account found with this number.', 'accountNumber');

  account.balanceCents += req.amountCents;

  const transaction: Transaction = {
    id: nextTransactionId(),
    type: 'deposit',
    amountCents: req.amountCents,
    fromAccountNumber: null,
    toAccountNumber: account.accountNumber,
    timestamp: new Date().toISOString(),
  };
  db.transactions.push(transaction);

  return { transaction, newBalanceCents: account.balanceCents };
}
