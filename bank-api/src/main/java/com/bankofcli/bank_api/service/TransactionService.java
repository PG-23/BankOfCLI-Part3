package com.bankofcli.bank_api.service;

import java.util.List;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.bankofcli.bank_api.repository.TransactionRepository;
import org.springframework.transaction.annotation.Transactional;

import com.bankofcli.bank_api.dto.TransactionDto;
import com.bankofcli.bank_api.model.Transaction;

@Service 
public class TransactionService {
 
    private final TransactionRepository transactionRepo;
    private final AccountService accountService;

    public TransactionService(TransactionRepository transactionRepo, AccountService accountService){
        this.transactionRepo = transactionRepo;
        this.accountService = accountService;
    }

    // Gets all of the transactions from the database
    // I think the Angular team needed this function for their frontend so it will exist on it's own
    @Transactional(readOnly = true)
    public List<TransactionDto> getAllTransactions(long userId){
        long accountId = accountService.getAccountByUserId(userId).getId();
        List<Transaction> transactions = transactionRepo.getAllFromAccountId(accountId);
        List<TransactionDto> updatedTransactions = transactions.stream().map(transaction -> TransactionDto.from(transaction)).toList();
        return updatedTransactions;
    }

    // This is the service that React needs to use to get pages transaction lists. 
    @Transactional   (readOnly = true)
    public Page<TransactionDto> getAllTransactionPaginated(long userId, Pageable pageable){
        long accountId = accountService.getAccountByUserId(userId).getId();
        Page<Transaction> transactions = transactionRepo.getPageFromAccountId(accountId, pageable);
        return transactions.map(TransactionDto::from);
    }
}
