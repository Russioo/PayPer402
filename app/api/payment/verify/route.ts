import { NextRequest, NextResponse } from 'next/server';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { verifyUSDCPayment, getTokenPriceUSD } from '@/lib/solana-payment';
import { executeBuyback, calculateFeeValueInSOL } from '@/lib/pumpportal-buyback';
import { BUYBACK_FEE_PERCENTAGE } from '@/lib/token-price';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signature, generationId, amount } = body;

    if (!signature || !generationId) {
      return NextResponse.json(
        { error: 'Signature and generation ID are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificerer Solana betaling...');
    console.log('Signature:', signature);
    console.log('Generation ID:', generationId);
    console.log('Expected amount:', amount, 'USDC');

    // RPC endpoint for payment verification
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
                   clusterApiUrl('mainnet-beta');
    const connection = new Connection(rpcUrl, 'confirmed');

    // Verificer betaling on-chain
    const isPaid = await verifyUSDCPayment(connection, signature, amount);

    if (isPaid) {
      console.log('✅ Betaling verificeret!');
      
      // Udfør automatisk buyback med 10% fee
      try {
        console.log('🔄 Starter automatisk buyback...');
        
        // Beregn 10% af brugerens betaling
        const feeUSD = amount * 0.1;
        
        // Gang med 4000 for buyback amount
        const buybackUSD = feeUSD * 4000;
        
        console.log(`💳 Bruger betaler: $${amount.toFixed(4)} USD`);
        console.log(`💰 10% af betaling: $${feeUSD.toFixed(4)} USD`);
        console.log(`🔥 Buyback amount: $${buybackUSD.toFixed(2)} USD (${feeUSD} × 4000)`);
        
        // Hent SOL pris for at konvertere USD til SOL
        const solPriceResponse = await fetch('https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112');
        const solPriceData = await solPriceResponse.json();
        const solPrice = solPriceData.data?.['So11111111111111111111111111111111111111112']?.price || 150;
        
        // Konverter buyback USD til SOL
        const feeSOL = buybackUSD / solPrice;
        
        // Minimum 0.001 SOL for at det giver mening
        if (feeSOL >= 0.001) {
          console.log(`💰 Udfører buyback for ${feeSOL} SOL...`);
          
          const buybackResult = await executeBuyback(feeSOL, generationId);
          
          if (buybackResult.success) {
            console.log('✅ Buyback gennemført!', buybackResult.txSignature);
          } else {
            console.warn('⚠️  Buyback fejlede:', buybackResult.error);
            // Vi fortsætter alligevel med payment - buyback er ikke critical
          }
        } else {
          console.log('⚠️  Fee for lille til buyback:', feeSOL, 'SOL');
        }
      } catch (buybackError) {
        console.error('❌ Buyback error (non-critical):', buybackError);
        // Buyback error skal ikke stoppe payment flow
      }
      
      return NextResponse.json({
        success: true,
        paid: true,
        generationId,
        signature,
        message: 'Payment verified on Solana - generation started',
      });
    } else {
      console.log('❌ Betaling kunne ikke verificeres');
      return NextResponse.json({
        success: false,
        paid: false,
        message: 'Payment not found or not completed on Solana',
      }, { status: 402 });
    }
  } catch (error: any) {
    console.error('❌ Payment verification failed:', error);
    return NextResponse.json(
      { 
        error: 'Could not verify payment',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

