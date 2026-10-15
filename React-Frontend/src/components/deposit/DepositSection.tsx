import { useAuth } from "../../hooks/useAuth";
import { DepositCard } from "./DepositCard";

type DepositSectionProps = {
    onDeposited?: (newBalanceCents: number) => void; // e.g. let the dashboard refresh its balance
};

// Drop-in deposit feature for the dashboard. Loads the logged-in user's current balance,
// then shows the deposit form. id="deposit" is the target of the navbar's "Deposit" button.
export function DepositSection({ onDeposited }: DepositSectionProps) {
    const { account } = useAuth();

    return (
        <section id="deposit" className="w-full">
            <DepositCard
                accountNumber={account?.accountNumber ?? ""}
                balanceCents={account?.balanceCents ?? 0}
                onDeposited={(res) => {
                    onDeposited?.(res.newBalanceCents);
                }}
            />
        </section>
    );
}
