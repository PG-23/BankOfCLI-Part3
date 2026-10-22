
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';

import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { TransactionService } from '../../../core/services/transaction.service';

import {
  Account,
  Transaction,
  User,
} from '../../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser: User | null = null;

  account: Account | null = null;
  checkingAccount: Account | null = null;
  savingsAccount: Account | null = null;

  recentTransactions: Transaction[] = [];
  checkingTransactions: Transaction[] = [];
  savingsTransactions: Transaction[] = [];

  isLoading = true;
  today = new Date();

  // Interactive dashboard state
  accountDetailsOpen = false;
  showAllTransactions = false;
  profileMenuOpen = false;
  sortMenuOpen = false;
  activityPeriodMenuOpen = false;

  transactionSort:
    | 'Recent'
    | 'Oldest'
    | 'Highest Amount'
    | 'Lowest Amount' = 'Recent';

  activityPeriod:
    | 'Last 3 Months'
    | 'Last 5 Months'
    | 'All Activity' = 'Last 5 Months';

  // Activity chart data
  // These values are still mock data; the backend does not currently
  // provide monthly activity summaries.
  activity = [
    { month: 'MAY', deposits: 55, withdrawals: 25, transfers: 35 },
    { month: 'JUN', deposits: 70, withdrawals: 40, transfers: 25 },
    { month: 'JUL', deposits: 45, withdrawals: 60, transfers: 35 },
    { month: 'AUG', deposits: 80, withdrawals: 45, transfers: 55 },
    { month: 'SEP', deposits: 60, withdrawals: 35, transfers: 45 },
  ];

  activityMaximum = 100;

  ngOnInit(): void {
    this.loadDashboard();
  }

  // Load the authenticated user's existing backend account.
  private loadDashboard(): void {
    this.isLoading = true;
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.transactionService
      .getAccountsByUserId(this.currentUser.id)
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data?.length) {
            this.clearAccountData();
            this.isLoading = false;
            this.cdr.detectChanges();
            return;
          }

          const accounts = response.data;

          // The current backend provides one account per user.
          this.checkingAccount =
            accounts.find((account) => account.type !== 'SAVINGS') ?? null;

          this.savingsAccount = null;
          this.account = this.checkingAccount;
          this.savingsTransactions = [];

          if (!this.checkingAccount) {
            this.checkingTransactions = [];
            this.recentTransactions = [];
            this.isLoading = false;
            this.cdr.detectChanges();
            return;
          }

          this.transactionService
            .getTransactions(this.checkingAccount.id)
            .subscribe({
              next: (transactionResponse) => {
                const transactions = transactionResponse.data ?? [];

                this.checkingTransactions = transactions;
                this.recentTransactions = transactions.slice(0, 5);
                this.isLoading = false;
                this.cdr.detectChanges();
              },
              error: (error) => {
                console.error('Failed to load transactions:', error);
                this.checkingTransactions = [];
                this.recentTransactions = [];
                this.isLoading = false;
                this.cdr.detectChanges();
              },
            });
        },
        error: (error) => {
          console.error('Failed to load dashboard account:', error);
          this.clearAccountData();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private clearAccountData(): void {
    this.account = null;
    this.checkingAccount = null;
    this.savingsAccount = null;
    this.checkingTransactions = [];
    this.savingsTransactions = [];
    this.recentTransactions = [];
  }

  // Account details
  toggleAccountDetails(): void {
    this.accountDetailsOpen = !this.accountDetailsOpen;
  }

  // Transactions
  toggleTransactions(): void {
    this.showAllTransactions = !this.showAllTransactions;
  }

  // Profile menu
  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  // Sort menu
  toggleSortMenu(): void {
    this.sortMenuOpen = !this.sortMenuOpen;
    this.activityPeriodMenuOpen = false;
  }

  setTransactionSort(
    sort: 'Recent' | 'Oldest' | 'Highest Amount' | 'Lowest Amount',
  ): void {
    this.transactionSort = sort;
    this.sortMenuOpen = false;
  }

  // Activity period menu
  toggleActivityPeriodMenu(): void {
    this.activityPeriodMenuOpen = !this.activityPeriodMenuOpen;
    this.sortMenuOpen = false;
  }

  setActivityPeriod(
    period: 'Last 3 Months' | 'Last 5 Months' | 'All Activity',
  ): void {
    this.activityPeriod = period;
    this.activityPeriodMenuOpen = false;
  }

  // Displayed transactions
  getDisplayedTransactions(transactions: Transaction[]): Transaction[] {
    const sortedTransactions = [...transactions];

    if (this.transactionSort === 'Recent') {
      sortedTransactions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
    }

    if (this.transactionSort === 'Oldest') {
      sortedTransactions.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime(),
      );
    }

    if (this.transactionSort === 'Highest Amount') {
      sortedTransactions.sort((a, b) => b.amount - a.amount);
    }

    if (this.transactionSort === 'Lowest Amount') {
      sortedTransactions.sort((a, b) => a.amount - b.amount);
    }

    return this.showAllTransactions
      ? sortedTransactions
      : sortedTransactions.slice(0, 3);
  }

  // Displayed activity
  getDisplayedActivity() {
    if (this.activityPeriod === 'Last 3 Months') {
      return this.activity.slice(-3);
    }

    if (this.activityPeriod === 'All Activity') {
      return this.activity;
    }

    return this.activity.slice(-5);
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Transaction display helpers
  getTransactionIcon(transaction: Transaction): string {
    if (transaction.type === 'DEPOSIT') {
      return '+';
    }

    if (transaction.type === 'WITHDRAW') {
      return '−';
    }

    return '↗';
  }

  getTransactionClass(transaction: Transaction): string {
    if (transaction.type === 'DEPOSIT') {
      return 'deposit';
    }

    if (transaction.type === 'WITHDRAW') {
      return 'withdraw';
    }

    return 'transfer';
  }

  getTransactionAmount(transaction: Transaction): string {
    if (
      transaction.type === 'DEPOSIT' ||
      transaction.type === 'TRANSFER_IN'
    ) {
      return `+$${transaction.amount.toFixed(2)}`;
    }

    if (
      transaction.type === 'WITHDRAW' ||
      transaction.type === 'TRANSFER_OUT'
    ) {
      return `-$${transaction.amount.toFixed(2)}`;
    }

    return `$${transaction.amount.toFixed(2)}`;
  }

  // Chart helpers
  getBarHeight(value: number, maximum: number): number {
    if (maximum <= 0) {
      return 0;
    }

    return Math.max(8, Math.min(100, (value / maximum) * 100));
  }
}
