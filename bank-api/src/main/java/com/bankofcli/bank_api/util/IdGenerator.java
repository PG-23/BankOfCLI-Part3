package com.bankofcli.bank_api.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class IdGenerator {
    public static void main(String[] args) {
        System.out.println(nextTransactionId());
    }

    public static String nextTransactionId(){
        LocalDate date = LocalDate.now();
        DateTimeFormatter secondBlock = DateTimeFormatter.ofPattern("yyyyMMdd");
        //String lastSeq = Math.max(0, ...db.transactions.map(t => Number(t.id.slice(-6)) || 0));
        return "TXN-" + secondBlock.format(date); 
    }
}
