package com.bankofcli.bank_api.dto;


import org.springframework.data.domain.Page;

import com.bankofcli.bank_api.model.Transaction;

public record PageableTransaction(
    int maxPages,
    Page<Transaction> transactions
) {
    
}