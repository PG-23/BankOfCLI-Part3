package com.bankofcli.bank_api.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.bankofcli.bank_api.dto.RecipientResponse;
import com.bankofcli.bank_api.service.RecipientService;

@RestController 
public class RecipientController {
    private final RecipientService recipientService;

    public RecipientController(RecipientService recipientService) {
        this.recipientService = recipientService;
    }

    @GetMapping("/accounts/{accountNumber}")
    public RecipientResponse lookupRecipient(@PathVariable String accountNumber, Authentication authentication) {
        return recipientService.lookupRecipient(accountNumber, authentication.getName());
    }

}
