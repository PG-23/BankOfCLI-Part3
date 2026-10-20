package com.bankofcli.bank_api.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.bankofcli.bank_api.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM transactions t WHERE t.from_account_id = :accountId OR t.to_account_id = :accountId")
    List<Transaction> getAllFromAccountId(long accountId);

    @Query("SELECT t FROM transactions t WHERE t.from_account_id = :accountId OR t.to_account_id = :accountId")
    Page<Transaction> getPageFromAccountId(long accountId, Pageable pageable);
}