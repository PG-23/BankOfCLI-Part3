package com.bankofcli.bank_api.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import com.bankofcli.bank_api.repository.TransactionRepository;
import com.bankofcli.bank_api.util.IdGenerator;

import jakarta.transaction.Transactional;

@Service 
public class TransactionService {
 
    private final TransactionRepository transactionRepo;

    public TransactionService(TransactionRepository transactionRepo){
        this.transactionRepo = transactionRepo;
    }

    // This will create a new id to with when creating an id 
    @Transactional
    public String getNewId(){
        LocalDate now = LocalDate.now();

        String oldId = transactionRepo.findTopByIdStartingWithOrderByIdDesc("TXN-" + now.format(DateTimeFormatter.BASIC_ISO_DATE));
        String oldSuf = oldId.substring(oldId.length()-6);

        if(oldSuf == null){
            oldSuf = "000000";
        }

        int newId = Integer.parseInt(oldSuf) + 1;

        return IdGenerator.nextTransactionId(now, newId);
    }
}
