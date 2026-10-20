
package com.bankofcli.bank_api.dto;

// DTO for incoming withdrawal requests.
public class WithdrawRequest {

    private String accountNumber;
    private Long amountCents;

    // Required for JSON deserialization by Jackson.
    public WithdrawRequest() {
    }

    // Constructor for creating a withdrawal request.
    public WithdrawRequest(String accountNumber, Long amountCents) {
        this.accountNumber = accountNumber;
        this.amountCents = amountCents;
    }

    // Getters
    public String getAccountNumber() {
        return accountNumber;
    }

    public Long getAmountCents() {
        return amountCents;
    }

    // Setters
    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public void setAmountCents(Long amountCents) {
        this.amountCents = amountCents;
    }
}
