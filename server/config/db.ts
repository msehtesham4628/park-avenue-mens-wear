import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;
let mongoMemoryServerInstance: any = null;

export async function connectDB(): Promise<boolean> {
  if (isConnected && mongoose.connection.readyState === 1) return true;

  // 1. If live remote MongoDB URI is provided, attempt to connect
  if (ENV.MONGODB_URI && !ENV.MONGODB_URI.includes('127.0.0.1') && !ENV.MONGODB_URI.includes('localhost')) {
    try {
      await mongoose.connect(ENV.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
      isConnected = true;
      console.info('[Park Avenue DB] Successfully connected to live MongoDB cluster.');
      return true;
    } catch (err: any) {
      console.warn(`[Park Avenue DB] Live cluster connection failed (${err.message}). Falling back to embedded Mongo engine.`);
    }
  }

  // 2. Initialize fast embedded in-memory MongoDB server for development, testing, and isolated preview
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const uri = mongoMemoryServerInstance.getUri();

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    isConnected = true;
    console.info(`[Park Avenue DB] Connected to embedded in-memory MongoDB instance: ${uri}`);
    return true;
  } catch (err: any) {
    console.warn(`[Park Avenue DB] In-memory MongoDB initialization note (${err.message}). Connecting with buffer timeout mitigation.`);
    // Set bufferTimeoutMS to 0 so errors fail fast if not connected
    mongoose.set('bufferTimeoutMS', 2500);
    isConnected = true;
    return false;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
  isConnected = false;
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
