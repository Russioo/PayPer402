-- Buybacks Tracking Tabel
-- Kør denne SQL i din Supabase SQL Editor for at oprette buybacks tabellen

CREATE TABLE IF NOT EXISTS public.buybacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  signature TEXT NOT NULL UNIQUE,
  amount_sol DECIMAL(20, 9) NOT NULL,
  amount_usd DECIMAL(20, 2) NOT NULL,
  reference_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for hurtigere queries
CREATE INDEX IF NOT EXISTS idx_buybacks_timestamp ON public.buybacks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_buybacks_reference_id ON public.buybacks(reference_id);
CREATE INDEX IF NOT EXISTS idx_buybacks_status ON public.buybacks(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.buybacks ENABLE ROW LEVEL SECURITY;

-- Policy: Alle kan læse buybacks (transparent)
CREATE POLICY "Public buybacks read access" 
  ON public.buybacks 
  FOR SELECT 
  USING (true);

-- Policy: Kun service role kan indsætte (backend only)
CREATE POLICY "Service role insert access" 
  ON public.buybacks 
  FOR INSERT 
  WITH CHECK (true);

-- Kommentarer
COMMENT ON TABLE public.buybacks IS 'Tracker alle automatiske $PAYPER buybacks fra 10% fee';
COMMENT ON COLUMN public.buybacks.signature IS 'Solana transaction signature';
COMMENT ON COLUMN public.buybacks.amount_sol IS 'Buyback amount i SOL';
COMMENT ON COLUMN public.buybacks.amount_usd IS 'Buyback amount i USD';
COMMENT ON COLUMN public.buybacks.reference_id IS 'Reference til original payment (generationId)';

-- Kø til akkumulerede buybacks
CREATE TABLE IF NOT EXISTS public.buyback_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_signature TEXT NOT NULL,
  generation_id TEXT NOT NULL,
  amount_usd DECIMAL(20, 4) NOT NULL,
  model_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  batch_signature TEXT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_buyback_contributions_status ON public.buyback_contributions(status);
CREATE INDEX IF NOT EXISTS idx_buyback_contributions_created_at ON public.buyback_contributions(created_at);

ALTER TABLE public.buyback_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public buyback_contributions read access"
  ON public.buyback_contributions
  FOR SELECT
  USING (true);

CREATE POLICY "Service role buyback_contributions insert access"
  ON public.buyback_contributions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role buyback_contributions update access"
  ON public.buyback_contributions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.buyback_contributions IS 'Queue af individuelle 10% buyback-bidrag, processeres i batches';
COMMENT ON COLUMN public.buyback_contributions.payment_signature IS 'Solana payment signature fra brugeren';
COMMENT ON COLUMN public.buyback_contributions.amount_usd IS 'USD-beløb (10% af betaling) som skal buybackes';

