-- Dev-only seed data: the 4 test users from React-Frontend/src/mocks, their accounts and transactions.
-- Every user's password is "password1", stored as a BCrypt hash (matches Spring's BCryptPasswordEncoder).
-- Runs only when db/seed is in spring.flyway.locations (see application-dev.yml), so it never reaches production.
-- Balances equal the sum of the transactions below.

INSERT INTO users (first_name, last_name, username, email, password_hash) VALUES
                                                                              ('Alice', 'Smith', 'asmith1234', 'alice@bank.com', '$2a$10$Llhzb51Y9eOMFwjUP6qSi.xCiNYbGo0/aOXTzafZdMQtNwuuBBGca'),
                                                                              ('Bob', 'Jones', 'bjones5678', 'bob@bank.com', '$2a$10$Llhzb51Y9eOMFwjUP6qSi.xCiNYbGo0/aOXTzafZdMQtNwuuBBGca'),
                                                                              ('Carol', 'Nguyen', 'cnguyen4417', 'carol@bank.com', '$2a$10$Llhzb51Y9eOMFwjUP6qSi.xCiNYbGo0/aOXTzafZdMQtNwuuBBGca'),
                                                                              ('Dan', 'Patel', 'dpatel9023', 'dan@bank.com', '$2a$10$Llhzb51Y9eOMFwjUP6qSi.xCiNYbGo0/aOXTzafZdMQtNwuuBBGca');

INSERT INTO accounts (account_number, user_id, balance_cents) VALUES
                                                                  ('1000001234', (SELECT id FROM users WHERE username = 'asmith1234'), 458351),
                                                                  ('1000005678', (SELECT id FROM users WHERE username = 'bjones5678'), 345926),
                                                                  ('1000004417', (SELECT id FROM users WHERE username = 'cnguyen4417'), 484711),
                                                                  ('1000009023', (SELECT id FROM users WHERE username = 'dpatel9023'), 0);

-- Oldest first, so transaction ids increase with time.
-- All activity falls between 2026-10-17 and 2026-10-22 (US Central), with matching calendar days in UTC.
INSERT INTO transactions (type, amount_cents, from_account_id, to_account_id, note, created_at) VALUES
                                                                                              ('DEPOSIT', 320000, NULL, (SELECT id FROM accounts WHERE account_number = '1000001234'), NUlL, '2026-10-17T13:12:00Z'),
                                                                                              ('DEPOSIT', 185000, NULL, (SELECT id FROM accounts WHERE account_number = '1000005678'), NULL, '2026-10-17T15:45:00Z'),
                                                                                              ('DEPOSIT', 410000, NULL, (SELECT id FROM accounts WHERE account_number = '1000004417'), NULL, '2026-10-17T18:30:00Z'),
                                                                                              ('WITHDRAWAL', 6250, (SELECT id FROM accounts WHERE account_number = '1000001234'), NULL, NULL, '2026-10-17T21:05:00Z'),
                                                                                              ('TRANSFER', 120000, (SELECT id FROM accounts WHERE account_number = '1000001234'), (SELECT id FROM accounts WHERE account_number = '1000005678'), 'Sample Transfer', '2026-10-18T14:22:00Z'),
                                                                                              ('WITHDRAWAL', 4599, (SELECT id FROM accounts WHERE account_number = '1000005678'), NULL, NULL, '2026-10-18T16:40:00Z'),
                                                                                              ('TRANSFER', 25000, (SELECT id FROM accounts WHERE account_number = '1000004417'), (SELECT id FROM accounts WHERE account_number = '1000001234'), 'A new rug', '2026-10-18T19:18:00Z'),
                                                                                              ('WITHDRAWAL', 1299, (SELECT id FROM accounts WHERE account_number = '1000004417'), NULL, NULL, '2026-10-18T22:55:00Z'),
                                                                                              ('DEPOSIT', 245000, NULL, (SELECT id FROM accounts WHERE account_number = '1000001234'), NULL, '2026-10-19T13:30:00Z'),
                                                                                              ('TRANSFER', 8500, (SELECT id FROM accounts WHERE account_number = '1000005678'), (SELECT id FROM accounts WHERE account_number = '1000004417'), 'Paying my tab', '2026-10-19T16:47:00Z'),
                                                                                              ('WITHDRAWAL', 20000, (SELECT id FROM accounts WHERE account_number = '1000001234'), NULL, NULL, '2026-10-19T19:10:00Z'),
                                                                                              ('WITHDRAWAL', 3475, (SELECT id FROM accounts WHERE account_number = '1000005678'), NULL, NULL, '2026-10-19T22:03:00Z'),
                                                                                              ('TRANSFER', 150000, (SELECT id FROM accounts WHERE account_number = '1000004417'), (SELECT id FROM accounts WHERE account_number = '1000005678'), 'Buying a new TV', '2026-10-20T14:15:00Z'),
                                                                                              ('DEPOSIT', 245000, NULL, (SELECT id FROM accounts WHERE account_number = '1000004417'), NULL, '2026-10-20T16:00:00Z'),
                                                                                              ('WITHDRAWAL', 125000, (SELECT id FROM accounts WHERE account_number = '1000005678'), NULL, NULL, '2026-10-20T18:20:00Z'),
                                                                                              ('TRANSFER', 4250, (SELECT id FROM accounts WHERE account_number = '1000001234'), (SELECT id FROM accounts WHERE account_number = '1000004417'), 'Paying back for Dinner', '2026-10-20T21:36:00Z'),
                                                                                              ('DEPOSIT', 50000, NULL, (SELECT id FROM accounts WHERE account_number = '1000005678'), NULL, '2026-10-21T14:11:00Z'),
                                                                                              ('WITHDRAWAL', 8999, (SELECT id FROM accounts WHERE account_number = '1000001234'), NULL, NULL, '2026-10-21T17:42:00Z'),
                                                                                              ('WITHDRAWAL', 6740, (SELECT id FROM accounts WHERE account_number = '1000004417'), NULL, NULL, '2026-10-21T21:27:00Z'),
                                                                                              ('TRANSFER', 30000, (SELECT id FROM accounts WHERE account_number = '1000005678'), (SELECT id FROM accounts WHERE account_number = '1000001234'), 'Coffee', '2026-10-22T11:58:00Z'),
                                                                                              ('WITHDRAWAL', 2150, (SELECT id FROM accounts WHERE account_number = '1000001234'), NULL, NULL, '2026-10-22T12:35:00Z'),
                                                                                              ('DEPOSIT', 12500, NULL, (SELECT id FROM accounts WHERE account_number = '1000005678'), NULL, '2026-10-22T13:44:00Z');

-- The fixed account numbers above bypass account_number_seq; move it past them so new accounts never collide.
SELECT setval('account_number_seq', 1000010000);