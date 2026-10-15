import type { Transaction, TransactionType } from "../models";
import { db, delay } from "../mocks/db";

const { transactions } = db;

// Typings that exist to make it easier to work with transaction filters and paginated results
export type TransactionFilter = TransactionType | "all"; // Accepts all filtering results
export type PaginatedTransactions = {
    // totalPages makes rendering easier
    transactions: Transaction[];
    totalPages: number;
};

export const PAGE_SIZE = 5;

// Get all to retrieve transactions by id, type, and page.
// Returns a paginated list of transactions matching and the total pages that exist
export async function getTransactionsFromId(
    id: string,
    type: TransactionFilter = "all",
    page: number = 0,
): Promise<PaginatedTransactions> {
    await delay(2000); // TEMPORARY: make the skeleton visible
    await delay(500); // Simulate network delay
    // Check to see if a filter exists anywhere
    const sorted = [...transactions].sort((a, b) =>
        b.timestamp.localeCompare(a.timestamp),
    );
    const filteredTransactions = sorted.filter((transaction) => {
        const inAccount =
            transaction.fromAccountNumber === id ||
            transaction.toAccountNumber === id;

        // Do not filter any more if the type is all
        if (type === "all") {
            return inAccount;
        }

        // Otherwise, filter by the specified type
        return inAccount && transaction.type === type;
    });

    // Get the paginated transactions based on the current page and page size
    const paginatedTransactions = filteredTransactions.slice(
        page * PAGE_SIZE,
        (page + 1) * PAGE_SIZE,
    );
    const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE);
    return {
        transactions: paginatedTransactions,
        totalPages,
    };
}
