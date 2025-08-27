-- Create type_prototypes table for PRISM type mapping
CREATE TABLE IF NOT EXISTS public.type_prototypes (
  type_code text NOT NULL,
  func text NOT NULL,
  block text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT type_prototypes_pkey PRIMARY KEY (type_code, func),
  CONSTRAINT type_prototypes_func_chk CHECK (func IN ('Ti','Te','Fi','Fe','Ni','Ne','Si','Se')),
  CONSTRAINT type_prototypes_block_chk CHECK (block IN ('base','creative','role','vulnerable','mobilizing','suggestive','ignoring','demonstrative')),
  CONSTRAINT type_prototypes_type_chk CHECK (type_code IN ('LIE','ILI','ESE','SEI','LII','ILE','ESI','SEE','LSE','SLI','EIE','IEI','LSI','SLE','EII','IEE'))
);

ALTER TABLE public.type_prototypes ENABLE ROW LEVEL SECURITY;

-- Policies: public read, service manage
CREATE POLICY IF NOT EXISTS "Type prototypes are publicly readable"
ON public.type_prototypes
FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Service role can manage type prototypes"
ON public.type_prototypes
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Updated-at trigger
DROP TRIGGER IF EXISTS update_type_prototypes_updated_at ON public.type_prototypes;
CREATE TRIGGER update_type_prototypes_updated_at
BEFORE UPDATE ON public.type_prototypes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data from current engine defaults (upsert)
INSERT INTO public.type_prototypes (type_code, func, block) VALUES
  -- LIE
  ('LIE','Ti','mobilizing'),('LIE','Te','base'),('LIE','Fi','vulnerable'),('LIE','Fe','demonstrative'),('LIE','Ni','creative'),('LIE','Ne','suggestive'),('LIE','Si','ignoring'),('LIE','Se','role'),
  -- ILI
  ('ILI','Ti','suggestive'),('ILI','Te','creative'),('ILI','Fi','role'),('ILI','Fe','ignoring'),('ILI','Ni','base'),('ILI','Ne','mobilizing'),('ILI','Si','demonstrative'),('ILI','Se','vulnerable'),
  -- ESE
  ('ESE','Ti','vulnerable'),('ESE','Te','ignoring'),('ESE','Fi','mobilizing'),('ESE','Fe','base'),('ESE','Ni','suggestive'),('ESE','Ne','role'),('ESE','Si','creative'),('ESE','Se','demonstrative'),
  -- SEI
  ('SEI','Ti','role'),('SEI','Te','demonstrative'),('SEI','Fi','suggestive'),('SEI','Fe','creative'),('SEI','Ni','mobilizing'),('SEI','Ne','vulnerable'),('SEI','Si','base'),('SEI','Se','ignoring'),
  -- LII
  ('LII','Ti','base'),('LII','Te','mobilizing'),('LII','Fi','ignoring'),('LII','Fe','vulnerable'),('LII','Ni','role'),('LII','Ne','creative'),('LII','Si','suggestive'),('LII','Se','demonstrative'),
  -- ILE
  ('ILE','Ti','creative'),('ILE','Te','suggestive'),('ILE','Fi','demonstrative'),('ILE','Fe','role'),('ILE','Ni','vulnerable'),('ILE','Ne','base'),('ILE','Si','mobilizing'),('ILE','Se','ignoring'),
  -- ESI
  ('ESI','Ti','ignoring'),('ESI','Te','vulnerable'),('ESI','Fi','base'),('ESI','Fe','mobilizing'),('ESI','Ni','role'),('ESI','Ne','suggestive'),('ESI','Si','demonstrative'),('ESI','Se','creative'),
  -- SEE
  ('SEE','Ti','demonstrative'),('SEE','Te','role'),('SEE','Fi','creative'),('SEE','Fe','suggestive'),('SEE','Ni','vulnerable'),('SEE','Ne','mobilizing'),('SEE','Si','ignoring'),('SEE','Se','base'),
  -- LSE
  ('LSE','Ti','mobilizing'),('LSE','Te','base'),('LSE','Fi','vulnerable'),('LSE','Fe','demonstrative'),('LSE','Ni','ignoring'),('LSE','Ne','suggestive'),('LSE','Si','creative'),('LSE','Se','role'),
  -- SLI
  ('SLI','Ti','suggestive'),('SLI','Te','creative'),('SLI','Fi','role'),('SLI','Fe','ignoring'),('SLI','Ni','mobilizing'),('SLI','Ne','demonstrative'),('SLI','Si','base'),('SLI','Se','vulnerable'),
  -- EIE
  ('EIE','Ti','vulnerable'),('EIE','Te','ignoring'),('EIE','Fi','mobilizing'),('EIE','Fe','base'),('EIE','Ni','creative'),('EIE','Ne','role'),('EIE','Si','suggestive'),('EIE','Se','demonstrative'),
  -- IEI
  ('IEI','Ti','role'),('IEI','Te','demonstrative'),('IEI','Fi','suggestive'),('IEI','Fe','creative'),('IEI','Ni','base'),('IEI','Ne','vulnerable'),('IEI','Si','mobilizing'),('IEI','Se','ignoring'),
  -- LSI
  ('LSI','Ti','base'),('LSI','Te','mobilizing'),('LSI','Fi','ignoring'),('LSI','Fe','vulnerable'),('LSI','Ni','role'),('LSI','Ne','suggestive'),('LSI','Si','demonstrative'),('LSI','Se','creative'),
  -- SLE
  ('SLE','Ti','creative'),('SLE','Te','suggestive'),('SLE','Fi','demonstrative'),('SLE','Fe','role'),('SLE','Ni','vulnerable'),('SLE','Ne','mobilizing'),('SLE','Si','ignoring'),('SLE','Se','base'),
  -- EII
  ('EII','Ti','demonstrative'),('EII','Te','vulnerable'),('EII','Fi','base'),('EII','Fe','mobilizing'),('EII','Ni','role'),('EII','Ne','creative'),('EII','Si','suggestive'),('EII','Se','ignoring'),
  -- IEE
  ('IEE','Ti','demonstrative'),('IEE','Te','role'),('IEE','Fi','creative'),('IEE','Fe','suggestive'),('IEE','Ni','vulnerable'),('IEE','Ne','base'),('IEE','Si','mobilizing'),('IEE','Se','ignoring')
ON CONFLICT (type_code, func) DO UPDATE SET block = EXCLUDED.block, updated_at = now();