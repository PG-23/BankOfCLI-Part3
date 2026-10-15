import type {Transaction} from '../models';
import { db,delay } from '../mocks/db';

// Every transaction that involves this account (no paging), for the activity chart.

export async function getAccountActivity(accountNumber:string): Promise<Transaction[]>{
    await delay(300);
    return db.transactions.filter(
        t => t.fromAccountNumber === accountNumber || t.toAccountNumber === accountNumber,
    
    );

}