package com.bankofcli.bank_api.service;

import static org.junit.jupiter.api.Assertions.*;

import java.time.Instant;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.test.util.ReflectionTestUtils;

import com.bankofcli.bank_api.config.JwtConfig;
import com.bankofcli.bank_api.model.User;

class JwtServiceTest {

    private final JwtConfig config = new JwtConfig();
    private final SecretKey key = config.jwtSigningKey("test-secret-that-is-at-least-32-bytes-long");
    private final JwtService service = new JwtService(config.jwtEncoder(key), 60);
    private final JwtDecoder decoder = config.jwtDecoder(key);

    private User user() {
        User user = new User("John", "Doe", "jdoe4821", "john@example.com", "hash");
        ReflectionTestUtils.setField(user, "id", 42L);   // normally set by the database
        return user;
    }

    @Test
    void issuedTokenDecodesWithUserClaims() {
        Jwt jwt = decoder.decode(service.generateToken(user()));

        assertEquals("42", jwt.getSubject());
        assertEquals("jdoe4821", jwt.getClaimAsString("username"));
        assertTrue(jwt.getExpiresAt().isAfter(Instant.now()));
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        SecretKey otherKey = config.jwtSigningKey("a-completely-different-secret-32-bytes!!");
        String forged = new JwtService(config.jwtEncoder(otherKey), 60).generateToken(user());

        assertThrows(JwtException.class, () -> decoder.decode(forged));
    }

    @Test
    void rejectsShortSecret() {
        assertThrows(IllegalStateException.class, () -> config.jwtSigningKey("too-short"));
    }
}