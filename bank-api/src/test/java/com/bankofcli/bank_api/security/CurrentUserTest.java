package com.bankofcli.bank_api.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;

import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.model.User;
import com.bankofcli.bank_api.repository.UserRepository;

class CurrentUserTest {

    private UserRepository users;
    private CurrentUser currentUser;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        currentUser = new CurrentUser(users);
    }

    // TEST 1: With a real JWT the name is the user's database id.
    @Test
    void returnsIdFromJwtSubject() {
        assertEquals(42L, currentUser.id(new TestingAuthenticationToken("42", null)));
        verifyNoInteractions(users);
    }

    // TEST 2: In the dev profile the name is a username, so it is looked up.
    @Test
    void looksUpUsernameWhenNameIsNotAnId() {
        User dev = new User("Test", "User", "testuser", "test@bank.com", "hash");
        ReflectionTestUtils.setField(dev, "id", 7L);
        when(users.findByUsername("testuser")).thenReturn(Optional.of(dev));

        assertEquals(7L, currentUser.id(new TestingAuthenticationToken("testuser", null)));
    }

    // TEST 3: A username that isn't in the database is a 401.
    @Test
    void unknownUsernameIsUnauthorized() {
        when(users.findByUsername("ghost")).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> currentUser.id(new TestingAuthenticationToken("ghost", null)));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertEquals("UNAUTHORIZED", ex.getCode());
    }

    // TEST 4: No login at all is a 401.
    @Test
    void missingAuthenticationIsUnauthorized() {
        ApiException ex = assertThrows(ApiException.class, () -> currentUser.id(null));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertEquals("UNAUTHORIZED", ex.getCode());
    }
}
