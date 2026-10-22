package com.bankofcli.bank_api.service;
import org.springframework.stereotype.Service;

import org.springframework.stereotype.Service;

import com.bankofcli.bank_api.dto.DashboardResponse;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.User;
import com.bankofcli.bank_api.repository.AccountRepository;

@Service 
public class AccountService {
    private final AccountRepository accountRepo;
    private final UserService userService;

    AccountService(AccountRepository accountRepo, UserService userService){
        this.accountRepo = accountRepo;
        this.userService = userService;
    }

    public Account getAccountByUserId(long userId){
        return accountRepo.findByUserId(userId).orElseThrow(() -> new IllegalStateException("Account not found."));
    }

    public DashboardResponse getDashboardInfo(long userId){
        User user = userService.getSignedInUser(userId);

        Account account = getAccountByUserId(userId);

        return DashboardResponse.from(user, account);
    }
}
