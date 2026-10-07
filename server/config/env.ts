import dotenv from 'dotenv';
dotenv.config();

function getPort(): number {
  const args = process.argv;
  const portArgIndex = args.indexOf('--port');
  if (portArgIndex !== -1 && args[portArgIndex + 1]) {
    const parsed = parseInt(args[portArgIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  // In AI Studio environments, dev server must strictly bind to port 3000
  return 3000;
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: getPort(),
  MONGODB_URI: process.env.MONGODB_URI || process.env.DATABASE_URL || '',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'park_avenue_menswear',
  JWT_SECRET: process.env.JWT_SECRET || process.env.AUTH_SECRET || 'park-avenue-luxury-jwt-secret-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  
  // Communication Gateways
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'mock',
  EMAIL_API_KEY: process.env.EMAIL_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'concierge@parkavenuemenswear.com',
  
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'mock',
  SMS_API_KEY: process.env.SMS_API_KEY || '',
  SMS_FROM: process.env.SMS_FROM || '+18005557275',
  
  WHATSAPP_PROVIDER: process.env.WHATSAPP_PROVIDER || 'mock',
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY || '',
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID || '',

  // Payment Processing (Stripe)
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'stripe',
  PAYMENT_SECRET: process.env.PAYMENT_SECRET || process.env.STRIPE_SECRET_KEY || '',
  PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_SECRET || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET || ''
};
