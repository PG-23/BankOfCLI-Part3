/**
 * DEV PROFILE security config.
 * Permits all requests and injects a fixed test user so the team can build
 * and test protected endpoints before real JWT auth is ready.
 * NOT for production — real JWT security replaces this.
 */

package com.bankofcli.bank_api.config;

import java.io.IOException;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration 
@Profile("dev")
// TODO: Temporary. Remove or restrict once JWT SecurityConfig is merged (see issue #___)
public class DevSecurityConfig {
    public static final String DEV_USERNAME = "testuser";

    @Bean
    public SecurityFilterChain devSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — not needed with JWT (token in header, not cookies)
            .csrf(AbstractHttpConfigurer::disable)
            // Enable CORS using the CorsConfigurationSource bean we defined
            .cors(Customizer.withDefaults())
            // DEV ONLY: allow every request without authentication
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            // DEV ONLY: inject a fixed test user so "who's logged in?" works before JWT exists
            .addFilterBefore(new FixedUserFilter(), AnonymousAuthenticationFilter.class);
        return http.build();
    }
    //puts a fake logged-in user on every request so controllers can read the current user
    private static class FixedUserFilter extends OncePerRequestFilter{
        @Override 
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException{
                if(SecurityContextHolder.getContext().getAuthentication() == null){
                    var auth = new UsernamePasswordAuthenticationToken(
                        DEV_USERNAME, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
                    );
                   
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
                chain.doFilter(request, response);

            }
        
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
}
