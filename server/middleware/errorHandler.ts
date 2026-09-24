import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected error occurred in the atelier engine.';

  // Strip any accidental secrets or stack traces from client response
  console.error(`[Park Avenue Error] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message: message.replace(/(Bearer\s+[A-Za-z0-9-_.]+)|(key_[a-zA-Z0-9]+)|(sec_[a-zA-Z0-9]+)/gi, '[REDACTED]')
  });
}
