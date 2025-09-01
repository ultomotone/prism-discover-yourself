-- Add 'META' to the enum in its own transaction (safe to re-run)
ALTER TYPE assessment_scale_type ADD VALUE IF NOT EXISTS 'META';
