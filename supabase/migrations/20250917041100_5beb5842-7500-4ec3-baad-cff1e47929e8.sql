-- IR-07B: FC Infrastructure Seeding for v1.2
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

-- Step 3: Insert fc_options for each block
-- Each block will have 4 options (A, B, C, D) with cognitive function weights

-- WORK_PREF Block Options
INSERT INTO fc_options (id, block_id, option_code, prompt, weights_json, order_index, created_at)
VALUES 
  -- Work Preferences - Option A (Te focus)
  ('650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 
   'A', 'Structured environment with clear goals and measurable outcomes', 
   '{"Te": 3, "Ti": 1, "Fe": 0, "Fi": 0, "Ne": 0, "Ni": 1, "Se": 2, "Si": 1}'::jsonb, 1, now()),
   
  -- Work Preferences - Option B (Fi focus)  
  ('650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid,
   'B', 'Flexible environment that allows personal expression and autonomy',
   '{"Te": 0, "Ti": 1, "Fe": 1, "Fi": 3, "Ne": 2, "Ni": 1, "Se": 1, "Si": 0}'::jsonb, 2, now()),
   
  -- Work Preferences - Option C (Ne focus)
  ('650e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid,
   'C', 'Dynamic environment with variety, creativity, and new possibilities',
   '{"Te": 1, "Ti": 0, "Fe": 2, "Fi": 1, "Ne": 3, "Ni": 1, "Se": 2, "Si": 0}'::jsonb, 3, now()),
   
  -- Work Preferences - Option D (Si focus)
  ('650e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid,
   'D', 'Stable environment with established procedures and consistent processes',
   '{"Te": 1, "Ti": 2, "Fe": 1, "Fi": 1, "Ne": 0, "Ni": 0, "Se": 1, "Si": 3}'::jsonb, 4, now()),

-- DECISION_STYLE Block Options
  -- Decision Making - Option A (Ti focus)
  ('650e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid,
   'A', 'Analyze thoroughly, consider logical frameworks, decide independently',
   '{"Te": 1, "Ti": 3, "Fe": 0, "Fi": 1, "Ne": 1, "Ni": 2, "Se": 0, "Si": 1}'::jsonb, 1, now()),
   
  -- Decision Making - Option B (Fe focus)
  ('650e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid,
   'B', 'Consider impact on people, seek input from others, build consensus',
   '{"Te": 0, "Ti": 0, "Fe": 3, "Fi": 2, "Ne": 1, "Ni": 1, "Se": 1, "Si": 1}'::jsonb, 2, now()),
   
  -- Decision Making - Option C (Se focus)  
  ('650e8400-e29b-41d4-a716-446655440007'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid,
   'C', 'Act quickly on available information, adapt based on immediate results',
   '{"Te": 2, "Ti": 1, "Fe": 1, "Fi": 0, "Ne": 2, "Ni": 0, "Se": 3, "Si": 0}'::jsonb, 3, now()),
   
  -- Decision Making - Option D (Ni focus)
  ('650e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid,
   'D', 'Reflect on patterns and implications, envision long-term consequences',
   '{"Te": 1, "Ti": 2, "Fe": 1, "Fi": 1, "Ne": 1, "Ni": 3, "Se": 0, "Si": 1}'::jsonb, 4, now()),

-- COMM_STYLE Block Options  
  -- Communication - Option A (Te focus)
  ('650e8400-e29b-41d4-a716-446655440009'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid,
   'A', 'Direct communication focused on efficiency and clear outcomes',
   '{"Te": 3, "Ti": 1, "Fe": 1, "Fi": 0, "Ne": 1, "Ni": 1, "Se": 2, "Si": 1}'::jsonb, 1, now()),
   
  -- Communication - Option B (Fi focus)
  ('650e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid,
   'B', 'Authentic communication that honors individual values and perspectives',
   '{"Te": 0, "Ti": 1, "Fe": 2, "Fi": 3, "Ne": 1, "Ni": 2, "Se": 0, "Si": 1}'::jsonb, 2, now()),
   
  -- Communication - Option C (Fe focus)
  ('650e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid,
   'C', 'Warm communication that builds relationships and maintains harmony',
   '{"Te": 1, "Ti": 0, "Fe": 3, "Fi": 2, "Ne": 2, "Ni": 1, "Se": 1, "Si": 1}'::jsonb, 3, now()),
   
  -- Communication - Option D (Ti focus)  
  ('650e8400-e29b-41d4-a716-446655440012'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid,
   'D', 'Precise communication focused on accuracy and logical clarity',
   '{"Te": 2, "Ti": 3, "Fe": 0, "Fi": 1, "Ne": 1, "Ni": 2, "Se": 0, "Si": 2}'::jsonb, 4, now()),

