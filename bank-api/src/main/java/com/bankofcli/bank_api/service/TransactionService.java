package com.bankofcli.bank_api.service;

import java.util.List;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.bankofcli.bank_api.repository.TransactionRepository;
import org.springframework.transaction.annotation.Transactional;

import com.bankofcli.bank_api.model.Transaction;

@Service 
public class TransactionService {
 
    private final TransactionRepository transactionRepo;

    public TransactionService(TransactionRepository transactionRepo){
        this.transactionRepo = transactionRepo;
    }

    // Gets all of the transactions from the database
    // I think the Angular team needed this function for their frontend so it will exist on it's own
    @Transactional(readOnly = true)
    public List<Transaction> getAllTransactions(long accountId){
        return transactionRepo.getAllFromAccountId(accountId);
    }

    // This is the service that React needs to use to get pages transaction lists. 
    @Transactional 
    public Page<Transaction> getAllTransactionPaginated(long accountId, Pageable pageable){
        return transactionRepo.getPageFromAccountId(accountId, pageable);
    }
}
