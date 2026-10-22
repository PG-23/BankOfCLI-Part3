const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
const SESSION_KEY = "bankofcli-auth"; // contract §6

/** Thrown for every failed request; mirrors the backend's ApiError (contract §4). */
export class ApiRequestError extends Error {
    readonly status: number;
    readonly code: string;
    readonly field?: string;

    constructor(status: number, code: string, message: string, field?: string) {
        super(message);
        this.name = "ApiRequestError";
        this.status = status;
        this.code = code;
        this.field = field;
    }
}

// AuthProvider registers this so a 401 can log the user out without
// apiClient importing React or the router.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
    onUnauthorized = handler;
}

function getToken(): string | null {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw).token ?? null) : null;
    } catch {
        return null;
    }
}

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    query?: Record<string, string | number | undefined>;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, query } = options;
    const isAuthRoute = path.startsWith("/auth/");

    const url = new URL(BASE_URL + path, window.location.origin); // origin only used when BASE_URL is relative
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const token = getToken();
    if (token && !isAuthRoute) headers["Authorization"] = `Bearer ${token}`;

    let response: Response;
    try {
        response = await fetch(url, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiRequestError(0, "NETWORK_ERROR", "Can't reach the server. Check your connection and try again.");
    }

    if (response.ok) {
        return (response.status === 204 ? undefined : await response.json()) as T;
    }

    // Error path: prefer the contract's ApiError body; fall back for anything else (e.g. Spring's default 404).
    let code = `HTTP_${response.status}`;
    let message = "Something went wrong. Please try again.";
    let field: string | undefined;
    try {
        const err = await response.json();
        if (err?.code) {
            code = err.code;
            message = err.message ?? message;
            field = err.field;
        }
    } catch {
        /* non-JSON body */
    }

    // Only an expired/invalid session logs the user out. A wrong password on
    // /auth/login is also a 401 (INVALID_CREDENTIALS) and must NOT trigger this.
    if (response.status === 401 && !isAuthRoute) {
        sessionStorage.removeItem(SESSION_KEY);
        onUnauthorized?.();
    }

    throw new ApiRequestError(response.status, code, message, field);
}

export const api = {
    get: <T>(path: string, query?: RequestOptions["query"]) => apiRequest<T>(path, { query }),
    post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
};