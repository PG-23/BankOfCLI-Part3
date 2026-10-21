export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_TAKEN'
  | 'EMAIL_TAKEN'
  | 'WEAK_PASSWORD'
  | 'ACCOUNT_NOT_FOUND'
  | 'INSUFFICIENT_FUNDS'
  | 'UNAUTHORIZED'
  | 'NETWORK_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  field?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
