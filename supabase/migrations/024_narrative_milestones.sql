-- Phase 4: Narrative Milestone Support
-- Create table for GM-bestowed lore fragments/milestones

CREATE TABLE IF NOT EXISTS lore_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES story_chapters(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lore_milestones ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Players can view their own milestones"
  ON lore_milestones FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "GMs can manage all milestones in their household"
  ON lore_milestones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'gm' 
      AND household_id = (SELECT household_id FROM profiles WHERE id = lore_milestones.player_id)
    )
  );

-- Update story_chapters to ensure narrative_text is present (safety)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='story_chapters' AND column_name='narrative_text') THEN
        ALTER TABLE story_chapters ADD COLUMN narrative_text TEXT DEFAULT 'The darkness stirs... but your deeds light the way.';
    END IF;
END $$;
