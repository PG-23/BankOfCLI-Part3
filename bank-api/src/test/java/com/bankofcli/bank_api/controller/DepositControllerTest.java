package com.bankofcli.bank_api.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.bankofcli.bank_api.dto.DepositRequest;
import com.bankofcli.bank_api.dto.TransactionDto;
import com.bankofcli.bank_api.dto.TransactionResponse;
import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.Transaction;
import com.bankofcli.bank_api.model.TransactionType;
import com.bankofcli.bank_api.model.User;
import com.bankofcli.bank_api.repository.UserRepository;
import com.bankofcli.bank_api.security.CurrentUser;
import com.bankofcli.bank_api.service.ActivityService;
import com.bankofcli.bank_api.service.TransactionService;
import com.bankofcli.bank_api.service.TransferService;
import com.bankofcli.bank_api.service.WithdrawalService;

// HTTP-level tests for POST /transactions/deposit: JSON parsing, validation, status codes and
// error bodies. The service is mocked; its rules are covered in TransactionServiceTest.
// Security filters are off, so the logged-in user is passed in with .principal(...).
@WebMvcTest(TransactionController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CurrentUser.class)
class DepositControllerTest {

    private static final String URL = "/transactions/deposit";
    private static final String ACCOUNT = "1000010001";

    @Autowired
    private MockMvc mvc;

    @MockitoBean private TransactionService transactionService;
    @MockitoBean private TransferService transferService;
    @MockitoBean private WithdrawalService withdrawalService;
    @MockitoBean private ActivityService activityService;
    @MockitoBean private UserRepository userRepository;

    private ResultActions deposit(String json) throws Exception {
        return mvc.perform(post(URL)
                .principal(new TestingAuthenticationToken("5", null))   // JWT subject = user id 5
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }

    private static TransactionResponse sampleResponse(long amount, long newBalance) {
        User user = new User("Test", "User", "tuser0001", "t@bank.com", "hash");
        Account account = new Account(user);
        ReflectionTestUtils.setField(account, "accountNumber", ACCOUNT);
        Transaction t = new Transaction(TransactionType.DEPOSIT, amount, null, account, null);
        ReflectionTestUtils.setField(t, "id", 52L);
        ReflectionTestUtils.setField(t, "timestamp", OffsetDateTime.parse("2026-10-20T20:22:43Z"));
        return new TransactionResponse(TransactionDto.from(t), newBalance);
    }

    // ---------- positive ----------

    // TEST 1: A valid deposit returns 201 with the contract's response shape.
    @Test
    void validDepositReturns201WithTransactionAndBalance() throws Exception {
        when(transactionService.deposit(eq(5L), any())).thenReturn(sampleResponse(2550, 12550));

        deposit("{\"accountNumber\":\"" + ACCOUNT + "\",\"amountCents\":2550}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.newBalanceCents").value(12550))
                .andExpect(jsonPath("$.transaction.id").value("TXN-20261020-000052"))
                .andExpect(jsonPath("$.transaction.type").value("deposit"))
                .andExpect(jsonPath("$.transaction.amountCents").value(2550))
                .andExpect(jsonPath("$.transaction.fromAccountNumber").doesNotExist())
                .andExpect(jsonPath("$.transaction.toAccountNumber").value(ACCOUNT))
                .andExpect(jsonPath("$.transaction.timestamp").value("2026-10-20T20:22:43Z"));
    }

    // TEST 2: The service receives the logged-in user's id and the request as sent.
    @Test
    void passesLoggedInUserIdAndRequestToService() throws Exception {
        when(transactionService.deposit(anyLong(), any())).thenReturn(sampleResponse(100, 100));

        deposit("{\"accountNumber\":\"" + ACCOUNT + "\",\"amountCents\":100}")
                .andExpect(status().isCreated());

        verify(transactionService).deposit(5L, new DepositRequest(ACCOUNT, 100L));
    }

