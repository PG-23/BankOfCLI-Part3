package com.bankofcli.bank_api.dto;

public record AuthResponse(UserDto user, AccountDto account, String token) {}