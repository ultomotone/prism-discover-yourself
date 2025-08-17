-- Tighten RLS on public.trading_candles
-- Ensure RLS is enabled
ALTER TABLE public.trading_candles ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.trading_candles;
DROP POLICY IF EXISTS "Allow Cloudflare insert" ON public.trading_candles;

-- Allow reads only for authenticated users (and service role)
CREATE POLICY "Authenticated users can read trading candles"
ON public.trading_candles
FOR SELECT
USING (
  auth.uid() IS NOT NULL OR auth.role() = 'service_role'
);

-- Allow inserts only for service role (e.g., server/ingestion jobs)
CREATE POLICY "Service role can insert trading candles"
ON public.trading_candles
FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
);
