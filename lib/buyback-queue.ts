import { supabase } from './supabase';

export interface BuybackContribution {
  id?: string;
  payment_signature: string;
  generation_id: string;
  amount_usd: number;
  model_name?: string;
  status?: 'pending' | 'processed' | 'failed';
  created_at?: string;
  processed_at?: string | null;
  batch_signature?: string | null;
  error?: string | null;
}

export async function queueBuybackContribution(contribution: {
  paymentSignature: string;
  generationId: string;
  amountUSD: number;
  modelName?: string;
}): Promise<void> {
  const { error } = await supabase
    .from('buyback_contributions')
    .insert([
      {
        payment_signature: contribution.paymentSignature,
        generation_id: contribution.generationId,
        amount_usd: contribution.amountUSD,
        model_name: contribution.modelName ?? null,
        status: 'pending',
      },
    ]);

  if (error) {
    console.error('❌ Kunne ikke queue buyback contribution:', error);
    throw new Error(error.message || 'Failed to queue buyback contribution');
  }
}

export async function getPendingBuybackContributions(): Promise<BuybackContribution[]> {
  const { data, error } = await supabase
    .from('buyback_contributions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Kunne ikke hente pending buyback contributions:', error);
    throw new Error(error.message || 'Failed to fetch pending buyback contributions');
  }

  return data ?? [];
}

export async function markBuybackContributionsProcessed(
  ids: string[],
  batchSignature: string
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('buyback_contributions')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      batch_signature: batchSignature,
    })
    .in('id', ids);

  if (error) {
    console.error('❌ Kunne ikke opdatere buyback contributions til processed:', error);
    throw new Error(error.message || 'Failed to mark contributions as processed');
  }
}

export async function markBuybackContributionsFailed(
  ids: string[],
  errorMessage: string
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('buyback_contributions')
    .update({
      status: 'failed',
      processed_at: new Date().toISOString(),
      error: errorMessage,
    })
    .in('id', ids);

  if (error) {
    console.error('❌ Kunne ikke markere buyback contributions som failed:', error);
    throw new Error(error.message || 'Failed to mark contributions as failed');
  }
}

