# PayPer402

Professional AI image and video generation platform with pay-per-use pricing via HTTP 402 Payment Protocol.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)

## Overview

PayPer402 is a modern web application that enables users to generate high-quality images and videos using state-of-the-art AI models. Built on the HTTP 402 Payment Protocol, it offers a seamless pay-per-use experience without subscriptions or complicated billing.

Generate professional content with leading AI models including Sora 2, Veo 3.1, GPT Image, Ideogram, and Qwen VL - pay only for what you use, starting from $0.03 per generation.

## Features

### AI Models

**Image Generation**
- **GPT Image 1** (OpenAI) - Advanced image generation with optional reference images
- **Ideogram** - High-quality art generation with multiple rendering speeds
- **Qwen VL** - Fast image generation with acceleration options

**Video Generation**
- **Sora 2** (OpenAI) - Professional text-to-video generation
- **Veo 3.1** (Google) - Advanced video generation with image-to-video support

### Platform Features

- **Pay-Per-Use**: No subscriptions, pay only for completed generations
- **HTTP 402 Protocol**: Native integration with payment-required standard
- **Real-time Progress**: Live generation status and time estimates
- **Multiple Outputs**: Support for batch generation and variants
- **Cloud Storage**: Integrated Supabase storage for all generated content
- **Modern UI**: Clean, minimalist design with smooth animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Supabase
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **File Handling**: JSZip for batch downloads

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- API keys for AI models (OpenAI, Ideogram, Qwen, Google)

### Installation

```bash
# Clone the repository
git clone https://github.com/Russioo/PayPer402.git
cd PayPer402

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Model APIs
OPENAI_API_KEY=your_openai_api_key
IDEOGRAM_API_KEY=your_ideogram_api_key
QWEN_API_KEY=your_qwen_api_key
GOOGLE_API_KEY=your_google_api_key

# Payment (Optional)
PAYMENT_WALLET_ADDRESS=your_wallet_address
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
PayPer402/
├── app/
│   ├── api/
│   │   ├── generate/
│   │   │   ├── route.ts          # Initialize generation
│   │   │   └── [id]/route.ts     # Poll generation status
│   │   ├── upload/route.ts       # File upload handler
│   │   ├── payment/
│   │   │   └── verify/route.ts   # Payment verification
│   │   └── callback/route.ts     # Payment callbacks
│   ├── page.tsx                   # Main application page
│   ├── about/page.tsx            # About page
│   ├── docs/page.tsx             # Documentation page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── GenerationForm.tsx        # Prompt input and options
│   ├── GenerationProgress.tsx    # Real-time progress display
│   ├── ResultDisplay.tsx         # Result viewer with download
│   ├── PaymentModal.tsx          # 402 payment interface
│   ├── ModelCard.tsx             # AI model selector
│   ├── Header.tsx                # Navigation header
│   ├── InteractiveBackground.tsx # Animated background
│   └── Toast.tsx                 # Notification system
├── lib/
│   ├── models.ts                 # AI model definitions
│   ├── openai-image.ts           # OpenAI integration
│   ├── ideogram-ai.ts            # Ideogram integration
│   ├── qwen-ai.ts                # Qwen integration
│   ├── veo-ai.ts                 # Veo integration
│   ├── kie-ai.ts                 # Kling AI integration
│   ├── supabase.ts               # Supabase client
│   ├── supabase-helpers.ts       # Storage helpers
│   ├── storage.ts                # File storage utilities
│   └── payment.ts                # Payment logic
├── types/
│   └── index.ts                  # TypeScript definitions
└── public/                       # Static assets
```

## Pricing

| Model | Type | Price (USD) |
|-------|------|-------------|
| 4o Image | Image | $0.042 |
| Ideogram V3 | Image | $0.066 |
| Qwen | Image | $0.03 |
| Sora 2 | Video | $0.21 |
| Veo 3.1 | Video | $0.36 |

All prices are pay-per-generation with no subscriptions or hidden fees.

## API Integration

### Supported Models

**OpenAI GPT Image 1**
- Text-to-image generation
- Reference image support
- Multiple variant generation
- 1024x1024 resolution

**Ideogram**
- Multiple rendering speeds (Turbo, Balanced, Quality)
- Art and design focused
- High-quality outputs

**Qwen VL**
- Fast generation
- Acceleration options (None, Regular, High)
- Cost-effective solution

**OpenAI Sora 2**
- Text-to-video generation
- Configurable duration (5s or 15s)
- Professional quality output

**Google Veo 3.1**
- Text-to-video generation
- Image-to-video support
- Advanced motion control

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Docker

```bash
# Build image
docker build -t payper402 .

# Run container
docker run -p 3000:3000 payper402
```

### Environment Setup

Ensure all environment variables are properly configured in your deployment platform. For Vercel, add them in the project settings under "Environment Variables".

## Development

### Code Style

The project follows standard TypeScript and React best practices:

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Keep components small and focused
- Implement proper error handling

### Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Roadmap

**Current Features**
- 5 AI models for image and video generation
- Real-time generation progress tracking
- Supabase cloud storage integration
- Multi-variant support
- Batch download with ZIP

**Planned Features**
- Additional AI models
- User generation history
- Advanced editing options
- API access for developers
- Mobile application
- Social sharing features

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Use different port
PORT=3001 npm run dev
```

**TypeScript errors**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
```

**API errors**
- Verify all API keys are valid
- Check API rate limits
- Ensure environment variables are set correctly

**Supabase connection issues**
- Verify Supabase URL and keys
- Check project is active
- Ensure storage bucket is configured

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## Security

If you discover a security vulnerability, please email security@payper402.com instead of using the issue tracker.

## License

MIT License

Copyright (c) 2025 PayPer402

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Support

For support, please:
- Open an issue on GitHub
- Check existing documentation
- Review closed issues for solutions

## Acknowledgments

- OpenAI for GPT Image and Sora 2
- Google for Veo 3.1
- Ideogram for their image generation API
- Qwen for their VL model
- Supabase for cloud storage
- Vercel for hosting platform

## Links

- Repository: [https://github.com/Russioo/PayPer402](https://github.com/Russioo/PayPer402)
- Issues: [https://github.com/Russioo/PayPer402/issues](https://github.com/Russioo/PayPer402/issues)

---

Built with Next.js, TypeScript, and the HTTP 402 Protocol
