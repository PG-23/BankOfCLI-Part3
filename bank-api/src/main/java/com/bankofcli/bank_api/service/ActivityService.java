package com.bankofcli.bank_api.service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bankofcli.bank_api.dto.ActivityResponse;
import com.bankofcli.bank_api.dto.TransactionDto;
import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.repository.AccountRepository;
import com.bankofcli.bank_api.repository.TransactionRepository;

@Service
public class ActivityService {
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    public ActivityService(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    //readonly: no locks or write needed, and keep the session open while building DTOs
    @Transactional(readOnly = true)
    public ActivityResponse getActivity(Long userId, OffsetDateTime since){
        Account account = accountRepository.findByUserId(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,"ACCOUNT_NOT_FOUND", "No account found for this user.",null) );


        //Contract: since defaults to null, meaning the whole history 
        OffsetDateTime from = since != null ? since : OffsetDateTime.ofInstant(Instant.EPOCH,ZoneOffset.UTC);

        List<TransactionDto> transactions = transactionRepository.findActivitySince(account, from)
            .stream()
            .map(TransactionDto::from)
            .toList();

        return new ActivityResponse(transactions);

        
    }

}
