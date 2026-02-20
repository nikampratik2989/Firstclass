import crypto from 'crypto';
import { env } from '../config/env.js';

export const signAudioPath = ({ fileName, expires }) => {
  return crypto
    .createHmac('sha256', env.signingSecret)
    .update(`${fileName}:${expires}`)
    .digest('hex');
};

export const verifyAudioSignature = ({ fileName, expires, signature }) => {
  const now = Date.now();
  if (!expires || Number(expires) < now || !signature) return false;

  const expected = signAudioPath({ fileName, expires });
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(String(signature));

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};
