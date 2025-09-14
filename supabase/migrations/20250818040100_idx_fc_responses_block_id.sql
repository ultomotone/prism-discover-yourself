-- Ensure index for fc_responses(block_id)
create index concurrently if not exists idx_fc_responses_block_id on public.fc_responses(block_id);
