-- Add length constraints for title (max 50 chars) and content/description (max 1000 chars)
-- Note: This migration will fail if existing data violates these constraints.
-- Clean up any violating data before running this migration.

DO $$
BEGIN
  -- Add title length constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ideas_title_length_check' 
    AND conrelid = 'ideas'::regclass
  ) THEN
    ALTER TABLE ideas 
      ADD CONSTRAINT ideas_title_length_check CHECK (LENGTH(title) <= 50);
  END IF;

  -- Add content length constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ideas_content_length_check' 
    AND conrelid = 'ideas'::regclass
  ) THEN
    ALTER TABLE ideas 
      ADD CONSTRAINT ideas_content_length_check CHECK (content IS NULL OR LENGTH(content) <= 1000);
  END IF;
END $$;
