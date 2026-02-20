// Deprecated placeholder kept only for backward compatibility.
// Use azureTtsProvider.js for production and set TTS_PROVIDER=azure.
export const synthesize = async () => {
  throw new Error('Google provider is not configured in this project build. Use TTS_PROVIDER=azure.');
};
