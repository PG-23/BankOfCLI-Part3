import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Account, ApiResponse, Recipient, Transaction } from '../../../core/models';
import { TransactionService } from '../../../core/services/transaction.service';
import { CurrentUserService } from '../../../core/services/current.user.services';

type Mode = 'deposit' | 'withdraw' | 'transfer';

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  selector: 'app-transactions',
  styleUrl: './transactions.css',
  templateUrl: './transactions.html',
})
export class Transactions implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(TransactionService);
  private currentUser = inject(CurrentUserService);

  // set once the logged-in user's account is found
  accountId = '';

  mode = signal<Mode>('deposit');
  loading = signal(false);
  tableLoading = signal(true);
  account = signal<Account | null>(null);
  transactions = signal<Transaction[]>([]);
  recipients = signal<Recipient[]>([]);
  selectedAccountNumber = signal<string | null>(null);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // the welcome card reads this
  userName = computed(() => this.currentUser.fullName());

  private amountRules = [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)];

  depositForm = this.fb.group({ amount: ['', this.amountRules], description: [''] });
  withdrawForm = this.fb.group({ amount: ['', this.amountRules], description: [''] });
  transferForm = this.fb.group({
    toAccountNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    amount: ['', this.amountRules],
    description: [''],
  });

  totals = computed(() => {
    let income = 0;
    let expenses = 0;
    for (const t of this.transactions()) {
      if (this.isCredit(t)) income += t.amount;
      else expenses += t.amount;
    }
    return { income, expenses };
  });

  // ---------- pagination ----------
  readonly pageSize = 10;
  page = signal(1);
  totalPages = computed(() => Math.max(1, Math.ceil(this.transactions().length / this.pageSize)));
  currentPage = computed(() => Math.min(this.page(), this.totalPages()));
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  pagedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.transactions().slice(start, start + this.pageSize);
  });

  goTo(p: number) {
    this.page.set(Math.min(Math.max(1, p), this.totalPages()));
  }

  // ---------- table helpers ----------
  typeLabel(t: Transaction): string {
    if (t.type === 'DEPOSIT') return 'deposit';
    if (t.type === 'WITHDRAW') return 'withdraw';
    return 'transfer';
  }

  rowTitle(t: Transaction): string {
    if (t.description) return t.description;
    if (t.type === 'TRANSFER_OUT') return `To ${t.relatedAccountNumber}`;
    if (t.type === 'TRANSFER_IN') return `From ${t.relatedAccountNumber}`;
    return t.type === 'DEPOSIT' ? 'Deposit' : 'Withdraw';
  }

  isCredit(t: Transaction): boolean {
    return t.type === 'DEPOSIT' || t.type === 'TRANSFER_IN';
  }

  initials(r: Recipient): string {
    return (r.firstName[0] + r.lastName[0]).toUpperCase();
  }

  // ---------- lifecycle ----------
  ngOnInit() {
    const user = this.currentUser.user();
    if (!user) {
      // not logged in: the auth guard normally redirects before we get here
      this.tableLoading.set(false);
      return;
    }

    this.service.getAccountByUserId(user.id).subscribe((res) => {
      if (res.success && res.data) {
        this.accountId = res.data.id;
        this.refresh();
      } else {
        this.tableLoading.set(false);
        this.feedback.set({ type: 'error', text: res.error?.message ?? 'Account not found.' });
      }
    });
  }

  // ---------- form actions ----------
  setMode(mode: Mode) {
    this.mode.set(mode);
    this.feedback.set(null);
  }

  pickRecipient(r: Recipient) {
    this.setMode('transfer');
    this.transferForm.patchValue({ toAccountNumber: r.accountNumber });
    this.selectedAccountNumber.set(r.accountNumber);
  }

  onDeposit() {
    if (this.depositForm.invalid) return this.depositForm.markAllAsTouched();
    const { amount, description } = this.depositForm.getRawValue();
    this.run(
      this.service.deposit({ accountId: this.accountId, amount: Number(amount), description: description || undefined }),
      this.depositForm,
    );
  }

  onWithdraw() {
    if (this.withdrawForm.invalid) return this.withdrawForm.markAllAsTouched();
    const { amount, description } = this.withdrawForm.getRawValue();
    this.run(
      this.service.withdraw({ accountId: this.accountId, amount: Number(amount), description: description || undefined }),
      this.withdrawForm,
    );
  }

  onTransfer() {
    if (this.transferForm.invalid) return this.transferForm.markAllAsTouched();
    const { toAccountNumber, amount, description } = this.transferForm.getRawValue();
    this.run(
      this.service.transfer({
        fromAccountId: this.accountId,
        toAccountNumber: toAccountNumber!,
        amount: Number(amount),
        description: description || undefined,
      }),
      this.transferForm,
    );
  }

  private run(request$: Observable<ApiResponse<Transaction>>, form: FormGroup) {
    this.loading.set(true);
    this.feedback.set(null);
    request$.subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.feedback.set({ type: 'success', text: 'Transaction completed' });
          form.reset({ amount: '', description: '', toAccountNumber: '' });
          this.selectedAccountNumber.set(null);
          this.page.set(1);
          this.refresh();
        } else {
          this.feedback.set({ type: 'error', text: res.error?.message ?? 'Something went wrong.' });
        }
      },
      error: () => {
        this.loading.set(false);
        this.feedback.set({ type: 'error', text: 'Service unavailable. Please try again.' });
      },
    });
  }

  private refresh() {
    this.service.getAccount(this.accountId).subscribe((res) => this.account.set(res.data ?? null));
    this.service.getRecipients(this.accountId).subscribe((res) => this.recipients.set(res.data ?? []));
    this.service.getTransactions(this.accountId).subscribe((res) => {
      this.transactions.set(res.data ?? []);
      this.tableLoading.set(false);
    });
  }
}