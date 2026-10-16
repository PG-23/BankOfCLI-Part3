package com.bankofcli.bank_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity 
@Table(name="accounts")
public class Account {

    

    protected Account() {
    }



    public Account(String accountNumber,  BankUser bankUser) {
        this.accountNumber = accountNumber;
        this.balanceCents = 0;
        this.bankUser = bankUser;
    }

    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column(name="a_id")
    private Long id;


    @Column(name = "account_number",nullable = false,unique = true,length = 10)
    private String accountNumber;

    @Column(name="balance_cents",nullable=false)
    private long balanceCents;

    @OneToOne (optional = false)
    @JoinColumn (name = "u_id",nullable = false,unique = true)
    private BankUser bankUser;

    public Long getId() {
        return id;
    }

    

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public long getBalanceCents() {
        return balanceCents;
    }

    public void setBalanceCents(long balanceCents) {
        this.balanceCents = balanceCents;
    }

    public BankUser getBankUser() {
        return bankUser;
    }

    public void setBankUser(BankUser bankUser) {
        this.bankUser = bankUser;
    }

    
    
}
