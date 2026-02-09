-- Add AI generated roadmap field
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS ai_roadmap TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN ideas.ai_roadmap IS 'AI-generated product roadmap in markdown format';
