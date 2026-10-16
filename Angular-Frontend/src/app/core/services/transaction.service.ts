import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, delay, forkJoin, map, shareReplay } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import {
    Account,
    ApiErrorCode,
    ApiResponse,
    DepositRequest,
    Recipient,
    Transaction,
    TransferRequest,
    WithdrawRequest,
} from '../models';

const FAKE_DELAY_MS = 600;
const DB_KEY = 'bank-of-airlines-mock-db-v1'; // NEW: localStorage key (from the API contract)

@Injectable({ providedIn: 'root' })
export class TransactionService {
    private http = inject(HttpClient);
    private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private accounts: Account[] = [];
    private transactions: Transaction[] = [];
    private recipients: Recipient[] = [];
    private data$?: Observable<void>;

    // ---------- what components call (public api) ----------
    getAccount(accountId: string): Observable<ApiResponse<Account>> {
        return this.load().pipe(
            map(() => {
                const account = this.accounts.find((a) => a.id === accountId);
                return account ? this.ok({ ...account }) : this.fail<Account>('ACCOUNT_NOT_FOUND', 'Account not found.');
            }),
        );
    }

    getAccountByUserId(userId: string): Observable<ApiResponse<Account>> {
    return this.load().pipe(
        map(() => {
            const mine = this.accounts.filter((a) => a.userId.toLowerCase() === userId.toLowerCase());
            const account = mine.find((a) => a.type !== 'SAVINGS') ?? mine[0];
            return account ? this.ok({ ...account }) : this.fail<Account>('ACCOUNT_NOT_FOUND', 'Account not found.');
        }),
    );
}

// NEW: every account a user owns (the dashboard shows checking and savings)
getAccountsByUserId(userId: string): Observable<ApiResponse<Account[]>> {
    return this.load().pipe(
        map(() =>
            this.ok(
                this.accounts
                    .filter((a) => a.userId.toLowerCase() === userId.toLowerCase())
                    .map((a) => ({ ...a })),
            ),
        ),
        delay(FAKE_DELAY_MS),
    );
}

    getTransactions(accountId: string): Observable<ApiResponse<Transaction[]>> {
        return this.load().pipe(
            map(() => {
                if (!this.accounts.some((a) => a.id === accountId)) {
                    return this.fail<Transaction[]>('ACCOUNT_NOT_FOUND', 'Account not found.'); // NEW: matches the contract
                }
                const list = this.transactions
                    .filter((t) => t.accountId === accountId)
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
                return this.ok(list);
            }),
            delay(FAKE_DELAY_MS), // NEW: lets the table's skeleton loader show
        );
    }

    getRecipients(accountId: string): Observable<ApiResponse<Recipient[]>> {
        return this.load().pipe(
            map(() => {
                const own = this.accounts.find((a) => a.id === accountId);
                return this.ok(this.recipients.filter((r) => r.accountNumber !== own?.accountNumber));
            }),
        );
    }

    deposit(req: DepositRequest): Observable<ApiResponse<Transaction>> {
        return this.load().pipe(map(() => this.applyDeposit(req)), delay(FAKE_DELAY_MS));
    }

    withdraw(req: WithdrawRequest): Observable<ApiResponse<Transaction>> {
        return this.load().pipe(map(() => this.applyWithdraw(req)), delay(FAKE_DELAY_MS));
    }

    transfer(req: TransferRequest): Observable<ApiResponse<Transaction>> {
        return this.load().pipe(map(() => this.applyTransfer(req)), delay(FAKE_DELAY_MS));
    }

    // NEW: Gbolahan calls this after a successful register so the new user has an account (balance 0)
    createAccount(userId: string): Observable<ApiResponse<Account>> {
        return this.load().pipe(
            map(() => {
                const existing = this.accounts.find((a) => a.userId === userId);
                if (existing) return this.ok({ ...existing });

                const highest = this.accounts.reduce((m, a) => Math.max(m, Number(a.accountNumber)), 1000000000);
                const account: Account = {
                    id: `a${this.accounts.length + 1}`,
                    userId,
                    accountNumber: String(highest + 1),
                    balance: 0,
                    currency: 'USD',
                    type: 'CHECKING',
                };
                this.accounts.push(account);
                this.save();
                return this.ok({ ...account });
            }),
        );
    }

    // ---------- business rules ----------
    private applyDeposit(req: DepositRequest): ApiResponse<Transaction> {
        const bad = this.checkAmount<Transaction>(req.amount);
        if (bad) return bad;
        const account = this.accounts.find((a) => a.id === req.accountId);
        if (!account) return this.fail('ACCOUNT_NOT_FOUND', 'Account not found.');

        account.balance = this.round2(account.balance + req.amount);
        const tx = this.record(account, 'DEPOSIT', req.amount, req.description);
        this.save(); // NEW
        return this.ok(tx);
    }

