package com.bankofcli.bank_api.config;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

@Configuration
public class JwtConfig {

    @Bean
    public SecretKey jwtSigningKey(@Value("${app.jwt.secret}") String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 bytes for HS256");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    /** Signs tokens (used by JwtService). */
    @Bean
    public JwtEncoder jwtEncoder(SecretKey jwtSigningKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSigningKey));
    }

    /** Verifies signature + expiry (used by the Bearer-token filter in the next step). */
    @Bean
    public JwtDecoder jwtDecoder(SecretKey jwtSigningKey) {
        return NimbusJwtDecoder.withSecretKey(jwtSigningKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }
}