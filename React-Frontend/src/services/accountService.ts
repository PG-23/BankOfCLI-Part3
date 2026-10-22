import type { Account } from '../models';
import { api } from './apiClient';

// GET /accounts/{accountNumber} — the session's account is a login-time snapshot,
// so pages call this to show the current balance.
export async function getAccount(): Promise<Account> {
  return await api.get(`/accounts/me`);
}
