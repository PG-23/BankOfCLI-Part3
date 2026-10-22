import type { Account, ApiError } from '../models';
import { api } from './apiClient';

function fail(code: ApiError['code'], message: string, field?: string): never {
  throw { code, message, field } satisfies ApiError;
}

// GET /accounts/{accountNumber} — the session's account is a login-time snapshot,
// so pages call this to show the current balance.
export async function getAccount(accountNumber: string): Promise<Account> {
    const account = await api.get<Account>(`/accounts/me`);
    console.log(account);
    
    if (!account) fail('ACCOUNT_NOT_FOUND', 'No account found with this number.', 'accountNumber');

    return account;
  }
