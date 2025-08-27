-- Create versioned Forced-Choice (FC) scoring module
-- 1.1 FC block definitions (versioned)
CREATE TABLE IF NOT EXISTS public.fc_blocks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version       text NOT NULL DEFAULT 'v1.1',
  code          text NOT NULL,          -- e.g., 'FC01'
  title         text NOT NULL,
  description   text,
  order_index   int NOT NULL,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS fc_blocks_version_code_idx
  ON public.fc_blocks(version, code);

-- 1.2 FC options inside each block (each option carries weights)
-- weights_json = {"Ti":0.7,"Te":0.3,"Ni":0,...} or {"LIE":0.8,"ILI":0.2,...}
CREATE TABLE IF NOT EXISTS public.fc_options (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id      uuid NOT NULL REFERENCES public.fc_blocks(id) ON DELETE CASCADE,
  option_code   text NOT NULL,     -- 'A','B','C','D' (or any label)
  prompt        text NOT NULL,     -- what user sees
  weights_json  jsonb NOT NULL,    -- function/type weights (sum need not be 1.0)
  order_index   int NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS fc_options_block_code_idx
  ON public.fc_options(block_id, option_code);

-- 1.3 FC responses (one row per block answered)
CREATE TABLE IF NOT EXISTS public.fc_responses (
  session_id    uuid NOT NULL,
  block_id      uuid NOT NULL REFERENCES public.fc_blocks(id) ON DELETE RESTRICT,
  option_id     uuid NOT NULL REFERENCES public.fc_options(id) ON DELETE RESTRICT,
  answered_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, block_id)
);

-- 1.4 Session-level rollups (what scoring function writes)
-- fc_kind = 'functions' or 'types'
CREATE TABLE IF NOT EXISTS public.fc_scores (
  session_id    uuid NOT NULL,
  version       text NOT NULL DEFAULT 'v1.1',
  fc_kind       text NOT NULL,       -- 'functions'|'types'
  scores_json   jsonb NOT NULL,      -- {"Ti":58.2,"Ne":41.7,...} or {"LIE":0.74,...}
  blocks_answered int NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, version, fc_kind)
);