    private applyWithdraw(req: WithdrawRequest): ApiResponse<Transaction> {
        const bad = this.checkAmount<Transaction>(req.amount);
        if (bad) return bad;
        const account = this.accounts.find((a) => a.id === req.accountId);
        if (!account) return this.fail('ACCOUNT_NOT_FOUND', 'Account not found.');
        if (req.amount > account.balance) return this.fail('INSUFFICIENT_FUNDS', 'Insufficient funds.');

        account.balance = this.round2(account.balance - req.amount);
        const tx = this.record(account, 'WITHDRAW', req.amount, req.description);
        this.save(); // NEW
        return this.ok(tx);
    }

    private applyTransfer(req: TransferRequest): ApiResponse<Transaction> {
        const bad = this.checkAmount<Transaction>(req.amount);
        if (bad) return bad;
        // NEW: account number must be exactly 10 digits
        if (!/^\d{10}$/.test(req.toAccountNumber)) {
            return this.fail('VALIDATION_ERROR', 'Account number must be exactly 10 digits.');
        }
        const from = this.accounts.find((a) => a.id === req.fromAccountId);
        const to = this.accounts.find((a) => a.accountNumber === req.toAccountNumber);
        if (!from) return this.fail('ACCOUNT_NOT_FOUND', 'Your account was not found.');
        if (!to) return this.fail('ACCOUNT_NOT_FOUND', 'Recipient account was not found.');
        if (from.id === to.id) return this.fail('VALIDATION_ERROR', 'You cannot transfer to your own account.');
        if (req.amount > from.balance) return this.fail('INSUFFICIENT_FUNDS', 'Insufficient funds.');

        // CHANGED: one shared timestamp so the OUT/IN pair matches (contract rule)
        const now = new Date().toISOString();
        from.balance = this.round2(from.balance - req.amount);
        to.balance = this.round2(to.balance + req.amount);
        const out = this.record(from, 'TRANSFER_OUT', req.amount, req.description, to.accountNumber, now);
        this.record(to, 'TRANSFER_IN', req.amount, req.description, from.accountNumber, now);
        this.save(); // NEW: one save after both records, so it stays atomic
        return this.ok(out);
    }

    // ---------- helpers ----------
    private record(
        account: Account,
        type: Transaction['type'],
        amount: number,
        description?: string,
        relatedAccountNumber?: string,
        createdAt: string = new Date().toISOString(), // CHANGED: optional timestamp
    ): Transaction {
        const tx: Transaction = {
            id: `t${this.transactions.length + 1}`,
            accountId: account.id,
            type,
            amount: this.round2(amount),
            balanceAfter: account.balance,
            createdAt,
            ...(description ? { description } : {}),
            ...(relatedAccountNumber ? { relatedAccountNumber } : {}),
        };
        this.transactions.push(tx);
        return tx;
    }

    private checkAmount<T>(amount: number): ApiResponse<T> | null {
        const twoDecimals = Math.round(amount * 100) / 100 === amount; // NEW
        if (!Number.isFinite(amount) || amount <= 0 || !twoDecimals) {
            return this.fail<T>('VALIDATION_ERROR', 'Amount must be greater than 0 with at most 2 decimals.');
        }
        return null;
    }

    private load(): Observable<void> {
        if (!this.data$) {
            this.data$ = forkJoin({
                accounts: this.http.get<Account[]>('/mock/accounts.json'),
                transactions: this.http.get<Transaction[]>('/mock/transactions.json'),
                recipients: this.http.get<Recipient[]>('/mock/recipients.json'),
            }).pipe(
                map(({ accounts, transactions, recipients }) => {
                    // CHANGED: a saved copy in localStorage wins over the JSON files
                    const saved = this.isBrowser ? localStorage.getItem(DB_KEY) : null;
                    if (saved) {
                        const db = JSON.parse(saved) as { accounts: Account[]; transactions: Transaction[] };
                        this.accounts = db.accounts;
                        this.transactions = db.transactions;
                    } else {
                        this.accounts = accounts;
                        this.transactions = transactions;
                    }
                    this.recipients = recipients;
                }),
                shareReplay(1),
            );
        }
        return this.data$;
    }

    // NEW: writes the whole dataset to the browser
    private save(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(DB_KEY, JSON.stringify({ accounts: this.accounts, transactions: this.transactions }));
    }

    private round2(n: number): number {
        return Math.round(n * 100) / 100;
    }

    private ok<T>(data: T): ApiResponse<T> {
        return { success: true, data };
    }

    private fail<T>(code: ApiErrorCode, message: string): ApiResponse<T> {
        return { success: false, error: { code, message } };
    }
}
