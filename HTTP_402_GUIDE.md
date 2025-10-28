# HTTP 402 Payment Protocol Implementation Guide

Dette dokument beskriver hvordan PayPer402 implementerer den rigtige HTTP 402 Payment Required protocol med Solana USDC betalinger.

## 📖 HTTP 402 Protocol Oversigt

HTTP 402 Payment Required er en HTTP statuskode reserveret til fremtidige digital payment systemer. PayPer402 implementerer dette med Solana blockchain betalinger.

### RFC Specification

```
HTTP/1.1 402 Payment Required
WWW-Authenticate: Bearer realm="PayPer402", amount="0.50", currency="USDC", network="Solana"
Content-Type: application/json

{
  "error": "Payment Required",
  "message": "This resource requires payment",
  "generationId": "gen_1234567890_abc123",
  "paymentRequired": true,
  "amount": 0.50,
  "currency": "USDC",
  "network": "Solana",
  "model": "GPT Image 1"
}
```

## 🔄 Payment Flow

### 1. Initial Request (Uden Betaling)

Client sender en generation request:

```javascript
POST /api/generate
{
  "model": "gpt-image-1",
  "prompt": "A beautiful sunset",
  "type": "image",
  "options": {}
}
```

### 2. Server Returnerer 402

Server tjekker at der ikke er betalt og returnerer HTTP 402:

```javascript
HTTP/1.1 402 Payment Required
WWW-Authenticate: Bearer realm="PayPer402", amount="0.40", currency="USDC", network="Solana"

{
  "error": "Payment Required",
  "generationId": "gen_1234567890_abc123",
  "paymentRequired": true,
  "amount": 0.40,
  "currency": "USDC",
  "network": "Solana",
  "model": "GPT Image 1"
}
```

### 3. Client Betaler via Solana

Client modtager 402 response og:

1. Viser payment modal til bruger
2. Bruger godkender USDC transfer i Solana wallet
3. Transaction sendes til Solana blockchain
4. Client modtager transaction signature

```javascript
// Example Solana payment
const signature = await sendUSDCPayment(
  connection,
  userWallet,
  signTransaction,
  0.40 // amount in USDC
);
// Returns: "5j7s...xyz123" (transaction signature)
```

### 4. Retry Request med Payment Proof

Client sender samme request igen, MED payment signature:

```javascript
POST /api/generate
{
  "model": "gpt-image-1",
  "prompt": "A beautiful sunset",
  "type": "image",
  "options": {},
  "paymentSignature": "5j7s...xyz123"
}
```

### 5. Server Verificerer og Starter Generation

Server:

1. Modtager paymentSignature
2. Verificerer transaction on-chain via Solana RPC
3. Tjekker at payment er confirmed
4. Starter AI generation
5. Returnerer 200 OK med generation status

```javascript
HTTP/1.1 200 OK

{
  "success": true,
  "taskId": "task_1234567890",
  "message": "Image generation started",
  "status": "processing"
}
```

## 💻 Implementation Detaljer

### Backend: Generation API

**File:** `app/api/generate/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { model, prompt, type, options, paymentSignature } = await request.json();
  
  const modelInfo = getModelById(model);
  
  // ====== HTTP 402 CHECK ======
  if (!paymentSignature) {
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store pending payment info
    pendingPayments.set(generationId, {
      model, prompt, type, options,
      amount: modelInfo.price,
      createdAt: new Date(),
    });

    // Return HTTP 402 Payment Required
    return new NextResponse(
      JSON.stringify({
        error: 'Payment Required',
        generationId,
        paymentRequired: true,
        amount: modelInfo.price,
        currency: 'USDC',
        network: 'Solana',
        model: modelInfo.name,
      }),
      { 
        status: 402,
        headers: {
          'WWW-Authenticate': `Bearer realm="PayPer402", amount="${modelInfo.price}", currency="USDC", network="Solana"`,
        },
      }
    );
  }

  // Verify payment on-chain
  const connection = new Connection(clusterApiUrl('mainnet-beta'));
  const isPaid = await verifyUSDCPayment(connection, paymentSignature, modelInfo.price);

  if (!isPaid) {
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 402 }
    );
  }

  // Payment verified - start generation
  // ... generation logic ...
}
```

### Frontend: Payment Handling

**File:** `app/page.tsx`

```typescript
const handleGenerate = async (prompt: string, options: any) => {
  try {
    // Try to start generation
    const response = await axios.post('/api/generate', {
      model: selectedModel,
      prompt,
      type: activeTab,
      options,
    });
    
    // Success - generation started
    // ... poll for results ...
    
  } catch (error: any) {
    if (error.response?.status === 402) {
      // HTTP 402 - Payment Required
      const model = currentModels.find((m) => m.id === selectedModel);
      
      setPaymentData({
        amount: error.response.data.amount,
        modelName: model?.name || '',
        generationId: error.response.data.generationId,
        prompt,
      });
      
      setShowPaymentModal(true); // Show payment UI
    }
  }
};

const handlePaymentComplete = async (signature: string) => {
  // Retry generation request WITH payment signature
  const response = await axios.post('/api/generate', {
    model: selectedModel,
    prompt: paymentData.prompt,
    type: activeTab,
    options: {},
    paymentSignature: signature, // Include payment proof
  });
  
  // Generation now starts...
};
```

