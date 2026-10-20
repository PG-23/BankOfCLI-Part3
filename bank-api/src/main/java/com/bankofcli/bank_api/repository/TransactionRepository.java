package com.bankofcli.bank_api.repository;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
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