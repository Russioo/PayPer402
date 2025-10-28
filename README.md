# x402 AI Generation Platform

A cutting-edge platform for instant AI-powered image and video generation with pay-per-use via the x402 Payment Protocol.

![x402 Platform](https://img.shields.io/badge/x402-AI%20Platform-blueviolet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## 🌟 Features

### Image Generation
- **GPT-Image-1** (OpenAI) - High precision with advanced prompt understanding
- **Ideogram** - Diverse art styles perfect for art, memes, and graphics  
- **Grok-Image** (xAI) - High-resolution with batch generation capabilities

### Video Generation
- **Sora** (OpenAI) - Text-to-video with audio
- **Grok-Video** (xAI) - Batch generation with high quality output
- **Veo 3.1** (Google Gemini) - Multimodal input support

## 🚀 x402 Payment Flow

- ✅ No login required
- ✅ No subscription needed
- ✅ Pay-per-generation with cryptocurrency (USDC)
- ✅ HTTP 402 Payment Required protocol
- ✅ Instant micro-payments
- ✅ AI-agent friendly

## 🎨 Modern Design Features

- **Sleek Dark Theme** - Professional glassmorphism design
- **Animated Gradients** - Smooth color transitions and effects
- **Interactive Components** - Hover effects and micro-interactions
- **Responsive Layout** - Perfect on all devices
- **Real-time Feedback** - Loading states and animations

## 🛠️ Quick Start

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local and add your API keys (optional for development)
# - OPENAI_API_KEY
# - IDEOGRAM_API_KEY
# - XAI_API_KEY
# - GOOGLE_API_KEY
# - X402_WALLET_ADDRESS

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

## 📁 Project Structure

```
x402-ai-platform/
├── app/
│   ├── api/
│   │   ├── generate/          # AI generation endpoints
│   │   │   ├── route.ts       # POST: Initialize generation
│   │   │   └── [id]/route.ts  # GET: Fetch result
│   │   └── payment/
│   │       └── verify/route.ts # POST: Verify payment
│   ├── page.tsx               # Main page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   ├── Header.tsx             # Navigation header
│   ├── ModelCard.tsx          # AI model selector
│   ├── GenerationForm.tsx     # Prompt input form
│   ├── PaymentModal.tsx       # x402 payment modal
│   └── ResultDisplay.tsx      # Result viewer
├── lib/
│   ├── models.ts              # AI model definitions
│   └── payment.ts             # x402 payment logic
├── types/
│   └── index.ts               # TypeScript types
└── public/                     # Static assets
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 💰 Pricing

| Model | Type | Price (USD) |
|-------|------|-------------|
| GPT-Image-1 | Image | $0.50 |
| Ideogram | Image | $0.30 |
| Grok-Image | Image | $0.40 |
| Sora | Video | $2.00 |
| Grok-Video | Video | $1.50 |
| Veo 3.1 | Video | $1.80 |

Prices can be customized in the `.env.local` file.

## 🔐 API Integration

### Mock Mode (Default)

The platform runs in mock mode by default:

- ✅ No API keys required
- ✅ Mock images from Unsplash
- ✅ Mock videos from Google samples
- ✅ Simulated payment flow
- ✅ Perfect for development and demos

### Production Mode

To enable real AI generations:

#### 1. Get API Keys

- [OpenAI Platform](https://platform.openai.com/)
- [Ideogram](https://ideogram.ai/)
- [xAI](https://x.ai/)
- [Google AI Studio](https://makersuite.google.com/)

#### 2. Implement AI Integrations

**OpenAI (GPT-Image-1)**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: prompt,
  n: 1,
  size: "1024x1024"
});
```

**Ideogram**
```typescript
const response = await fetch('https://api.ideogram.ai/generate', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${process.env.IDEOGRAM_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ prompt })
});
```

**xAI (Grok)**
```typescript
const response = await fetch('https://api.x.ai/v1/generate', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    prompt, 
    model: 'grok-image' 
  })
});
```

**Google Gemini (Veo 3.1)**
```typescript
const response = await fetch('https://generativelanguage.googleapis.com/v1/models/veo-3.1:generate', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ prompt })
});
```

#### 3. Setup x402 Payment

- Integrate with x402 blockchain protocol
- Implement wallet connection
- Configure USDC payments

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```bash
docker build -t x402-ai-platform .
docker run -p 3000:3000 x402-ai-platform
```

## 🎨 Design System

### Colors

- **Primary**: Cyan (#06b6d4)
- **Secondary**: Purple (#a855f7)
- **Accent**: Pink (#ec4899)
- **Background**: Black (#000000)
- **Surface**: White with opacity

### Typography

- **Headings**: Black weight (900)
- **Body**: Regular weight (400)
- **Labels**: Bold weight (700)

### Effects

- **Glassmorphism**: backdrop-blur with opacity
- **Gradients**: Multi-color linear gradients
- **Shadows**: Colored shadow effects
- **Animations**: Smooth transitions and pulse effects

## 📝 Development Roadmap

- [ ] Implement real API integrations (OpenAI, Ideogram, xAI, Google)
- [ ] Integrate x402 payment protocol with blockchain
- [ ] Add user history (optional, local storage only)
- [ ] Implement rate limiting
- [ ] Add advanced generation options
- [ ] Implement batch generation
- [ ] Add image-to-image and video-to-video features
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

### Port 3000 already in use

```bash
PORT=3001 npm run dev
```

### TypeScript errors

```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Styles not loading

Restart the dev server (Ctrl+C, then `npm run dev`)

## 📚 Documentation

- [Getting Started Guide](./GETTING_STARTED.md)
- [API Documentation](./docs/API.md) (coming soon)
- [Payment Integration](./docs/PAYMENT.md) (coming soon)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for commercial purposes.

## 🌐 Links

- **Website**: [x402.ai](https://x402.ai) (coming soon)
- **Twitter**: [@x402ai](https://twitter.com/x402ai) (coming soon)
- **Discord**: [Join our community](https://discord.gg/x402) (coming soon)

## 💡 Why x402?

The x402 protocol revolutionizes micro-payments by:

- **Eliminating friction**: No sign-ups or subscriptions
- **Enabling AI agents**: Machines can pay directly
- **Ensuring fairness**: Pay only for what you use
- **Providing transparency**: Blockchain-verified transactions
- **Future-proofing**: Built for the AI-first economy

---

**Built with ❤️ using Next.js, TypeScript, and the x402 Protocol**
