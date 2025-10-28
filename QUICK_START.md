# Quick Start Guide - Sora 2 Video Generation

## Setup (2 minutes)

### 1. Create `.env.local` file

Create a file called `.env.local` in the root of the project:

```bash
KIE_AI_API_KEY=your_api_key_here
KIE_AI_API_URL=https://api.kie.ai/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Replace `your_api_key_here` with your actual Kie.ai API key!

### 2. Start the server

```bash
npm run dev
```

## How to use Sora 2

1. **Go to http://localhost:3000**

2. **Click on the "Videos" tab**

3. **Select "Sora 2" model**
   - You will see settings appear:
     - **Aspect Ratio:** Landscape or Portrait
     - **Duration:** 10 or 15 seconds
     - **Remove Watermark:** On/Off

4. **Write your prompt**
   - Example: "A beautiful sunset over the ocean with waves crashing on the shore"

5. **Press "Generate"**
   - The video is now generating (takes ~30-60 seconds)
   - Loading spinner shows while generating
   - When ready, the video displays automatically

## Settings Explained

### Aspect Ratio
- **Landscape (16:9)** - Horizontal format, good for YouTube, movies
- **Portrait (9:16)** - Vertical format, good for TikTok, Instagram Reels

### Duration
- **10 seconds** - Shorter video, faster generation
- **15 seconds** - Longer video, more details

### Remove Watermark
- **On** - No watermark on the final video (recommended)
- **Off** - Watermark visible on video

## What happens?

1. You press Generate
2. API sends request to Kie.ai
3. Kie.ai starts video generation
4. Frontend polls every 5 seconds to see if it's ready
5. When ready, the video displays automatically

## Troubleshooting

### "Failed to initiate video generation"
- Check that your API key is correct in `.env.local`
- Check that you have credits on your Kie.ai account
- Restart the server after changing `.env.local`

### Video not generating
- Open browser console (F12) and look for errors
- Check that the server is running without errors
- Wait 1-2 minutes - it can take time

### "Generation timeout"
- It took more than 5 minutes - try again
- Check Kie.ai dashboard for task status

## API Response Example

When the video is ready you get:

```json
{
  "success": true,
  "result": "https://kie-ai-cdn.com/video-url.mp4",
  "type": "video",
  "state": "completed"
}
```

## Next Steps

For other models (Grok-Video, Veo 3.1) you still need to implement their APIs.
Sora 2 is now fully functional!
