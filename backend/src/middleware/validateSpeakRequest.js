import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

const schema = z.object({
  text: z.string().min(1).max(20000),
  language: z.string().min(2).max(20),
  voice: z.string().min(2).max(100),
  rate: z.number().min(0.5).max(2),
  pitch: z.number().min(-20).max(20)
});

export const validateSpeakRequest = (req, res, next) => {
  try {
    const text = sanitizeHtml(String(req.body.text ?? ''), {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();

    const payload = {
      ...req.body,
      text,
      rate: Number(req.body.rate),
      pitch: Number(req.body.pitch)
    };

    const data = schema.parse(payload);
    req.validatedSpeakRequest = data;
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Invalid request payload.',
      details: error?.errors ?? error.message
    });
  }
};
