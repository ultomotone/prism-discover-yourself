-- First, let's properly fix the bad timestamps
UPDATE assessment_sessions 
SET started_at = created_at 
WHERE started_at < '2000-01-01'::timestamp;

-- Now add the constraint 
ALTER TABLE assessment_sessions 
ADD CONSTRAINT chk_started_at_sane 
CHECK (started_at >= '2000-01-01'::timestamp);