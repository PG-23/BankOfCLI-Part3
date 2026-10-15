import {useEffect, useState, type ReactNode } from 'react';
import type { AuthResponse } from '../models';
import * as authService from '../services/authService';
import { AuthContext } from './AuthContext';
import { getAccount } from '../services/accountService';

const STORAGE_KEY = 'bankofcli-auth';

function loadSession(): AuthResponse | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(loadSession);

  const save = (res: AuthResponse | null) => {
    setSession(res);
    if (res) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    else sessionStorage.removeItem(STORAGE_KEY);
  };
    // After a page refresh the mock db resets to the JSON data, but sessionStorage still holds
  // the balance from before the refresh. Re-read the account once so the balance always
  // matches the real data (e.g. Dan goes back to $0).
  const accountNumber = session?.account.accountNumber;
  useEffect(() => {
    if (!accountNumber) return;
    getAccount(accountNumber)
      .then(fresh => {
        setSession(prev => {
          if (!prev) return prev;
          const next = { ...prev, account: fresh };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {
        // Account no longer exists (e.g. registered before the refresh): ignore for now
      });
  }, [accountNumber]);


  const value = {
    user: session?.user ?? null,
    account: session?.account ?? null,
    token: session?.token ?? null,
    login: async (req: Parameters<typeof authService.login>[0]) => {
      save(await authService.login(req));
    },
    register: async (req: Parameters<typeof authService.register>[0]) => {
      const res = await authService.register(req);
      save(res);
      return res.user; // so the page can show the generated username
    },
    logout: () => save(null),
    // Replace only the balance; keeps user, token and account number the same.
    // save() also writes it to sessionStorage, so it survives switching pages.
    updateBalance: (newBalanceCents: number) => {
      if (!session) return;
      save({ ...session, account: { ...session.account, balanceCents: newBalanceCents } });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}