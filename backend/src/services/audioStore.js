import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '..', '..', 'tmp-audio');

const ensureDir = async () => {
  await fs.mkdir(outputDir, { recursive: true });
};

export const saveAudio = async (buffer) => {
  await ensureDir();
  const fileName = `${uuidv4()}.wav`;
  const filePath = path.join(outputDir, fileName);
  await fs.writeFile(filePath, buffer);
  return fileName;
};

export const getAudioPath = (fileName) => path.join(outputDir, fileName);

export const purgeExpiredAudio = async () => {
  await ensureDir();
  const entries = await fs.readdir(outputDir);
  const now = Date.now();

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(outputDir, entry);
      const stat = await fs.stat(fullPath);
      if (now - stat.mtimeMs > env.audioTtlMs) {
        await fs.rm(fullPath, { force: true });
      }
    })
  );
};
