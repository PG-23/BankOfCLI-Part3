import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

import {
  Account,
  ApiResponse,
  BackendAccount,
  BackendRecipient,
  BackendTransaction,
  BackendTransactionResponse,
  DepositRequest,
  Recipient,
  Transaction,
  TransferRequest,
  WithdrawRequest,
} from '../models';

import { environment } from '../../../environments/environment';
import { toApiResponse } from '../utils/api-result';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // ---------- ACCOUNT METHODS ----------

  getAccount(accountId: string): Observable<ApiResponse<Account>> {
    return toApiResponse(
      this.http.get<BackendAccount>(`${this.baseUrl}/accounts/me`).pipe(
        map((backend) => this.mapAccount(backend)),
        map((account) => {
          if (account.id !== accountId) {
            throw {
              error: {
                code: 'ACCOUNT_NOT_FOUND',
                message: 'Account not found.',
              },
            };
          }
          return account;
        }),
      ),
    );
  }

  getAccountByUserId(userId: string): Observable<ApiResponse<Account>> {
    // The authenticated JWT identifies the user on the backend.
    void userId;

    return toApiResponse(
      this.http.get<BackendAccount>(`${this.baseUrl}/accounts/me`).pipe(
        map((backend) => this.mapAccount(backend)),
      ),
    );
  }

  getAccountsByUserId(userId: string): Observable<ApiResponse<Account[]>> {
    return this.getAccountByUserId(userId).pipe(
      map((response) => ({
        success: response.success,
        ...(response.data ? { data: [response.data] } : {}),
        ...(response.error ? { error: response.error } : {}),
      })),
    );
  }

  lookupRecipient(accountNumber: string): Observable<ApiResponse<Recipient>> {
    return toApiResponse(
      this.http
        .get<BackendRecipient>(`${this.baseUrl}/accounts/${accountNumber}`)
        .pipe(map((r): Recipient => ({ id: r.accountNumber, ...r }))),
    );
  }

  // the backend has no saved recipient list, so build one from the
  // people this user sent money to most recently (newest first, max 5)
  getRecipients(transactions: Transaction[]): Observable<ApiResponse<Recipient[]>> {
    const accountNumbers = [
      ...new Set(
        transactions
          .filter((t) => t.type === 'TRANSFER_OUT' && t.relatedAccountNumber)
          .map((t) => t.relatedAccountNumber!),
      ),
    ].slice(0, 5);

    if (accountNumbers.length === 0) {
      return of({ success: true, data: [] });
    }

    return forkJoin(accountNumbers.map((n) => this.lookupRecipient(n))).pipe(
      map((results) => ({
        success: true,
        data: results.filter((r) => r.success && r.data).map((r) => r.data!),
      })),
    );
  }

  // ---------- TRANSACTION HISTORY ----------

  getTransactions(accountId: string): Observable<ApiResponse<Transaction[]>> {
    return toApiResponse(
      forkJoin({
        account: this.http.get<BackendAccount>(
          `${this.baseUrl}/accounts/me`,
        ),
        transactions: this.http.get<BackendTransaction[]>(
          `${this.baseUrl}/transactions`,
        ),
      }).pipe(
        map(({ account, transactions }) => {
          const ownAccount = this.mapAccount(account);

          if (ownAccount.id !== accountId) {
            throw {
              error: {
                code: 'ACCOUNT_NOT_FOUND',
                message: 'Account not found.',
              },
            };
          }

          return transactions
            .map((transaction) =>
              this.mapTransaction(transaction, ownAccount.accountNumber),
            )
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
        }),
      ),
    );
  }

  // ---------- DEPOSIT ----------

  deposit(req: DepositRequest): Observable<ApiResponse<Transaction>> {
    return this.submitTransaction(req.accountId, (account) =>
      this.http.post<BackendTransactionResponse>(
        `${this.baseUrl}/transactions/deposit`,
        {
          accountNumber: account.accountNumber,
          amountCents: this.toCents(req.amount),
        },
      ),
    );
  }

  // ---------- WITHDRAWAL ----------

  withdraw(req: WithdrawRequest): Observable<ApiResponse<Transaction>> {
    return this.submitTransaction(req.accountId, (account) =>
      this.http.post<BackendTransactionResponse>(
        `${this.baseUrl}/transactions/withdraw`,
        {
          accountNumber: account.accountNumber,
          amountCents: this.toCents(req.amount),
        },
      ),
    );
  }

  // ---------- TRANSFER ----------

  transfer(req: TransferRequest): Observable<ApiResponse<Transaction>> {
    return this.submitTransaction(req.fromAccountId, (account) =>
      this.http.post<BackendTransactionResponse>(
        `${this.baseUrl}/transactions/transfer`,
        {
          fromAccountNumber: account.accountNumber,
          toAccountNumber: req.toAccountNumber,
          amountCents: this.toCents(req.amount),
          note: req.description || null,
        },
      ),
    );
  }

  // ---------- SHARED TRANSACTION SUBMISSION ----------

  private submitTransaction(
    accountId: string,
    request: (account: Account) => Observable<BackendTransactionResponse>,
  ): Observable<ApiResponse<Transaction>> {
    return toApiResponse(
      this.http.get<BackendAccount>(`${this.baseUrl}/accounts/me`).pipe(
        map((backend) => this.mapAccount(backend)),
        switchMap((account) => {
          if (account.id !== accountId) {
            throw {
              error: {
                code: 'ACCOUNT_NOT_FOUND',
                message: 'Account not found.',
              },
            };
          }

          // switchMap executes the actual POST request.
          return request(account).pipe(
            map((response) =>
              this.mapTransaction(
                response.transaction,
                account.accountNumber,
                response.newBalanceCents / 100,
              ),
            ),
          );
        }),
      ),
    );
  }

  // ---------- BACKEND-TO-FRONTEND MAPPING ----------

  private mapAccount(backend: BackendAccount): Account {
    return {
      id: backend.accountNumber,
      userId: backend.username,
      accountNumber: backend.accountNumber,
      balance: backend.balanceCents / 100,
      currency: 'USD',
      type: 'CHECKING',
    };
  }

  private mapTransaction(
    backend: BackendTransaction,
    ownAccountNumber: string,
    balanceAfter = 0,
  ): Transaction {
    const backendType = backend.type.toLowerCase();

    let type: Transaction['type'];

    if (backendType === 'deposit') {
      type = 'DEPOSIT';
    } else if (
      backendType === 'withdrawal' ||
      backendType === 'withdraw'
    ) {
      type = 'WITHDRAW';
    } else if (backend.fromAccountNumber === ownAccountNumber) {
      type = 'TRANSFER_OUT';
    } else {
      type = 'TRANSFER_IN';
    }

    const relatedAccountNumber =
      type === 'TRANSFER_OUT'
        ? backend.toAccountNumber
        : type === 'TRANSFER_IN'
          ? backend.fromAccountNumber
          : undefined;

    return {
      id: backend.id,
      accountId: ownAccountNumber,
      type,
      amount: backend.amountCents / 100,
      balanceAfter,
      createdAt: backend.timestamp,
      ...(backend.note ? { description: backend.note } : {}),
      ...(relatedAccountNumber ? { relatedAccountNumber } : {}),
    };
  }

  private toCents(amount: number): number {
    return Math.round(amount * 100);
  }
}