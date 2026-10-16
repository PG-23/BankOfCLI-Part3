package com.bankofcli.bank_api.model;

import java.time.Instant;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Entity 
@Table (name="transaction")
public class Transaction {
    /**************************************************
    *                      Values                     *
    ***************************************************/

    @Id 
    @Column(name = "id")
    private String id;

    @Column(name = "type")
    @NotNull 
    private TransactionType type;

    @Column(name = "amount_cents")
    @Positive 
    private int amountCents;

    @ManyToOne 
    @JoinColumn(name = "from_account_id", nullable = true)
    private Account fromAccount;

    @ManyToOne
    @JoinColumn(name = "to_account_id", nullable = true)
    private Account toAccount;

    @Column(name = "note")
    @Size(max=255)
    @Nullable 
    private String note;

    // Inside the constructors, the default is set to now. No Jakarta command to set default
    @Column(name = "created_at")
    @NotNull 
    private Instant timestamp;

    /********************************************************
    *                      Constructors                     *
    *********************************************************/

    // Timestamp set automatically went generating a Transaction

    // Transfer Constructor
    public Transaction(String id, @NotNull TransactionType type, @Positive int amountCents, Account fromAccount,
            Account toAccount, String note) {
        this.id = id;
        this.type = type;
        this.amountCents = amountCents;
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.note = note;
        this.timestamp = Instant.now();
    }    

    // Deposit/Withdraw Constructor
    // This WILL require the toAccountId or fromAccountId to be manually set
    public Transaction(String id, @NotNull TransactionType type, @Positive int amountCents) {
        this.id = id;
        this.type = type;
        this.amountCents = amountCents;
        this.timestamp = Instant.now();
    }

    // Empty Constructor for hibernate
    public Transaction(){

    }

    /***********************************************************
    *                      Getters/Setters                     *
    ************************************************************/

    public String getId() {
        return id;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public int getAmountCents() {
        return amountCents;
    }

    public void setAmountCents(int amountCents) {
        this.amountCents = amountCents;
    }

    public Account getFromAccount() {
        return fromAccount;
    }

    public void setFromAccountId(Account fromAccount) {
        this.fromAccount = fromAccount;
    }

    public Account getToAccount() {
        return toAccount;
    }

    public void setToAccountId(Account toAccount) {
        this.toAccount = toAccount;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    
}