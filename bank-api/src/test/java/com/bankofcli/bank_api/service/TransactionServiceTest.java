package com.bankofcli.bank_api.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import com.bankofcli.bank_api.dto.DepositRequest;
import com.bankofcli.bank_api.dto.TransactionResponse;
import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.Transaction;
import com.bankofcli.bank_api.model.User;
import com.bankofcli.bank_api.repository.AccountRepository;
import com.bankofcli.bank_api.repository.TransactionRepository;

class TransactionServiceTest {

    private static final Long ALICE_ID = 1L;
    private static final String ALICE_ACCOUNT = "1000001234";

    private TransactionRepository transactionRepo;
    private AccountRepository accountRepo;
    private TransactionService service;
    private Account aliceAccount;

    @BeforeEach
    void setUp() {
        transactionRepo = mock(TransactionRepository.class);
        accountRepo = mock(AccountRepository.class);
        service = new TransactionService(transactionRepo, accountRepo);

        // Alice owns account 1000001234 with $100.00. Ids normally come from the database.
        User alice = new User("Alice", "Smith", "asmith1234", "alice@bank.com", "hash");
        ReflectionTestUtils.setField(alice, "id", ALICE_ID);
        aliceAccount = new Account(alice);
        ReflectionTestUtils.setField(aliceAccount, "accountNumber", ALICE_ACCOUNT);
        aliceAccount.setBalanceCents(10000);

        when(accountRepo.findByAccountNumberForUpdate(ALICE_ACCOUNT)).thenReturn(Optional.of(aliceAccount));
        // Pretend the database assigned id 7 on insert.
        when(transactionRepo.save(any(Transaction.class))).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            ReflectionTestUtils.setField(t, "id", 7L);
            return t;
        });
    }

    // TEST 1: A valid deposit adds to the balance and records a DEPOSIT.
    @Test
    void depositAddsToBalanceAndRecordsTransaction() {
        TransactionResponse response = service.deposit(ALICE_ID, new DepositRequest(ALICE_ACCOUNT, 2550L));

        assertEquals(12550, response.getNewBalanceCents());
        assertEquals(12550, aliceAccount.getBalanceCents());
        assertEquals("deposit", response.getTransaction().getType());
        assertEquals(2550, response.getTransaction().getAmountCents());
        assertNull(response.getTransaction().getFromAccountNumber());
        assertEquals(ALICE_ACCOUNT, response.getTransaction().getToAccountNumber());
        assertTrue(response.getTransaction().getId().matches("TXN-\\d{8}-000007"));
        verify(transactionRepo).save(any(Transaction.class));
    }

    // TEST 2: The largest allowed amount ($100,000,000) is accepted.
    @Test
    void depositAcceptsMaximumAmount() {
        TransactionResponse response = service.deposit(ALICE_ID,
                new DepositRequest(ALICE_ACCOUNT, TransactionService.MAX_AMOUNT_CENTS));

        assertEquals(10000 + TransactionService.MAX_AMOUNT_CENTS, response.getNewBalanceCents());
    }

    // TEST 3: Missing, zero, negative and over-the-limit amounts are rejected before touching the account.
    @Test
    void depositRejectsInvalidAmounts() {
        Long[] badAmounts = {null, 0L, -500L, TransactionService.MAX_AMOUNT_CENTS + 1};
        for (Long amount : badAmounts) {
            ApiException ex = assertThrows(ApiException.class,
                    () -> service.deposit(ALICE_ID, new DepositRequest(ALICE_ACCOUNT, amount)),
                    "amount " + amount);
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("INVALID_AMOUNT", ex.getCode());
            assertEquals("amountCents", ex.getField());
        }
        verifyNoInteractions(accountRepo, transactionRepo);
        assertEquals(10000, aliceAccount.getBalanceCents());
    }

    // TEST 4: Depositing into someone else's account is rejected and changes nothing.
    @Test
    void depositRejectsAccountOwnedByAnotherUser() {
        Long bobId = 2L;

        ApiException ex = assertThrows(ApiException.class,
                () -> service.deposit(bobId, new DepositRequest(ALICE_ACCOUNT, 2550L)));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertEquals("UNAUTHORIZED", ex.getCode());
        assertEquals(10000, aliceAccount.getBalanceCents());
        verifyNoInteractions(transactionRepo);
    }

    // TEST 5: An account number that doesn't exist gets the same 401 (no hint that it doesn't exist).
    @Test
    void depositRejectsUnknownAccount() {
        when(accountRepo.findByAccountNumberForUpdate("9999999999")).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> service.deposit(ALICE_ID, new DepositRequest("9999999999", 2550L)));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertEquals("UNAUTHORIZED", ex.getCode());
        verifyNoInteractions(transactionRepo);
    }
}
