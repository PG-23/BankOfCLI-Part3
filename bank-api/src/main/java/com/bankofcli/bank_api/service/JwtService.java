package com.bankofcli.bank_api.service;

import java.time.Duration;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.bankofcli.bank_api.model.User;

@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final Duration ttl;

    public JwtService(JwtEncoder encoder,
                      @Value("${app.jwt.expiration-minutes:60}") long expirationMinutes) {
        this.encoder = encoder;
        this.ttl = Duration.ofMinutes(expirationMinutes);
    }

    /** Issues a signed token identifying the user. Returned in AuthResponse.token. */
    public String generateToken(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("bank-of-cli")
                .issuedAt(now)
                .expiresAt(now.plus(ttl))
                .subject(String.valueOf(user.getId()))   // DB id; protected endpoints read it back
                .claim("username", user.getUsername())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}