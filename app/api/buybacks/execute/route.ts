import { NextRequest, NextResponse } from 'next/server';

import { executeBuyback, getSOLPrice } from '@/lib/pumpportal-buyback';
import {
  getPendingBuybackContributions,
  markBuybackContributionsProcessed,
} from '@/lib/buyback-queue';
import { saveBuyback } from '@/lib/supabase-buybacks';

export async function POST(request: NextRequest) {
  try {
    const executionKey = process.env.BUYBACK_EXECUTION_KEY;

    if (executionKey) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${executionKey}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const pendingContributions = await getPendingBuybackContributions();

    if (pendingContributions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending buyback contributions to process',
      });
    }

    const totalUSD = pendingContributions.reduce((sum, contribution) => sum + (contribution.amount_usd ?? 0), 0);

    if (totalUSD <= 0) {
      return NextResponse.json({
        success: true,
        message: 'Pending contributions sum to $0. Nothing to buy back.',
      });
    }

    const solPrice = await getSOLPrice();
    const totalSOL = totalUSD / solPrice;

    if (totalSOL < 0.001) {
      return NextResponse.json({
        success: true,
        message: `Total buyback amount too small to execute: ${totalSOL} SOL`,
      });
    }

    const batchId = `batch-${new Date().toISOString()}`;
    const buybackResult = await executeBuyback(totalSOL, batchId);

    if (!buybackResult.success || !buybackResult.txSignature) {
      const errorMessage = buybackResult.error || 'Unknown buyback error';
      return NextResponse.json({
        success: false,
        message: 'Buyback execution failed',
        error: errorMessage,
      }, { status: 500 });
    }

    const contributionIds = pendingContributions
      .map((contribution) => contribution.id)
      .filter((id): id is string => Boolean(id));

    await markBuybackContributionsProcessed(contributionIds, buybackResult.txSignature);

    await saveBuyback({
      signature: buybackResult.txSignature,
      amount_sol: totalSOL,
      amount_usd: totalUSD,
      reference_id: batchId,
      timestamp: new Date().toISOString(),
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: `Executed buyback batch with ${pendingContributions.length} contributions`,
      totalUSD,
      totalSOL,
      txSignature: buybackResult.txSignature,
    });
  } catch (error: any) {
    console.error('❌ Buyback batch execution failed:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Buyback batch execution failed',
    }, { status: 500 });
  }
}

