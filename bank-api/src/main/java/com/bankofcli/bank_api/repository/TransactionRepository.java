package com.bankofcli.bank_api.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bankofcli.bank_api.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM transactions t WHERE t.fromAccount.id = :accountId OR t.toAccount.id = :accountId  ORDER BY t.timestamp ASC")
    List<Transaction> getAllFromAccountId(@Param("accountId") long accountId);

    @Query("SELECT t FROM transactions t WHERE t.fromAccount.id = :accountId OR t.toAccount.id = :accountId  ORDER BY t.timestamp ASC")
    Page<Transaction> getPageFromAccountId(@Param("accountId") long accountId, Pageable pageable);
}