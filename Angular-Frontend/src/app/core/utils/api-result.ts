import { HttpErrorResponse } from "@angular/common/http";
import { Observable, catchError, map, of } from "rxjs";
import { ApiError, ApiResponse } from "../models";

// wraps an HTTP call so components keep getting { success, data, error }
// instead of having to handle thrown HttpErrorResponse themselves
export function toApiResponse<T>(request: Observable<T>): Observable<ApiResponse<T>> {
    return request.pipe(
        map((data): ApiResponse<T> => ({success: true, data })),
        catchError((err: unknown) => of(toFailure<T>(err))),
    );
}

function toFailure<T>(err: unknown): ApiResponse<T> {
    if(err instanceof HttpErrorResponse) {
        if(err.status === 0) {
            return {
                success: false,
                error: { code: 'NETWORK_ERROR', message: "cant reach the server. please try again" },
            };
        }

        // the backend will always send { code, message, field? } (API contract §4 )
        if (err.error?.code) {
        return { success: false, error: err.error as ApiError };
        }
    }
    return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Something went wrong. Please try again.' },
    };
}