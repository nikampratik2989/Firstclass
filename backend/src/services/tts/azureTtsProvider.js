import sdk from 'microsoft-cognitiveservices-speech-sdk';
import { env } from '../../config/env.js';
import { chunkText } from '../../utils/textChunker.js';
import { concatWav } from '../../utils/wavConcat.js';

const VOICE_PATTERN = /^[a-z]{2,3}-[A-Z]{2,3}-[A-Za-z0-9]+(?:[A-Za-z0-9-]+)?$/;
const LANGUAGE_PATTERN = /^[a-z]{2,3}-[A-Z]{2,3}$/;

const ensureAzureConfig = () => {
  if (!env.azureSpeechKey || !env.azureSpeechRegion) {
    throw new Error('Azure Speech is not configured. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in your .env file.');
  }
};

const validateVoiceParams = ({ language, voice }) => {
  if (!LANGUAGE_PATTERN.test(language)) {
    throw new Error('Invalid language format supplied for Azure TTS.');
  }

  if (!VOICE_PATTERN.test(voice)) {
    throw new Error('Invalid voice format supplied for Azure TTS.');
  }
};

const toSsml = ({ text, language, voice, rate, pitch }) => {
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const ratePercent = `${Math.round((rate - 1) * 100)}%`;
  const pitchValue = `${pitch >= 0 ? '+' : ''}${pitch}Hz`;

  return `
    <speak version="1.0" xml:lang="${language}">
      <voice name="${voice}">
        <prosody rate="${ratePercent}" pitch="${pitchValue}">${escapedText}</prosody>
      </voice>
    </speak>
  `;
};

const synthesizeChunk = (ssml) => {
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(env.azureSpeechKey, env.azureSpeechRegion);
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(Buffer.from(result.audioData));
          return;
        }

        reject(new Error(`Azure Speech synthesis failed: ${result.errorDetails || 'unknown error'}`));
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
};

export const synthesize = async ({ text, language, voice, rate, pitch }) => {
  ensureAzureConfig();
  validateVoiceParams({ language, voice });

  const chunks = chunkText(text);
  const audioBuffers = [];

  for (const chunk of chunks) {
    const ssml = toSsml({ text: chunk, language, voice, rate, pitch });
    const buffer = await synthesizeChunk(ssml);
    audioBuffers.push(buffer);
  }

  return concatWav(audioBuffers, { sampleRate: 24000, channels: 1, bitsPerSample: 16 });
};
