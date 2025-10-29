/**
 * Supabase Buyback Tracking
 * Gemmer og tracker alle buyback transaktioner
 */

import { supabase } from './supabase';

export interface BuybackRecord {
  id?: string;
  signature: string;
  amount_sol: number;
  amount_usd: number;
  reference_id: string;
  timestamp: string;
  status: 'success' | 'failed';
  error?: string;
}

/**
 * Gem buyback til database
 */
export async function saveBuyback(buyback: BuybackRecord): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('buybacks')
      .insert([
        {
          signature: buyback.signature,
          amount_sol: buyback.amount_sol,
          amount_usd: buyback.amount_usd,
          reference_id: buyback.reference_id,
          timestamp: buyback.timestamp,
          status: buyback.status,
          error: buyback.error,
        },
      ]);

    if (error) {
      console.error('Database error ved gemning af buyback:', error);
      return false;
    }

    console.log('✅ Buyback gemt i database');
    return true;
  } catch (error) {
    console.error('Fejl ved gemning af buyback:', error);
    return false;
  }
}

/**
 * Hent buyback statistik
 */
export async function getBuybackStats(): Promise<{
  totalBuybacks: number;
  totalVolumeSOL: number;
  totalVolumeUSD: number;
  last24h: number;
}> {
  try {
    // Total buybacks
    const { count } = await supabase
      .from('buybacks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success');

    // Total volume
    const { data: volumeData } = await supabase
      .from('buybacks')
      .select('amount_sol, amount_usd')
      .eq('status', 'success');

    const totalVolumeSOL = volumeData?.reduce((sum, record) => sum + record.amount_sol, 0) || 0;
    const totalVolumeUSD = volumeData?.reduce((sum, record) => sum + record.amount_usd, 0) || 0;

    // Last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: last24hCount } = await supabase
      .from('buybacks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success')
      .gte('timestamp', oneDayAgo);

    return {
      totalBuybacks: count || 0,
      totalVolumeSOL,
      totalVolumeUSD,
      last24h: last24hCount || 0,
    };
  } catch (error) {
    console.error('Fejl ved hentning af buyback stats:', error);
    return {
      totalBuybacks: 0,
      totalVolumeSOL: 0,
      totalVolumeUSD: 0,
      last24h: 0,
    };
  }
}

/**
 * Hent seneste buybacks
 */
export async function getRecentBuybacks(limit: number = 10): Promise<BuybackRecord[]> {
  try {
    const { data, error } = await supabase
      .from('buybacks')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Database error ved hentning af buybacks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Fejl ved hentning af buybacks:', error);
    return [];
  }
}

