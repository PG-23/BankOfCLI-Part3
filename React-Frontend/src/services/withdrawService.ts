
import type {
  Account,
  ApiError,
  TransactionResponse,
  WithdrawRequest
} from '../models';

import { api } from './apiClient';
import { isValidCents } from '../utils/money';

// Helper function for handling validation errors
function fail(
  code: ApiError['code'],
  message: string,
  field?: string
): never {
  throw { code, message, field } satisfies ApiError;
}

// GET /api/account/me
// Fetch account information from the real backend API
export async function getWithdrawAccount(
  accountNumber: string
): Promise<Pick<Account, 'accountNumber' | 'balanceCents'>> {

  const account = await api.get<
    Pick<Account, 'accountNumber' | 'balanceCents'>
  >('/account/me');

  // Verify that the account number matches
  if (account.accountNumber !== accountNumber) {
    fail(
      'ACCOUNT_NOT_FOUND',
      'The selected account could not be found.',
      'accountNumber'
    );
  }

  return {
    accountNumber: account.accountNumber,
    balanceCents: account.balanceCents
  };
}

// POST /api/transactions/withdraw
// Send the withdrawal request to the Spring Boot backend
export async function withdraw(
  req: WithdrawRequest
): Promise<TransactionResponse> {

  // Validate the withdrawal amount
  if (!isValidCents(req.amountCents)) {
    fail(
      'INVALID_AMOUNT',
      'Enter a withdrawal amount greater than $0.00.',
      'amountCents'
    );
  }

  // Backend handles balance checks, withdrawal,
  // database updates, and transaction recording
  return api.post<TransactionResponse>(
    '/transactions/withdraw',
    req
  );
}
