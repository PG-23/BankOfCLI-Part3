package com.bankofcli.bank_api.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;

import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.Transaction;
import com.bankofcli.bank_api.model.TransactionType;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("""
        SELECT t FROM Transaction t 
        WHERE t.fromAccount.id = :accountId OR t.toAccount.id = :accountId
    """)
    List<Transaction> getAllFromAccountId(@Param("accountId") long accountId);

    @Query("""
        SELECT t FROM Transaction t 
        WHERE t.fromAccount.id = :accountId OR t.toAccount.id = :accountId
    """)
    Page<Transaction> getPageFromAccountId(@Param("accountId") long accountId, Pageable pageable);
    //Every transaction where this account sent OR received money,since the given time oldest first
    @Query("""
            SELECT t FROM Transaction t
            WHERE (t.fromAccount.id = :accountId OR t.toAccount.id = :accountId)
            AND t.type = :filter
            """)
    Page<Transaction> getFilteredPageFromAccountId(@Param("accountId") long accountId, Pageable pageable, @Param("filter") TransactionType filter);
    //Every transaction where this account sent OR received money,since the given time oldest first

    @Query("""
            SELECT t FROM Transaction t
            WHERE(t.fromAccount = :account OR t.toAccount = :account)
                AND t.timestamp >= :since
            ORDER BY t.timestamp ASC

            """)
    List<Transaction> findActivitySince(@Param("account") Account account,
                                        @Param("since") OffsetDateTime since);
}