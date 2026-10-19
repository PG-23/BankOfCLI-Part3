package com.bankofcli.bank_api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

// Defines the structure of an error response sent to the frontend.
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
    String code,
    String message,
    String field
) {
}
