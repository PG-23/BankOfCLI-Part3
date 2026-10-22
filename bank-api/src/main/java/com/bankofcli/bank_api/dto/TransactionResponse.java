package com.bankofcli.bank_api.dto;

public class TransactionResponse {
    
    private final TransactionDto transaction;
    private final long newBalanceCents;


    public TransactionResponse(TransactionDto transaction, long newBalanceCents) {
        this.transaction = transaction;
        this.newBalanceCents = newBalanceCents;
    }


    public TransactionDto getTransaction() {
        return transaction;
    }


    public long getNewBalanceCents() {
        return newBalanceCents;
    }
    

    
}
