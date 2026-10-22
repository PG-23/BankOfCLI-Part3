-- V1: initial schema for users, accounts and transactions.
-- Money is stored as BIGINT cents (10050 = $100.50) to avoid floating-point rounding.
-- Never edit this file after it has run anywhere; add a V2__... migration instead.

CREATE TABLE users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50)  NOT NULL,
    username      VARCHAR(30)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Hands out unique 10-digit account numbers (1000000001, 1000000002, ...).
CREATE SEQUENCE account_number_seq START WITH 1000000001 MAXVALUE 9999999999;

CREATE TABLE accounts (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_number CHAR(10) NOT NULL UNIQUE
                   DEFAULT nextval('account_number_seq')::TEXT
                   CHECK (account_number ~ '^[0-9]{10}$'),
    user_id        BIGINT   NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    balance_cents  BIGINT   NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
    version        BIGINT   NOT NULL DEFAULT 0, -- for JPA @Version (optimistic locking)
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounts_user_id ON accounts (user_id);

CREATE TABLE transactions (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')),
    amount_cents    BIGINT      NOT NULL CHECK (amount_cents > 0),
    from_account_id BIGINT      REFERENCES accounts (id),
    to_account_id   BIGINT      REFERENCES accounts (id),
    note            VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Which account columns are filled depends on the type (see docs/api-contract.md §2).
    CONSTRAINT chk_transaction_accounts CHECK (
        (type = 'DEPOSIT'    AND from_account_id IS NULL     AND to_account_id IS NOT NULL) OR
        (type = 'WITHDRAWAL' AND from_account_id IS NOT NULL AND to_account_id IS NULL)     OR
        (type = 'TRANSFER'   AND from_account_id IS NOT NULL AND to_account_id IS NOT NULL
                             AND from_account_id <> to_account_id)
    )
);

-- History is queried per account, newest first.
CREATE INDEX idx_transactions_from_account ON transactions (from_account_id, created_at DESC);
CREATE INDEX idx_transactions_to_account   ON transactions (to_account_id, created_at DESC);
