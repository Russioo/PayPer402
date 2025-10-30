/**
 * PumpPortal Buyback Service
 * Automatic buyback of $PAYPER tokens from 10% fee on all transactions
 */

import { PAYMENT_TOKEN_MINT_ADDRESS } from './solana-payment';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

const PUMPPORTAL_API_URL = 'https://pumpportal.fun/api/trade-local';

export interface BuybackRequest {
  feeAmountSOL: number; // 10% fee amount in SOL value
  transactionId: string; // Reference to original payment
}

export interface BuybackResult {
  success: boolean;
  txSignature?: string;
  error?: string;
  amountBought?: number;
}

/**
 * Executes automatic buyback of $PAYPER tokens via PumpPortal
 */
export async function executeBuyback(
  feeAmountSOL: number,
  referenceId: string
): Promise<BuybackResult> {
  try {
    console.log('🔥 Starting $PAYPER buyback...');
    console.log('💰 Fee amount:', feeAmountSOL, 'SOL');
    console.log('📝 Reference ID:', referenceId);

    // Get buyback wallet keys from environment
    const buybackPublicKey = process.env.BUYBACK_WALLET_PUBLIC_KEY;
    const buybackPrivateKey = process.env.BUYBACK_WALLET_PRIVATE_KEY;

    if (!buybackPublicKey || !buybackPrivateKey) {
      console.error('❌ Buyback wallet keys not configured');
      console.error('Set BUYBACK_WALLET_PUBLIC_KEY and BUYBACK_WALLET_PRIVATE_KEY in .env');
      return {
        success: false,
        error: 'Buyback wallet not configured',
      };
    }

    // Build PumpPortal trade request (EXACT format from docs)
    const tradeRequest = {
      publicKey: buybackPublicKey,
      action: 'buy',
      mint: PAYMENT_TOKEN_MINT_ADDRESS.toBase58(), // 4BwTM7JvCXnMHPoxfPBoNjxYSbQpVQUMPtK5KNGppump
      amount: feeAmountSOL,
      denominatedInSol: 'true', // Amount is in SOL
      slippage: 15, // 15% slippage tolerance
      priorityFee: 0.005, // Priority fee in SOL
      pool: 'auto', // Auto-select best pool
    };

    console.log('📤 Sending buyback request to PumpPortal...');
    console.log('Request:', JSON.stringify(tradeRequest, null, 2));
    
    let response;
    try {
      // Call PumpPortal API to get serialized transaction
      response = await fetch(PUMPPORTAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeRequest),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
    } catch (fetchError: any) {
      console.error('❌ PumpPortal fetch fejl:', fetchError);
      console.error('Fejl type:', fetchError.name, fetchError.code);
      
      if (fetchError.code === 'EAI_AGAIN' || fetchError.code === 'ENOTFOUND') {
        return {
          success: false,
          error: 'DNS lookup fejl - kan ikke nå pumpportal.fun. Tjek internet forbindelse.',
        };
      }
      
      return {
        success: false,
        error: `Netværks fejl: ${fetchError.message}`,
      };
    }

    if (!response.ok) {
      console.error('❌ PumpPortal API error:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return {
        success: false,
        error: `PumpPortal API error: ${response.status} - ${errorText}`,
      };
    }

    // Get serialized transaction from PumpPortal
    const txBuffer = await response.arrayBuffer();
    const txBytes = new Uint8Array(txBuffer);
    
    console.log('✅ Received transaction from PumpPortal');
    console.log('Transaction size:', txBytes.length, 'bytes');
    
    // Deserialize and sign transaction with our keypair
    // Decode base58 private key to Uint8Array
    const privateKeyBytes = bs58.decode(buybackPrivateKey);
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    
    console.log('✍️ Signing buyback transaction with wallet:', keypair.publicKey.toBase58());
    
    // Parse the versioned transaction
    const transaction = VersionedTransaction.deserialize(txBytes);
    
    // Sign it
    transaction.sign([keypair]);
    
    console.log('📤 Sending signed transaction to Solana...');
    
    // Send to RPC
    const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
                        'https://api.mainnet-beta.solana.com';
    
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
          Buffer.from(transaction.serialize()).toString('base64'),
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
        error: sendResult.error.message || JSON.stringify(sendResult.error),
      };
    }

    const txSignature = sendResult.result;
    console.log('✅ Buyback successful!');
    console.log('🔗 Transaction:', `https://solscan.io/tx/${txSignature}`);

    // Log buyback to database/tracking
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
    console.error('Error stack:', error.stack);
    return {
      success: false,
      error: error.message || 'Unknown buyback error',
    };
  }
}

/**
 * Calculates SOL value of fee based on token amount and price
 */
export async function calculateFeeValueInSOL(
  feeTokenAmount: number,
  tokenPriceUSD: number
): Promise<number> {
  // Get SOL price
  const solPrice = await getSOLPrice();
  
  // Calculate USD value of fee
  const feeUSD = feeTokenAmount * tokenPriceUSD;
  
  // Convert to SOL
  const feeSOL = feeUSD / solPrice;
  
  console.log(`💵 Fee calculation: ${feeTokenAmount} tokens × $${tokenPriceUSD} = $${feeUSD} = ${feeSOL} SOL`);
  
  return feeSOL;
}

/**
 * Gets current SOL price in USD from DexScreener
 */
export async function getSOLPrice(): Promise<number> {
  try {
    // Use DexScreener for SOL price
    const solMint = 'So11111111111111111111111111111111111111112';
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${solMint}`, {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.pairs && data.pairs.length > 0) {
        const mainPair = data.pairs[0];
        const price = parseFloat(mainPair.priceUsd);
        if (price && price > 0) {
          console.log('💰 SOL price from DexScreener:', `$${price}`);
          return price;
        }
      }
    }
    
    // Fallback to fixed value
    console.warn('⚠️  Could not fetch SOL price from DexScreener, using fallback: $170');
    return 170; // Fallback SOL price
  } catch (error) {
    console.warn('⚠️  Error fetching SOL price (using fallback $170):', error instanceof Error ? error.message : 'Unknown error');
    return 170; // Fallback
  }
}

/**
 * Logs buyback to tracking system
 */
async function logBuyback(data: {
  signature: string;
  amount: number;
  referenceId: string;
  timestamp: string;
}): Promise<void> {
  try {
    console.log('📝 Logging buyback:', data);
    
    // Import dynamically to avoid circular dependencies
    const { saveBuyback } = await import('./supabase-buybacks');
    
    // Get SOL price for USD value
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
    console.error('⚠️  Error logging buyback:', error);
    // Don't fail buyback if logging fails
  }
}

/**
 * Gets buyback statistics
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

