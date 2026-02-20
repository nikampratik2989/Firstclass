import rateLimit from 'express-rate-limit';

export const speakRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many synthesis requests. Please wait a minute and try again.'
  }
});
