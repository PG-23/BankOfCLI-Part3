// CONTRACT LAYER

export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER_IN' | 'TRANSFER_OUT';

export interface Transaction {
    id: string;
    accountId: string;
    type: TransactionType;
    amount: number;
    relatedAccountNumber?: string; // now THIS is only for transfer in/out
    description?: string; // now optional cuz of relatedAccountNumber
    balanceAfter: number;
    createdAt: string; //(international standard format) YYYY-MM-DDTHH:mm:ssZ ex: 2026-09-29T14:30:00Z
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