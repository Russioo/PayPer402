# 🚀 Getting Started with x402 AI Platform

## Quick Start (5 minutes)

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys (optional for development - mock data is used by default):

```env
# OpenAI API Key (for gpt-image-1 and Sora)
OPENAI_API_KEY=sk-...

# Ideogram API Key
IDEOGRAM_API_KEY=your_key_here

# xAI API Key (for Grok-Image and Grok-Video)  
XAI_API_KEY=your_key_here

# Google API Key (for Veo 3.1)
GOOGLE_API_KEY=your_key_here

# x402 Payment Configuration
X402_WALLET_ADDRESS=your_wallet_here
X402_PAYMENT_ENDPOINT=https://payment.x402.ai

# Prices (optional - defaults used if not set)
PRICE_IMAGE_GPT=0.50
PRICE_IMAGE_IDEOGRAM=0.30
PRICE_IMAGE_GROK=0.40
PRICE_VIDEO_SORA=2.00
PRICE_VIDEO_GROK=1.50
PRICE_VIDEO_VEO=1.80
```

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📖 Development Guide

### Mock Mode (Default)

The platform runs in mock mode by default, which means:

- ✅ No API keys required
- ✅ Mock images from Unsplash
- ✅ Mock videos from Google samples
- ✅ Simulated payment flow
- ✅ Perfect for development and demos

### Production Mode

To enable real AI generations:

1. **Get API keys** from:
   - [OpenAI Platform](https://platform.openai.com/)
   - [Ideogram](https://ideogram.ai/)
   - [xAI](https://x.ai/)
   - [Google AI Studio](https://makersuite.google.com/)

2. **Implement AI integrations** in `app/api/generate/route.ts`:

```typescript
// Example: OpenAI integration
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In generate route:
if (model === 'gpt-image-1') {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024"
  });
  
  resultUrl = response.data[0].url;
}
```

3. **Setup x402 Payment**:
   - Integrate with x402 blockchain protocol
   - Implement wallet connection
   - Configure USDC payments

## 🎨 Customization

### Change Prices

Edit `.env.local`:

```env
PRICE_IMAGE_GPT=1.00    # New price for gpt-image-1
PRICE_VIDEO_SORA=5.00   # New price for Sora
```

### Add New Models

1. Update `lib/models.ts`:

```typescript
export const imageModels: ModelInfo[] = [
  // ... existing models
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    description: 'Open source high-quality image generator',
    price: 0.25,
    type: 'image',
  },
];
```

2. Implement API integration in `app/api/generate/route.ts`

### Change Colors/Styling

#### Primary Colors

Edit `app/globals.css` or use Tailwind classes:

```css
/* Cyan */
from-cyan-500 to-cyan-400

/* Purple */
from-purple-500 to-purple-400

/* Pink */
from-pink-500 to-pink-400
```

#### Gradients

The platform uses multi-color gradients:

```css
bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500
```

### Customize Animations

Edit `app/globals.css` to adjust animation speeds:

```css
.animate-pulse-slow {
  animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 🧪 Testing

```bash
# Start development server
npm run dev

# Test flow:
# 1. Select a model (e.g., gpt-image-1)
# 2. Enter prompt: "A beautiful sunset over mountains"
# 3. Click "Generate with AI"
# 4. Payment modal appears
# 5. Click "Pay with USDC"
# 6. Wait for simulated payment (2 sec)
# 7. Result displays with mock image
```

## 📦 Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🐛 Troubleshooting

### Port 3000 is already in use

```bash
# Use a different port
PORT=3001 npm run dev
```

### TypeScript errors

```bash
# Delete .next and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Styles not loading

```bash
# Restart dev server
# Ctrl+C, then:
npm run dev
```

### Mock images not loading

The platform uses Unsplash for mock images. If images don't load:
- Check your internet connection
- Unsplash may be rate limiting (rare)
- You can replace URLs in `app/api/generate/[id]/route.ts`

## 📚 Next Steps

1. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Setup Database** (optional):
   - User history
   - Generation cache
   - Analytics

3. **Implement Real APIs**:
   - See guide in README.md
   - Test with small amounts first

4. **Integrate x402 Payment**:
   - Smart contracts
   - Wallet connection
   - USDC integration

## 💡 Tips

- Start in mock mode and test the entire flow first
- Implement one AI model at a time  
- Test payment flow thoroughly before deployment
- Consider rate limiting in production
- Store generated assets in cloud storage (S3, Cloudinary)

## 🎨 Design System

### Color Palette

- **Primary**: Cyan (#06b6d4) - Innovation
- **Secondary**: Purple (#a855f7) - Creativity
- **Accent**: Pink (#ec4899) - Energy
- **Background**: Black (#000000) - Professional
- **Surface**: White with 5-10% opacity - Glassmorphism

### Typography Scale

- **Hero**: 5xl-7xl (48-72px) - Black weight
- **Heading**: 2xl-3xl (24-30px) - Black weight
- **Body**: base-lg (16-18px) - Regular weight
- **Label**: sm-xs (12-14px) - Bold weight

### Spacing System

Uses Tailwind's spacing scale:
- `space-y-8` for section spacing
- `space-y-6` for component spacing
- `space-y-4` for element spacing

### Component Patterns

**Cards**:
```tsx
bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10
```

**Buttons**:
```tsx
bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500
hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400
```

**Inputs**:
```tsx
bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10
focus:ring-2 ring-cyan-400/50
```

## 🆘 Need Help?

- Read [README.md](./README.md) for detailed documentation
- Check the code for comments and hints
- All components are well-structured and easy to customize
- The design is modular and scalable

## 🌟 Advanced Features

### Add Image Variations

Implement in `app/api/generate/route.ts`:

```typescript
if (model === 'gpt-image-1' && baseImage) {
  const response = await openai.images.createVariation({
    image: baseImage,
    n: 1,
    size: "1024x1024"
  });
}
```

### Add Video Duration Control

Add to `GenerationForm.tsx`:

```typescript
const [duration, setDuration] = useState(5);

// Then pass to API
```

### Add Style Presets

Create preset prompts for users:

```typescript
const stylePresets = [
  { name: 'Photorealistic', modifier: ', photorealistic, 8k, detailed' },
  { name: 'Anime', modifier: ', anime style, vibrant colors' },
  { name: 'Oil Painting', modifier: ', oil painting style, artistic' },
];
```

---

**Happy Building! 🎨🎬**
