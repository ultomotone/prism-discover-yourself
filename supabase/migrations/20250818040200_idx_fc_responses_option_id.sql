-- Ensure index for fc_responses(option_id)
create index concurrently if not exists idx_fc_responses_option_id on public.fc_responses(option_id);
