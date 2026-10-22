import type { Transaction, TransactionType } from "../models";
import { api } from "./apiClient";

// Typings that exist to make it easier to work with transaction filters and paginated results
export type TransactionFilter = TransactionType | "all"; // Accepts all filtering results
export type PaginatedTransactions = {
    // totalPages makes rendering easier
    transactions: Transaction[];
    totalPages: number;
};

export const PAGE_SIZE = 5;

type SpringPage<T> = {
    content: T[];
    totalPages: number;
};

export async function getTransactionsFromId(
    page: number = 0,
    type: TransactionFilter = "all",
): Promise<PaginatedTransactions> {
    const response = await api.get<SpringPage<Transaction>>(
        `/transactions/paged?page=${page}&size=${PAGE_SIZE}&type=${type}`,
    );

    return {
        transactions: response.content,
        totalPages: response.totalPages,
    };
}