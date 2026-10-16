
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

    // TEST 1: Verify regular validation errors return VALIDATION_ERROR.
    @Test
    void shouldReturnValidationError() {

        // Simulate a request with an invalid amount.
        Object request = new Object();

        var bindingResult =
            new BeanPropertyBindingResult(request, "request");

        bindingResult.addError(new FieldError(
            "request",
            "amountCents",
            "Amount must be greater than zero."
        ));

        // Create a simulated validation exception.
        var exception = new MethodArgumentNotValidException(
            null,
            bindingResult
        );

        // Call the global exception handler.
        var handler = new GlobalExceptionHandler();

        ResponseEntity<ApiError> response =
            handler.handleValidation(exception);

        // Verify the HTTP status is 400 Bad Request.
        assertEquals(
            HttpStatus.BAD_REQUEST,
            response.getStatusCode()
        );

        // Verify the error response.
        ApiError error = response.getBody();
        assertNotNull(error);

        assertEquals("VALIDATION_ERROR", error.code());
        assertEquals("amountCents", error.field());
        assertEquals(
            "Amount must be greater than zero.",
            error.message()
        );
    }

    // TEST 2: Verify password errors return WEAK_PASSWORD.
    @Test
    void shouldReturnWeakPasswordError() {

        // Simulate a request with an invalid password.
        Object request = new Object();

        var bindingResult =
            new BeanPropertyBindingResult(request, "request");

        bindingResult.addError(new FieldError(
            "request",
            "password",
            "Password does not meet requirements."
        ));

        // Create a simulated validation exception.
        var exception = new MethodArgumentNotValidException(
            null,
            bindingResult
        );

        // Call the global exception handler.
        var handler = new GlobalExceptionHandler();

        ResponseEntity<ApiError> response =
            handler.handleValidation(exception);

        // Verify the HTTP status is 400 Bad Request.
        assertEquals(
            HttpStatus.BAD_REQUEST,
            response.getStatusCode()
        );

        // Verify the password-specific error response.
        ApiError error = response.getBody();
        assertNotNull(error);

        assertEquals("WEAK_PASSWORD", error.code());
        assertEquals("password", error.field());
        assertEquals(
            "Password does not meet requirements.",
            error.message()
        );
    }
}
