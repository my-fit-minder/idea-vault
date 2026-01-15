-- Add AI context field for additional description/context to help AI generate better descriptions
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS ai_context TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN ideas.ai_context IS 'Additional context/description to help AI generate detailed descriptions with correct context';
