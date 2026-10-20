package com.bankofcli.bank_api.dto;

import java.util.List;

import com.bankofcli.bank_api.model.Transaction;

public record PageableTransaction(
    int maxPages,
    List<Transaction> transactions
) {
    
}