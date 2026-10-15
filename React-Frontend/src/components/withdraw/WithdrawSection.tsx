import { useAuth } from "../../hooks/useAuth";
import { WithdrawCard } from "./WithdrawCard";

type WithdrawSectionProps = {
    onWithdrawn?: (newBalanceCents: number) => void; // e.g. let the dashboard refresh its balance
};

// Drop-in withdraw feature for the dashboard. Uses the logged-in user's balance from the auth context.
// id="withdraw" is the target of the navbar's "Withdraw" button.
export function WithdrawSection({ onWithdrawn }: WithdrawSectionProps) {
    const { account } = useAuth();

    return (
        <section id="withdraw" className="w-full">
            <WithdrawCard
                accountNumber={account?.accountNumber ?? ""}
                balanceCents={account?.balanceCents ?? 0}
                onWithdrawn={(res) => {
                    onWithdrawn?.(res.newBalanceCents);
                }}
            />
        </section>
    );
}
