package com.bankofcli.bank_api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.bankofcli.bank_api.dto.AuthResponse;
import com.bankofcli.bank_api.dto.LoginRequest;
import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.User;
import com.bankofcli.bank_api.repository.AccountRepository;
import com.bankofcli.bank_api.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;
    private User user;
    private Account account;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userService,
                jwtService,
                userRepository,
                accountRepository,
                passwordEncoder);

        user = new User(
                "John",
                "Doe",
                "jdoe4821",
                "john@example.com",
                "encoded-password");

        ReflectionTestUtils.setField(user, "id", 42L);

        account = new Account(user);
        account.setBalanceCents(5000L);
    }

    @Test
    void loginWithUsernameReturnsAccountAndToken() {
        when(userRepository.findByUsername("jdoe4821"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password1", "encoded-password"))
                .thenReturn(true);
        when(accountRepository.findByUserId(42L))
                .thenReturn(Optional.of(account));
        when(jwtService.generateToken(user))
                .thenReturn("test-token");

        AuthResponse response = authService.login(
                new LoginRequest("jdoe4821", "password1"));

        assertEquals("test-token", response.token());
        assertEquals(5000L, response.account().balanceCents());
        verify(userRepository).findByUsername("jdoe4821");
    }

    @Test
    void loginWithEmailReturnsAccountAndToken() {
        when(userRepository.findByUsername("john@example.com"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("john@example.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password1", "encoded-password"))
                .thenReturn(true);
        when(accountRepository.findByUserId(42L))
                .thenReturn(Optional.of(account));
        when(jwtService.generateToken(user))
                .thenReturn("test-token");

        AuthResponse response = authService.login(
                new LoginRequest("john@example.com", "password1"));

        assertEquals("test-token", response.token());
        assertEquals(5000L, response.account().balanceCents());
        verify(userRepository).findByEmailIgnoreCase("john@example.com");
    }

    @Test
    void loginWithInvalidCredentialsThrowsUnauthorized() {
        when(userRepository.findByUsername("jdoe4821"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password"))
                .thenReturn(false);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> authService.login(
                        new LoginRequest("jdoe4821", "wrong-password")));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        assertEquals("INVALID_CREDENTIALS", exception.getCode());
    }

    @Test
    void loginWithoutAccountThrowsInternalError() {
        when(userRepository.findByUsername("jdoe4821"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password1", "encoded-password"))
                .thenReturn(true);
        when(accountRepository.findByUserId(42L))
                .thenReturn(Optional.empty());

        ApiException exception = assertThrows(
                ApiException.class,
                () -> authService.login(
                        new LoginRequest("jdoe4821", "password1")));

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                exception.getStatus());
        assertEquals("INTERNAL_ERROR", exception.getCode());
    }
}
