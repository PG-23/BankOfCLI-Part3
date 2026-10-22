package com.bankofcli.bank_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// amountCents is checked in TransactionService so a bad amount returns INVALID_AMOUNT (contract §4).
public record DepositRequest(
        @NotBlank(message = "Account number is required.")
        @Pattern(regexp = "\\d{10}", message = "Account number must be 10 digits.")
        String accountNumber,

        Long amountCents
) {}
