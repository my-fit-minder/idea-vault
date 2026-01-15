-- Add AI generated report field
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS ai_report TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN ideas.ai_report IS 'AI-generated report in markdown format';
