-- Create stripe_customers table to map Supabase users to Stripe customers
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL UNIQUE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- Users can read their own Stripe customer data
CREATE POLICY "Users read own stripe_customer"
  ON public.stripe_customers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all records (for webhooks)
CREATE POLICY "Service role manages stripe_customers"
  ON public.stripe_customers
  FOR ALL
  USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);

CREATE INDEX idx_stripe_customers_stripe_id ON public.stripe_customers(stripe_customer_id);
CREATE INDEX idx_stripe_customers_user_id ON public.stripe_customers(user_id);

-- Add index for faster product_code queries on entitlements
CREATE INDEX IF NOT EXISTS idx_entitlements_product ON public.entitlements(product_code, active);

-- Document expected product codes
COMMENT ON TABLE public.entitlements IS 'Product codes: prism_beta_monthly (Monthly Beta Membership), prism_beta_annual (Annual Beta Membership), prism_beta_lifetime (Lifetime Beta Membership), prism_advanced_pack (Advanced Results Pack one-time)';