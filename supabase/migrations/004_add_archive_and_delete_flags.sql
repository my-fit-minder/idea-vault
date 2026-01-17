-- Add archived and deleted flags for soft delete/archive functionality
ALTER TABLE ideas 
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Create index on archived and deleted for faster filtering
CREATE INDEX IF NOT EXISTS ideas_archived_idx ON ideas(archived) WHERE archived = FALSE;
CREATE INDEX IF NOT EXISTS ideas_deleted_idx ON ideas(deleted) WHERE deleted = FALSE;

-- Update RLS policies to exclude deleted items by default
-- Note: The application layer will filter deleted items, but we can also add a policy if needed
