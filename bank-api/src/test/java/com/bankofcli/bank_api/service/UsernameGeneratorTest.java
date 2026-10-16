package com.bankofcli.bank_api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class UsernameGeneratorTest {

    @Test
    void matchesContractExamples() {
        assertEquals("jdoe", UsernameGenerator.base("John", "Doe"));
        assertEquals("sobriensmith", UsernameGenerator.base("Seán", "O'Brien-Smith"));
    }

    @Test
    void capsBaseAtTwelveCharacters() {
        assertEquals("aabcdefghijk", UsernameGenerator.base("Al", "Abcdefghijklmnop"));
    }
}