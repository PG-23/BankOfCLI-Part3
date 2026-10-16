package com.bankofcli.bank_api.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class IdGenerator {

    public static String nextTransactionId(LocalDate date, int sequence) {
        return "TXN-" + date.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + sequence;
    }
}
