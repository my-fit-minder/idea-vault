-- Add AI generated validation roadmap field
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS ai_validation_roadmap TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN ideas.ai_validation_roadmap IS 'AI-generated validation roadmap in markdown format';
