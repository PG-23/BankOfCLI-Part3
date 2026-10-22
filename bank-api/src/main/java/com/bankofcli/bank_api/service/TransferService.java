package com.bankofcli.bank_api.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.bankofcli.bank_api.dto.TransactionDto;
import com.bankofcli.bank_api.dto.TransactionResponse;
import com.bankofcli.bank_api.dto.TransferRequest;
import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.Transaction;
import com.bankofcli.bank_api.model.TransactionType;
import com.bankofcli.bank_api.repository.AccountRepository;
import com.bankofcli.bank_api.repository.TransactionRepository;
import org.springframework.transaction.annotation.Transactional;


@Service 
public class TransferService {

    private static final long MAX_AMOUNT_CENTS = 10_000_000_000L;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public TransferService(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional 
    public TransactionResponse transfer(Long userId,TransferRequest req){
        long amount = req.getAmountCents();
        String fromNumber = req.getFromAccountNumber();
        String toNumber = req.getToAccountNumber();

        //Check first, before taking any lock 
        if(amount <= 0 || amount > MAX_AMOUNT_CENTS){
            throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_AMOUNT",
                "Amount must be between $0.01 and $100,000,000","amountCents"
            );
        }
        if (fromNumber.equals(toNumber)){
            throw new ApiException(HttpStatus.BAD_REQUEST,"SAME_ACCOUNT_TRANSFER", "You cannot transfer to your own account.", "toAccountNumber");

        }
        //Lock both rows,smaller account number first, so A->B and B->A can't deadlock
        boolean fromFirst = fromNumber.compareTo(toNumber) <0;
        Optional<Account> first = accountRepository.findByAccountNumberForUpdate(fromFirst ? fromNumber : toNumber);
        Optional<Account> second = accountRepository.findByAccountNumberForUpdate(fromFirst ? toNumber : fromNumber);

        //Sender must exists and belong to the logged-in user;recipient must exist 
        Account from =  (fromFirst ? first:second)
            .filter(a -> a.getUser().getId().equals(userId))

            .orElseThrow(()->new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "You can only transfer from your own account.",null));
        
        Account to = (fromFirst ? second : first)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ACCOUNT_NOT_FOUND", "Recipient account does not exist.", "toAccountNumber"));


        //Balance check after locking,if it reads the real current balance
        if(from.getBalanceCents() < amount){
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "INSUFFICIENT_FUNDS","Insufficient funds for this transfer.","amountCents");
        }

        //Move the money(Hibernate save both accounts automatically on commit)
        from.setBalanceCents(from.getBalanceCents() - amount);
        to.setBalanceCents(to.getBalanceCents()+amount);

        //Record the transaction
        Transaction saved = transactionRepository.save(
            new Transaction(TransactionType.TRANSFER,amount,from,to,req.getNote())
        );

        //Contract:newBalanceCents is the sender's balance
        return new TransactionResponse(TransactionDto.from(saved),from.getBalanceCents());
    } 

    

}
