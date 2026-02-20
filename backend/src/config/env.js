import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

const ttsProvider = process.env.TTS_PROVIDER ?? 'azure';

const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  // Development-safe fallback so local startup does not crash.
  // In production, this remains strictly required.
  signingSecret: process.env.SIGNING_SECRET ?? 'dev-signing-secret-change-me',
  audioTtlMs: Number(process.env.AUDIO_TTL_MS ?? 15 * 60 * 1000),
  ttsProvider,
  azureSpeechKey: process.env.AZURE_SPEECH_KEY ?? '',
  azureSpeechRegion: process.env.AZURE_SPEECH_REGION ?? ''
};

const missingInProd = [];
if (!process.env.SIGNING_SECRET) missingInProd.push('SIGNING_SECRET');
if (ttsProvider === 'azure') {
  if (!env.azureSpeechKey) missingInProd.push('AZURE_SPEECH_KEY');
  if (!env.azureSpeechRegion) missingInProd.push('AZURE_SPEECH_REGION');
}

if (isProduction && missingInProd.length) {
  throw new Error(`Missing required environment variable(s): ${missingInProd.join(', ')}`);
}

if (!isProduction && !process.env.SIGNING_SECRET) {
  console.warn('[config] SIGNING_SECRET is not set. Using a development fallback secret.');
}

export { env };
