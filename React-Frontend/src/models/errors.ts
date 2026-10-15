export type ErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_TAKEN'
  | 'ACCOUNT_NOT_FOUND'
  | 'INSUFFICIENT_FUNDS'
  | 'INVALID_AMOUNT'        // zero, negative, or not a whole number of cents
  | 'SAME_ACCOUNT_TRANSFER'
  | 'WEAK_PASSWORD'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED';

export interface ApiError {
  code: ErrorCode;
  message: string;
  field?: string; // e.g. "email" for EMAIL_TAKEN
}