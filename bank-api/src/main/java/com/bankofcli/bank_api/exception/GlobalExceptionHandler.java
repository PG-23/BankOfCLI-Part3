
package com.bankofcli.bank_api.exception;

import com.bankofcli.bank_api.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import tools.jackson.core.JacksonException;

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

        // Password failures use WEAK_PASSWORD.
        // All other validation failures use VALIDATION_ERROR.
        String code = "password".equals(field)
                ? "WEAK_PASSWORD"
                : "VALIDATION_ERROR";

        // Create the standardized error response.
        ApiError error = new ApiError(
                code,
                message,
                field
        );

        // Return HTTP 400 Bad Request.
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(EmailTakenException.class)
    public ResponseEntity<ApiError> handleEmailTaken(EmailTakenException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError("EMAIL_TAKEN", ex.getMessage(), "email"));
    }

    @ExceptionHandler (ApiException.class)
    public ResponseEntity<ApiError> handleApi(ApiException ex){
        return ResponseEntity.status(ex.getStatus())
            .body(new ApiError(ex.getCode(),ex.getMessage(),ex.getField()));
    }

    // Body is not valid JSON, or a field has the wrong type (e.g. "amountCents": 10.5 or "abc").
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex) {
        String field = ex.getCause() instanceof JacksonException je && !je.getPath().isEmpty()
                ? je.getPath().get(je.getPath().size() - 1).getPropertyName()
                : null;

        // A bad amount is still an amount problem, so the UI shows it under the amount input.
        if ("amountCents".equals(field)) {
            return ResponseEntity.badRequest().body(new ApiError("INVALID_AMOUNT",
                    "Amount must be a whole number of cents.", field));
        }
        return ResponseEntity.badRequest().body(new ApiError("VALIDATION_ERROR",
                field != null ? "Invalid value for " + field + "." : "Request body is not valid JSON.",
                field));
    }
}
