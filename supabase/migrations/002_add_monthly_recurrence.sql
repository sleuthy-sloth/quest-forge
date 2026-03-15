-- Add 'monthly' to the recurrence_type enum.
-- Postgres requires adding enum values with ALTER TYPE; it cannot be done inside a transaction.
ALTER TYPE recurrence_type ADD VALUE IF NOT EXISTS 'monthly';
