package com.bankofcli.bank_api.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bankofcli.bank_api.dto.DepositRequest;
import com.bankofcli.bank_api.dto.TransactionDto;
import com.bankofcli.bank_api.dto.TransactionResponse;
import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.Transaction;
import com.bankofcli.bank_api.model.TransactionType;
import com.bankofcli.bank_api.repository.AccountRepository;
import com.bankofcli.bank_api.repository.TransactionRepository;

@Service
public class TransactionService {

    /** Contract §5: at most $100,000,000 per transaction. */
    public static final long MAX_AMOUNT_CENTS = 10_000_000_000L;

    private final TransactionRepository transactionRepo;
    private final AccountRepository accountRepo;

    public TransactionService(TransactionRepository transactionRepo, AccountRepository accountRepo){
        this.transactionRepo = transactionRepo;
        this.accountRepo = accountRepo;
    }

    /** Adds money to the caller's own account and records a DEPOSIT. All or nothing. */
    @Transactional
    public TransactionResponse deposit(Long userId, DepositRequest request) {
        long amount = requireValidAmount(request.amountCents());
        Account account = lockOwnedAccount(userId, request.accountNumber(), "deposit to");

        account.setBalanceCents(account.getBalanceCents() + amount);
        Transaction saved = transactionRepo.save(
                new Transaction(TransactionType.DEPOSIT, amount, null, account, null));

        return new TransactionResponse(TransactionDto.from(saved), account.getBalanceCents());
    }

    // Shared amount rule for deposit, withdraw and transfer.
    static long requireValidAmount(Long amountCents) {
        if (amountCents == null || amountCents <= 0 || amountCents > MAX_AMOUNT_CENTS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_AMOUNT",
                    "Enter an amount between $0.01 and $100,000,000.", "amountCents");
        }
        return amountCents;
    }

    // Locks the row so concurrent balance changes wait their turn. A missing account and
    // someone else's account get the same 401, so callers can't probe which numbers exist.
    private Account lockOwnedAccount(Long userId, String accountNumber, String action) {
        return accountRepo.findByAccountNumberForUpdate(accountNumber)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED",
                        "You can only " + action + " your own account.", "accountNumber"));
    }
}
