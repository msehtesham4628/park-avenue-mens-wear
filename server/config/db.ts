import mongoose from 'mongoose';
import { ENV } from './env.js';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  __parkAvenueMongoose?: MongooseCache;
};

const cache: MongooseCache = globalForMongoose.__parkAvenueMongoose || {
  conn: null,
  promise: null
};
globalForMongoose.__parkAvenueMongoose = cache;

export async function connectDB(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) {
    cache.conn = mongoose;
    return true;
  }

  const uri = ENV.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error('[Park Avenue DB] MONGODB_URI is missing. Add the MongoDB Atlas connection string to Vercel Production.');
  }

  if (/mongodb(?:\+srv)?:\/\/(?:127\.0\.0\.1|localhost)/i.test(uri)) {
    throw new Error('[Park Avenue DB] Production MONGODB_URI points to localhost. Use the MongoDB Atlas connection string.');
  }

  if (cache.promise) {
    await cache.promise;
    return mongoose.connection.readyState === 1;
  }

  cache.promise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 0
  });

  try {
    cache.conn = await cache.promise;
    console.info('[Park Avenue DB] MongoDB Atlas connection ready.');
    return true;
  } catch (err: any) {
    cache.conn = null;
    throw new Error('[Park Avenue DB] MongoDB connection failed: ' + (err?.message || 'unknown connection error'));
  } finally {
    cache.promise = null;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  cache.conn = null;
  cache.promise = null;
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
