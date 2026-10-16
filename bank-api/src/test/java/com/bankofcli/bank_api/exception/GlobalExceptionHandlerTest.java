
package com.bankofcli.bank_api.exception;

import com.bankofcli.bank_api.dto.ApiError;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    @Test
    void shouldReturnValidationError() {

        // Simulate a request containing an invalid amount.
        Object request = new Object();

        var bindingResult =
            new BeanPropertyBindingResult(request, "request");

        bindingResult.addError(new FieldError(
            "request",
            "amountCents",
            "Amount must be greater than zero."
        ));

        // Simulate the validation exception.
        var exception = new MethodArgumentNotValidException(
            null,
            bindingResult
        );

        // Call our global exception handler.
        var handler = new GlobalExceptionHandler();

        ResponseEntity<ApiError> response =
            handler.handleValidation(exception);

        // Verify the HTTP status.
        assertEquals(HttpStatus.BAD_REQUEST,
                     response.getStatusCode());

        // Verify the error response fields.
        ApiError error = response.getBody();
        assertNotNull(error);

        assertEquals("VALIDATION_ERROR", error.code());
        assertEquals("amountCents", error.field());
        assertEquals(
            "Amount must be greater than zero.",
            error.message()
        );
    }
}
