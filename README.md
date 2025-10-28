# PayPer402 - AI Generation via HTTP 402 Protocol

> Professional AI video and image generation powered by Sora 2, Veo 3.1, GPT Image, Ideogram, Qwen og Kling AI. Betal kun for hvad du bruger via Solana USDC betalinger.

![PayPer402](https://img.shields.io/badge/Protocol-HTTP%20402-black)
![Solana](https://img.shields.io/badge/Blockchain-Solana-purple)
![USDC](https://img.shields.io/badge/Payment-USDC-blue)

## 🚀 Features

- **5+ AI Modeller**: Sora 2, Veo 3.1, GPT Image 1, Ideogram, Qwen, Kling AI
- **Solana Betalinger**: Rigtige USDC betalinger på Solana blockchain
- **Wallet Integration**: Support for Phantom, Solflare, Coinbase Wallet
- **Pay-per-use**: Betal kun for det du genererer
- **Real-time Generation**: Live progress tracking
- **Multi-image Support**: Generer op til 4 billeder ad gangen

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/payper402.git
cd payper402

# Installer dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Rediger .env.local med dine API keys

# Start development server
npm run dev
```

## ⚙️ Konfiguration

### 1. API Keys

Opret en `.env.local` fil med:

```env
# Supabase (for storage)
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_key
SUPABASE_SERVICE_ROLE_KEY=din_service_role_key

# OpenAI (for GPT Image 1)
OPENAI_API_KEY=din_openai_key

# Ideogram
IDEOGRAM_API_KEY=din_ideogram_key

# Qwen (Alibaba)
QWEN_API_KEY=din_qwen_key
QWEN_API_BASE_URL=https://dashscope.aliyuncs.com/api/v1

# Kling AI
KLING_API_KEY=din_kling_key

# Veo (Google)
VEO_API_KEY=din_veo_key

# Sora (OpenAI)
SORA_API_KEY=din_sora_key
```

### 2. Solana Payment Setup

**VIGTIGT**: Opdater payment wallet address i `lib/solana-payment.ts`:

```typescript
export const PAYMENT_WALLET_ADDRESS = new PublicKey('DIN_WALLET_ADDRESS_HER');
```

Se [SOLANA_SETUP.md](./SOLANA_SETUP.md) for komplet guide til Solana integration.

### 3. Supabase Storage Setup

1. Opret en Supabase project på [supabase.com](https://supabase.com)
2. Opret en storage bucket kaldet `generations`
3. Sæt bucket til public
4. Opdater `.env.local` med dine credentials

## 🏗️ Arkitektur

### Frontend
- **Next.js 14** med App Router
- **React 18** med hooks
- **Tailwind CSS** til styling
- **Solana Wallet Adapter** til wallet integration
- **Axios** til API calls

### Backend
- **Next.js API Routes** (serverless functions)
- **Solana Web3.js** til blockchain interaction
- **SPL Token** til USDC transfers
- **Supabase** til file storage

### Blockchain
- **Solana Mainnet Beta** for betalinger
- **USDC** (SPL Token) som payment method
- **On-chain verification** af alle transaktioner

## 🔄 HTTP 402 Payment Flow

PayPer402 implementerer den rigtige HTTP 402 Payment Required protocol:

```
1. User connects Solana wallet
   ↓
2. User selects AI model & enters prompt
   ↓
3. POST /api/generate → Server returnerer HTTP 402 Payment Required
   {
     "error": "Payment Required",
     "amount": 0.40,
     "currency": "USDC",
     "network": "Solana"
   }
   ↓
4. Client viser payment modal med betalingsdetaljer
   ↓
5. User godkender USDC transfer i wallet
   ↓
6. Transaction sendes til Solana blockchain
   ↓
7. Client modtager transaction signature
   ↓
8. POST /api/generate MED paymentSignature
   ↓
9. Backend verificerer payment on-chain via Solana RPC
   ↓
10. Hvis verificeret → HTTP 200 OK → AI generation starter
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

Alle betalinger verificeres on-chain:

```typescript
// Backend verificerer transaction på Solana
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

## 💡 Understøttede AI Modeller

| Model | Type | Pris | Features |
|-------|------|------|----------|
| **Sora 2** | Video | $5.00 | 5-15s video, 720p |
| **Veo 3.1** | Video | $0.10 | Text/image-to-video |
| **GPT Image 1** | Image | $0.40 | 1-4 images, reference support |
| **Ideogram** | Image | $0.08 | 3 quality modes, style options |
| **Qwen** | Image | $0.03 | Fast, acceleration modes |
| **Kling AI** | Video | $0.25 | High quality video |

## 🔐 Sikkerhed

- ✅ Wallet authentication required
- ✅ On-chain payment verification
- ✅ No private keys stored
- ✅ Serverless API endpoints
- ✅ Environment variable protection

**Note**: Se [SOLANA_SETUP.md](./SOLANA_SETUP.md) for anbefalinger til produktion.

## 🛠️ Development

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

## 📁 Projektstruktur

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

## 🚀 Deployment

### Vercel (Anbefalet)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy til produktion
vercel --prod
```

### Environment Variables på Vercel

Tilføj alle environment variables fra `.env.local` i Vercel dashboard under Settings → Environment Variables.

**Vigtig**: Husk at sætte `PAYMENT_WALLET_ADDRESS` i `lib/solana-payment.ts` før deployment.

## 📚 Dokumentation

- **[HTTP 402 Protocol Guide](./HTTP_402_GUIDE.md)** - Komplet guide til HTTP 402 implementation
- **[Solana Setup Guide](./SOLANA_SETUP.md)** - Komplet guide til Solana integration
- [Getting Started](./GETTING_STARTED.md) - Quick start guide
- [Quick Start](./QUICK_START.md) - Hurtig opsætning

### Payment Implementation

PayPer402 bruger **rigtig HTTP 402 protocol**:

1. **402 Response**: API returnerer 402 når betaling mangler
2. **On-chain Verification**: Alle betalinger verificeres på Solana blockchain
3. **Retry med Payment**: Client sender request igen med payment signature
4. **Generation Start**: Ved verificeret betaling starter generation

Se [HTTP_402_GUIDE.md](./HTTP_402_GUIDE.md) for fuld implementation guide.

## 🤝 Contributing

Contributions er velkomne! 

1. Fork projektet
2. Opret en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dine ændringer (`git commit -m 'Add some AmazingFeature'`)
4. Push til branchen (`git push origin feature/AmazingFeature`)
5. Åbn en Pull Request

## 📄 License

Dette projekt er licenseret under MIT License - se [LICENSE](LICENSE) filen for detaljer.

## ⚠️ Disclaimer

Dette er et demo projekt der viser HTTP 402 protocol med Solana betalinger. 

For produktion brug:
- Implementer fuld payment verification
- Tilføj database logging
- Implementer error handling & retries
- Tilføj monitoring & alerting
- Implementer refund system
- Test grundigt på testnet først

## 💬 Support

Har du spørgsmål eller problemer?

- 📧 Email: support@payper402.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/payper402/issues)

## 🎯 Roadmap

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

**Made with ❤️ using Next.js, Solana & AI**
