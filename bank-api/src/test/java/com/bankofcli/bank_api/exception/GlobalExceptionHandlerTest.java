
package com.bankofcli.bank_api.exception;

import com.bankofcli.bank_api.dto.ApiError;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    @Test
    void shouldReturnValidationError() {

        Object request = new Object();

        var bindingResult =
                new BeanPropertyBindingResult(request, "request");

        bindingResult.addError(new FieldError(
                "request",
                "amountCents",
                "Amount must be greater than zero."
        ));

        var exception = new MethodArgumentNotValidException(
                null,
                bindingResult
        );

        var handler = new GlobalExceptionHandler();

        ResponseEntity<ApiError> response =
                handler.handleValidation(exception);

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode()
        );

        ApiError error = response.getBody();
        assertNotNull(error);

        assertEquals("VALIDATION_ERROR", error.code());
        assertEquals("amountCents", error.field());
        assertEquals(
                "Amount must be greater than zero.",
                error.message()
        );
    }

    @Test
    void shouldReturnWeakPasswordError() {

        Object request = new Object();

        var bindingResult =
                new BeanPropertyBindingResult(request, "request");

        bindingResult.addError(new FieldError(
                "request",
                "password",
                "Password does not meet requirements."
        ));

        var exception = new MethodArgumentNotValidException(
                null,
                bindingResult
        );

        var handler = new GlobalExceptionHandler();

        ResponseEntity<ApiError> response =
                handler.handleValidation(exception);

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode()
        );

        ApiError error = response.getBody();
        assertNotNull(error);

        assertEquals("WEAK_PASSWORD", error.code());
        assertEquals("password", error.field());
        assertEquals(
                "Password does not meet requirements.",
                error.message()
        );
    }

    @Test
    void shouldReturnMethodNotAllowedError() {

        var exception =
                new HttpRequestMethodNotSupportedException("POST");

        var handler = new GlobalExceptionHandler();

        ResponseEntity<ApiError> response =
                handler.handleMethodNotAllowed(exception);

        assertEquals(
                HttpStatus.METHOD_NOT_ALLOWED,
                response.getStatusCode()
        );

        ApiError error = response.getBody();
        assertNotNull(error);

        assertEquals("VALIDATION_ERROR", error.code());

        assertEquals(
                "HTTP method is not supported for this endpoint.",
                error.message()
        );

        assertNull(error.field());
    }
}
