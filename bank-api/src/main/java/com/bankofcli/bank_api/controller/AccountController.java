package com.bankofcli.bank_api.controller;

import org.springframework.web.bind.annotation.RestController;

import com.bankofcli.bank_api.dto.DashboardResponse;
import com.bankofcli.bank_api.service.AccountService;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;

@RestController 
@RequestMapping("/account")
public class AccountController {

    AccountService accountService;

    public AccountController(AccountService accountService){
        this.accountService = accountService;
    }

    @GetMapping("/me")
    public DashboardResponse getDashboardData(@AuthenticationPrincipal Jwt jwt) {
        long userId = Long.parseLong(jwt.getSubject());
        return accountService.getDashboardInfo(userId);
    }
    
}
