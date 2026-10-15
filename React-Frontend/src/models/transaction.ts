export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';

export interface Transaction {
  id: string;                       // e.g. "TXN-0001"
  type: TransactionType;
  amountCents: number;              // integer, always positive
  fromAccountNumber: string | null; // null for deposits
  toAccountNumber: string | null;   // null for withdrawals
  reference?:string;                // transfer only
  timestamp: string;                // ISO 8601
}

export interface DepositRequest {
  accountNumber: string;
  amountCents: number;
}

export interface WithdrawRequest {
  accountNumber: string;
  amountCents: number;
}

export interface TransferRequest {
  fromAccountNumber: string;
  toAccountNumber: string;
  amountCents: number;
  reference:string;
}

export interface RecipientLookup {
  accountNumber: string;
  firstName: string;
  lastName: string;
}

export interface TransactionResponse {
  transaction: Transaction;
  newBalanceCents: number;
}