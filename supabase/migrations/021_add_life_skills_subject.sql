-- ============================================================
-- Quest Forge — Migration 021
-- Add 'life_skills' to subject_type enum
-- ============================================================

ALTER TYPE subject_type ADD VALUE IF NOT EXISTS 'life_skills';
