import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const hitMap = new Map<string, RateLimitRecord>();

/**
 * Clean in-memory sliding window rate limiter
 */
export function createRateLimiter(options: { windowMs: number; max: number; message?: string }) {
  const { windowMs, max, message } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-client';
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    const record = hitMap.get(key);

    if (!record || now > record.resetAt) {
      hitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please slow down.'
      });
    }

    record.count += 1;
    next();
  };
}

// Preset limiters
export const orderLookupLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30,
  message: 'Too many order lookup attempts. Please try again in a few minutes.'
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts. Please try again later.'
});
