import type { Account, ApiError, Transaction, TransactionResponse, WithdrawRequest } from '../models';
import { db, delay } from '../mocks/db';
import { isValidCents } from '../utils/money';

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

// GET /accounts/:accountNumber
export async function getWithdrawAccount(accountNumber: string): Promise<Account> {
  await delay(350);

  const account = db.accounts.find(a => a.accountNumber === accountNumber);
  if (!account) fail('ACCOUNT_NOT_FOUND', 'The selected account could not be found.', 'accountNumber');

  return { ...account };
}

// POST /transactions/withdraw
export async function withdraw(req: WithdrawRequest): Promise<TransactionResponse> {
  await delay();

  if (!isValidCents(req.amountCents))
    fail('INVALID_AMOUNT', 'Enter a withdrawal amount greater than $0.00.', 'amountCents');

  const account = db.accounts.find(a => a.accountNumber === req.accountNumber);
  if (!account) fail('ACCOUNT_NOT_FOUND', 'The selected account could not be found.', 'accountNumber');

  if (req.amountCents > account.balanceCents)
    fail('INSUFFICIENT_FUNDS', 'Insufficient funds for this withdrawal.', 'amountCents');

  account.balanceCents -= req.amountCents;

  const transaction: Transaction = {
    id: nextTransactionId(),
    type: 'withdrawal',
    amountCents: req.amountCents,
    fromAccountNumber: account.accountNumber,
    toAccountNumber: null,
    timestamp: new Date().toISOString(),
  };
  db.transactions.push(transaction);

  return { transaction, newBalanceCents: account.balanceCents };
}