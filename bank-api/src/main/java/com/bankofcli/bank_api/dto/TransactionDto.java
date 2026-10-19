package com.bankofcli.bank_api.dto;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

import com.bankofcli.bank_api.model.Account;
import com.bankofcli.bank_api.model.Transaction;

public class TransactionDto {

    private final String id;
    private final String type;
    private final long amountCents;
    private final String fromAccountNumber;
    private final String toAccountNumber;
    private final String timestamp;
    private final String note;

    public TransactionDto(String id,String type,long amountCents,String fromAccountNumber,String toAccountNumber,String timestamp,String note){
        this.id=id;
        this.type = type;
        this.amountCents = amountCents;
        this.fromAccountNumber = fromAccountNumber;
        this.toAccountNumber = toAccountNumber;
        this.timestamp = timestamp;
        this.note = note;
    }

    //Convert a saved Transaction into the JSON shape from the API contract 
    public static TransactionDto from(Transaction t){
        OffsetDateTime utc = t.getTimestamp().withOffsetSameInstant(ZoneOffset.UTC);

        //Contract format: TXN-YYYYMMDD-NNNNNN, built from the database id
        String id = "TXN-" + utc.format(DateTimeFormatter.BASIC_ISO_DATE).substring(0,8) + "-" + String.format("%06d",t.getId());

        return new TransactionDto(
            id,
            t.getType().name().toLowerCase(),
            t.getAmountCents(),
            accountNumber(t.getFromAccount()),
            accountNumber(t.getToAccount()),
            utc.toInstant().truncatedTo(ChronoUnit.SECONDS).toString(),
            
            t.getNote()
        );

    }

    private static String accountNumber(Account account){
        return account == null ? null : account.getAccountNumber();
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public long getAmountCents() {
        return amountCents;
    }

    public String getFromAccountNumber() {
        return fromAccountNumber;
    }

    public String getToAccountNumber() {
        return toAccountNumber;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getNote() {
        return note;
    }

}
