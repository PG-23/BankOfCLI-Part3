import { useState, type FormEvent } from 'react';
import type { TransactionResponse } from '../../models';
import { Button, Input, Modal } from '../ui';
import { withdraw } from '../../services/withdrawService';
import { getApiError } from '../../utils/apiError';
import { formatCents, parseDollarsToCents } from '../../utils/money';
import { notify } from '../../utils/notify';

type WithdrawCardProps = {
  accountNumber: string;
  balanceCents: number;
  onWithdrawn: (res: TransactionResponse) => void; // parent updates its balance / transaction list
};

// Returns an error message, or undefined if the amount is valid.
function validateAmount(input: string, balanceCents: number): string | undefined {
  const trimmed = input.trim();
  if (trimmed === '') return 'Enter a withdrawal amount.';
  if (trimmed.startsWith('-')) return "Amount can't be negative.";

  const cents = parseDollarsToCents(trimmed);
  if (cents === null) {
    const looksLikeMoney = /^\$?[\d,]+(\.\d{1,2})?$/.test(trimmed); // e.g. "0"
    return looksLikeMoney ? 'Enter an amount greater than $0.00.' : 'Enter a valid dollar amount, like 125.50.';
  }
  if (cents > balanceCents) return `Insufficient funds. Enter ${formatCents(balanceCents)} or less.`;
  return undefined;
}

function WithdrawIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 20V9m0 0-4.5 4.5M12 9l4.5 4.5M5 4h14" />
    </svg>
  );
}

function CheckCircleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

function AlertCircleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5m0 3.5h.01" />
    </svg>
  );
}

export function WithdrawCard({ accountNumber, balanceCents, onWithdrawn }: WithdrawCardProps) {
  const [amount, setAmount] = useState('');
  const [showErrors, setShowErrors] = useState(false); // only after blur or a submit attempt
  const [serverError, setServerError] = useState<string | undefined>(); // field error returned by the service
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAmountCents, setPendingAmountCents] = useState<number | null>(null);

  const error = validateAmount(amount, balanceCents);
  const cents = error ? null : parseDollarsToCents(amount);
  const parsedCents = parseDollarsToCents(amount);
  const overBalance = parsedCents !== null && parsedCents > balanceCents; // shown right away, as in the design
  const fieldError = serverError ?? (showErrors || overBalance ? error : undefined);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (cents === null) {
      setShowErrors(true);
      return;
    }

    setPendingAmountCents(cents);
    setIsConfirmOpen(true);
  }

  function closeConfirmation() {
    if (submitting) return;
    setIsConfirmOpen(false);
    setPendingAmountCents(null);
  }

  async function handleConfirmWithdrawal() {
    if (pendingAmountCents === null || submitting) return;

    setSubmitting(true);
    try {
      const res = await withdraw({ accountNumber, amountCents: pendingAmountCents });
      notify.success(
        `Withdrew ${formatCents(pendingAmountCents)}. New balance: ${formatCents(res.newBalanceCents)}.`,
      );
      setAmount('');
      setShowErrors(false);
      onWithdrawn(res);
    } catch (err) {
      const apiError = getApiError(err);
      if (apiError?.field === 'amountCents') setServerError(apiError.message);
      else notify.error(apiError?.message ?? 'The withdrawal could not be completed. Please try again.');
    } finally {
      setSubmitting(false);
      setIsConfirmOpen(false);
      setPendingAmountCents(null);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 rounded-md border border-border bg-surface p-6"
      >
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-success-bg text-primary">
            <WithdrawIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-title font-semibold text-text-main">Withdraw funds</h2>
            <p className="text-small text-text-muted">Move money out of your available balance.</p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Input
            label="Withdrawal amount *"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="$0.00"
            value={amount}
            onChange={e => {
              setAmount(e.target.value);
              setServerError(undefined);
            }}
            onBlur={() => amount.trim() !== '' && setShowErrors(true)}
            disabled={submitting}
            error={fieldError}
          />
          {!fieldError && (
            <p className="text-small text-text-muted">
              Enter an amount up to your available balance of {formatCents(balanceCents)}.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-small text-text-muted">Balance after withdrawal</span>
          <span className="font-semibold tabular-nums text-text-main">
            {formatCents(balanceCents - (cents ?? 0))}
          </span>
        </div>

        {overBalance ? (
          <div role="alert" className="flex gap-2 rounded-sm border-l-4 border-error bg-error-bg p-4">
            <AlertCircleIcon className="mt-0.5 size-5 shrink-0 text-error" />
            <div>
              <p className="font-medium text-error">Withdrawal cannot be submitted</p>
              <p className="text-small text-text-muted">Reduce the amount or add funds before withdrawing.</p>
            </div>
          </div>
        ) : cents !== null && (
          <div role="status" className="flex gap-2 rounded-sm border-l-4 border-primary bg-success-bg p-4">
            <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-text-main">Ready to withdraw</p>
              <p className="text-small text-text-muted">
                Review and confirm the withdrawal before your balance is updated.
              </p>
            </div>
          </div>
        )}

        <Button type="submit" fullWidth disabled={submitting || balanceCents <= 0}>
          {cents !== null ? `Withdraw ${formatCents(cents)}` : 'Withdraw'}
          <WithdrawIcon className="size-4" />
        </Button>
      </form>

      <Modal
        open={isConfirmOpen && pendingAmountCents !== null}
        onClose={closeConfirmation}
        title="Confirm withdrawal"
      >
        {pendingAmountCents !== null && (
          <>
            <p className="text-base text-text-muted">
              Review the amount below before completing the withdrawal.
            </p>

            <div className="mt-4 rounded-md border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base text-text-muted">Withdrawal amount</span>
                <span className="text-title font-semibold text-text-main">
                  {formatCents(pendingAmountCents)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-border pt-3">
                <span className="text-base text-text-muted">Balance after withdrawal</span>
                <span className="text-base font-semibold text-text-main">
                  {formatCents(balanceCents - pendingAmountCents)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={closeConfirmation}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirmWithdrawal()}
                loading={submitting}
              >
                {submitting ? 'Processing withdrawal…' : 'Confirm withdrawal'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
