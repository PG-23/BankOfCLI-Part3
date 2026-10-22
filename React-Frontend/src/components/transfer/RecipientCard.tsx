// The type returned by lookupRecipient() in transferService
import type { RecipientLookup } from '../../models';

// Props the parent passes in
interface RecipientCardProps {
  recipient: RecipientLookup;   // the account owner found by lookupRecipient()
}

export function RecipientCard({ recipient }: RecipientCardProps) {
  // First letter of first and last name, e.g. "Bob Jones" becomes "BJ"
  const initials = `${recipient.firstName.charAt(0)}${recipient.lastName.charAt(0)}`.toUpperCase();

  // Only the last 4 digits, for privacy: "1000005678" becomes "5678"
  const lastFour = recipient.accountNumber.slice(-4);

  return (
    // Light background box with a border, laid out as one row: avatar | name | check
    <div className="flex items-center gap-md rounded-sm border border-border bg-background px-md py-sm">

      {/* Round avatar with the initials. aria-hidden because the name below already says who it is. */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-bg text-small font-semibold text-primary"
        aria-hidden="true"
      >
        {initials}
      </div>

      {/* Name and masked account number. flex-1 pushes the check icon to the far right. */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-text-main">
          {recipient.firstName} {recipient.lastName}
        </p>
        <p className="text-small text-text-muted">
          CLI •••• {lastFour}
        </p>
      </div>

      {/* Green check on the right. The sr-only text is read by screen readers but hidden on screen. */}
      <i className="bi bi-check-circle text-lg text-primary" aria-hidden="true" />
      <span className="sr-only">Verified recipient</span>
    </div>
  );
}
