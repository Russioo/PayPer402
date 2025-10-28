# PayPer402 - AI Generation via HTTP 402 Protocol

> Professional AI video and image generation powered by Sora 2, Veo 3.1, GPT Image, Ideogram, Qwen and Kling AI. Pay only for what you use via Solana USDC payments.

![PayPer402](https://img.shields.io/badge/Protocol-HTTP%20402-black)
![Solana](https://img.shields.io/badge/Blockchain-Solana-purple)
![USDC](https://img.shields.io/badge/Payment-USDC-blue)

## Features

- **5+ AI Models**: Sora 2, Veo 3.1, GPT Image 1, Ideogram, Qwen, Kling AI
- **Solana Payments**: Real USDC payments on Solana blockchain
- **Wallet Integration**: Support for Phantom, Solflare, Coinbase Wallet
- **Pay-per-use**: Pay only for what you generate
- **Real-time Generation**: Live progress tracking
- **Multi-image Support**: Generate up to 4 images at once

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/payper402.git
cd payper402

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

## Configuration

### 1. API Keys

Create a `.env.local` file with:

```env
# Supabase (for storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for GPT Image 1)
OPENAI_API_KEY=your_openai_key

# Ideogram
IDEOGRAM_API_KEY=your_ideogram_key

# Qwen (Alibaba)
QWEN_API_KEY=your_qwen_key
QWEN_API_BASE_URL=https://dashscope.aliyuncs.com/api/v1

# Kling AI
KLING_API_KEY=your_kling_key

# Veo (Google)
VEO_API_KEY=your_veo_key

# Sora (OpenAI)
SORA_API_KEY=your_sora_key

# Solana RPC (IMPORTANT)
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

### 2. Solana Payment Setup

**IMPORTANT**: Update payment wallet address in `lib/solana-payment.ts`:

```typescript
export const PAYMENT_WALLET_ADDRESS = new PublicKey('YOUR_WALLET_ADDRESS_HERE');
```

See [SOLANA_SETUP.md](./SOLANA_SETUP.md) for complete guide to Solana integration.

### 3. Supabase Storage Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a storage bucket named `generations`
3. Set bucket to public
4. Update `.env.local` with your credentials

## Architecture

### Frontend
- **Next.js 14** with App Router
- **React 18** with hooks
- **Tailwind CSS** for styling
- **Solana Wallet Adapter** for wallet integration
- **Axios** for API calls

### Backend
- **Next.js API Routes** (serverless functions)
- **Solana Web3.js** for blockchain interaction
- **SPL Token** for USDC transfers
- **Supabase** for file storage

### Blockchain
- **Solana Mainnet Beta** for payments
- **USDC** (SPL Token) as payment method
- **On-chain verification** of all transactions

## HTTP 402 Payment Flow

PayPer402 implements the real HTTP 402 Payment Required protocol:

```
1. User connects Solana wallet
   ↓
2. User selects AI model & enters prompt
   ↓
3. POST /api/generate → Server returns HTTP 402 Payment Required
   {
     "error": "Payment Required",
     "amount": 0.40,
     "currency": "USDC",
     "network": "Solana"
   }
   ↓
4. Client shows payment modal with payment details
   ↓
5. User approves USDC transfer in wallet
   ↓
6. Transaction sent to Solana blockchain
   ↓
7. Client receives transaction signature
   ↓
8. POST /api/generate WITH paymentSignature
   ↓
9. Backend verifies payment on-chain via Solana RPC
   ↓
10. If verified → HTTP 200 OK → AI generation starts
   ↓
11. Result displayed when ready
```

### HTTP 402 Response Example

```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: Bearer realm="PayPer402", amount="0.40", currency="USDC", network="Solana"
Content-Type: application/json

{
  "error": "Payment Required",
  "message": "This resource requires payment",
  "generationId": "gen_1234567890_abc123",
  "paymentRequired": true,
  "amount": 0.40,
  "currency": "USDC",
  "network": "Solana",
  "model": "GPT Image 1"
}
```

### Payment Verification

All payments are verified on-chain:

```typescript
// Backend verifies transaction on Solana
const connection = new Connection(clusterApiUrl('mainnet-beta'));
const isPaid = await verifyUSDCPayment(
  connection, 
  paymentSignature, 
  expectedAmount
);

if (!isPaid) {
  return 402; // Payment verification failed
}

// Start generation...
```

## Supported AI Models

| Model | Type | Price | Features |
|-------|------|-------|----------|
| **Sora 2** | Video | $5.00 | 5-15s video, 720p |
| **Veo 3.1** | Video | $0.10 | Text/image-to-video |
| **GPT Image 1** | Image | $0.40 | 1-4 images, reference support |
| **Ideogram** | Image | $0.08 | 3 quality modes, style options |
| **Qwen** | Image | $0.03 | Fast, acceleration modes |
| **Kling AI** | Video | $0.25 | High quality video |

## Security

- Wallet authentication required
- On-chain payment verification
- No private keys stored
- Serverless API endpoints
- Environment variable protection

**Note**: See [SOLANA_SETUP.md](./SOLANA_SETUP.md) for production recommendations.

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

```
payper402/
├── app/
│   ├── api/              # API routes
│   │   ├── generate/     # Generation endpoints
│   │   ├── payment/      # Payment verification
│   │   └── upload/       # File upload
│   ├── about/            # About page
│   ├── docs/             # Documentation page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── WalletProvider.tsx
│   ├── Header.tsx
│   ├── PaymentModal.tsx
│   ├── GenerationForm.tsx
│   └── ...
├── lib/                  # Utilities
│   ├── solana-payment.ts # Solana integration
│   ├── models.ts         # AI model configs
│   ├── openai-image.ts   # OpenAI integration
│   ├── ideogram-ai.ts    # Ideogram integration
│   ├── qwen-ai.ts        # Qwen integration
│   ├── veo-ai.ts         # Veo integration
│   └── ...
├── types/                # TypeScript types
└── public/               # Static files
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables on Vercel

Add all environment variables from `.env.local` in Vercel dashboard under Settings → Environment Variables.

**Important**: Remember to set `PAYMENT_WALLET_ADDRESS` in `lib/solana-payment.ts` before deployment.

## Documentation

- **[HTTP 402 Protocol Guide](./HTTP_402_GUIDE.md)** - Complete guide to HTTP 402 implementation
- **[Solana Setup Guide](./SOLANA_SETUP.md)** - Complete guide to Solana integration
- [Getting Started](./GETTING_STARTED.md) - Quick start guide
- [Quick Start](./QUICK_START.md) - Quick setup

### Payment Implementation

PayPer402 uses **real HTTP 402 protocol**:

1. **402 Response**: API returns 402 when payment is missing
2. **On-chain Verification**: All payments verified on Solana blockchain
3. **Retry with Payment**: Client sends request again with payment signature
4. **Generation Start**: When verified, generation starts

See [HTTP_402_GUIDE.md](./HTTP_402_GUIDE.md) for full implementation guide.

## Contributing

Contributions are welcome! 

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Disclaimer

This is a demo project showing HTTP 402 protocol with Solana payments. 

For production use:
- Implement full payment verification
- Add database logging
- Implement error handling & retries
- Add monitoring & alerting
- Implement refund system
- Test thoroughly on testnet first

## Support

Have questions or issues?

- Email: support@payper402.com
- Issues: [GitHub Issues](https://github.com/yourusername/payper402/issues)

## Roadmap

- [x] Solana wallet integration
- [x] USDC payment support
- [x] Multi-AI model support
- [ ] Database for transaction logging
- [ ] Admin dashboard
- [ ] Refund system
- [ ] Subscription plans
- [ ] API for developers
- [ ] Mobile app

---

**Made with Next.js, Solana & AI**
