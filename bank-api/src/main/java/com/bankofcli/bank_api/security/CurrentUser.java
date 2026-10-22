package com.bankofcli.bank_api.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.repository.UserRepository;

/** Turns the logged-in Authentication into our users.id. */
@Component
public class CurrentUser {

    private final UserRepository users;

    public CurrentUser(UserRepository users) {
        this.users = users;
    }

    public Long id(Authentication auth) {
        if (auth == null) {
            throw unauthorized();
        }
        String name = auth.getName();
        try {
            return Long.valueOf(name);                // JWT: subject is the DB id (see JwtService)
        } catch (NumberFormatException e) {
            return users.findByUsername(name)         // dev profile: fixed username, e.g. "testuser"
                    .orElseThrow(CurrentUser::unauthorized)
                    .getId();
        }
    }

    private static ApiException unauthorized() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED",
                "Your session is missing or has expired. Please log in again.", null);
    }
}
