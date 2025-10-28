export interface X402PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  generationId: string;
}

export interface X402PaymentResponse {
  paymentUrl: string;
  paymentId: string;
  statusUrl: string;
}

/**
 * Initialiserer en x402 betaling
 */
export async function initializePayment(
  request: X402PaymentRequest
): Promise<X402PaymentResponse> {
  // Dette er en mock implementation
  // I produktion skulle dette kalde x402 payment API
  const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    paymentUrl: `/payment/${paymentId}`,
    paymentId,
    statusUrl: `/api/payment/status/${paymentId}`,
  };
}

/**
 * Verificerer om en betaling er gennemført
 */
export async function verifyPayment(paymentId: string): Promise<boolean> {
  // Mock implementation - returnerer true efter 2 sekunder
  // I produktion skulle dette verificere med x402 blockchain
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 2000);
  });
}

/**
 * Generer HTTP 402 Payment Required response
 */
export function create402Response(amount: number, paymentUrl: string) {
  return {
    status: 402,
    message: 'Payment Required',
    amount,
    currency: 'USDC',
    paymentUrl,
    headers: {
      'WWW-Authenticate': `x402 amount="${amount}" currency="USDC" payment-url="${paymentUrl}"`,
    },
  };
}

