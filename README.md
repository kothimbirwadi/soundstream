# 🎵 SoundStream — Spotify Web Clone with AWS S3

> A full-featured **Spotify-inspired music streaming web app** built with **Next.js 14**, **Tailwind CSS**, and **AWS S3** for cloud audio/artwork storage. Deployed on **Vercel** with zero-config serverless API routes.

---

## Features

| Feature | Details |
|---|---|
| 🎵 Audio Playback | HTML5 Web Audio engine with play/pause, skip, seek scrubber |
| 🔀 Queue + Shuffle | Persistent session queue, shuffle mode, repeat (off / all / one) |
| ❤️ Like Songs | Save/unlike tracks — persisted to localStorage |
| 📃 Playlists | Create custom playlists, add/remove tracks via context menu |
| 🔍 Live Search | Instant full-text search across title, artist, album, genre |
| ☁️ AWS S3 Upload | Upload audio & artwork directly to S3 via pre-signed PUT URLs |
| 📡 Streaming | Audio streams via S3 public URL or CloudFront CDN |
| 📊 Waveform Visualizer | Animated CSS waveform bars while audio plays |
| 🌐 Deploy-Ready | Vercel `vercel.json` config included |

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── s3/
│   │       ├── presign/route.ts    ← Generate pre-signed S3 PUT URL
│   │       └── status/route.ts     ← Check S3 bucket connectivity
│   ├── layout.tsx                  ← Root layout with Sidebar + PlayerBar
│   ├── page.tsx                    ← Home: greeting + playlists + trending
│   ├── search/page.tsx             ← Live search + genre browse grid
│   ├── library/page.tsx            ← Your library (playlists + uploads)
│   ├── liked/page.tsx              ← Liked Songs collection
│   └── playlist/[id]/page.tsx      ← Dynamic playlist detail page
├── components/
│   ├── cards/
│   │   ├── PlaylistCard.tsx        ← Hoverable playlist card with play button
│   │   └── TrackRow.tsx            ← Track row (index, title, artist, controls)
│   ├── layout/
│   │   ├── Sidebar.tsx             ← Navigation, playlists, cloud status
│   │   └── Header.tsx              ← Back/Forward nav, upload, cloud badge
│   ├── modals/
│   │   ├── UploadModal.tsx         ← Drag-and-drop audio upload to AWS S3
│   │   ├── CloudStatusModal.tsx    ← AWS S3 integration status + architecture
│   │   └── QueueDrawer.tsx         ← Slide-out play queue panel
│   └── player/
│       ├── PlayerBar.tsx           ← Fixed bottom audio player
│       └── WaveformVisualizer.tsx  ← Animated waveform bars
├── context/
│   └── PlayerContext.tsx           ← Global audio engine + state management
├── lib/
│   ├── aws-s3.ts                   ← AWS SDK: presigned URLs + bucket status
│   ├── tracks-data.ts              ← Seed tracks, playlists, genres
│   └── utils.ts                    ← formatTime, cn (tailwind-merge)
└── types/index.ts                  ← Track, Playlist, CloudStatus interfaces
```

---

## ☁️ AWS S3 Integration Architecture

```
[Browser]
    │
    ├─ POST /api/s3/presign
    │       ↓ (Next.js Route Handler — Server-side, credentials hidden)
    │   AWS SDK generates Pre-signed PUT URL (expires in 15 min)
    │       ↓
    ├─ PUT audioFile → S3 bucket (direct browser upload, no server bandwidth)
    │
    └─ GET s3.amazonaws.com/bucket/tracks/… OR CloudFront CDN
           ↓
       <audio> element streams the file
```

### Environment Variables

Copy `.env.example` → `.env.local` and fill in:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=your-bucket-name

# Optional: CloudFront CDN domain (no https://)
NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN=d12345abcdef.cloudfront.net
```

> 💡 **No AWS credentials?** SoundStream automatically falls back to  
> **Demo / Simulation Mode** — audio plays via local `blob:` URLs and  
> tracks persist to `localStorage`. Perfect for local development and evaluation.

### Required AWS S3 Bucket Policy

Attach this CORS config to your S3 bucket under **Permissions → CORS**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedOrigins": ["https://your-app.vercel.app", "http://localhost:3000"],
    "ExposeHeaders": []
  }
]
```

---

##  Deploy on Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: SoundStream - Spotify Clone with AWS S3 integration"
   git push origin main
   ```

2. **Import into Vercel:** [vercel.com/new](https://vercel.com/new)

3. **Add Environment Variables** in Vercel dashboard → Project → Settings → Environment Variables.

4. **Done!** Vercel auto-detects Next.js, runs `next build`, and deploys.

---

## 🖥 Local Development

```bash
# Install dependencies
npm install

# Start dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build locally
npm start
```

Open [http://localhost:3000](http://localhost:3000) 

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router + Server Components) |
| Styling | Tailwind CSS v3 + tailwind-merge |
| Icons | Lucide React |
| Cloud Storage | Amazon S3 (`@aws-sdk/client-s3`) |
| Presigned URLs | `@aws-sdk/s3-request-presigner` |
| Deployment | Vercel (zero-config) |
| Language | TypeScript |
| Audio | Native HTML5 Web Audio API |

---

## Screenshots

| Home | Playlist | Upload to S3 | Cloud Status |
|---|---|---|---|
| Greeting grid + trending | Gradient hero + tracks | Presign + upload progress | Architecture diagram |

---

## 📄 License

MIT — built as a Spotify Clone demo for educational purposes.  
SoundStream is not affiliated with Spotify AB.
