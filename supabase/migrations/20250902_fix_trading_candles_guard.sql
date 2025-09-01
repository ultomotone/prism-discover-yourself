DO $$
BEGIN
  IF to_regclass('public.trading_candles') IS NOT NULL THEN
    ALTER TABLE public.trading_candles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
