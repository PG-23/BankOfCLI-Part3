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

import com.bankofcli.bank_api.dto.ActivityResponse;
import com.bankofcli.bank_api.dto.DepositRequest;
import com.bankofcli.bank_api.dto.TransactionResponse;
import com.bankofcli.bank_api.dto.TransferRequest;
import com.bankofcli.bank_api.security.CurrentUser;
import com.bankofcli.bank_api.service.ActivityService;
import com.bankofcli.bank_api.service.TransactionService;
import com.bankofcli.bank_api.service.TransferService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/transactions")
public class TransactionController {
    private final TransferService transferService;
    private final ActivityService activityService;
    private final TransactionService transactionService;
    private final CurrentUser currentUser;

    public TransactionController(TransferService transferService, ActivityService activityService,
            TransactionService transactionService, CurrentUser currentUser) {
        this.transferService = transferService;
        this.activityService = activityService;
        this.transactionService = transactionService;
        this.currentUser = currentUser;
    }

    @PostMapping("/deposit")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse deposit(@Valid @RequestBody DepositRequest request, Authentication auth) {
        return transactionService.deposit(currentUser.id(auth), request);
    }

    @PostMapping("/transfer")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse transfer(@Valid @RequestBody TransferRequest request, Authentication auth) {
        // JWT subject is the user's database id
        Long userId = Long.valueOf(auth.getName());
        return transferService.transfer(userId, request);
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
