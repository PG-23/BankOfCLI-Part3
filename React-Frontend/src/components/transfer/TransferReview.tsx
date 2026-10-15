import type { RecipientLookup } from '../../models';
import { formatCents } from '../../utils/money';
import { InfoBanner } from '../InfoBanner';

// Props the parent (TransferForm) passes in
interface TransferReviewProps {
  recipient: RecipientLookup;   // verified recipient from lookupRecipient()
  amountCents: number;          // e.g. 65000 = $650.00
  reference: string;            // e.g. "October rent"
  reviewedAt: Date;             // when the user clicked "Review transfer details"
  serverError:string | null;    //error with no field,
  isSubmitting:boolean;        //true while transfer() is running 
  onBack: () => void;           // go back to the form, keeping what they typed
  onConfirm: () => void;        // send the transfer (Part 5)
  
}

// "1000005678" becomes "1000 0056 78", easier to read and compare
function formatAccountNumber(accountNumber: string): string {
  return accountNumber.replace(/(\d{4})(\d{4})(\d{2})/, '$1 $2 $3');
}

// Date becomes "7 Oct 2026 • 09:41 AM"
function formatTimestamp(date: Date): string {
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${day} • ${time}`;
}

// One "label ........ value" row. dt/dd = description list, the correct HTML for label–value pairs.
export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-md py-xs">
      <dt className="text-base text-text-muted">{label}</dt>
      <dd className="text-right text-base font-semibold text-text-main">{value}</dd>
    </div>
  );
}

export function TransferReview({
  recipient, amountCents, reference, reviewedAt,isSubmitting,serverError, onBack, onConfirm,
}: TransferReviewProps) {
  const fullName = `${recipient.firstName} ${recipient.lastName}`;

  return (
    <section id="transfer"  className="rounded-md border border-border bg-surface p-lg">
      {/* Header */}
      <h2 className="text-title font-semibold text-text-main">Review transfer</h2>
      <p className="text-small text-text-muted">Check the details below before you confirm.</p>

      {/* Card-style box: recipient name on top, transfer details below, all in one container */}
      <div className="mt-lg rounded-md border border-border bg-gradient-to-br from-surface to-success-bg p-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-small font-bold tracking-widest text-primary">CLI</p>
            <p className="mt-md text-small text-text-muted">Recipient</p>
            <p className="text-base font-semibold text-text-main">{fullName}</p>
          </div>
          <i className="bi bi-credit-card-2-front text-title text-primary" aria-hidden="true" />
        </div>

        {/* Details list, inside the card, separated from the name by a line */}
        <dl className="mt-md border-t border-border pt-md">
          <DetailRow label="Recipient account number" value={formatAccountNumber(recipient.accountNumber)} />
          <DetailRow label="Transfer amount" value={formatCents(amountCents)} />
          <DetailRow label="Transfer reference" value={reference} />
          <DetailRow label="Timestamp" value={formatTimestamp(reviewedAt)} />
        </dl>
      </div>

      {/* Warning */}
      <div className="mt-lg">
        <InfoBanner>
          Completed transfers cannot be reversed from this screen. Please review the details carefully before you continue.
        </InfoBanner>
      </div>
      {/* Error that doesn't belong to one input; the user retry with confirm */}

      {serverError && (
        <div className='mt-4'>
          <InfoBanner variant='error'>{serverError}</InfoBanner>
        </div>
      )}

      {/* Buttons: Back on the left, Confirm on the right. Stacked on phones (Confirm on top). */}
      <div className="mt-lg flex flex-col-reverse gap-md md:flex-row md:justify-end">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-sm rounded-sm border
           border-border bg-surface px-lg py-sm text-base 
           font-semibold text-text-main transition-colors
            hover:bg-background disabled:cursor-not-allowed 
            disabled:opacity-60"
        >
          <i className="bi bi-arrow-left" aria-hidden="true" />
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-sm rounded-sm
           bg-primary-strong px-lg py-sm text-base font-semibold
            text-white transition-colors
             hover:bg-primary-hover 
             disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
            {/* animate-spin rotates the icon continuously */}
            <i className='bi bi-arrow-repeat animate-spin aria-hidden:"true' />
                Sending...
            </>
          ):(
            <>
            Confirm transfer {formatCents(amountCents)}
            <i className='bi bi-check2' aria-hidden="true"/>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
