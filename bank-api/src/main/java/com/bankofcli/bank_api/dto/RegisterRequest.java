package com.bankofcli.bank_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "First name is required.")
        @Size(max = 50, message = "First name must be 50 characters or fewer.")
        @Pattern(regexp = ".*\\p{L}.*", message = "First name must contain at least one letter.")
        String firstName,

        @NotBlank(message = "Last name is required.")
        @Size(max = 50, message = "Last name must be 50 characters or fewer.")
        @Pattern(regexp = ".*\\p{L}.*", message = "Last name must contain at least one letter.")
        String lastName,

        @NotBlank(message = "Email is required.")
        @Size(max = 255, message = "Email must be 255 characters or fewer.")
        @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message = "Enter a valid email address.")
        String email,

        @NotBlank(message = "Password is required.")
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters.")
        @Pattern(regexp = ".*\\d.*", message = "Password must contain at least one number.")
        String password
) {}