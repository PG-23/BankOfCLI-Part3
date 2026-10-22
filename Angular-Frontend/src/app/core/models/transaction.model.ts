
export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAW'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  relatedAccountNumber?: string;
  description?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface DepositRequest {
  accountId: string;
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  accountId: string;
  amount: number;
  description?: string;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
}

/** Backend API response shapes */
export interface BackendTransaction {
  id: string;
  type: string;
  amountCents: number;
  fromAccountNumber?: string | null;
  toAccountNumber?: string | null;
  timestamp: string;
  note?: string | null;
}

export interface BackendTransactionResponse {
  transaction: BackendTransaction;
  newBalanceCents: number;
}

export interface BackendAccount {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  accountNumber: string;
  balanceCents: number;
}

export interface BackendRecipient {
  firstName: string;
  lastName: string;
  accountNumber: string;
}
