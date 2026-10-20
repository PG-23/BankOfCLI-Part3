package com.bankofcli.bank_api.dto;

import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.User;

public record DashboardResponse(String firstName, String lastName, String username, String email, String accountNumber, long balanceCents) {
 
    public static DashboardResponse from (User user, Account account){
        return new DashboardResponse(user.getFirstName(),
            user.getLastName(),
            user.getUsername(),
            user.getEmail(),
            account.getAccountNumber(),
            account.getBalanceCents()
        );
    }
}
