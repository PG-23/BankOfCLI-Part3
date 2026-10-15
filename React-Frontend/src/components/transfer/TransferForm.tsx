// useState = values that change and re-render the screen
// useRef   = a value that survives re-renders but doesn't cause one (used for the lookup counter)
import { useRef, useState, type FormEvent, type ReactNode } from 'react';

import type { ApiError, RecipientLookup, TransactionResponse } from '../../models';
import { useAuth } from '../../hooks/useAuth';
import { lookupRecipient, transfer } from '../../services/transferService';
import { isValidAccountNumber,isValidReference } from '../../utils/validation';
import { FormField } from '../FormField';
import { formatCents, parseDollarsToCents } from '../../utils/money';
import { RecipientCard } from './RecipientCard';
import { InfoBanner } from '../InfoBanner';
import { TransferReview } from './TransferReview';
import { TransferSuccess } from './TransferSuccess';
import { notify } from '../../utils/notify';





// The 4 states of the "Verified" area on the right side of the account input
type LookupStatus = 'idle' | 'checking' | 'verified' | 'error';

// The inputs that can show an error underneath. Matches the "field" values in transferService.
type FieldName = 'toAccountNumber' | 'amount' | 'reference';

// Everything the review screen needs, captured when "Review transfer details" passes
interface ReviewData {
  recipient: RecipientLookup;
  amountCents: number;
  reference: string;
  reviewedAt: Date;
}

