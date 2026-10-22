import type {Transaction} from '../models';
import { api } from './apiClient';

// Every transaction that involves this account (no paging), for the activity chart.

export async function getAccountActivity(daysAgo: number): Promise<Transaction[]>{

    const since = new Date();
    since.setDate(since.getDate() - daysAgo);

    const response = await api.get<{transactions: Transaction[]}>(`/transactions/activity?since=${since.toISOString()}`);

    return response.transactions;
}