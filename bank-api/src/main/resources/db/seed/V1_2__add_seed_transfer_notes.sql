-- Adds notes to the seeded transfers from V1_1.
-- V1_1 has already run on deployed databases, so it must never be edited (Flyway checksum); change seed data in a new migration instead.
UPDATE transactions SET note = 'Sample Transfer'        WHERE type = 'TRANSFER' AND created_at = '2026-10-18T14:22:00Z';
UPDATE transactions SET note = 'A new rug'              WHERE type = 'TRANSFER' AND created_at = '2026-10-18T19:18:00Z';
UPDATE transactions SET note = 'Paying my tab'          WHERE type = 'TRANSFER' AND created_at = '2026-10-19T16:47:00Z';
UPDATE transactions SET note = 'Buying a new TV'        WHERE type = 'TRANSFER' AND created_at = '2026-10-20T14:15:00Z';
UPDATE transactions SET note = 'Paying back for Dinner' WHERE type = 'TRANSFER' AND created_at = '2026-10-20T21:36:00Z';
UPDATE transactions SET note = 'Coffee'                 WHERE type = 'TRANSFER' AND created_at = '2026-10-22T11:58:00Z';
