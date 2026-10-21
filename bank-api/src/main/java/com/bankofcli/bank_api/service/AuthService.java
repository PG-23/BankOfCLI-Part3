package com.bankofcli.bank_api.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bankofcli.bank_api.dto.AccountDto;
import com.bankofcli.bank_api.dto.AuthResponse;
import com.bankofcli.bank_api.dto.LoginRequest;
import com.bankofcli.bank_api.dto.RegisterRequest;
import com.bankofcli.bank_api.dto.UserDto;
import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.User;
import com.bankofcli.bank_api.repository.AccountRepository;
import com.bankofcli.bank_api.repository.UserRepository;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserService userService,
            JwtService jwtService,
            UserRepository userRepository,
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        UserService.RegisteredUser registered = userService.createUserWithAccount(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.password());

        return new AuthResponse(
                UserDto.from(registered.user()),
                AccountDto.from(registered.account()),
                jwtService.generateToken(registered.user()));
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.identifier().trim();

        Optional<User> matchingUser = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier));

        User user = matchingUser
                .filter(foundUser -> passwordEncoder.matches(
                        request.password(), foundUser.getPasswordHash()))
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED,
                        "INVALID_CREDENTIALS",
                        "Invalid username/email or password.",
                        null));

        Account account = accountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "INTERNAL_ERROR",
                        "Unable to complete login.",
                        null));

        return new AuthResponse(
                UserDto.from(user),
                AccountDto.from(account),
                jwtService.generateToken(user));
    }
}