    // TEST 3: A whole number written as a JSON integer is accepted at the max limit.
    @Test
    void acceptsMaximumAmountAsJsonNumber() throws Exception {
        when(transactionService.deposit(anyLong(), any()))
                .thenReturn(sampleResponse(TransactionService.MAX_AMOUNT_CENTS, TransactionService.MAX_AMOUNT_CENTS));

        deposit("{\"accountNumber\":\"" + ACCOUNT + "\",\"amountCents\":10000000000}")
                .andExpect(status().isCreated());

        verify(transactionService).deposit(5L, new DepositRequest(ACCOUNT, 10_000_000_000L));
    }

    // ---------- negative: amount ----------

    // TEST 4: A decimal amount is rejected, not rounded down to 10 cents.
    @Test
    void decimalAmountIsRejected() throws Exception {
        deposit("{\"accountNumber\":\"" + ACCOUNT + "\",\"amountCents\":10.5}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_AMOUNT"))
                .andExpect(jsonPath("$.field").value("amountCents"));

        verifyNoInteractions(transactionService);
    }

    // TEST 5: Text instead of a number is an amount error.
    @Test
    void textAmountIsRejected() throws Exception {
        deposit("{\"accountNumber\":\"" + ACCOUNT + "\",\"amountCents\":\"abc\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_AMOUNT"))
                .andExpect(jsonPath("$.field").value("amountCents"));

        verifyNoInteractions(transactionService);
    }

    // TEST 6: An amount the service rejects (e.g. 0) comes back as 400 INVALID_AMOUNT.
    @Test
    void serviceAmountErrorBecomes400() throws Exception {
        when(transactionService.deposit(anyLong(), any())).thenThrow(new ApiException(HttpStatus.BAD_REQUEST,
                "INVALID_AMOUNT", "Enter an amount between $0.01 and $100,000,000.", "amountCents"));

        deposit("{\"accountNumber\":\"" + ACCOUNT + "\",\"amountCents\":0}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_AMOUNT"))
                .andExpect(jsonPath("$.message").value("Enter an amount between $0.01 and $100,000,000."))
                .andExpect(jsonPath("$.field").value("amountCents"));
    }

    // ---------- negative: account number ----------

    // TEST 7: Missing account number fails validation before the service runs.
    @Test
    void missingAccountNumberIsRejected() throws Exception {
        deposit("{\"amountCents\":2550}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.field").value("accountNumber"));

        verifyNoInteractions(transactionService);
    }

    // TEST 8: An account number that isn't exactly 10 digits is rejected.
    @Test
    void badlyFormattedAccountNumberIsRejected() throws Exception {
        for (String bad : new String[] {"12ab", "123456789", "12345678901", "10000abcde"}) {
            deposit("{\"accountNumber\":\"" + bad + "\",\"amountCents\":2550}")
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.field").value("accountNumber"))
                    .andExpect(jsonPath("$.message").value("Account number must be 10 digits."));
        }
        verifyNoInteractions(transactionService);
    }

    // TEST 9: Someone else's account comes back as 401 UNAUTHORIZED.
    @Test
    void depositToAnotherUsersAccountReturns401() throws Exception {
        when(transactionService.deposit(anyLong(), any())).thenThrow(new ApiException(HttpStatus.UNAUTHORIZED,
                "UNAUTHORIZED", "You can only deposit to your own account.", "accountNumber"));

        deposit("{\"accountNumber\":\"1000001234\",\"amountCents\":2550}")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.message").value("You can only deposit to your own account."))
                .andExpect(jsonPath("$.field").value("accountNumber"));
    }

    // ---------- negative: request body and login ----------

    // TEST 10: A body that isn't valid JSON is a 400, not a 500.
    @Test
    void malformedJsonIsRejected() throws Exception {
        deposit("{\"accountNumber\": ")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("Request body is not valid JSON."));

        verifyNoInteractions(transactionService);
    }

    // TEST 11: An empty body is a 400.
    @Test
    void emptyBodyIsRejected() throws Exception {
        deposit("")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

        verifyNoInteractions(transactionService);
    }

    // TEST 12: No logged-in user is a 401 and nothing is deposited.
    @Test
    void notLoggedInReturns401() throws Exception {
        mvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"accountNumber\":\"" + ACCOUNT + "\",\"amountCents\":2550}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        verifyNoInteractions(transactionService);
    }
}
