package com.bankofcli.bank_api.exception;

public class EmailTakenException extends RuntimeException {
    public EmailTakenException() {
        super("An account with this email already exists.");
    }
}