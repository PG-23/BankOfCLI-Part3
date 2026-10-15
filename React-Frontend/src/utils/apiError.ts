import type { ApiError } from '../models';

export function getApiError(err: unknown): ApiError | null {
  if (typeof err === 'object' && err !== null && 'code' in err && 'message' in err) {
    return err as ApiError;
  }
  return null;
}