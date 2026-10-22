package com.bankofcli.bank_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Username or email is required.")
        @Size(max = 255, message = "Username or email must be 255 characters or fewer.")
        String identifier,
        @NotBlank(message = "Password is required.")
        @Size(max = 72, message = "Password must be 72 characters or fewer.")
        String password
        ) {}
