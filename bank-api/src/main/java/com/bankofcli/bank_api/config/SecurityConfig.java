package com.bankofcli.bank_api.config;

import java.util.List;

import com.bankofcli.bank_api.security.ApiErrorAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http,
                                    ApiErrorAuthenticationEntryPoint entryPoint) throws Exception {
        DefaultBearerTokenResolver defaultResolver = new DefaultBearerTokenResolver();

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e.authenticationEntryPoint(entryPoint))      // missing token
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(Customizer.withDefaults())                                  // uses your JwtDecoder bean
                        .authenticationEntryPoint(entryPoint)                            // bad/expired token
                        .bearerTokenResolver(request ->                                  // ignore tokens on /auth/**
                                request.getServletPath().startsWith("/auth/")
                                        ? null
                                        : defaultResolver.resolve(request)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/health", "/error").permitAll()
                        .anyRequest().authenticated());
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}