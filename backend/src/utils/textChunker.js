export const chunkText = (text, maxChunkLength = 4200) => {
  if (text.length <= maxChunkLength) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > maxChunkLength) {
    let cutIndex = remaining.lastIndexOf(' ', maxChunkLength);
    if (cutIndex <= 0) {
      cutIndex = maxChunkLength;
    }

    chunks.push(remaining.slice(0, cutIndex).trim());
    remaining = remaining.slice(cutIndex).trim();
  }

  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks;
};
