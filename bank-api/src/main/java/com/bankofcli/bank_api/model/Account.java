package com.bankofcli.bank_api.model;

import java.time.Instant;

import org.hibernate.annotations.Generated;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.generator.EventType;

import jakarta.persistence.*;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Generated(event = EventType.INSERT)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "account_number", nullable = false, unique = true,
            length = 10, insertable = false, updatable = false)
    private String accountNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "balance_cents", nullable = false)
    private long balanceCents;

    @Version
    private Long version;

    @Generated(event = EventType.INSERT)
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    protected Account() {}

    public Account(User user) {
        this.user = user;
        this.balanceCents = 0;
    }

    public Long getId() { return id; }
    public String getAccountNumber() { return accountNumber; }
    public User getUser() { return user; }
    public long getBalanceCents() { return balanceCents; }
    public void setBalanceCents(long balanceCents) { this.balanceCents = balanceCents; }
    public Long getVersion() { return version; }
    public Instant getCreatedAt() { return createdAt; }
}