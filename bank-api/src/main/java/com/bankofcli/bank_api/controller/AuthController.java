package com.bankofcli.bank_api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.bankofcli.bank_api.dto.AuthResponse;
import com.bankofcli.bank_api.dto.RegisterRequest;
import com.bankofcli.bank_api.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")   // served at /api/auth via context-path
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }
}