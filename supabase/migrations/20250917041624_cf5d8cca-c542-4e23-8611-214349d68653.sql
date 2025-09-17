-- IR-07B: Create mock FC responses for smoke testing
-- Insert responses for test sessions to enable fc scoring verification

INSERT INTO fc_responses (session_id, block_id, option_id, answered_at)
VALUES 
  -- Test session 1: 618c5ea6-aeda-4084-9156-0aac9643afd3
  ('618c5ea6-aeda-4084-9156-0aac9643afd3'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '650e8400-e29b-41d4-a716-446655440001'::uuid, now()),
  ('618c5ea6-aeda-4084-9156-0aac9643afd3'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '650e8400-e29b-41d4-a716-446655440005'::uuid, now()),
  ('618c5ea6-aeda-4084-9156-0aac9643afd3'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, '650e8400-e29b-41d4-a716-446655440009'::uuid, now()),
  ('618c5ea6-aeda-4084-9156-0aac9643afd3'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, '650e8400-e29b-41d4-a716-446655440013'::uuid, now()),
  ('618c5ea6-aeda-4084-9156-0aac9643afd3'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid, '650e8400-e29b-41d4-a716-446655440017'::uuid, now()),
  ('618c5ea6-aeda-4084-9156-0aac9643afd3'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid, '650e8400-e29b-41d4-a716-446655440021'::uuid, now()),
  
  -- Test session 2: 070d9bf2-516f-44ee-87fc-017c7db9d29c (different pattern for variety)
  ('070d9bf2-516f-44ee-87fc-017c7db9d29c'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '650e8400-e29b-41d4-a716-446655440002'::uuid, now()),
  ('070d9bf2-516f-44ee-87fc-017c7db9d29c'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '650e8400-e29b-41d4-a716-446655440006'::uuid, now()),
  ('070d9bf2-516f-44ee-87fc-017c7db9d29c'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, '650e8400-e29b-41d4-a716-446655440010'::uuid, now()),
  ('070d9bf2-516f-44ee-87fc-017c7db9d29c'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, '650e8400-e29b-41d4-a716-446655440014'::uuid, now()),
  ('070d9bf2-516f-44ee-87fc-017c7db9d29c'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid, '650e8400-e29b-41d4-a716-446655440018'::uuid, now()),
  ('070d9bf2-516f-44ee-87fc-017c7db9d29c'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid, '650e8400-e29b-41d4-a716-446655440022'::uuid, now())

ON CONFLICT (session_id, block_id) DO UPDATE SET
  option_id = EXCLUDED.option_id,
  answered_at = EXCLUDED.answered_at;