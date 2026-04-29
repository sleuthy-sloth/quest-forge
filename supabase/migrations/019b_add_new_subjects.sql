-- ============================================================
-- Quest Forge — Migration 019b
-- Register new educational subjects in the subject_type enum.
-- These must exist before Migration 020 (Bulk Load) runs.
-- ============================================================

ALTER TYPE subject_type ADD VALUE IF NOT EXISTS 'general_knowledge';
ALTER TYPE subject_type ADD VALUE IF NOT EXISTS 'life_skills';
