package com.bankofcli.bank_api.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.bankofcli.bank_api.dto.RecipientResponse;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.BankUser;
import com.bankofcli.bank_api.repository.AccountRepository;

@Service
public class RecipientService {

    private final AccountRepository accountRepository;

    public RecipientService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public RecipientResponse lookupRecipient(String accountNumber, String currentUsername) {
        // find the account or display 404 if no exist
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ACCOUNT_NOT_FOUND"));

        BankUser owner = account.getBankUser();

        // block looking up own account (aka no transfer to yourself)
        if (owner.getUsername().equals(currentUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SAME_ACCOUNT_TRANSFER");
        }

        // return only the owner's name and the account number
        return new RecipientResponse(owner.getFirstName(), owner.getLastName(), account.getAccountNumber());
    }
}
