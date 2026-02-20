import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

const fallbackSigningSecret = `dev-signing-secret-${crypto.randomBytes(16).toString('hex')}`;

const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  signingSecret: process.env.SIGNING_SECRET ?? fallbackSigningSecret,
  audioTtlMs: Number(process.env.AUDIO_TTL_MS ?? 15 * 60 * 1000),
  ttsProvider: process.env.TTS_PROVIDER ?? 'azure',
  azureSpeechKey: process.env.AZURE_SPEECH_KEY ?? '',
  azureSpeechRegion: process.env.AZURE_SPEECH_REGION ?? ''
};

const missingInProd = [];
if (!process.env.SIGNING_SECRET) missingInProd.push('SIGNING_SECRET');
if (!env.azureSpeechKey) missingInProd.push('AZURE_SPEECH_KEY');
if (!env.azureSpeechRegion) missingInProd.push('AZURE_SPEECH_REGION');

if (isProduction && missingInProd.length) {
  throw new Error(`Missing required environment variable(s): ${missingInProd.join(', ')}`);
}

if (!isProduction && !process.env.SIGNING_SECRET) {
  console.warn('[config] SIGNING_SECRET is not set. Using an ephemeral development fallback secret.');
}

export { env };
