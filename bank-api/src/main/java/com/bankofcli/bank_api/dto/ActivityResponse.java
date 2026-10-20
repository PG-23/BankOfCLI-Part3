package com.bankofcli.bank_api.dto;

import java.util.List;

public class ActivityResponse {
    private final List<TransactionDto> transactions;

    public ActivityResponse(List<TransactionDto> transactions) {
        this.transactions = transactions;
    }
    public List<TransactionDto> getTransactions(){
        return transactions;
    }

}
