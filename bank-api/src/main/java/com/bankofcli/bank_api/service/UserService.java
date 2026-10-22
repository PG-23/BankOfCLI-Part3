package com.bankofcli.bank_api.service;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bankofcli.bank_api.exception.EmailTakenException;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.User;
import com.bankofcli.bank_api.repository.AccountRepository;
import com.bankofcli.bank_api.repository.UserRepository;

@Service
public class UserService {

    public record RegisteredUser(User user, Account account) {}

    private final UserRepository users;
    private final AccountRepository accounts;
    private final PasswordEncoder passwordEncoder;
    private final UsernameGenerator usernameGenerator;

    public UserService(UserRepository users, AccountRepository accounts,
                       PasswordEncoder passwordEncoder, UsernameGenerator usernameGenerator) {
        this.users = users;
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
        this.usernameGenerator = usernameGenerator;
    }

    /** Creates a user and their single zero-balance account. All or nothing. */
    @Transactional
    public RegisteredUser createUserWithAccount(String firstName, String lastName,
                                                String email, String rawPassword) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(normalizedEmail)) {
            throw new EmailTakenException();
        }

        User user = users.save(new User(
                firstName.trim(),
                lastName.trim(),
                usernameGenerator.generate(firstName, lastName),
                normalizedEmail,
                passwordEncoder.encode(rawPassword)));          // BCrypt

        Account account = accounts.save(new Account(user));     // DB assigns account_number
        return new RegisteredUser(user, account);
    }

    @Transactional(readOnly = true)
    public User getSignedInUser(long userId) {
        return users.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
    }

}