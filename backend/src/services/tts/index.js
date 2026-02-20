import { env } from '../../config/env.js';
import * as azureProvider from './azureTtsProvider.js';

const providerMap = {
  azure: azureProvider
};

export const ttsService = providerMap[env.ttsProvider];

if (!ttsService) {
  throw new Error(`Unsupported TTS_PROVIDER: ${env.ttsProvider}`);
}
