
package com.bankofcli.bank_api.service;

import static org.junit.jupiter.api.Assertions.*;

import java.time.Instant;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.test.util.ReflectionTestUtils;

import com.bankofcli.bank_api.config.JwtConfig;
import com.bankofcli.bank_api.model.User;

class JwtServiceTest {

    // Create the JWT configuration for testing.
    private final JwtConfig config = new JwtConfig();

    // Use a test secret key instead of the real application's key.
    private final SecretKey key = config.jwtSigningKey(
        "test-secret-that-is-at-least-32-bytes-long"
    );

    // Create a JWT service with a 60-minute expiration.
    private final JwtService service = new JwtService(
        config.jwtEncoder(key),
        60
    );

    // Decoder checks the JWT signature and expiration.
    private final JwtDecoder decoder = config.jwtDecoder(key);

    // ==========================================
    // HELPER METHOD: CREATE TEST USER
    // ==========================================

    private User user() {

        User user = new User(
            "John",
            "Doe",
            "jdoe4821",
            "john@example.com",
            "hash"
        );

        // Simulate an ID assigned by the database.
        ReflectionTestUtils.setField(user, "id", 42L);

        return user;
    }

    // ==========================================
    // TEST 1: VALID JWT
    // Expected: Token is accepted.
    // ==========================================

    @Test
    void issuedTokenDecodesWithUserClaims() {

        // Generate and decode a valid JWT.
        Jwt jwt = decoder.decode(
            service.generateToken(user())
        );

        // Verify the token contains the correct user ID.
        assertEquals("42", jwt.getSubject());

        // Verify the username inside the token.
        assertEquals(
            "jdoe4821",
            jwt.getClaimAsString("username")
        );

        // Verify the token has not expired.
        assertTrue(
            jwt.getExpiresAt().isAfter(Instant.now())
        );
    }

    // ==========================================
    // TEST 2: INVALID JWT SIGNATURE
    // Expected: Token is rejected.
    // ==========================================

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {

        // Create a different signing key.
        SecretKey otherKey = config.jwtSigningKey(
            "a-completely-different-secret-32-bytes!!"
        );

        // Generate a token using the incorrect key.
        String forged = new JwtService(
            config.jwtEncoder(otherKey),
            60
        ).generateToken(user());

        // The decoder should reject the token because
        // its signature does not match our original key.
        assertThrows(
            JwtException.class,
            () -> decoder.decode(forged)
        );
    }

    // ==========================================
    // TEST 3: INVALID SECRET KEY
    // Expected: Short secret is rejected.
    // ==========================================

    @Test
    void rejectsShortSecret() {

        // Verify that the application rejects
        // a signing key that is too short.
        assertThrows(
            IllegalStateException.class,
            () -> config.jwtSigningKey("too-short")
        );
    }

    // ==========================================
    // TEST 4: EXPIRED JWT
    // Expected: Expired token is rejected.
    // ==========================================

    @Test
    void expiredTokenIsRejected() {

        // Get the current time.
        Instant now = Instant.now();

        // Create JWT claims for a token that:
        // 1. Was issued 10 minutes ago.
        // 2. Expired 5 minutes ago.
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("bank-of-cli")
            .issuedAt(now.minusSeconds(600))
            .expiresAt(now.minusSeconds(300))
            .subject("42")
            .claim("username", "jdoe4821")
            .build();

        // Use the same signing algorithm as our application.
        JwsHeader header = JwsHeader.with(
            MacAlgorithm.HS256
        ).build();

        // Generate a correctly signed but expired JWT.
        String expiredToken = config.jwtEncoder(key)
            .encode(
                JwtEncoderParameters.from(header, claims)
            )
            .getTokenValue();

        // Verify the decoder rejects the expired token.
        assertThrows(
            JwtException.class,
            () -> decoder.decode(expiredToken)
        );
    }
}
