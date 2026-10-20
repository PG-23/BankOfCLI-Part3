
package com.bankofcli.bank_api.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bankofcli.bank_api.dto.TransactionDto;
import com.bankofcli.bank_api.dto.TransactionResponse;
import com.bankofcli.bank_api.dto.WithdrawRequest;
import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.Transaction;
import com.bankofcli.bank_api.model.TransactionType;
import com.bankofcli.bank_api.repository.AccountRepository;
import com.bankofcli.bank_api.repository.TransactionRepository;

@Service
public class WithdrawalService {

    private static final long MAX_AMOUNT_CENTS = 10_000_000_000L;

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    // Constructor injection
    public WithdrawalService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository) {

        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public TransactionResponse withdraw(Long userId, WithdrawRequest request) {

        // 1. Get information from the request
        Long amount = request.getAmountCents();
        String accountNumber = request.getAccountNumber();

        // 2. Validate the withdrawal amount
        if (amount == null || amount <= 0 || amount > MAX_AMOUNT_CENTS) {
            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "INVALID_AMOUNT",
                "Amount must be between $0.01 and $100,000,000.",
                "amountCents"
            );
        }

        // 3. Validate the account number
        if (accountNumber == null || accountNumber.isBlank()) {
            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Account number is required.",
                "accountNumber"
            );
        }

        // 4. Find and lock the account before changing its balance
        Account account = accountRepository
            .findByAccountNumberForUpdate(accountNumber)
            .orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND,
                "ACCOUNT_NOT_FOUND",
                "Account does not exist.",
                "accountNumber"
            ));

        // 5. Verify the account belongs to the logged-in user
        if (!account.getUser().getId().equals(userId)) {
            throw new ApiException(
                HttpStatus.UNAUTHORIZED,
                "UNAUTHORIZED",
                "You can only withdraw from your own account.",
                null
            );
        }

        // 6. Make sure the account has enough money
        if (account.getBalanceCents() < amount) {
            throw new ApiException(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "INSUFFICIENT_FUNDS",
                "Insufficient funds for this withdrawal.",
                "amountCents"
            );
        }

        // 7. Subtract the withdrawal amount
        account.setBalanceCents(account.getBalanceCents() - amount);

        // 8. Record the withdrawal transaction
        Transaction transaction = new Transaction(
            TransactionType.WITHDRAWAL,
            amount,
            account,
            null,
            null
        );

        Transaction saved = transactionRepository.save(transaction);

        // 9. Return the transaction and updated account balance
        return new TransactionResponse(
            TransactionDto.from(saved),
            account.getBalanceCents()
        );
    }
}
