-- IR-07B: FC Infrastructure Seeding for v1.2 (Fixed)
-- Idempotent migration to populate fc_blocks and fc_options
-- Safe to run multiple times

-- Step 1: Update version defaults to v1.2
ALTER TABLE fc_blocks ALTER COLUMN version SET DEFAULT 'v1.2';
ALTER TABLE fc_scores ALTER COLUMN version SET DEFAULT 'v1.2';

-- Step 2: Insert fc_blocks for v1.2 (using stable UUIDs for consistency)  
INSERT INTO fc_blocks (id, version, code, title, description, order_index, is_active, created_at) 
VALUES 
  -- Work Preferences Block
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'v1.2', 'WORK_PREF', 'Work Environment Preferences', 
   'Questions about preferred work settings, task approach, and professional environment', 1, true, now()),
   
  -- Decision Making Block  
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'v1.2', 'DECISION_STYLE', 'Decision Making Style', 
   'Questions about how you approach decisions, process information, and reach conclusions', 2, true, now()),
   
  -- Communication Block
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'v1.2', 'COMM_STYLE', 'Communication & Interaction Style', 
   'Questions about communication preferences, social interactions, and collaboration approaches', 3, true, now()),
   
  -- Problem Solving Block
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'v1.2', 'PROBLEM_SOLVE', 'Problem Solving Approach', 
   'Questions about how you analyze problems, generate solutions, and implement changes', 4, true, now()),
   
  -- Information Processing Block
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'v1.2', 'INFO_PROCESS', 'Information Processing Style',
   'Questions about how you gather, organize, and utilize information', 5, true, now()),
   
  -- Energy & Focus Block  
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'v1.2', 'ENERGY_FOCUS', 'Energy & Focus Patterns',
   'Questions about energy sources, focus preferences, and attention patterns', 6, true, now())
ON CONFLICT (id) DO UPDATE SET
  version = EXCLUDED.version,
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;