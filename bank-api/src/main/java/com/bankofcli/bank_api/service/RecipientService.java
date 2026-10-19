package com.bankofcli.bank_api.service;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bankofcli.bank_api.dto.RecipientResponse;
import com.bankofcli.bank_api.exception.ApiException;
import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.User;
import com.bankofcli.bank_api.repository.AccountRepository;

@Service
public class RecipientService {
   private final AccountRepository accountRepository;

   public RecipientService(AccountRepository accountRepository){
       this.accountRepository = accountRepository;
   }

   // readOnly transaction keeps the session open so lazy user can load
   @Transactional(readOnly = true)
   public RecipientResponse lookupRecipient(Long currentUserId, String accountNumber){
       Account account = accountRepository.findByAccountNumber(accountNumber).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ACCOUNT_NOT_FOUND",
           "No account exists with that account number", "accountNumber"));
      
       User owner = account.getUser();

       // users cant lookup their own account as transfer recipient
       if(owner.getId().equals(currentUserId)){
           throw new ApiException(HttpStatus.BAD_REQUEST, "SAME_ACCOUNT_TRANSFER", "you can't transfer to your own account", "accountNumber");
       }

       return new RecipientResponse(owner.getFirstName(), owner.getLastName(), account.getAccountNumber());
   }
}
