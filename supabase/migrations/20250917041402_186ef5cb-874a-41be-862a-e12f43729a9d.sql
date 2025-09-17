-- IR-07B: FC Infrastructure Seeding Part 3 - Remaining fc_options  
INSERT INTO fc_options (id, block_id, option_code, prompt, weights_json, order_index, created_at)
VALUES 
  -- PROBLEM_SOLVE Block Options
  ('650e8400-e29b-41d4-a716-446655440013'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid,
   'A', 'Brainstorm multiple creative solutions and explore new approaches',
   '{"Te": 1, "Ti": 1, "Fe": 2, "Fi": 1, "Ne": 3, "Ni": 1, "Se": 2, "Si": 0}'::jsonb, 1, now()),
  ('650e8400-e29b-41d4-a716-446655440014'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid,
   'B', 'Apply proven methods and learn from past successful experiences',
   '{"Te": 2, "Ti": 2, "Fe": 1, "Fi": 1, "Ne": 0, "Ni": 1, "Se": 1, "Si": 3}'::jsonb, 2, now()),
  ('650e8400-e29b-41d4-a716-446655440015'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid,
   'C', 'Step back to understand underlying patterns and root causes',
   '{"Te": 1, "Ti": 2, "Fe": 1, "Fi": 2, "Ne": 1, "Ni": 3, "Se": 0, "Si": 1}'::jsonb, 3, now()),
  ('650e8400-e29b-41d4-a716-446655440016'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid,
   'D', 'Take immediate action and adjust approach based on real-time feedback',
   '{"Te": 2, "Ti": 0, "Fe": 1, "Fi": 0, "Ne": 2, "Ni": 0, "Se": 3, "Si": 1}'::jsonb, 4, now()),

  -- INFO_PROCESS Block Options  
  ('650e8400-e29b-41d4-a716-446655440017'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid,
   'A', 'Synthesize information into coherent insights and future possibilities',
   '{"Te": 1, "Ti": 2, "Fe": 1, "Fi": 1, "Ne": 2, "Ni": 3, "Se": 0, "Si": 1}'::jsonb, 1, now()),
  ('650e8400-e29b-41d4-a716-446655440018'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid,
   'B', 'Focus on concrete, immediately available facts and current details',
   '{"Te": 2, "Ti": 1, "Fe": 1, "Fi": 0, "Ne": 1, "Ni": 0, "Se": 3, "Si": 2}'::jsonb, 2, now()),
  ('650e8400-e29b-41d4-a716-446655440019'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid,
   'C', 'Explore connections between ideas and generate new possibilities',
   '{"Te": 1, "Ti": 1, "Fe": 2, "Fi": 1, "Ne": 3, "Ni": 2, "Se": 1, "Si": 0}'::jsonb, 3, now()),
  ('650e8400-e29b-41d4-a716-446655440020'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid,
   'D', 'Compare new information with established knowledge and experience',
   '{"Te": 1, "Ti": 2, "Fe": 1, "Fi": 1, "Ne": 0, "Ni": 1, "Se": 2, "Si": 3}'::jsonb, 4, now()),

  -- ENERGY_FOCUS Block Options
  ('650e8400-e29b-41d4-a716-446655440021'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid,
   'A', 'Energized by meaningful work aligned with personal values',
   '{"Te": 0, "Ti": 1, "Fe": 1, "Fi": 3, "Ne": 1, "Ni": 2, "Se": 1, "Si": 1}'::jsonb, 1, now()),
  ('650e8400-e29b-41d4-a716-446655440022'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid,
   'B', 'Energized by positive interactions and helping others succeed',
   '{"Te": 1, "Ti": 0, "Fe": 3, "Fi": 2, "Ne": 2, "Ni": 1, "Se": 2, "Si": 1}'::jsonb, 2, now()),
  ('650e8400-e29b-41d4-a716-446655440023'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid,
   'C', 'Energized by achieving goals and seeing measurable progress',
   '{"Te": 3, "Ti": 1, "Fe": 1, "Fi": 0, "Ne": 1, "Ni": 1, "Se": 2, "Si": 2}'::jsonb, 3, now()),
  ('650e8400-e29b-41d4-a716-446655440024'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid,
   'D', 'Energized by deep understanding and intellectual mastery',
   '{"Te": 1, "Ti": 3, "Fe": 0, "Fi": 1, "Ne": 1, "Ni": 2, "Se": 0, "Si": 2}'::jsonb, 4, now())

ON CONFLICT (id) DO UPDATE SET
  block_id = EXCLUDED.block_id,
  option_code = EXCLUDED.option_code,
  prompt = EXCLUDED.prompt,
  weights_json = EXCLUDED.weights_json,
  order_index = EXCLUDED.order_index;