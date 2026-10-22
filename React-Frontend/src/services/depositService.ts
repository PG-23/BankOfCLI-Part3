import type { DepositRequest, TransactionResponse } from '../models';
import { api } from './apiClient';

// Per-deposit limits from the Figma design ("between $1.00 and $25,000.00").
// DepositCard enforces these; the API itself accepts 1 cent to $100,000,000.
export const DEPOSIT_MIN_CENTS = 100;
export const DEPOSIT_MAX_CENTS = 2_500_000;

// POST /transactions/deposit
// On failure throws ApiRequestError ({ status, code, message, field }), e.g.
// 400 INVALID_AMOUNT, 401 UNAUTHORIZED (not your account / session expired).
export function deposit(req: DepositRequest): Promise<TransactionResponse> {
  return api.post<TransactionResponse>('/transactions/deposit', req);
}