export function TransferForm() {
  // The logged-in user's account = the sender. Never typed by the user.
    const { account, updateBalance } = useAuth();


  // ---------- State ----------
  const [toAccount, setToAccount] = useState('');                              // what the user typed
  const [recipient, setRecipient] = useState<RecipientLookup | null>(null);    // filled once verified
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({}); // one message per input
  const [amount, setAmount] = useState('');        // what the user typed, e.g. "650" or "$1,250.50"
  const [reference, setReference] = useState('');  // e.g. "October rent"
  const [review, setReview] = useState<ReviewData | null>(null); // null = show the form, set = show the review screen
  const [isSubmitting, setIsSubmitting] = useState(false);  //true while transfer() runs
  const [serverError, setServerError] = useState<string | null>(null); //error with no field
  const [result,setResult] = useState<TransactionResponse | null>(null);  //set after a successful transfer



  // Counts lookups. If the user changes the number while a lookup is still running,
  // the old (slower) result is ignored so it can't overwrite the newer one.
  const lookupIdRef = useRef(0);

  // Sets or clears (message = undefined) the error under one input
  function setFieldError(field: FieldName, message?: string) {
    setErrors(prev => ({ ...prev, [field]: message }));
  }

  // ---------- Recipient account input ----------

  // Runs on every keystroke
  async function handleAccountChange(value: string) {
    setToAccount(value);
    setRecipient(null);                  // the number changed, so the old recipient no longer applies
    setFieldError('toAccountNumber');    // clear the old error while they type

    const lookupId = ++lookupIdRef.current; // number this lookup

    // Fewer than 10 digits: show nothing yet, don't call the service
    if (!isValidAccountNumber(value) || !account) {
      setLookupStatus('idle');
      return;
    }

    // Exactly 10 digits: check that the account exists
    setLookupStatus('checking');
    try {
      const found = await lookupRecipient(value, account.accountNumber);
      if (lookupId !== lookupIdRef.current) return; // the user typed again meanwhile, so ignore this result
      setRecipient(found);
      setLookupStatus('verified');
    } catch (err) {
      if (lookupId !== lookupIdRef.current) return;
      setLookupStatus('error');
      setFieldError('toAccountNumber', (err as ApiError).message); // e.g. "No account found with this number."
    }
  }

  // Runs when the user leaves the input. Catches incomplete numbers like "12345".
  function handleAccountBlur() {
    if (toAccount.trim() !== '' && !isValidAccountNumber(toAccount)) {
      setFieldError('toAccountNumber', 'Account number must be 10 digits.');
    }
  }
// ---------- Amount input ----------
 function handleAmountChange(value: string) {
    setAmount(value);
    setFieldError('amount');
  }
// Leaving the input: check the amount is valid and affordable
function handleAmountBlur() {
    if (amount.trim() === '') return; // empty: the "required" error is shown on submit 

    const cents = parseDollarsToCents(amount);
    if(cents === null){
        setFieldError('amount','Enter a valid amount, e.g. 25 or 25.50.');

    }else if(account && cents > account.balanceCents){
        setFieldError('amount','Insufficient balance for this transfer.');
    }
}

// ---------- Reference input ----------
function handleReferenceChange(value:string){
    setReference(value);
    setFieldError('reference');
}

  // What to show on the right inside the account input
  let accountRightSlot: ReactNode = null;
  if (lookupStatus === 'checking') {
    accountRightSlot = <span className="shrink-0 text-small text-text-muted">Checking…</span>;
  } else if (lookupStatus === 'verified' && recipient) {
    accountRightSlot = (
      <span className="flex shrink-0 items-center gap-xs text-small font-medium text-primary">
        <i className="bi bi-check-circle-fill" aria-hidden="true" />
        {/* The recipient's name is shown in the RecipientCard beside this input */}
        <span>Verified</span>
      </span>
    );
  }
// ---------- Review button ----------

function validateAll():boolean{
    const next:Partial<Record<FieldName,string>> ={};

    //Recipient:must be filled in,10 digits,and verified by lookupRecipient()
    if(toAccount.trim()===''){
        next.toAccountNumber = "Enter the recipient's account number.";
    
    }else if(!isValidAccountNumber(toAccount)){
        next.toAccountNumber = 'Account number must be 10 digits.';

    }else if(lookupStatus === 'checking'){
        next.toAccountNumber = 'Still checking this account. Please wait a moment.';
    }
    else if(!recipient){
        next.toAccountNumber = errors.toAccountNumber ?? 'No account found with this number.';
    }

    //Reference:required, up to 140 characters 
    if(reference.trim() === ''){
        next.reference = 'Enter a transfer reference.';
    }else if(!isValidReference(reference)){
        next.reference = 'Reference must be 140 characters or fewer.';
    }
    // Amount: required, a valid number, and not more than the balance
    const cents = parseDollarsToCents(amount);
    if (amount.trim() === '') {
      next.amount = 'Enter an amount.';
    } else if (cents === null) {
      next.amount = 'Enter a valid amount, e.g. 25 or 25.50.';
    } else if (account && cents > account.balanceCents) {
      next.amount = 'Insufficient balance for this transfer.';
    }

    setErrors(next); // replaces all old errors with the new ones

    // Move the cursor to the first field with an error (in screen order)
    const firstError = (['toAccountNumber', 'reference', 'amount'] as FieldName[]).find(f => next[f]);
    if (firstError) document.getElementById(firstError)?.focus();

    return firstError === undefined; // no errors = valid
   }
   // Runs when the button is clicked or Enter is pressed in any input
  function handleReview(e: FormEvent) {
    e.preventDefault(); // stop the browser from reloading the page (default form behaviour)
    if (!validateAll()) return;

    // Part 4 replaces this with the review screen
    //console.log('Valid — ready for review', { toAccount, amount, reference, recipient });
      // validateAll() passed, so recipient and the amount are guaranteed valid here (hence the "!")
    setReview({
      recipient: recipient!,
      amountCents: parseDollarsToCents(amount)!,
      reference: reference.trim(),
      reviewedAt: new Date(),
    });
  }
// ---------- Confirm button ----------
async function handleConfirm(){
  if(!review || !account) return ;
  setIsSubmitting(true); //disable buttons,show "Sending.."
  setServerError(null); //clear any old error before retrying

  try{
    const res = await transfer({
      fromAccountNumber: account.accountNumber,
      toAccountNumber:review.recipient.accountNumber,
      amountCents:review.amountCents,
      reference:review.reference,
    });
    setResult(res); // switches to the success screen
    updateBalance(res.newBalanceCents); // update the balance everywhere on the page

    notify.success(`${formatCents(review.amountCents)} sent to ${review.recipient.firstName}`);
  } catch(err){
    const apiError = err as ApiError;
    const message = apiError.message ?? 'Something went wrong.Please try again';

    if(apiError.field){
    // The error belongs to one input: go back to the form and show it there
    setReview(null);
    if(apiError.field === 'toAccountNumber'){
      setRecipient(null);
      setLookupStatus('error');
    }
    setFieldError(apiError.field as FieldName,message);
  }else{
    // No field (e.g. session expired): show the banner on the review screen
    setServerError(message);

  }
    } finally{
      setIsSubmitting(false); //runs after both success and error
    }
  }
// "Make another transfer": reset everything to an empty form
function startNewTransfer(){
  setToAccount('');
  setRecipient(null);
  setLookupStatus('idle');
  setAmount('');
  setReference('');
  setErrors({});
  setReview(null);
  setServerError(null);
  setResult(null);

}
// success step: shown after transfer() succeeds
if(result && review){
  return (
    <TransferSuccess
    transaction={result.transaction}
    newBalanceCents={result.newBalanceCents}
    recipientName={`${review.recipient.firstName} ${review.recipient.lastName}`}
    onNewTransfer={startNewTransfer}/>

  );
}


  // Review step: show the summary instead of the form.
  // The typed values stay in state, so "Back" returns to a filled-in form.
  if (review) {
    return (
      <TransferReview
        recipient={review.recipient}
        amountCents={review.amountCents}
        reference={review.reference}
        reviewedAt={review.reviewedAt}
        onBack={() => { setServerError(null); setReview(null); }}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
        serverError={serverError}
      />
    );
  }



  

  // ---------- Layout ----------
  return (
    <section id="transfer" className="rounded-md border border-border bg-surface p-lg">
      {/* Card header: icon + title + subtitle */}
      <div className="flex items-start gap-md">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-success-bg text-primary">
          <i className="bi bi-arrow-left-right" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-title font-semibold text-text-main">Account-to-account transfer</h2>
          <p className="text-small text-text-muted">
            Send funds securely using a verified Bank of CLI account number.
          </p>
        </div>
      </div>

    {/* noValidate turns off the browser's own popups, so our messages show instead */}
      <form noValidate onSubmit={handleReview}>

      {/* Two columns on wide screens, one column on phones.
          The grid fills left to right, row by row, so the order below sets the position:
          Row 1: account number | recipient     Row 2: reference | amount */}
      <div className="mt-lg grid gap-md md:grid-cols-2">
        {/* Row 1, left: recipient account number */}
        <FormField
          id="toAccountNumber"
          label="Recipient account number"
          icon="bank"
          required
          inputMode="numeric"
          maxLength={13}   // 10 digits + up to 3 spaces ("1000 0056 78")
          placeholder="10-digit account number"
          value={toAccount}
          onChange={handleAccountChange}
          onBlur={handleAccountBlur}
          helperText="Use the recipient's 10-digit Bank of CLI account number."
          error={errors.toAccountNumber}
          rightSlot={accountRightSlot}
        />

        {/* Row 1, right: recipient, beside the account number.
            The label matches the other fields so the card lines up with the input. */}
        <div className="flex flex-col gap-xs">
          <p className="text-base font-medium text-text-main">Recipient</p>
          {recipient ? (
            <RecipientCard recipient={recipient} />
          ) : (
            // Placeholder so the space isn't empty before verification
            <div className="flex items-center gap-sm rounded-sm border border-dashed border-border px-md py-sm text-small text-text-muted">
              <i className="bi bi-person" aria-hidden="true" />
              Enter a valid account number to see the recipient.
            </div>
          )}
        </div>

        {/* Row 2, left: transfer reference */}
        <FormField
          id="reference"
          label="Transfer reference"
          icon="chat-left-text"
          required
          maxLength={140}              // same limit as isValidReference
          placeholder="e.g. October rent"
          value={reference}
          onChange={handleReferenceChange}
          helperText="Shown to you and the recipient on account statements."
          error={errors.reference}
        />

        {/* Row 2, right: amount */}
        <FormField
          id="amount"
          label="Amount"
          icon="currency-dollar"
          required
          inputMode="decimal"          // number keyboard with a "." on phones
          placeholder="0.00"
          value={amount}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          // Shows the sender's balance as a hint, e.g. "Available balance: $2,500.00"
          helperText={account ? `Available balance: ${formatCents(account.balanceCents)}` : undefined}
          error={errors.amount}
        />
      </div>

        {/* Bottom row: info banner on the left, button on the right. Stacked on phones. */}
        <div className="mt-lg flex flex-col gap-md md:flex-row md:items-center">
          <div className="md:flex-1">
            <InfoBanner>
              Check the recipient and reference carefully. Completed transfers cannot be reversed from this screen.
            </InfoBanner>
          </div>

          {/* type="submit" runs the form's onSubmit, i.e. handleReview */}
          <button
            type="submit"
            className="flex items-center justify-center gap-sm rounded-sm bg-primary-strong px-lg py-sm text-base font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Review transfer details
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}
