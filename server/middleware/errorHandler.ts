import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected error occurred in the atelier engine.';

  if (err?.code === 11000 || (err?.message && err.message.includes('E11000'))) {
    statusCode = 409;
    if (err.message?.includes('email') || err?.keyPattern?.email) {
      message = 'An account with this email address already exists.';
    } else if (err.message?.includes('username') || err?.keyPattern?.username) {
      message = 'This username is already taken. Please choose another username.';
    } else if (err.message?.includes('customerId') || err?.keyPattern?.customerId) {
      message = 'A record with this identifier already exists.';
    } else if (err.message?.includes('sku') || err?.keyPattern?.sku) {
      message = 'A product with this SKU already exists.';
    } else {
      message = 'A database record with duplicate unique fields already exists.';
    }
  }

  // Strip any accidental secrets or stack traces from client response
  console.error(`[Park Avenue Error] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message: message.replace(/(Bearer\s+[A-Za-z0-9-_.]+)|(key_[a-zA-Z0-9]+)|(sec_[a-zA-Z0-9]+)/gi, '[REDACTED]')
  });
}
