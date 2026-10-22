import type { RecipientLookup,TransactionResponse,TransferRequest } from "../models";
import { api, ApiRequestError } from './apiClient';
import { isValidAccountNumber } from "../utils/validation";

// The recipient lookup reports its error on "accountNumber", but on the
// transfer form that input is "toAccountNumber". Renaming it lets
// TransferForm show the error under the right input.
const FORM_FIELD: Record<string, string> = {
    accountNumber: 'toAccountNumber',
};

function rethrowWithFormField(err:unknown): never {
    if(err instanceof ApiRequestError && err.field && FORM_FIELD[err.field]){
        throw new ApiRequestError(err.status,err.code,err.message,FORM_FIELD[err.field]);
    }
    throw err;
}

//GET / accounts/{accountNumber} ->the recipient's name ,before the user confirms
export async function lookupRecipient(accountNumber:string,fromAccountNumber:string):Promise<RecipientLookup>{
    const cleaned = accountNumber.replace(/\s/g,'');

    //Quick checks without a network call
    if(!isValidAccountNumber(cleaned)){
        throw new ApiRequestError(400,'VALIDATION_ERROR','Account number must be 10 digits.','toAccountNumber');

    }
    if(cleaned === fromAccountNumber){
        throw new ApiRequestError(400,'SAME_ACCOUNT_TRANSFER',"you can't transfer to your own account.","toAccountNumber");
    }
    try{
        return await api.get<RecipientLookup>(`/accounts/${cleaned}`);

    }catch(err){
        return rethrowWithFormField(err);
    }

}

//Post/transactions/transfer -> moves the money ; the backend does all the real checks
export async function transfer(req:TransferRequest): Promise<TransactionResponse>{
    try{
        return await api.post<TransactionResponse>(
            '/transactions/transfer',
            {
                fromAccountNumber:req.fromAccountNumber,
                toAccountNumber:req.toAccountNumber.replace(/\s/g,''),
                amountCents:req.amountCents,
                note:req.note.trim(),
            },
        );

    } catch(err){
        return rethrowWithFormField(err);
    }
}
