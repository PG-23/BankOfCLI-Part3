export type AccountType = 'CHECKING' | 'SAVINGS';

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number;
  currency: 'USD';
  type: AccountType;
}
