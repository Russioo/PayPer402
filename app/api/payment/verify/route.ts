import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, generationId } = body;

    if (!paymentId || !generationId) {
      return NextResponse.json(
        { error: 'Payment ID and generation ID are required' },
        { status: 400 }
      );
    }

    // Verificer betaling med x402
    const isPaid = await verifyPayment(paymentId);

    if (isPaid) {
      return NextResponse.json({
        success: true,
        paid: true,
        generationId,
        message: 'Payment verified - generation started',
      });
    } else {
      return NextResponse.json({
        success: false,
        paid: false,
        message: 'Payment not found or not completed',
      });
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { error: 'Could not verify payment' },
      { status: 500 }
    );
  }
}

