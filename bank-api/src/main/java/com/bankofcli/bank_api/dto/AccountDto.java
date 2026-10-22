package com.bankofcli.bank_api.dto;

import com.bankofcli.bank_api.model.Account;

public record AccountDto(String accountNumber, long balanceCents, String userId) {

    public static AccountDto from(Account account) {
        return new AccountDto(account.getAccountNumber(), account.getBalanceCents(),
                UserDto.publicId(account.getUser().getId()));
    }
}