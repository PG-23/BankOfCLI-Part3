
package com.bankofcli.bank_api.exception;

import com.bankofcli.bank_api.dto.ApiError;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles validation errors from incoming API requests.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException ex) {

        // Get the first field that failed validation.
        var fieldError = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .orElse(null);

        String field = fieldError != null
                ? fieldError.getField() : null;

        String message = fieldError != null
                ? fieldError.getDefaultMessage()
                : "Invalid request.";

        // Create the standardized error response.
        ApiError error = new ApiError(
                "VALIDATION_ERROR",
                message,
                field
        );

        // Return HTTP 400 Bad Request with the error.
        return ResponseEntity.badRequest().body(error);
    }
}
