import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CurrencyPipe,
  DatePipe
} from '@angular/common';

import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { TransactionService } from '../../../core/services/transaction.service';

import {
  Account,
  Transaction,
  User
} from '../../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink
  ],
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


  // =========================================
  // INTERACTIVE DASHBOARD STATE
  // =========================================

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


  // =========================================
  // MOCK ACTIVITY DATA
  // =========================================

  activity = [
    {
      month: 'MAY',
      deposits: 55,
      withdrawals: 25,
      transfers: 35
    },
    {
      month: 'JUN',
      deposits: 70,
      withdrawals: 40,
      transfers: 25
    },
    {
      month: 'JUL',
      deposits: 45,
      withdrawals: 60,
      transfers: 35
    },
    {
      month: 'AUG',
      deposits: 80,
      withdrawals: 45,
      transfers: 55
    },
    {
      month: 'SEP',
      deposits: 60,
      withdrawals: 35,
      transfers: 45
    }
  ];

  activityMaximum = 100;


  // =========================================
  // LOAD DASHBOARD
  // =========================================

  ngOnInit(): void {
    this.loadDashboard();
  }


  private loadDashboard(): void {

    this.currentUser =
      this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.isLoading = false;
      return;
    }

    const user = this.currentUser;

    this.transactionService.getAccountsByUserId(user.id).subscribe((response) => {

      const accounts = response.data ?? [];

      // brand-new user with no account yet: open a $0 checking account, then reload
      if (accounts.length === 0) {
        this.transactionService
          .createAccount(user.id)
          .subscribe(() => this.loadDashboard());
        return;
      }

      this.checkingAccount =
        accounts.find((a) => a.type !== 'SAVINGS') ?? null;

      this.savingsAccount =
        accounts.find((a) => a.type === 'SAVINGS') ?? null;

      this.account = this.checkingAccount;

      this.loadTransactionsFor(this.checkingAccount, (list) => {
        this.checkingTransactions = list;
        this.recentTransactions = list.slice(0, 5);
      });

      this.loadTransactionsFor(this.savingsAccount, (list) => {
        this.savingsTransactions = list;
      });

      this.isLoading = false;
      this.cdr.detectChanges();

    });

  }


  private loadTransactionsFor(
    account: Account | null,
    assign: (list: Transaction[]) => void
  ): void {

    if (!account) {
      return;
    }

    this.transactionService.getTransactions(account.id).subscribe((response) => {

      assign(response.data ?? []);

      this.cdr.detectChanges();

    });

  }


  // =========================================
  // ACCOUNT DETAILS
  // =========================================

  toggleAccountDetails(): void {

    this.accountDetailsOpen =
      !this.accountDetailsOpen;

  }


  // =========================================
  // TRANSACTIONS
  // =========================================

  toggleTransactions(): void {

    this.showAllTransactions =
      !this.showAllTransactions;

  }


  // =========================================
  // PROFILE MENU
  // =========================================

  toggleProfileMenu(): void {

    this.profileMenuOpen =
      !this.profileMenuOpen;

  }


  // =========================================
  // SORT MENU
  // =========================================

  toggleSortMenu(): void {

    this.sortMenuOpen =
      !this.sortMenuOpen;

    this.activityPeriodMenuOpen = false;

  }


  setTransactionSort(
    sort:
      | 'Recent'
      | 'Oldest'
      | 'Highest Amount'
      | 'Lowest Amount'
  ): void {

    this.transactionSort = sort;

    this.sortMenuOpen = false;

  }


  // =========================================
  // ACTIVITY PERIOD MENU
  // =========================================

  toggleActivityPeriodMenu(): void {

    this.activityPeriodMenuOpen =
      !this.activityPeriodMenuOpen;

    this.sortMenuOpen = false;

  }


  setActivityPeriod(
    period:
      | 'Last 3 Months'
      | 'Last 5 Months'
      | 'All Activity'
  ): void {

    this.activityPeriod = period;

    this.activityPeriodMenuOpen = false;

  }


  // =========================================
  // DISPLAYED TRANSACTIONS
  // =========================================

  getDisplayedTransactions(
    transactions: Transaction[]
  ): Transaction[] {

    const sortedTransactions =
      [...transactions];


    if (this.transactionSort === 'Recent') {

      sortedTransactions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

    }


    if (this.transactionSort === 'Oldest') {

      sortedTransactions.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

    }


    if (this.transactionSort === 'Highest Amount') {

      sortedTransactions.sort(
        (a, b) =>
          b.amount - a.amount
      );

    }


    if (this.transactionSort === 'Lowest Amount') {

      sortedTransactions.sort(
        (a, b) =>
          a.amount - b.amount
      );

    }


    if (this.showAllTransactions) {

      return sortedTransactions;

    }


    return sortedTransactions.slice(0, 3);

  }


  // =========================================
  // DISPLAYED ACTIVITY
  // =========================================

  getDisplayedActivity() {

    if (this.activityPeriod === 'Last 3 Months') {

      return this.activity.slice(-3);

    }


    if (this.activityPeriod === 'All Activity') {

      return this.activity;

    }


    return this.activity.slice(-5);

  }


  // =========================================
  // LOGOUT
  // =========================================

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);

  }


  // =========================================
  // TRANSACTION DISPLAY HELPERS
  // =========================================

  getTransactionIcon(
    transaction: Transaction
  ): string {

    if (transaction.type === 'DEPOSIT') {
      return '+';
    }

    if (transaction.type === 'WITHDRAW') {
      return '−';
    }

    return '↗';

  }


  getTransactionClass(
    transaction: Transaction
  ): string {

    if (transaction.type === 'DEPOSIT') {
      return 'deposit';
    }

    if (transaction.type === 'WITHDRAW') {
      return 'withdraw';
    }

    return 'transfer';

  }


  getTransactionAmount(
    transaction: Transaction
  ): string {

    if (transaction.type === 'DEPOSIT' || transaction.type === 'TRANSFER_IN') {
      return `+$${transaction.amount.toFixed(2)}`;
    }

    if (transaction.type === 'WITHDRAW' || transaction.type === 'TRANSFER_OUT') {
      return `-$${transaction.amount.toFixed(2)}`;
    }

    return `$${transaction.amount.toFixed(2)}`;
  }


  // =========================================
  // CHART HELPERS
  // =========================================

  getBarHeight(
    value: number,
    maximum: number
  ): number {

    if (maximum <= 0) {
      return 0;
    }

    return Math.max(
      8,
      Math.min(
        100,
        (value / maximum) * 100
      )
    );

  }

}