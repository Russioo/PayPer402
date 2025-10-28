# Quick Start Guide - Sora 2 Video Generation

## Setup (2 minutter)

### 1. Opret `.env.local` fil

Opret en fil kaldet `.env.local` i roden af projektet:

```bash
KIE_AI_API_KEY=din_api_key_her
KIE_AI_API_URL=https://api.kie.ai/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Vigtigt:** Udskift `din_api_key_her` med din rigtige Kie.ai API key!

### 2. Start serveren

```bash
npm run dev
```

## Sådan bruger du Sora 2

1. **Gå til http://localhost:3000**

2. **Klik på "Videos" tab**

3. **Vælg "Sora 2" model**
   - Du vil se settings pop frem:
     - **Aspect Ratio:** Landscape eller Portrait
     - **Duration:** 10 eller 15 sekunder
     - **Remove Watermark:** On/Off

4. **Skriv din prompt**
   - Eksempel: "A beautiful sunset over the ocean with waves crashing on the shore"

5. **Tryk "Generate"**
   - Videoen genereres nu (tager ~30-60 sekunder)
   - Loading spinner viser mens den genererer
   - Når den er klar, vises videoen automatisk

## Settings Forklaring

### Aspect Ratio
- **Landscape (16:9)** - Vandret format, godt til YouTube, film
- **Portrait (9:16)** - Lodret format, godt til TikTok, Instagram Reels

### Duration
- **10 seconds** - Kortere video, hurtigere generation
- **15 seconds** - Længere video, mere detaljer

### Remove Watermark
- **On** - Ingen watermark på den færdige video (anbefalet)
- **Off** - Watermark vises på videoen

## Hvad sker der?

1. Du trykker Generate
2. API'en sender request til Kie.ai
3. Kie.ai starter video generation
4. Frontend poller hvert 5. sekund for at se om den er færdig
5. Når færdig, vises videoen automatisk

## Troubleshooting

### "Failed to initiate video generation"
- ✅ Tjek at din API key er korrekt i `.env.local`
- ✅ Tjek at du har credits på din Kie.ai konto
- ✅ Genstart serveren efter at have ændret `.env.local`

### Videoen genererer ikke
- ✅ Åbn browser console (F12) og se efter fejl
- ✅ Tjek at serveren kører uden fejl
- ✅ Vent 1-2 minutter - det kan tage tid

### "Generation timeout"
- ✅ Det tog mere end 5 minutter - prøv igen
- ✅ Tjek Kie.ai dashboard for task status

## API Response Eksempel

Når videoen er færdig får du:

```json
{
  "success": true,
  "result": "https://kie-ai-cdn.com/video-url.mp4",
  "type": "video",
  "state": "completed"
}
```

## Næste Step

For andre modeller (Grok-Video, Veo 3.1) skal du stadig implementere deres API'er.
Sora 2 er nu fuldt funktionel! 🎉

