package com.bankofcli.bank_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bankofcli.bank_api.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, String> {

    String findTopByIdStartingWithOrderByIdDesc(
        String prefix
    );    
}