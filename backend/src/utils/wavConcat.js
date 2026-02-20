const WAV_HEADER_SIZE = 44;

const writeWavHeader = ({ dataSize, sampleRate = 24000, channels = 1, bitsPerSample = 16 }) => {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(WAV_HEADER_SIZE);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(dataSize + 36, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
};

export const concatWav = (wavBuffers, options = {}) => {
  if (!wavBuffers.length) throw new Error('No WAV buffers to concatenate');
  if (wavBuffers.length === 1) return wavBuffers[0];

  const pcmBuffers = wavBuffers.map((chunk) => chunk.slice(WAV_HEADER_SIZE));
  const dataSize = pcmBuffers.reduce((sum, b) => sum + b.length, 0);

  return Buffer.concat([writeWavHeader({ dataSize, ...options }), ...pcmBuffers]);
};
