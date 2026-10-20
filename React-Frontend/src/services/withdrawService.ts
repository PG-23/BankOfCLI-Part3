
import type {
  Account,
  ApiError,
  TransactionResponse,
  WithdrawRequest
} from '../models';

import { db, delay } from '../mocks/db';
import { api } from './apiClient';

// Temporary error helper for the mock account lookup.
function fail(
  code: ApiError['code'],
  message: string,
  field?: string
): never {
  throw { code, message, field } satisfies ApiError;
}

// GET /accounts/:accountNumber
// Temporarily uses mock data until account API integration is ready.
export async function getWithdrawAccount(
  accountNumber: string
): Promise<Account> {

  await delay(350);

  const account = db.accounts.find(
    a => a.accountNumber === accountNumber
  );

  if (!account) {
    fail(
      'ACCOUNT_NOT_FOUND',
      'The selected account could not be found.',
      'accountNumber'
    );
  }

  return { ...account };
}

// POST /transactions/withdraw
// Sends a real request to the Spring Boot backend.
export async function withdraw(
  req: WithdrawRequest
): Promise<TransactionResponse> {

  return api.post<TransactionResponse>(
    '/transactions/withdraw',
    req
  );
}
