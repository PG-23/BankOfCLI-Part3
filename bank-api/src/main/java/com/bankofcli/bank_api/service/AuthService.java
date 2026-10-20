package com.bankofcli.bank_api.service;

import org.springframework.stereotype.Service;

import com.bankofcli.bank_api.dto.AccountDto;
import com.bankofcli.bank_api.dto.AuthResponse;
import com.bankofcli.bank_api.dto.RegisterRequest;
import com.bankofcli.bank_api.dto.UserDto;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthService(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        UserService.RegisteredUser registered = userService.createUserWithAccount(
                request.firstName(), request.lastName(), request.email(), request.password());

        return new AuthResponse(
                UserDto.from(registered.user()),
                AccountDto.from(registered.account()),
                jwtService.generateToken(registered.user()));
    }
}