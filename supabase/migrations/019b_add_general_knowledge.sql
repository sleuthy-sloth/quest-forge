-- ============================================================
-- Quest Forge — Migration 019b
-- Add 'general_knowledge' to subject_type enum
-- ============================================================

-- NOTE: ALTER TYPE ... ADD VALUE cannot be run inside a transaction block in some Postgres versions.
-- Supabase handles this by running migrations individually.
ALTER TYPE subject_type ADD VALUE IF NOT EXISTS 'general_knowledge';