### Payment Verification

**File:** `lib/solana-payment.ts`

```typescript
export async function verifyUSDCPayment(
  connection: Connection,
  signature: string,
  expectedAmount: number
): Promise<boolean> {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) return false;
    if (transaction.meta?.err) return false;

    // Payment exists and is confirmed
    return true;
  } catch (error) {
    return false;
  }
}
```

## 🔐 Sikkerhed & Best Practices

### 1. On-Chain Verification

✅ **DO**: Verificer altid payment on-chain
```typescript
const isPaid = await verifyUSDCPayment(connection, signature, amount);
```

❌ **DON'T**: Stol på client-side payment claims uden verification

### 2. Idempotency

For at undgå duplikerede generinger ved retries:

```typescript
// Store completed payments
const completedPayments = new Set<string>();

if (completedPayments.has(paymentSignature)) {
  return NextResponse.json(
    { error: 'Payment already used' },
    { status: 409 }
  );
}

// After successful generation
completedPayments.add(paymentSignature);
```

### 3. Amount Verification

Udvid `verifyUSDCPayment` til at verificere nøjagtig amount:

```typescript
export async function verifyUSDCPayment(
  connection: Connection,
  signature: string,
  expectedAmount: number
): Promise<boolean> {
  const transaction = await connection.getTransaction(signature);
  
  // Parse token transfer instruction
  const transferAmount = parseTransferAmount(transaction);
  
  // Verify amount matches (med tolerance for rounding)
  const tolerance = 0.01; // 1 cent tolerance
  return Math.abs(transferAmount - expectedAmount) < tolerance;
}
```

### 4. Timeout Handling

Payment requests skal have timeout:

```typescript
pendingPayments.set(generationId, {
  // ...
  expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
});

// Cleanup expired payments
setInterval(() => {
  const now = new Date();
  for (const [id, payment] of pendingPayments) {
    if (payment.expiresAt < now) {
      pendingPayments.delete(id);
    }
  }
}, 60 * 1000); // Check every minute
```

## 📊 Payment States

```
┌─────────────┐
│  No Payment │
│   (402)     │
└──────┬──────┘
       │
       │ User pays via Solana
       ↓
┌─────────────┐
│  Payment    │
│  Pending    │
└──────┬──────┘
       │
       │ Blockchain confirms
       ↓
┌─────────────┐
│  Payment    │
│  Verified   │
└──────┬──────┘
       │
       │ Generation starts
       ↓
┌─────────────┐
│  Generation │
│  Processing │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Completed  │
│   (200)     │
└─────────────┘
```

## 🧪 Testing

### Test på Devnet

```typescript
// 1. Skift til devnet i alle filer
const endpoint = clusterApiUrl('devnet');

// 2. Brug devnet USDC
const USDC_MINT_ADDRESS = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// 3. Få devnet SOL og USDC
// SOL: https://faucet.solana.com/
// USDC: (find devnet faucet eller mint selv)
```

### Test 402 Response

```bash
# Send request uden payment
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "test",
    "type": "image"
  }'

# Should return:
# HTTP/1.1 402 Payment Required
# {
#   "error": "Payment Required",
#   "generationId": "gen_...",
#   "amount": 0.40,
#   ...
# }
```

### Test med Payment

```bash
# Send request MED payment signature
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "test",
    "type": "image",
    "paymentSignature": "YOUR_SOLANA_TX_SIGNATURE"
  }'

# Should return:
# HTTP/1.1 200 OK
# {
#   "success": true,
#   "taskId": "task_...",
#   ...
# }
```

## 📈 Monitoring & Logging

### Log Alle Payment Events

```typescript
// Log 402 responses
console.log('🚫 HTTP 402: Payment Required', {
  generationId,
  amount,
  model,
  timestamp: new Date(),
});

// Log payment verifications
console.log('💳 Verificerer betaling', {
  signature,
  expectedAmount,
  timestamp: new Date(),
});

// Log successful verifications
console.log('✅ Betaling verificeret', {
  signature,
  generationId,
  timestamp: new Date(),
});
```

### Database Logging (Anbefalet)

```typescript
// Log til database for audit trail
await db.payments.create({
  signature,
  generationId,
  amount,
  currency: 'USDC',
  network: 'Solana',
  status: 'verified',
  timestamp: new Date(),
});
```

## 🚀 Production Checklist

- [ ] Test 402 responses uden payment
- [ ] Test payment verification on-chain
- [ ] Implementer idempotency for retries
- [ ] Tilføj amount verification
- [ ] Implementer payment timeout
- [ ] Setup database logging
- [ ] Implementer monitoring/alerting
- [ ] Test på devnet først
- [ ] Dokumenter payment wallet address
- [ ] Setup backup RPC endpoints
- [ ] Test edge cases (failed payments, network errors)

## 📚 Resources

- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token Program](https://spl.solana.com/token)
- [USDC on Solana](https://www.circle.com/en/usdc-multichain/solana)

---

**Implementeret af PayPer402 - HTTP 402 Payment Protocol på Solana**

