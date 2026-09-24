import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  if (isConnected && mongoose.connection.readyState === 1) return true;

  const uri = ENV.MONGODB_URI?.trim();
  if (ENV.NODE_ENV === 'production') {
    if (!uri) throw new Error('[Park Avenue DB] MONGODB_URI is missing in production. Add it to Vercel environment variables.');
    if (/mongodb(?:\+srv)?:\/\/(?:127\.0\.0\.1|localhost)/i.test(uri)) throw new Error('[Park Avenue DB] Production MONGODB_URI points to localhost. Use the MongoDB Atlas connection string in Vercel.');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, socketTimeoutMS: 45000, maxPoolSize: 10, minPoolSize: 1 });
    isConnected = true; console.info('[Park Avenue DB] Connected to production MongoDB.'); return true;
  }

  if (uri && !/mongodb(?:\+srv)?:\/\/(?:127\.0\.0\.1|localhost)/i.test(uri)) {
    try { await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }); isConnected = true; console.info('[Park Avenue DB] Connected to configured MongoDB.'); return true; }
    catch (err: any) { console.warn('[Park Avenue DB] Configured MongoDB connection failed in development:', err.message); }
  }
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongoMemoryServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoMemoryServer.getUri(), { serverSelectionTimeoutMS: 5000 });
    isConnected = true; console.info('[Park Avenue DB] Connected to development in-memory MongoDB.'); return true;
  } catch (err: any) {
    isConnected = false; mongoose.set('bufferTimeoutMS', 2500); console.error('[Park Avenue DB] Database initialization failed:', err.message); throw err;
  }
}

export async function disconnectDB(): Promise<void> { if (mongoose.connection.readyState !== 0) await mongoose.disconnect(); isConnected = false; }
export function isDbConnected(): boolean { return isConnected && mongoose.connection.readyState === 1; }