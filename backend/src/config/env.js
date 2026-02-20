import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const required = ['SIGNING_SECRET', 'AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION'];
required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  signingSecret: process.env.SIGNING_SECRET,
  audioTtlMs: Number(process.env.AUDIO_TTL_MS ?? 15 * 60 * 1000),
  ttsProvider: process.env.TTS_PROVIDER ?? 'azure',
  azureSpeechKey: process.env.AZURE_SPEECH_KEY,
  azureSpeechRegion: process.env.AZURE_SPEECH_REGION
};
