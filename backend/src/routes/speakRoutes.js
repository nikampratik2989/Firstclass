import express from 'express';
import fs from 'fs/promises';
import { validateSpeakRequest } from '../middleware/validateSpeakRequest.js';
import { speakRateLimit } from '../middleware/rateLimit.js';
import { saveAudio, getAudioPath } from '../services/audioStore.js';
import { ttsService } from '../services/tts/index.js';
import { env } from '../config/env.js';
import { signAudioPath, verifyAudioSignature } from '../utils/signature.js';

export const speakRouter = express.Router();

speakRouter.post('/speak', speakRateLimit, validateSpeakRequest, async (req, res) => {
  try {
    const audioBuffer = await ttsService.synthesize(req.validatedSpeakRequest);
    const fileName = await saveAudio(audioBuffer);

    const expires = Date.now() + env.audioTtlMs;
    const signature = signAudioPath({ fileName, expires });
    const audioUrl = `/api/audio/${fileName}?expires=${expires}&sig=${signature}`;

    res.status(201).json({
      audioUrl,
      expiresAt: expires,
      format: 'wav'
    });
  } catch (error) {
    console.error('Speech generation failed', error);
    res.status(500).json({
      error: 'Failed to generate speech audio.'
    });
  }
});

speakRouter.get('/audio/:fileName', async (req, res) => {
  const { fileName } = req.params;
  const { expires, sig } = req.query;

  if (!verifyAudioSignature({ fileName, expires, signature: sig })) {
    return res.status(403).json({ error: 'Audio URL expired or invalid.' });
  }

  try {
    const filePath = getAudioPath(fileName);
    await fs.access(filePath);
    return res.sendFile(filePath);
  } catch {
    return res.status(404).json({ error: 'Audio file not found.' });
  }
});