-- PROBLEM_SOLVE Block Options
  -- Problem Solving - Option A (Ne focus)
  ('650e8400-e29b-41d4-a716-446655440013'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid,
   'A', 'Brainstorm multiple creative solutions and explore new approaches',
   '{"Te": 1, "Ti": 1, "Fe": 2, "Fi": 1, "Ne": 3, "Ni": 1, "Se": 2, "Si": 0}'::jsonb, 1, now()),
   
  -- Problem Solving - Option B (Si focus)
  ('650e8400-e29b-41d4-a716-446655440014'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid,
   'B', 'Apply proven methods and learn from past successful experiences',
   '{"Te": 2, "Ti": 2, "Fe": 1, "Fi": 1, "Ne": 0, "Ni": 1, "Se": 1, "Si": 3}'::jsonb, 2, now()),
   
  -- Problem Solving - Option C (Ni focus)
  ('650e8400-e29b-41d4-a716-446655440015'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid,
   'C', 'Step back to understand underlying patterns and root causes',
   '{"Te": 1, "Ti": 2, "Fe": 1, "Fi": 2, "Ne": 1, "Ni": 3, "Se": 0, "Si": 1}'::jsonb, 3, now()),
   
  -- Problem Solving - Option D (Se focus)
  ('650e8400-e29b-41d4-a716-446655440016'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid,
   'D', 'Take immediate action and adjust approach based on real-time feedback',
   '{"Te": 2, "Ti": 0, "Fe": 1, "Fi": 0, "Ne": 2, "Ni": 0, "Se": 3, "Si": 1}'::jsonb, 4, now()),

-- INFO_PROCESS Block Options  
  -- Information Processing - Option A (Ni focus)
  ('650e8400-e29b-41d4-a716-446655440017'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid,
   'A', 'Synthesize information into coherent insights and future possibilities',
   '{"Te": 1, "Ti": 2, "Fe": 1, "Fi": 1, "Ne": 2, "Ni": 3, "Se": 0, "Si": 1}'::jsonb, 1, now()),
   
  -- Information Processing - Option B (Se focus)
  ('650e8400-e29b-41d4-a716-446655440018'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid,
   'B', 'Focus on concrete, immediately available facts and current details',
   '{"Te": 2, "Ti": 1, "Fe": 1, "Fi": 0, "Ne": 1, "Ni": 0, "Se": 3, "Si": 2}'::jsonb, 2, now()),
   
  -- Information Processing - Option C (Ne focus)
  ('650e8400-e29b-41d4-a716-446655440019'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid,
   'C', 'Explore connections between ideas and generate new possibilities',
   '{"Te": 1, "Ti": 1, "Fe": 2, "Fi": 1, "Ne": 3, "Ni": 2, "Se": 1, "Si": 0}'::jsonb, 3, now()),
   
  -- Information Processing - Option D (Si focus)  
  ('650e8400-e29b-41d4-a716-446655440020'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid,
   'D', 'Compare new information with established knowledge and experience',
   '{"Te": 1, "Ti": 2, "Fe": 1, "Fi": 1, "Ne": 0, "Ni": 1, "Se": 2, "Si": 3}'::jsonb, 4, now()),

-- ENERGY_FOCUS Block Options
  -- Energy & Focus - Option A (Fi focus)
  ('650e8400-e29b-41d4-a716-446655440021'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid,
   'A', 'Energized by meaningful work aligned with personal values',
   '{"Te": 0, "Ti": 1, "Fe": 1, "Fi": 3, "Ne": 1, "Ni": 2, "Se": 1, "Si": 1}'::jsonb, 1, now()),
   
  -- Energy & Focus - Option B (Fe focus)
  ('650e8400-e29b-41d4-a716-446655440022'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid,
   'B', 'Energized by positive interactions and helping others succeed',
   '{"Te": 1, "Ti": 0, "Fe": 3, "Fi": 2, "Ne": 2, "Ni": 1, "Se": 2, "Si": 1}'::jsonb, 2, now()),
   
  -- Energy & Focus - Option C (Te focus)
  ('650e8400-e29b-41d4-a716-446655440023'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid,
   'C', 'Energized by achieving goals and seeing measurable progress',
   '{"Te": 3, "Ti": 1, "Fe": 1, "Fi": 0, "Ne": 1, "Ni": 1, "Se": 2, "Si": 2}'::jsonb, 3, now()),
   
  -- Energy & Focus - Option D (Ti focus)
  ('650e8400-e29b-41d4-a716-446655440024'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid,
   'D', 'Energized by deep understanding and intellectual mastery',
   '{"Te": 1, "Ti": 3, "Fe": 0, "Fi": 1, "Ne": 1, "Ni": 2, "Se": 0, "Si": 2}'::jsonb, 4, now())

ON CONFLICT (id) DO UPDATE SET
  block_id = EXCLUDED.block_id,
  option_code = EXCLUDED.option_code,
  prompt = EXCLUDED.prompt,
  weights_json = EXCLUDED.weights_json,
  order_index = EXCLUDED.order_index;

-- Step 4: Create performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fc_blocks_version_active 
ON fc_blocks (version, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fc_options_block_order 
ON fc_options (block_id, order_index);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fc_responses_session 
ON fc_responses (session_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fc_scores_session_version 
ON fc_scores (session_id, version);

-- Step 5: Verify seeding success
SELECT 
  'fc_blocks' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE version = 'v1.2') as v12_rows
FROM fc_blocks
UNION ALL
SELECT 
  'fc_options' as table_name,
  COUNT(*) as total_rows,
  COUNT(DISTINCT block_id) as unique_blocks
FROM fc_options;