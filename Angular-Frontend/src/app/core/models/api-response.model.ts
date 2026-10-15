export type ApiErrorCode =
| 'VALIDATION_ERROR'
| 'INVALID_CREDENTIALS'
| 'EMAIL_ALREADY_TAKEN'
| 'ACCOUNT_NOT_FOUND'
| 'INSUFFICIENT_FUNDS'
| 'UNAUTHORIZED';

export interface ApiError {
    code: ApiErrorCode;
    message: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}