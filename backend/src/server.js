import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { speakRouter } from './routes/speakRoutes.js';
import { purgeExpiredAudio } from './services/audioStore.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendOrigin,
    methods: ['GET', 'POST']
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', speakRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(env.port, async () => {
  console.log(`Speakify backend listening on port ${env.port}`);
  try {
    await purgeExpiredAudio();
    setInterval(purgeExpiredAudio, 60 * 1000).unref();
  } catch (error) {
    console.error('Failed to start cleanup job', error);
  }
});
