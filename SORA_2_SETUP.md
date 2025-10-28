# Sora 2 Integration Setup Guide

This guide explains how to integrate and use Sora 2 via Kie.ai API in your x402 application.

## Prerequisites

- Kie.ai API account and API key
- Node.js environment with Next.js

## Setup Instructions

### 1. Get Your Kie.ai API Key

1. Visit [Kie.ai](https://kie.ai)
2. Sign up or log in to your account
3. Navigate to API settings
4. Copy your API key

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Kie.ai API Configuration
KIE_AI_API_KEY=your_actual_api_key_here
KIE_AI_API_URL=https://api.kie.ai/api/v1

# Model Prices (USD)
PRICE_VIDEO_SORA_2=3.50

# Application URL (for callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Replace `your_actual_api_key_here` with your real Kie.ai API key.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## How It Works

### Architecture

1. **User selects Sora 2 model** and enters a prompt
2. **Payment is required** via x402 protocol
3. **Task is created** at Kie.ai with the prompt
4. **Kie.ai processes** the video generation (10-15 seconds)
5. **Callback is received** when generation is complete
6. **User receives** the generated video URL

### API Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ 1. Submit prompt
       v
┌─────────────────────────┐
│  POST /api/generate     │
│  - Create Kie.ai task   │
│  - Return payment req   │
└──────┬──────────────────┘
       │ 2. Payment required
       v
┌─────────────────────────┐
│  User completes payment │
└──────┬──────────────────┘
       │ 3. Fetch result
       v
┌──────────────────────────┐
│  GET /api/generate/[id]  │
│  - Query Kie.ai status   │
│  - Return video URL      │
└──────────────────────────┘
```

### Kie.ai Task States

- **pending** - Task created, waiting to be processed
- **processing** - Video generation in progress
- **success** - Generation completed successfully
- **fail** - Generation failed

## API Endpoints

### POST /api/generate

Create a new generation task.

**Request:**
```json
{
  "model": "sora-2",
  "prompt": "A beautiful sunset over the ocean with waves",
  "type": "video",
  "options": {
    "aspect_ratio": "landscape",
    "n_frames": "10",
    "remove_watermark": true
  }
}
```

**Response:**
```json
{
  "paymentRequired": true,
  "price": 3.50,
  "generationId": "gen_1234567890_abc123",
  "kieTaskId": "task_xyz789"
}
```

### GET /api/generate/[id]

Fetch generation result.

**Query Parameters:**
- `poll=true` - Wait for completion (blocking, up to 5 minutes)
- `poll=false` - Check status once

**Response (success):**
```json
{
  "success": true,
  "generationId": "gen_1234567890_abc123",
  "kieTaskId": "task_xyz789",
  "result": "https://example.com/video.mp4",
  "resultUrls": ["https://example.com/video.mp4"],
  "type": "video",
  "state": "completed",
  "credits": {
    "consumed": 100,
    "remaining": 9900
  }
}
```

**Response (processing):**
```json
{
  "success": false,
  "generationId": "gen_1234567890_abc123",
  "kieTaskId": "task_xyz789",
  "state": "processing",
  "message": "Generation in progress"
}
```

### POST /api/callback

Webhook endpoint for Kie.ai callbacks (handled automatically).

## Configuration Options

### Video Generation Options

**aspect_ratio:**
- `landscape` - Widescreen format (default)
- `portrait` - Vertical format

**n_frames:**
- `10` - 10 second video (default)
- `15` - 15 second video

**remove_watermark:**
- `true` - Remove watermark (default)
- `false` - Keep watermark

## Pricing

- **Sora 2:** $3.50 per generation (configurable via `PRICE_VIDEO_SORA_2`)
- Credits are consumed from your Kie.ai account
- Check your remaining credits in the API response

## Production Deployment

### Environment Variables for Production

```bash
# Production URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Kie.ai API
KIE_AI_API_KEY=your_production_api_key
KIE_AI_API_URL=https://api.kie.ai/api/v1

# Prices
PRICE_VIDEO_SORA_2=3.50
```

### Webhook Configuration

Ensure your production URL is publicly accessible for Kie.ai callbacks:
- Callback URL: `https://your-domain.com/api/callback`

### Database Considerations

The current implementation uses in-memory storage. For production:

1. Replace `Map` storage with a database (PostgreSQL, MongoDB, etc.)
2. Store generation metadata and task IDs
3. Implement proper state management
4. Add retry logic for failed callbacks

## Troubleshooting

### API Key Issues

**Error:** `KIE_AI_API_KEY is not configured`

**Solution:** Ensure `.env.local` exists and contains your API key.

### Callback Not Received

**Issue:** Video generates but result is not returned

**Solutions:**
1. Check if your callback URL is publicly accessible
2. Use polling mode: `GET /api/generate/[id]?poll=true`
3. Verify webhook logs in Kie.ai dashboard

### Generation Fails

**Error:** Task state is `fail`

**Solutions:**
1. Check your Kie.ai credits balance
2. Verify prompt follows content policy
3. Check API rate limits
4. Review error message in `failMsg` field

## Example Usage

```typescript
// Create generation
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'sora-2',
    prompt: 'A serene forest with morning mist',
    type: 'video',
    options: {
      aspect_ratio: 'landscape',
      n_frames: '10',
      remove_watermark: true
    }
  })
});

const { generationId } = await response.json();

// Wait for result (with polling)
const result = await fetch(`/api/generate/${generationId}?poll=true`);
const { result: videoUrl } = await result.json();

console.log('Video URL:', videoUrl);
```

## Support

For issues with:
- **Kie.ai API:** Contact [Kie.ai Support](https://kie.ai/support)
- **x402 Integration:** Check project documentation
- **Payment Flow:** Review x402 protocol documentation

## License

This integration is part of the x402 project.

