package com.bankofcli.bank_api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.bankofcli.bank_api.dto.TransactionDto;
import com.bankofcli.bank_api.dto.TransactionResponse;
import com.bankofcli.bank_api.dto.TransferRequest;
import com.bankofcli.bank_api.service.TransactionService;
import com.bankofcli.bank_api.service.TransferService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

import com.bankofcli.bank_api.model.Transaction;

@RestController 
@RequestMapping("/transaction")
public class TransactionController {
    private final TransferService transferService;
    private final TransactionService transactionService;

    public TransactionController(TransferService transferService, TransactionService transactionService) {
        this.transferService = transferService;
        this.transactionService = transactionService;
    }

    @PostMapping("/transfer")
    @ResponseStatus (HttpStatus.CREATED)
    public TransactionResponse transfer(@Valid @RequestBody TransferRequest request,Authentication auth){
        //JWT subject is the user's database id
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

}
