import type { ApiError, RecipientLookup,Transaction ,TransferRequest,TransactionResponse } from '../models';
import { db,delay} from '../mocks/db';
import { isValidAccountNumber, isValidReference } from '../utils/validation';
import { isValidCents } from '../utils/money';

const fail = (code: ApiError['code'],message:string,
    field?:string): never =>{
        throw{code,message,field} satisfies ApiError;
    };

function nextTransactionId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const lastSeq = Math.max(0, ...db.transactions.map(t => Number(t.id.slice(-6)) || 0));
    return `TXN-${date}-${String(lastSeq + 1).padStart(6, '0')}`;

}

export async function lookupRecipient(
    accountNumber:string,
    fromAccountNumber:string,
    ):Promise<RecipientLookup> {
        await delay(400);

    const cleaned = accountNumber.replace(/\s/g,'');

    if(!isValidAccountNumber(cleaned))
        fail('VALIDATION_ERROR','Account number must be 10 digits.','toAccountNumber');

    if (cleaned === fromAccountNumber)
        fail('SAME_ACCOUNT_TRANSFER',"You can't transfer to your own account.",'toAccountNumber');
    
    const account = db.accounts.find(a => a.accountNumber === cleaned);
    if (!account) fail('ACCOUNT_NOT_FOUND','No account found with this number.','toAccountNumber');

    const owner = db.users.find(u => u.id === account!.userId);
    if(!owner) fail('ACCOUNT_NOT_FOUND','No account found with this number.','toAccountNumber');
    
    return{
        accountNumber: cleaned,
        firstName: owner!.firstName,
        lastName: owner!.lastName,
    };
}

export async function transfer(req: TransferRequest): Promise<TransactionResponse>{
    await delay();
    const toNumber = req.toAccountNumber.replace(/\s/g,'');
    //1.Format Checking
    if(!isValidAccountNumber(toNumber))
        fail('VALIDATION_ERROR','Account number must be 10 digits.','toAccountNumber');
    if(!isValidCents(req.amountCents))
        fail('INVALID_AMOUNT','Enter a valid amount greater than $0.00.','amount');
    if(!isValidReference(req.reference))
        fail('VALIDATION_ERROR','Enter a reference (up to 140 characters).','reference');

    //2.Account checks
    if(toNumber === req.fromAccountNumber)
        fail('SAME_ACCOUNT_TRANSFER',"You can't transfer to your own account.",'toAccountNumber');

    const from = db.accounts.find(a=>a.accountNumber ===req.fromAccountNumber);
    if(!from) fail('UNAUTHORIZED','Your session has expired. Please log in again.');

    const to = db.accounts.find(a=>a.accountNumber === toNumber);
    if(!to) fail('ACCOUNT_NOT_FOUND','No account found with this number.','toAccountNumber');


    //3.Balance Check
    if(from!.balanceCents < req.amountCents)
        fail('INSUFFICIENT_FUNDS','Insufficient balance for this transfer.','amount');

    //4. AllChecks passed - now chnage data
    from!.balanceCents -= req.amountCents;
    to!.balanceCents += req.amountCents;

    const transaction:Transaction ={
        id:nextTransactionId(),
        type:'transfer',
        amountCents: req.amountCents,
        fromAccountNumber: from!.accountNumber,
        toAccountNumber: to!.accountNumber,
        reference: req.reference.trim(),
        timestamp: new Date().toISOString(),
    };
    db.transactions.push(transaction);

    return {transaction,newBalanceCents:from!.balanceCents};
}

