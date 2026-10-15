import "./AccountOverview.css";
import { useState } from "react";
import { formatCents } from "../../utils/money";
import { BiCreditCard, BiUser, BiEnvelope } from "react-icons/bi";
import { useAuth } from "../../hooks/useAuth";

function AccountOverview() {
    const [showAccountInfo, setShowAccountInfo] = useState(false);

    // Logged-in user and their account (from AuthProvider)
    const { user, account } = useAuth();
    if (!user || !account) return null; // dashboard is protected, but stay safe


    return (
        <div className="container-overview">
            {/* Title Section */}
            <div className="title-container">
                <div className="title">Account Overview</div>
                <div className="user-name">
                    {user.firstName} {user.lastName}
                </div>
            </div>

            {/* Account details will go here */}
            <div className="account-balance">
                <div className="subtitle">Available Balance</div>
                <div className="amount">
                    {formatCents(account.balanceCents)}
                </div>
            </div>

            {/* Account Details */}
            <div className="account-info">
                {/* The bracketed space ensures that no formatter will remove it. The space is good for readability */}
                {/* This will sensor the account number until the user presses a button to reveal everything */}
                <div>
                    <div className="row">
                        <div className="icon-row">
                            <BiCreditCard size={24} /> Account Number{" "}
                        </div>
                        {showAccountInfo ? (
                            account.accountNumber
                        ) : (
                            // I cannot figure out why the first dot is lower than the others. Any of the fixes I try or other censor characters have the same fault
                            <>
                                {/* Censor all but the last 4 digits of the account number */}
                                {"•".repeat(
                                    account.accountNumber.length - 4,
                                )}
                                {account.accountNumber.substring(
                                    account.accountNumber.length - 4,
                                    account.accountNumber.length,
                                )}
                            </>
                        )}
                    </div>
                    <>
                        {showAccountInfo && (
                            <>
                                <div className="row">
                                    <div className="icon-row">
                                        <BiUser size={24} /> Username
                                    </div>
                                    <div>{user.username}</div>
                                </div>
                                <div className="row">
                                    <div className="icon-row">
                                        <BiEnvelope size={24} /> Email
                                    </div>
                                    <div>{user.email}</div>
                                </div>
                            </>
                        )}
                    </>
                </div>
                <button
                    className="link"
                    onClick={() => setShowAccountInfo(!showAccountInfo)}
                >
                    {showAccountInfo ? "Hide" : "Show"} Account Information{" "}
                </button>
            </div>
        </div>
    );
}

export default AccountOverview;
