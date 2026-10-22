import type { Transaction } from '../models';

export interface MonthActivity {
    month: string;
    deposits: number;
    withdrawals: number;
    transfers: number;
}

export interface WeekActivity {
    week: string;          // x-axis label: the Monday the week starts on, e.g. "Oct 5"
    deposits: number;
    withdrawals: number;
    transfers: number;
}

type Totals = { deposits: number; withdrawals: number; transfers: number };

// Adds one transaction's amount to the right total in a bucket.
// Shared by the monthly and weekly groupings so both count things the same way.
// Only outgoing transfers count; incoming ones are ignored.
function addTransaction(bucket: Totals, t: Transaction, accountNumber: string) {
    if (t.type === 'deposit') bucket.deposits += t.amountCents;
    else if (t.type === 'withdrawal') bucket.withdrawals += t.amountCents;
    else if (t.type === 'transfer' && t.fromAccountNumber === accountNumber) {
        bucket.transfers += t.amountCents;
    }
}

// Turns a list of transactions into totals per month for the last `months` months.
// Months with no activity still appear (with zeros), so the chart has no gaps.
export function groupByMonth(transactions: Transaction[], accountNumber: string, months = 6): MonthActivity[] {
    const now = new Date();

    const result: (MonthActivity & { key: string })[] = [];
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        result.push({
            key: `${d.getFullYear()}-${d.getMonth()}`,              // "2026-9", to match transactions
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            deposits: 0,
            withdrawals: 0,
            transfers: 0,
        });
    }

    // Add each transaction's amount to its month and type
    for (const t of transactions) {
        const d = new Date(t.timestamp);
        const bucket = result.find(m => m.key === `${d.getFullYear()}-${d.getMonth()}`);
        if (!bucket) continue;
        addTransaction(bucket, t, accountNumber);
    }

    // Return only the chart fields (drops the helper "key")
    return result.map(({ month, deposits, withdrawals, transfers }) => ({ month, deposits, withdrawals, transfers }));
}

// Midnight (local time) on the Monday of the week containing `d`
function startOfWeek(d: Date): Date {
    const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7)); // Sun→back 6, Mon→0, Tue→back 1…
    return monday;
}

// Turns a list of transactions into totals per week (Monday–Sunday) for the last `weeks` weeks.
// Weeks with no activity still appear (with zeros), so the chart has no gaps.
export function groupByWeek(transactions: Transaction[], accountNumber: string, weeks = 12): WeekActivity[] {
    const thisWeek = startOfWeek(new Date());

    const result: (WeekActivity & { key: number })[] = [];
    for (let i = weeks - 1; i >= 0; i--) {
        const start = new Date(thisWeek);
        start.setDate(start.getDate() - 7 * i);                 // setDate handles month/year rollover
        result.push({
            key: start.getTime(),                                // Monday's timestamp, to match transactions
            week: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            deposits: 0,
            withdrawals: 0,
            transfers: 0,
        });
    }

    // Add each transaction's amount to its week and type
    for (const t of transactions) {
        const key = startOfWeek(new Date(t.timestamp)).getTime();
        const bucket = result.find(w => w.key === key);
        if (!bucket) continue;
        addTransaction(bucket, t, accountNumber);
    }

    // Return only the chart fields (drops the helper "key")
    return result.map(({ week, deposits, withdrawals, transfers }) => ({ week, deposits, withdrawals, transfers }));
}

export interface DayActivity {
    day: string;           // x-axis label: date, e.g. "Oct 8"
    date: string;          // full date for the tooltip, e.g. "Thu, Oct 8"
    deposits: number;
    withdrawals: number;
    transfers: number;
}

// Turns a list of transactions into totals per day for the last `days` days (today included).
// Days with no activity still appear (with zeros), so the chart has no gaps.
export function groupByDay(transactions: Transaction[], accountNumber: string, days = 7): DayActivity[] {
    const now = new Date();

    const result: (DayActivity & { key: string })[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i); // handles month/year rollover
        result.push({
            key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,               // "2026-9-8", to match transactions
            day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),   // "Oct 8"
            date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            deposits: 0,
            withdrawals: 0,
            transfers: 0,
        });
    }

    // Add each transaction's amount to its day and type
    for (const t of transactions) {
        const d = new Date(t.timestamp);
        const bucket = result.find(b => b.key === `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
        if (!bucket) continue;
        addTransaction(bucket, t, accountNumber);
    }

    // Return only the chart fields (drops the helper "key")
    return result.map(({ day, date, deposits, withdrawals, transfers }) => ({ day, date, deposits, withdrawals, transfers }));
}