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
    @JoinColumn(name = "from_account", nullable = true)
    private String fromAccountId;

    @ManyToOne
    @JoinColumn(name = "to_account", nullable = true)
    private String toAccountId;

    @Column(name = "timestamp")
    @NotNull 
    private Instant timestamp;

    @Column(name = "note")
    @Nullable 
    private String note;

    /********************************************************
    *                      Constructors                     *
    *********************************************************/

    // Timestamp set automatically went generating a Transaction

    // Transfer Constructor
    public Transaction(String id, @NotNull TransactionType type, @Positive int amountCents, String fromAccountId,
            String toAccountId, String note) {
        this.id = id;
        this.type = type;
        this.amountCents = amountCents;
        this.fromAccountId = fromAccountId;
        this.toAccountId = toAccountId;
        this.timestamp = Instant.now();
        this.note = note;
    }    

    // Depsoti/Withdraw Constructor
    // This WILL require the toAccountId or fromAccountId to be manually set
    public Transaction(String id, @NotNull TransactionType type, @Positive int amountCents) {
        this.id = id;
        this.type = type;
        this.amountCents = amountCents;
        this.timestamp = Instant.now();
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

    public String getFromAccountId() {
        return fromAccountId;
    }

    public void setFromAccountId(String fromAccountId) {
        this.fromAccountId = fromAccountId;
    }

    public String getToAccountId() {
        return toAccountId;
    }

    public void setToAccountId(String toAccountId) {
        this.toAccountId = toAccountId;
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