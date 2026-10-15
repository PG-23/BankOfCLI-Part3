import { Injectable } from '@angular/core';

import { Account, AccountType } from '../models';
import accounts from '../mock/accounts.json';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accounts = accounts as Account[];

  getAccountsByUserId(userId: string): Account[] {
    return this.accounts.filter(
      (account) => account.userId === userId
    );
  }

  getAccountByUserId(userId: string): Account | null {
    const account = this.accounts.find(
      (item) => item.userId === userId
    );

    return account ?? null;
  }

  getAccountById(accountId: string): Account | null {
    const account = this.accounts.find(
      (item) => item.id === accountId
    );

    return account ?? null;
  }

  getAccountByType(
    userId: string,
    type: AccountType
  ): Account | null {
    const account = this.accounts.find(
      (item) =>
        item.userId === userId &&
        item.type === type
    );

    return account ?? null;
  }
}
