import type { Transaction } from "../../models";
import {
    ArrowDownCircleFill,
    ArrowUpCircleFill,
    ArrowLeftRight,
} from "react-bootstrap-icons";
import { formatCents } from "../../utils/money";
import "../transaction/TransferHistory.css";

function TransferHistoryRow({
    transaction,
    accountId,
}: {
    transaction: Transaction;
    accountId: string;
}) {
    // If the transaction is incoming to the account, the toAccountNumber will match the accountId
    // If not it will be null or to the account we are transferring money to
    const inToAccount =
        transaction.toAccountNumber === accountId ? true : false;

    // Fall back to the other account's number if the API didn't send a name
    const counterparty =
        transaction.counterpartyName ??
        `account ${inToAccount ? transaction.fromAccountNumber : transaction.toAccountNumber}`;

    const date = new Date(transaction.timestamp);

    return (
        <tr>
            {/* Icon indicating the type of transaction */}
            {/* Green indicates money coming into account, red out of it */}
            <td>
                <div className="flex flex-row items-center">
                    {transaction.type === "deposit" ? (
                        <>
                            <ArrowDownCircleFill className="green icon" />
                            <span className="ml-2">Deposit</span>
                        </>
                    ) : null}
                    {transaction.type === "withdrawal" ? (
                        <>
                            <ArrowUpCircleFill className="red icon" />
                            <span className="ml-2">Withdrawal</span>
                        </>
                    ) : null}
                    {/* Check if transfer and if money is coming in or out of account */}
                    {transaction.type === "transfer" ? (
                        <>
                            <ArrowLeftRight
                                className={`${inToAccount ? "green" : "red"} icon`}
                            />
                            <span className="ml-2">
                                {inToAccount
                                    ? (transaction.note
                                        ?(`${transaction.note} made by ${counterparty}`)
                                        :(`Transfer from account ${transaction.fromAccountNumber}`))
                                    : (transaction.note
                                        ?(`${transaction.note} made to ${counterparty}`)
                                        :(`Transfer to account ${transaction.toAccountNumber}`))
                                }
                            </span>
                        </>
                    ) : null}
                </div>
            </td>

            {/* Date and time of the transaction */}
            <td>
                {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </td>

            {/* Transfer Type */}
            <td>
                {transaction.type.charAt(0).toUpperCase() +
                    transaction.type.slice(1)}
            </td>

            {/* Number indicating money in or out of account, color coded to indicate */}
            <td className={`${inToAccount ? "green" : "red"}`}>
                {inToAccount
                    ? `+ ${formatCents(Math.abs(transaction.amountCents))}`
                    : `- ${formatCents(Math.abs(transaction.amountCents))}`}
            </td>
        </tr>
    );
}

export default TransferHistoryRow;
