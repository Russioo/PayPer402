import { NextRequest, NextResponse } from 'next/server';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { verifyUSDCPayment } from '@/lib/solana-payment';

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

    // Server-side RPC endpoint (private, not exposed to browser)
    // Uses your private Helius API key for reliable payment verification
    const rpcUrl = process.env.SOLANA_RPC_URL || 
                   clusterApiUrl('mainnet-beta');
    const connection = new Connection(rpcUrl, 'confirmed');

    // Verificer betaling on-chain
    const isPaid = await verifyUSDCPayment(connection, signature, amount);

    if (isPaid) {
      console.log('✅ Betaling verificeret!');
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

