# Speakify - Production-ready Copyright-safe Text-to-Speech

Speakify is a full-stack web application that converts **user-provided text** into speech with security and monetization-safe defaults for YouTube workflows.

## Why this is YouTube-safe and copyright-conscious

- Processes only text submitted by the user at request time.
- No script auto-generation and no preloaded copyrighted scripts.
- Uses a commercial-friendly TTS provider integration (Azure AI Speech) with configurable voices.
- No voice cloning and no celebrity voice emulation pipeline.
- Input sanitization and validation are enforced server-side.

## Architecture decisions

- **Frontend:** React + Vite for a fast, responsive, accessible UI.
- **Backend:** Node.js + Express with strict request validation and rate limiting.
- **TTS abstraction:** Provider logic is isolated in `backend/src/services/tts/` so provider swapping is low-risk.
- **Chunked synthesis:** Long text is split into safe chunk sizes and then merged into a single WAV file.
- **Secure audio access:** Returned audio URL is HMAC-signed + time limited.
- **Deployment:** Stateless API behavior except short-lived temp audio files; suitable for Railway/Render with ephemeral disks.

## Folder structure

```text
.
├── backend
│   ├── package.json
│   └── src
│       ├── config/env.js
│       ├── middleware/
│       ├── routes/speakRoutes.js
│       ├── services/
│       │   ├── audioStore.js
│       │   └── tts/
│       ├── utils/
│       └── server.js
├── frontend
│   ├── package.json
│   ├── vite.config.js
│   └── src
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
└── .env.sample
```

## Environment variables

Copy `.env.sample` to `.env` and fill values.

```bash
cp .env.sample .env
```

## Run locally

```bash
cd backend && npm install
cd ../frontend && npm install
```

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

## API

### POST `/api/speak`

Request JSON:

```json
{
  "text": "Welcome to Speakify. This script is original content.",
  "language": "en-US",
  "voice": "en-US-JennyNeural",
  "rate": 1,
  "pitch": 0
}
```

Success response (`201`):

```json
{
  "audioUrl": "/api/audio/2ab44e11-a8be-4ad6-9754-1f2f5165a130.wav?expires=1730000000000&sig=...",
  "expiresAt": 1730000000000,
  "format": "wav"
}
```

Error response (`400`):

```json
{
  "error": "Invalid request payload.",
  "details": []
}
```

## Notes for production deployment

- Put backend behind HTTPS (Render/Railway managed TLS is enough).
- Set `FRONTEND_ORIGIN` to your production app URL.
- Use secret manager for `SIGNING_SECRET` and cloud credentials.
- Use managed object storage if you need durable audio retention.
