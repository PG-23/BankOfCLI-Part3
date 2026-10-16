package com.bankofcli.bank_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bankofcli.bank_api.model.Account;
import jakarta.persistence.LockModeType;

public interface AccountRepository extends JpaRepository<Account, Long> {

    // plain read no lock: for showing balance and recipient look up
    Optional<Account> findByAccountNumber(String accountNumber);

    // Finds the logged-in user's account (GET /accounts/me)
    Optional<Account> findByBankUserId(Long userId);

    // Locks the row (SELECT .. FOR UPDATE) until the transaction ends.
    // Use before changing a balance: deposit, withdraw, transfer
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.accountNumber = :accountNumber")
    Optional<Account> findByAccountNumberForUpdate(@Param("accountNumber") String accountNumber);
}
