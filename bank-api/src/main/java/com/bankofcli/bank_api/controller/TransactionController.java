
package com.bankofcli.bank_api.controller;

import java.time.OffsetDateTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.bankofcli.bank_api.dto.TransactionDto;
import com.bankofcli.bank_api.dto.TransactionResponse;
import com.bankofcli.bank_api.dto.TransferRequest;
import com.bankofcli.bank_api.service.TransactionService;
import com.bankofcli.bank_api.dto.ActivityResponse;
import com.bankofcli.bank_api.dto.ActivityResponse;
import com.bankofcli.bank_api.dto.DepositRequest;
import com.bankofcli.bank_api.dto.TransactionResponse;
import com.bankofcli.bank_api.dto.TransferRequest;
import com.bankofcli.bank_api.dto.WithdrawRequest;

import com.bankofcli.bank_api.security.CurrentUser;
import com.bankofcli.bank_api.service.ActivityService;
import com.bankofcli.bank_api.service.TransactionService;
import com.bankofcli.bank_api.service.TransferService;
import com.bankofcli.bank_api.service.WithdrawalService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    // Services that handle the business logic
    private final TransferService transferService;
    private final ActivityService activityService;
    private final TransactionService transactionService;
    private final CurrentUser currentUser;
    private final WithdrawalService withdrawalService;

    public TransactionController(TransferService transferService, ActivityService activityService,
            TransactionService transactionService, WithdrawalService withdrawalService, CurrentUser currentUser) {
        this.transferService = transferService;
        this.activityService = activityService;
        this.transactionService = transactionService;
        this.withdrawalService = withdrawalService;
        this.currentUser = currentUser;
    }

    @PostMapping("/deposit")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse deposit(@Valid @RequestBody DepositRequest request, Authentication auth) {
        return transactionService.deposit(currentUser.id(auth), request);
    }

    // ==========================================
    // TRANSFER ENDPOINT
    // POST /api/transactions/transfer
    // ==========================================

    @PostMapping("/transfer")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse transfer(
            @Valid @RequestBody TransferRequest request,
            Authentication auth) {

        // Get the authenticated user's ID
        Long userId = Long.valueOf(auth.getName());

        // Call the transfer service
        return transferService.transfer(userId, request);
    }
    
    // Angular Transaction
    @GetMapping("")
    public List<TransactionDto> getAllTransactions(@AuthenticationPrincipal Jwt jwt) {
        long accountId = Long.parseLong(jwt.getSubject());
        return transactionService.getAllTransactions(accountId);
    }
    
    // React Endpoint
    @GetMapping("/transactions/paged")
    public Page<TransactionDto> getPagedTransactions(@AuthenticationPrincipal Jwt jwt, @PageableDefault(
        size = 5,
        sort = "timestamp",
        direction = Sort.Direction.DESC
    ) Pageable pageable) {
        long userId = Long.parseLong(jwt.getSubject());
        return transactionService.getAllTransactionPaginated(userId, pageable);
    }

    // ==========================================
    // WITHDRAWAL ENDPOINT
    // POST /api/transactions/withdraw
    // ==========================================

    @PostMapping("/withdraw")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse withdraw(
            @Valid @RequestBody WithdrawRequest request,
            Authentication auth) {

        // Get the authenticated user's ID from the JWT
        Long userId = Long.valueOf(auth.getName());

        // Call our withdrawal service
        return withdrawalService.withdraw(userId, request);
    }

    // ==========================================
    // ACTIVITY ENDPOINT
    // GET /api/transactions/activity
    // ==========================================

    @GetMapping("/activity")
    public ActivityResponse activity(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime since,
            Authentication auth) {

        // Get the authenticated user's ID
        Long userId = Long.valueOf(auth.getName());

        // Get the user's transaction activity
        return activityService.getActivity(userId, since);
    }
}
