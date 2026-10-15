import React from "react";
import TransferHistoryRow from "./TransferHistoryRow";
import "./TransferHistory.css";
import {
    getTransactionsFromId,
    type TransactionFilter,
    PAGE_SIZE,
} from "../../services/transactionService";
import type { Transaction } from "../../models";
import { useAuth } from "../../hooks/useAuth";
import { Skeleton } from "../ui";
import { notify } from "../../utils/notify";

function TransferHistory() {
    const { account } = useAuth();
    const accountNumber = account?.accountNumber;

    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [totalPages, setTotalPages] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    // State for the current filter selection
    const [filter, setFilter] = React.useState<TransactionFilter>("all");

    /************************************************
     *            Pagination Variables              *
     ***********************************************/
    const [page, setPage] = React.useState(0);
    const startingPage = Math.max(
        0,
        Math.min(totalPages - 5, Math.max(0, page - 2)),
    );
    const isLastPage = page >= totalPages - 1;

    // Fetch transactions whenever auth account state, filter, or page changes.
    // Including `account` ensures auth updates (e.g. balance updates after transfers)
    // trigger a refresh even when the account number itself stays the same.
    React.useEffect(() => {
        if (!accountNumber) return;
        let cancelled = false; // ignore results from outdated requests

        async function fetchData() {
            setLoading(true);
            try {
                const result = await getTransactionsFromId(
                    accountNumber!,
                    filter,
                    page,
                );
                if (cancelled) return;
                setTransactions(result.transactions);
                setTotalPages(result.totalPages);
            } catch {
                if (!cancelled) notify.error("Could not load transactions.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchData();

        return () => {
            cancelled = true;
        };
    }, [account, accountNumber, filter, page]);

    return (
        <>
            <div className="transaction-history" id="transactions">
                {/* Basic info + sorting capabilities */}
                <div className="header">
                    <div className="text-title">Transactions</div>
                    <div className="under-title">
                        <div>Latest activity across your account.</div>

                        {/* Drop down for sorting */}
                        <select
                            value={filter}
                            onChange={(e) => {
                                setFilter(e.target.value as TransactionFilter);
                                setPage(0); // Reset to first page when filter changes
                            }}
                        >
                            <option value="all">All Activity</option>
                            <option value="deposit">Deposits</option>
                            <option value="withdrawal">Withdrawals</option>
                            <option value="transfer">Transfers</option>
                        </select>
                    </div>
                </div>

                {/* Table for displaying transaction history */}
                <table aria-busy={loading}>
                    <thead>
                        <tr>
                            <th className="text-base first-column">
                                Transaction
                            </th>
                            <th className="text-base text-align-right">Date</th>
                            <th className="text-base mid-column">Type</th>
                            <th className="text-base text-align-left">
                                Amount
                            </th>
                        </tr>
                    </thead>

                    {/* Table content */}
                    <tbody>
                        {loading ? (
                            /* Skeleton rows while loading */
                            <>
                                {Array.from({ length: PAGE_SIZE }).map(
                                    (_, i) => (
                                        <tr key={`loading-${i}`}>
                                            <td
                                                colSpan={4}
                                                className="loading-cell"
                                            >
                                                <Skeleton className="h-5 w-full" />
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </>
                        ) : transactions.length === 0 ? (
                            /* Empty state */
                            <tr>
                                <td
                                    colSpan={4}
                                    className="py-8 text-center text-text-muted"
                                >
                                    {filter === "all"
                                        ? "No transactions yet."
                                        : "No transactions of this type."}
                                </td>
                            </tr>
                        ) : (
                            <>
                                {/* Transaction rows */}
                                {transactions.map((item) => (
                                    <TransferHistoryRow
                                        key={item.id}
                                        transaction={item}
                                        accountId={accountNumber!}
                                    />
                                ))}

                                {/* Filler rows keep the table height steady on the last page */}
                                {Array.from({
                                    length: Math.max(
                                        0,
                                        PAGE_SIZE - transactions.length,
                                    ),
                                }).map((_, i) => (
                                    <tr
                                        key={`empty-${i}`}
                                        className="empty-row"
                                        aria-hidden="true"
                                    >
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>

                {/* Page Buttons */}
                <div className="pagination">
                    <button
                        onClick={() => {
                            if (page > 0) setPage(page - 1);
                        }}
                        className={`nav ${page === 0 ? "invisible" : "active"}`}
                        disabled={page === 0 || loading}
                    >
                        Previous
                    </button>

                    {Array.from({ length: 5 }, (_, i) => {
                        const index = startingPage + i;
                        const isValid = index < totalPages;
                        const isCurrent = index === page;

                        if (totalPages <= 1) return null;

                        return (
                            <button
                                key={index}
                                className={`page ${isCurrent ? "current" : "active"} ${isValid ? "" : "invisible"}`}
                                disabled={!isValid || loading}
                                onClick={() => {
                                    if (isValid) setPage(index);
                                }}
                            >
                                {isValid ? index + 1 : "0"}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => {
                            if (!isLastPage) setPage(page + 1);
                        }}
                        className={`nav ${isLastPage ? "invisible" : "active"}`}
                        disabled={isLastPage || loading}
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}

export default TransferHistory;
