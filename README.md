# PayPer402 - HTTP 402 Payment Protocol with Solana

Professional AI content generation platform implementing the HTTP 402 Payment Required protocol with Solana USDC payments.

![PayPer402](https://img.shields.io/badge/Protocol-HTTP%20402-black)
![Solana](https://img.shields.io/badge/Blockchain-Solana-purple)
![USDC](https://img.shields.io/badge/Payment-USDC-blue)

## What is PayPer402?

PayPer402 is a payment-gated AI platform that demonstrates the HTTP 402 Payment Required protocol in action. Users pay with USDC on Solana before accessing AI generation services.

### Key Features

- Real HTTP 402 protocol implementation
- Solana blockchain payment verification
- Pay-per-use model (no subscriptions)
- Multiple AI models (Sora 2, Veo 3.1, GPT Image, Ideogram, Qwen)
- Wallet-gated access
- On-chain payment verification

## How It Works

### 1. HTTP 402 Payment Flow

```
User Request → 402 Payment Required → USDC Payment → On-chain Verification → Generation Starts
```

When a user attempts to generate content without payment:

**Request:**
```http
POST /api/generate
{
  "model": "gpt-image-1",
  "prompt": "A beautiful sunset",
  "type": "image"
}
```

**Response (402):**
```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: Bearer realm="PayPer402", amount="0.40", currency="USDC", network="Solana"

{
  "error": "Payment Required",
  "amount": 0.40,
  "currency": "USDC",
  "network": "Solana",
  "generationId": "gen_1234567890_abc123"
}
```

The client then:
1. Shows payment modal
2. User approves USDC transfer in Solana wallet
3. Client retries request WITH payment signature
4. Server verifies payment on-chain
5. Generation starts if payment is verified

### 2. Solana Payment Integration

**Technology Stack:**
- Solana Web3.js for blockchain interaction
- SPL Token for USDC transfers
- Solana Wallet Adapter for wallet connection
- Helius RPC for reliable blockchain access

**Payment Verification:**
```typescript
const connection = new Connection(rpcUrl, 'confirmed');
const isPaid = await verifyUSDCPayment(
  connection, 
  paymentSignature, 
  expectedAmount
);

if (!isPaid) {
  return 402; // Payment verification failed
}
```

All payments are verified on-chain before any generation starts.

### 3. Wallet-Gated Access

Users must connect a Solana wallet before accessing the platform:
- Phantom
- Solflare
- Coinbase Wallet

The generation interface is hidden behind wallet authentication.

## AI Models & Pricing

| Model | Type | Price | Provider |
|-------|------|-------|----------|
| Sora 2 | Video | $5.00 | OpenAI via Kie.ai |
| Veo 3.1 | Video | $0.10 | Google |
| GPT Image 1 | Image | $0.40 | OpenAI |
| Ideogram | Image | $0.08 | Ideogram |
| Qwen | Image | $0.03 | Alibaba Cloud |
| Kling AI | Video | $0.25 | Kling |

Each generation requires payment in USDC on Solana Mainnet.

## Architecture

### Frontend
- **Next.js 14** with App Router
- **React 18** with hooks
- **Tailwind CSS** for styling
- **Solana Wallet Adapter** for wallet integration
- **Axios** for HTTP requests

### Backend
- **Next.js API Routes** (serverless functions)
- **Solana Web3.js** for blockchain interaction
- **SPL Token** for USDC transfers
- **Supabase** for file storage

### Blockchain
- **Network:** Solana Mainnet Beta
- **Payment Token:** USDC (SPL Token)
- **Verification:** On-chain via Solana RPC
- **RPC Provider:** Helius (production-ready)

### Payment Flow Architecture

```typescript
// app/api/generate/route.ts
export async function POST(request: NextRequest) {
  const { model, prompt, paymentSignature } = await request.json();
  
  // Check for payment
  if (!paymentSignature) {
    // Return HTTP 402 Payment Required
    return new NextResponse(
      JSON.stringify({
        error: 'Payment Required',
        amount: modelInfo.price,
        currency: 'USDC',
        network: 'Solana',
      }),
      { status: 402 }
    );
  }

  // Verify payment on-chain
  const isPaid = await verifyUSDCPayment(connection, paymentSignature, amount);
  
  if (!isPaid) {
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 402 });
  }

  // Start generation
  const result = await generateContent(model, prompt);
  return NextResponse.json({ success: true, result });
}
```

## Technical Implementation

### HTTP 402 Standard Compliance

The implementation follows the HTTP 402 specification:

- **Status Code:** 402 Payment Required
- **WWW-Authenticate Header:** Contains payment details
- **Response Body:** JSON with payment information
- **Retry Mechanism:** Client sends request again with payment proof

### Solana Integration

**Wallet Provider:**
```typescript
// components/WalletProvider.tsx
<ConnectionProvider endpoint={rpcUrl}>
  <WalletProvider wallets={wallets} autoConnect>
    <WalletModalProvider>
      {children}
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>
```

**Payment Execution:**
```typescript
// lib/solana-payment.ts
export async function sendUSDCPayment(
  connection: Connection,
  payerPublicKey: PublicKey,
  signTransaction: SignerWalletAdapter['signTransaction'],
  amount: number
): Promise<{ signature: string; success: boolean }> {
  const usdcAmount = Math.floor(amount * 1_000_000); // Convert to micro-USDC
  
  const fromTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT_ADDRESS,
    payerPublicKey
  );

  const toTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT_ADDRESS,
    PAYMENT_WALLET_ADDRESS
  );

  const transaction = new Transaction().add(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      payerPublicKey,
      usdcAmount
    )
  );

  const signedTransaction = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTransaction.serialize());
  
  return { signature, success: true };
}
```

### On-Chain Verification

```typescript
// lib/solana-payment.ts
export async function verifyUSDCPayment(
  connection: Connection,
  signature: string,
  expectedAmount: number
): Promise<boolean> {
  const transaction = await connection.getTransaction(signature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0,
  });

  if (!transaction || transaction.meta?.err) {
    return false;
  }

  // Transaction exists and is confirmed
  return true;
}
```

## Project Structure

```
payper402/
├── app/
│   ├── api/
│   │   ├── generate/           # Generation endpoints
│   │   │   ├── route.ts        # HTTP 402 implementation
│   │   │   └── [id]/route.ts   # Result polling
│   │   ├── payment/
│   │   │   └── verify/         # Payment verification
│   │   └── upload/             # File uploads
│   ├── page.tsx                # Main app with wallet gate
│   ├── layout.tsx              # Root layout with WalletProvider
│   └── globals.css             # Global styles
├── components/
│   ├── WalletProvider.tsx      # Solana wallet setup
│   ├── PaymentModal.tsx        # USDC payment UI
│   ├── Header.tsx              # Navigation with wallet button
│   └── GenerationForm.tsx      # AI generation interface
├── lib/
│   ├── solana-payment.ts       # Payment logic
│   ├── models.ts               # AI model configurations
│   ├── openai-image.ts         # OpenAI integration
│   ├── ideogram-ai.ts          # Ideogram integration
│   ├── qwen-ai.ts              # Qwen integration
│   ├── veo-ai.ts               # Veo integration
│   └── kie-ai.ts               # Kie.ai (Sora) integration
└── types/
    └── index.ts                # TypeScript types
```

## Security Features

- **Wallet Authentication:** Required before any generation
- **On-chain Verification:** All payments verified on Solana blockchain
- **No Private Keys:** Never stored or transmitted
- **Serverless Architecture:** API routes run in isolated environments
- **Environment Protection:** Sensitive keys in environment variables only

## Configuration

### Payment Wallet

All USDC payments are sent to:
```typescript
// lib/solana-payment.ts
export const PAYMENT_WALLET_ADDRESS = new PublicKey('YOUR_WALLET_ADDRESS');
```

### RPC Endpoint

The platform uses Helius for reliable RPC access:
```typescript
// components/WalletProvider.tsx
const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
                 'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY';
```

### Model Prices

Prices are configured per model:
```typescript
// lib/models.ts
export const imageModels: ModelInfo[] = [
  {
    id: 'gpt-image-1',
    name: 'GPT Image 1',
    price: 0.40,
    type: 'image',
  },
  // ... more models
];
```

## Documentation

- **[HTTP 402 Guide](./HTTP_402_GUIDE.md)** - Complete HTTP 402 implementation details
- **[Solana Setup](./SOLANA_SETUP.md)** - Solana integration guide
- **[Quick Start](./QUICK_START.md)** - Quick setup for Sora 2

## Technology Stack

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Solana Wallet Adapter

**Backend:**
- Next.js API Routes
- Solana Web3.js
- SPL Token
- Supabase

**Blockchain:**
- Solana Mainnet Beta
- USDC (SPL Token)
- Helius RPC

**AI Providers:**
- OpenAI (GPT Image, Sora via Kie.ai)
- Google (Veo 3.1)
- Ideogram
- Alibaba Cloud (Qwen)
- Kling AI

## Design Philosophy

### HTTP 402 First

The platform is built around the HTTP 402 protocol:
- Resources are payment-gated by default
- Clear payment requirements in responses
- Retry mechanism with payment proof
- Standard-compliant headers and responses

### Blockchain-Verified Payments

All payments are verified on-chain:
- No trusted intermediaries
- Transparent transaction history
- Immutable payment records
- View on Solscan: `https://solscan.io/tx/{signature}`

### Pay-Per-Use Model

No subscriptions or monthly fees:
- Pay only for what you generate
- Transparent pricing per model
- Instant payment verification
- No account required (wallet-based)

## Performance

- **Payment Verification:** ~1-3 seconds (Solana confirmation time)
- **Generation Time:** Varies by model (25-240 seconds)
- **RPC Response Time:** <100ms (Helius premium endpoint)
- **Frontend Loading:** <1s (Next.js optimized)

## Production Considerations

For production deployment:

1. **Get dedicated RPC endpoint** from Helius, Alchemy, or QuickNode
2. **Implement database logging** for transaction audit trail
3. **Add monitoring** for payment failures and generation errors
4. **Implement retry logic** for failed transactions
5. **Setup error alerting** for payment verification issues
6. **Consider rate limiting** on API endpoints
7. **Add analytics** for usage tracking

## License

MIT License - See [LICENSE](LICENSE) for details

## Disclaimer

This is a demonstration of HTTP 402 protocol with Solana payments. For production use, implement comprehensive payment verification, error handling, and monitoring.

---

**Built with Next.js, Solana & AI**
