package com.bankofcli.bank_api.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String code;
    private final String field;

    public ApiException(HttpStatus status,String code,String message,String field){
        super(message);
        this.status = status;
        this.code = code;
        this.field = field;
    }
    public HttpStatus getStatus() { return status; }
    public String getCode() { return code; }
    public String getField() { return field; }

}
