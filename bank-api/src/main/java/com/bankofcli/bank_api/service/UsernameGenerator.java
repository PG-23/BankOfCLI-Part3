package com.bankofcli.bank_api.service;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.util.Locale;

import org.springframework.stereotype.Component;

import com.bankofcli.bank_api.repository.UserRepository;

@Component
public class UsernameGenerator {

    private static final int MAX_BASE_LENGTH = 12;
    private static final int MAX_ATTEMPTS = 20;

    private final UserRepository users;
    private final SecureRandom random = new SecureRandom();

    public UsernameGenerator(UserRepository users) {
        this.users = users;
    }

    public String generate(String firstName, String lastName) {
        String base = base(firstName, lastName);
        for (int i = 0; i < MAX_ATTEMPTS; i++) {
            String candidate = base + random.nextInt(1000, 10000);   // 1000–9999
            if (!users.existsByUsername(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Could not generate a unique username for base: " + base);
    }

    /** First initial + last name, lowercase a–z only, capped at 12 chars. */
    static String base(String firstName, String lastName) {
        String first = lettersOnly(firstName);
        String last = lettersOnly(lastName);
        String base = (first.isEmpty() ? "" : first.substring(0, 1)) + last;
        if (base.isEmpty()) {
            base = "user";   // names with no Latin letters, e.g. non-Latin scripts
        }
        return base.length() > MAX_BASE_LENGTH ? base.substring(0, MAX_BASE_LENGTH) : base;
    }

    private static String lettersOnly(String s) {
        String noAccents = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", ""); // é → e
        return noAccents.toLowerCase(Locale.ROOT).replaceAll("[^a-z]", "");                      // drop ' - spaces
    }
}