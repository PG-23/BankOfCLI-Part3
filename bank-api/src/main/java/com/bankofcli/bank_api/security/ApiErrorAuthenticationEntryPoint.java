package com.bankofcli.bank_api.security;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ApiErrorAuthenticationEntryPoint implements AuthenticationEntryPoint {

    // Fixed body matching contract §4. Same message for every cause, so callers
    // can't probe whether a token was missing, forged or expired.
    private static final String BODY =
            "{\"code\":\"UNAUTHORIZED\",\"message\":\"Your session is missing or has expired. Please log in again.\"}";

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException ex) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setHeader("WWW-Authenticate", "Bearer");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(BODY);
    }
}