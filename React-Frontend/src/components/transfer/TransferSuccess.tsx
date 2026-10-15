import type { Transaction } from "../../models";
import { formatCents } from "../../utils/money";
import { DetailRow } from "./TransferReview";

interface TransferSuccessProps{
    transaction: Transaction;
    newBalanceCents:number;
    recipientName:string;
    onNewTransfer:() => void; // clear the form and start again
}

export function TransferSuccess({
    transaction,newBalanceCents,recipientName ,onNewTransfer
}:TransferSuccessProps){
    return(
        // id="transfer": the navbar's Transfer button still scrolls here.
    // role="status": screen readers announce the success message.
    <section id="transfer" role="status" className="rounded-md border border-border
    bg-surface p-6 text-center">
        {/* Big green check */}
        <div className="mx-auto flex h14 w-14 items-center 
        justify-center  rounded-full bg-success-bg text-primary">
            <i className="bi bi-check-lg text-title" aria-hidden="true" />

        </div>
        <h2 className="mt-4 text-title font-semibold text-text-main">Transfer sent</h2>
        <p className="text-small text-text-muted">
            {formatCents(transaction.amountCents)} is on its way to {recipientName}.
        </p>

        {/* Receipt details,left-aligned like the review screen */}
        <dl className = "mt-6 rounded-md border border-border p-4 text-left">
            <DetailRow label="Transaction ID" value={transaction.id}/>
            <DetailRow label="Amount" value={formatCents(transaction.amountCents)} />
            <DetailRow label="To" value={recipientName} />
            <DetailRow label="Reference" value={transaction.reference ?? '-'} />
            <DetailRow label="New balance" value={formatCents(newBalanceCents)} />
        </dl>
        <button
        type="button"
        onClick={onNewTransfer}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-sm bg-primary-strong 
        px-6 py-2 text-base font-semibold text-white transition-colors hover:bg-primary-hover">
            <i className="bi bi-plus-lg" aria-hidden="true" />
            Make another transfer

        </button>


    </section>

    );

}