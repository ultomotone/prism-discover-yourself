-- IR-07B: FC Infrastructure Seeding Part 2 - fc_options
-- Insert fc_options for each block with cognitive function weights

INSERT INTO fc_options (id, block_id, option_code, prompt, weights_json, order_index, created_at)
VALUES 
  -- WORK_PREF Block Options
  ('650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 
   'A', 'Structured environment with clear goals and measurable outcomes', 
   '{"Te": 3, "Ti": 1, "Fe": 0, "Fi": 0, "Ne": 0, "Ni": 1, "Se": 2, "Si": 1}'::jsonb, 1, now()),
  ('650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid,
   'B', 'Flexible environment that allows personal expression and autonomy',
   '{"Te": 0, "Ti": 1, "Fe": 1, "Fi": 3, "Ne": 2, "Ni": 1, "Se": 1, "Si": 0}'::jsonb, 2, now()),
  ('650e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid,
   'C', 'Dynamic environment with variety, creativity, and new possibilities',
   '{"Te": 1, "Ti": 0, "Fe": 2, "Fi": 1, "Ne": 3, "Ni": 1, "Se": 2, "Si": 0}'::jsonb, 3, now()),
  ('650e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid,
   'D', 'Stable environment with established procedures and consistent processes',
   '{"Te": 1, "Ti": 2, "Fe": 1, "Fi": 1, "Ne": 0, "Ni": 0, "Se": 1, "Si": 3}'::jsonb, 4, now()),

  -- DECISION_STYLE Block Options
  ('650e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid,
   'A', 'Analyze thoroughly, consider logical frameworks, decide independently',
   '{"Te": 1, "Ti": 3, "Fe": 0, "Fi": 1, "Ne": 1, "Ni": 2, "Se": 0, "Si": 1}'::jsonb, 1, now()),
  ('650e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid,
   'B', 'Consider impact on people, seek input from others, build consensus',
   '{"Te": 0, "Ti": 0, "Fe": 3, "Fi": 2, "Ne": 1, "Ni": 1, "Se": 1, "Si": 1}'::jsonb, 2, now()),
  ('650e8400-e29b-41d4-a716-446655440007'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid,
   'C', 'Act quickly on available information, adapt based on immediate results',
   '{"Te": 2, "Ti": 1, "Fe": 1, "Fi": 0, "Ne": 2, "Ni": 0, "Se": 3, "Si": 0}'::jsonb, 3, now()),
  ('650e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid,
   'D', 'Reflect on patterns and implications, envision long-term consequences',
   '{"Te": 1, "Ti": 2, "Fe": 1, "Fi": 1, "Ne": 1, "Ni": 3, "Se": 0, "Si": 1}'::jsonb, 4, now()),

  -- COMM_STYLE Block Options  
  ('650e8400-e29b-41d4-a716-446655440009'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid,
   'A', 'Direct communication focused on efficiency and clear outcomes',
   '{"Te": 3, "Ti": 1, "Fe": 1, "Fi": 0, "Ne": 1, "Ni": 1, "Se": 2, "Si": 1}'::jsonb, 1, now()),
  ('650e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid,
   'B', 'Authentic communication that honors individual values and perspectives',
   '{"Te": 0, "Ti": 1, "Fe": 2, "Fi": 3, "Ne": 1, "Ni": 2, "Se": 0, "Si": 1}'::jsonb, 2, now()),
  ('650e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid,
   'C', 'Warm communication that builds relationships and maintains harmony',
   '{"Te": 1, "Ti": 0, "Fe": 3, "Fi": 2, "Ne": 2, "Ni": 1, "Se": 1, "Si": 1}'::jsonb, 3, now()),
  ('650e8400-e29b-41d4-a716-446655440012'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid,
   'D', 'Precise communication focused on accuracy and logical clarity',
   '{"Te": 2, "Ti": 3, "Fe": 0, "Fi": 1, "Ne": 1, "Ni": 2, "Se": 0, "Si": 2}'::jsonb, 4, now())

ON CONFLICT (id) DO UPDATE SET
  block_id = EXCLUDED.block_id,
  option_code = EXCLUDED.option_code,
  prompt = EXCLUDED.prompt,
  weights_json = EXCLUDED.weights_json,
  order_index = EXCLUDED.order_index;