
package com.bankofcli.bank_api.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.bankofcli.bank_api.dto.TransactionResponse;
import com.bankofcli.bank_api.dto.WithdrawRequest;
import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.Transaction;
import com.bankofcli.bank_api.model.TransactionType;
import com.bankofcli.bank_api.model.User;
import com.bankofcli.bank_api.repository.AccountRepository;
import com.bankofcli.bank_api.repository.TransactionRepository;

@ExtendWith(MockitoExtension.class)
class WithdrawalServiceTest {

    // Mock the repositories so we don't modify the real database.
    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    // Inject our mocked repositories into WithdrawalService.
    @InjectMocks
    private WithdrawalService withdrawalService;

    // ==========================================
    // TEST 1: INVALID AMOUNT
    // Expected: 400 INVALID_AMOUNT
    // ==========================================

    @Test
    void shouldRejectZeroAmount() {

        // Attempt to withdraw $0.
        WithdrawRequest request =
            new WithdrawRequest("1000000009", 0L);

        // The service should throw an exception.
        ApiException exception = assertThrows(
            ApiException.class,
            () -> withdrawalService.withdraw(9L, request)
        );

        // Verify the HTTP status and error code.
        assertEquals(
            HttpStatus.BAD_REQUEST,
            exception.getStatus()
        );

        assertEquals(
            "INVALID_AMOUNT",
            exception.getCode()
        );

        // Invalid requests should not access the database.
        verifyNoInteractions(
            accountRepository,
            transactionRepository
        );
    }

    // ==========================================
    // TEST 2: INSUFFICIENT FUNDS
    // Expected: 422 INSUFFICIENT_FUNDS
    // ==========================================

    @Test
    void shouldRejectInsufficientFunds() {

        // Create mocked Account and User objects.
        Account account = mock(Account.class);
        User user = mock(User.class);

        // Simulate finding and locking the account.
        when(accountRepository
            .findByAccountNumberForUpdate("1000000009"))
            .thenReturn(Optional.of(account));

        // Account belongs to authenticated user 9.
        when(account.getUser()).thenReturn(user);
        when(user.getId()).thenReturn(9L);

        // Account has $0 available.
        when(account.getBalanceCents()).thenReturn(0L);

        // Attempt to withdraw $25.
        WithdrawRequest request =
            new WithdrawRequest("1000000009", 2500L);

        // Expect an exception.
        ApiException exception = assertThrows(
            ApiException.class,
            () -> withdrawalService.withdraw(9L, request)
        );

        // Verify HTTP 422.
        assertEquals(
            HttpStatus.UNPROCESSABLE_ENTITY,
            exception.getStatus()
        );

        // Verify the expected error code.
        assertEquals(
            "INSUFFICIENT_FUNDS",
            exception.getCode()
        );

        // Balance must not change.
        verify(account, never())
            .setBalanceCents(anyLong());

        // No transaction should be saved.
        verifyNoInteractions(transactionRepository);
    }

    // ==========================================
    // TEST 3: SUCCESSFUL WITHDRAWAL
    // Expected: Balance updated, transaction saved
    // ==========================================

    @Test
    void shouldWithdrawSuccessfully() {

        Account account = mock(Account.class);
        User user = mock(User.class);

        // Simulate finding and locking the account.
        when(accountRepository
            .findByAccountNumberForUpdate("1000000009"))
            .thenReturn(Optional.of(account));

        // Account belongs to user 9.
        when(account.getUser()).thenReturn(user);
        when(user.getId()).thenReturn(9L);

        when(account.getAccountNumber())
            .thenReturn("1000000009");

        // The service reads the balance three times:
        // 1. Check available funds: $100
        // 2. Calculate the new balance: $100
        // 3. Return the updated balance: $75
        when(account.getBalanceCents())
            .thenReturn(10000L, 10000L, 7500L);

        // Simulate saving and returning the transaction.
        when(transactionRepository.save(any(Transaction.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Withdraw $25.
        WithdrawRequest request =
            new WithdrawRequest("1000000009", 2500L);

        TransactionResponse response =
            withdrawalService.withdraw(9L, request);

        // Verify that $25 was deducted.
        verify(account).setBalanceCents(7500L);

        // Verify the new balance in the response.
        assertEquals(
            7500L,
            response.getNewBalanceCents()
        );

        // Verify the transaction response.
        assertEquals(
            "withdrawal",
            response.getTransaction().getType()
        );

        assertEquals(
            2500L,
            response.getTransaction().getAmountCents()
        );

        // Capture the transaction passed to the repository.
        ArgumentCaptor<Transaction> captor =
            ArgumentCaptor.forClass(Transaction.class);

        verify(transactionRepository).save(captor.capture());

        Transaction saved = captor.getValue();

        // Verify the saved transaction details.
        assertEquals(
            TransactionType.WITHDRAWAL,
            saved.getType()
        );

        assertEquals(
            2500L,
            saved.getAmountCents()
        );

        // The withdrawal must come from the correct account.
        assertSame(account, saved.getFromAccount());

        // Withdrawals have no destination account.
        assertNull(saved.getToAccount());
    }

    // ==========================================
    // TEST 4: UNAUTHORIZED ACCOUNT ACCESS
    // Expected: 401 UNAUTHORIZED
    // ==========================================

    @Test
    void shouldRejectWithdrawalFromAnotherUsersAccount() {

        Account account = mock(Account.class);
        User user = mock(User.class);

        // Simulate finding and locking the account.
        when(accountRepository
            .findByAccountNumberForUpdate("1000000009"))
            .thenReturn(Optional.of(account));

        // The account belongs to user 99.
        when(account.getUser()).thenReturn(user);
        when(user.getId()).thenReturn(99L);

        // User 9 attempts to withdraw from user 99's account.
        WithdrawRequest request =
            new WithdrawRequest("1000000009", 2500L);

        ApiException exception = assertThrows(
            ApiException.class,
            () -> withdrawalService.withdraw(9L, request)
        );

        // Verify unauthorized status.
        assertEquals(
            HttpStatus.UNAUTHORIZED,
            exception.getStatus()
        );

        assertEquals(
            "UNAUTHORIZED",
            exception.getCode()
        );

        // No funds should be deducted.
        verify(account, never())
            .setBalanceCents(anyLong());

        // No transaction should be saved.
        verifyNoInteractions(transactionRepository);
    }
}
