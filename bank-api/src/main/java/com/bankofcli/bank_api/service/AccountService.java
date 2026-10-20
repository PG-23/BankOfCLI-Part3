package com.bankofcli.bank_api.service;
import org.springframework.stereotype.Service;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.User;
import com.bankofcli.bank_api.repository.AccountRepository;

@Service 
public class AccountService {
    private final AccountRepository accountRepo;

    AccountService(AccountRepository accountRepo){
        this.accountRepo = accountRepo;
    }
    
    public Account getAccountByUserId(long userId){
        return accountRepo.findByUserId(userId).orElseThrow(() -> new IllegalStateException("Account not found."));
    }
}