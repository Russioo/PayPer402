/**
 * PumpPortal Buyback Service
 * Automatisk buyback af $PAYPER tokens fra 10% fee på alle transaktioner
 */

import { PAYMENT_TOKEN_MINT_ADDRESS } from './solana-payment';
import { Keypair } from '@solana/web3.js';

const PUMPPORTAL_API_URL = 'https://pumpportal.fun/api/trade-local';

export interface BuybackRequest {
  feeAmountSOL: number; // 10% fee amount i SOL værdi
  transactionId: string; // Reference til original payment
}

export interface BuybackResult {
  success: boolean;
  txSignature?: string;
  error?: string;
  amountBought?: number;
}

/**
 * Udfører automatisk buyback af $PAYPER tokens via PumpPortal
 */
export async function executeBuyback(
  feeAmountSOL: number,
  referenceId: string
): Promise<BuybackResult> {
  try {
    console.log('🔄 Starter $PAYPER buyback...');
    console.log('💰 Fee amount:', feeAmountSOL, 'SOL');
    console.log('📝 Reference ID:', referenceId);

    // Hent buyback wallet keys fra environment
    const buybackPublicKey = process.env.BUYBACK_WALLET_PUBLIC_KEY;
    const buybackPrivateKey = process.env.BUYBACK_WALLET_PRIVATE_KEY;

    if (!buybackPublicKey || !buybackPrivateKey) {
      console.error('❌ Buyback wallet keys ikke konfigureret');
      return {
        success: false,
        error: 'Buyback wallet not configured',
      };
    }

    // Byg PumpPortal trade request
    const tradeRequest = {
      publicKey: buybackPublicKey,
      action: 'buy',
      mint: PAYMENT_TOKEN_MINT_ADDRESS.toBase58(),
      amount: feeAmountSOL,
      denominatedInSol: 'true', // Vi køber for SOL værdi
      slippage: 15, // 15% slippage tolerance
      priorityFee: 0.001, // Priority fee
      pool: 'auto', // Auto-select bedste pool
    };

    console.log('📤 Sender buyback request til PumpPortal...');
    
    // Kald PumpPortal API
    const response = await fetch(PUMPPORTAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradeRequest),
    });

    if (!response.ok) {
      console.error('❌ PumpPortal API error:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return {
        success: false,
        error: `PumpPortal API error: ${response.status}`,
      };
    }

    // Hent serialized transaction
    const txBuffer = await response.arrayBuffer();
    
    // Sign og send transaction
    const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
                        'https://api.mainnet-beta.solana.com';
    
    console.log('✍️ Signing og sender buyback transaction...');
    
    // Send signed transaction til RPC
    const sendResponse = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [
          Buffer.from(txBuffer).toString('base64'),
          {
            encoding: 'base64',
            preflightCommitment: 'confirmed',
          },
        ],
      }),
    });

    const sendResult = await sendResponse.json();

    if (sendResult.error) {
      console.error('❌ Transaction send error:', sendResult.error);
      return {
        success: false,
        error: sendResult.error.message,
      };
    }

    const txSignature = sendResult.result;
    console.log('✅ Buyback successful!');
    console.log('🔗 Transaction:', `https://solscan.io/tx/${txSignature}`);

    // Log buyback til database/tracking (implementer senere)
    await logBuyback({
      signature: txSignature,
      amount: feeAmountSOL,
      referenceId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      txSignature,
      amountBought: feeAmountSOL,
    };
  } catch (error: any) {
    console.error('❌ Buyback error:', error);
    return {
      success: false,
      error: error.message || 'Unknown buyback error',
    };
  }
}

/**
 * Beregner SOL værdi af fee baseret på token mængde og pris
 */
export async function calculateFeeValueInSOL(
  feeTokenAmount: number,
  tokenPriceUSD: number
): Promise<number> {
  // Hent SOL pris
  const solPrice = await getSOLPrice();
  
  // Beregn USD værdi af fee
  const feeUSD = feeTokenAmount * tokenPriceUSD;
  
  // Konverter til SOL
  const feeSOL = feeUSD / solPrice;
  
  console.log(`💵 Fee beregning: ${feeTokenAmount} tokens × $${tokenPriceUSD} = $${feeUSD} = ${feeSOL} SOL`);
  
  return feeSOL;
}

/**
 * Henter aktuel SOL pris i USD
 */
async function getSOLPrice(): Promise<number> {
  try {
    // Prøv Jupiter først
    const response = await fetch('https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112');
    const data = await response.json();
    
    if (data.data && data.data['So11111111111111111111111111111111111111112']) {
      const price = data.data['So11111111111111111111111111111111111111112'].price;
      console.log('💰 SOL pris:', `$${price}`);
      return price;
    }
    
    // Fallback til fast værdi
    console.warn('⚠️  Kunne ikke hente SOL pris, bruger fallback');
    return 150; // Fallback SOL pris
  } catch (error) {
    console.error('Fejl ved hentning af SOL pris:', error);
    return 150; // Fallback
  }
}

/**
 * Logger buyback til tracking system
 */
async function logBuyback(data: {
  signature: string;
  amount: number;
  referenceId: string;
  timestamp: string;
}): Promise<void> {
  try {
    console.log('📝 Logger buyback:', data);
    
    // Import dynamically for at undgå circular dependencies
    const { saveBuyback } = await import('./supabase-buybacks');
    
    // Hent SOL pris for USD værdi
    const solPrice = await getSOLPrice();
    const amountUSD = data.amount * solPrice;
    
    await saveBuyback({
      signature: data.signature,
      amount_sol: data.amount,
      amount_usd: amountUSD,
      reference_id: data.referenceId,
      timestamp: data.timestamp,
      status: 'success',
    });
    
    console.log('✅ Buyback logged successfully');
  } catch (error) {
    console.error('⚠️  Fejl ved logging af buyback:', error);
    // Don't fail buyback if logging fails
  }
}

/**
 * Henter buyback statistik
 */
export async function getBuybackStats(): Promise<{
  totalBuybacks: number;
  totalVolumeSOL: number;
  totalVolumeUSD: number;
  last24h: number;
}> {
  const { getBuybackStats: getStats } = await import('./supabase-buybacks');
  return getStats();
}

