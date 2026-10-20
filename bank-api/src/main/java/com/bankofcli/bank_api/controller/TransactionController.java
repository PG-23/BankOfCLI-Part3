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
import com.bankofcli.bank_api.service.ActivityService;
import com.bankofcli.bank_api.service.TransferService;

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
    private final TransferService transferService;
    private final ActivityService activityService;
    private final TransactionService transactionService;

    public TransactionController(TransferService transferService, ActivityService activityService, TransactionService transactionService) {
        this.transferService = transferService;
        this.activityService = activityService;
        this.transactionService = transactionService;
    }

    @PostMapping("/transfer")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse transfer(@Valid @RequestBody TransferRequest request, Authentication auth) {
        // JWT subject is the user's database id
        Long userId = Long.valueOf(auth.getName());
        return transferService.transfer(userId, request);
    }
    
    // Angular Transaction
    @GetMapping("/transactions")
    public List<TransactionDto> getMethodName(@AuthenticationPrincipal Jwt jwt) {
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

    // GET /api/transactions/activity?
    @GetMapping("/activity")
    public ActivityResponse activity(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime since,
            Authentication auth) {
        Long userId = Long.valueOf(auth.getName());
        return activityService.getActivity(userId, since);
    }
}
