package com.bankofcli.bank_api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.bankofcli.bank_api.dto.TransferRequest;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.User;
import com.bankofcli.bank_api.repository.AccountRepository;
import com.bankofcli.bank_api.repository.TransactionRepository;
import com.bankofcli.bank_api.repository.UserRepository;

// Not @Transactional on purpose: the service must commit or roll back for real
@SpringBootTest
class TransferServiceRollbackTest {

    @Autowired private TransferService transferService;
    @Autowired private UserRepository userRepository;
    @Autowired private AccountRepository accountRepository;

    // Fake repository so we can make saving the Transaction fail on purpose
    @MockitoBean private TransactionRepository transactionRepository;

    @Test
    void failedTransferRollsBackBothBalances() {
        String tag = UUID.randomUUID().toString().substring(0, 8);
        User alice = userRepository.save(new User("Alice", "Test", "alice" + tag, "alice" + tag + "@test.com", "x"));
        User bob = userRepository.save(new User("Bob", "Test", "bob" + tag, "bob" + tag + "@test.com", "x"));

        try {
            Account aliceAccount = new Account(alice);
            aliceAccount.setBalanceCents(100_000);
            aliceAccount = accountRepository.save(aliceAccount);
            Account bobAccount = accountRepository.save(new Account(bob));

            // Fail AFTER both balances have been changed in memory
            when(transactionRepository.save(any()))
                    .thenThrow(new RuntimeException("Simulated failure after money moved"));

            TransferRequest req = new TransferRequest();
            req.setFromAccountNumber(aliceAccount.getAccountNumber());
            req.setToAccountNumber(bobAccount.getAccountNumber());
            req.setAmountCents(5000L);

            assertThrows(RuntimeException.class, () -> transferService.transfer(alice.getId(), req));

            // Read fresh from the database: nothing may have changed
            assertEquals(100_000, accountRepository.findById(aliceAccount.getId()).orElseThrow().getBalanceCents());
            assertEquals(0, accountRepository.findById(bobAccount.getId()).orElseThrow().getBalanceCents());
        } finally {
            // Clean up; ON DELETE CASCADE removes their accounts too
            userRepository.deleteAll(List.of(alice, bob));
        }
    }
}

