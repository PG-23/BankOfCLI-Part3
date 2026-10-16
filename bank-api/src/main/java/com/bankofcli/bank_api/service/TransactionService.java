package com.bankofcli.bank_api.service;

import org.springframework.stereotype.Service;
import com.bankofcli.bank_api.repository.TransactionRepository;
import jakarta.transaction.Transactional;

@Service 
public class TransactionService {
 
    private final TransactionRepository transactionRepo;

    public TransactionService(TransactionRepository transactionRepo){
        this.transactionRepo = transactionRepo;
    }
}
