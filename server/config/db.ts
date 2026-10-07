import mongoose from 'mongoose';
import { ENV } from './env.js';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServer?: any;
};

const globalForMongoose = globalThis as typeof globalThis & {
  __parkAvenueMongoose?: MongooseCache;
};

const cache: MongooseCache = globalForMongoose.__parkAvenueMongoose || {
  conn: null,
  promise: null,
  memoryServer: null
};
globalForMongoose.__parkAvenueMongoose = cache;

export async function connectDB(): Promise<boolean> {
  if (Number(mongoose.connection.readyState) === 1) {
    cache.conn = mongoose;
    return true;
  }

  if (cache.promise) {
    try {
      await cache.promise;
      return Number(mongoose.connection.readyState) === 1;
    } catch {
      // fall through to retry
    }
  }

  // Ensure commands fail fast if connection drops
  mongoose.set('bufferCommands', false);

  const rawUri = ENV.MONGODB_URI?.trim() || '';
  const isLocalOrEmpty = !rawUri || /mongodb(?:\+srv)?:\/\/(?:127\.0\.0\.1|localhost)/i.test(rawUri);

  const formatDbUri = (uri: string, databaseName: string): string => {
    if (!uri) return uri;
    let formatted = uri.trim();
    // Replace explicit /test or /park_avanue_mens_wear with the intended database name
    formatted = formatted.replace(/\/(test|park_avanue_mens_wear)(\?|$)/i, `/${databaseName}$2`);
    // If the URI has no database name before query params (e.g. .mongodb.net/? or :27017/?)
    formatted = formatted.replace(/(\.mongodb\.net|\.net|\.com|\.org|\.io|:\d+)\/(\?|$)/i, `$1/${databaseName}$2`);
    // If URI ends with trailing slash only
    if (/(\.mongodb\.net|\.net|\.com|\.org|\.io|:\d+)\/$/i.test(formatted)) {
      formatted = `${formatted}${databaseName}`;
    }
    return formatted;
  };

  const connectWithUri = async (targetUri: string, isMemory: boolean): Promise<boolean> => {
    const dbName = ENV.MONGODB_DB_NAME || 'park_avenue_menswear';
    const finalUri = formatDbUri(targetUri, dbName);
    cache.promise = mongoose.connect(finalUri, {
      dbName,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 0
    });

    cache.conn = await cache.promise;
    console.info(`[Park Avenue DB] MongoDB connected successfully to database "${dbName}" (${isMemory ? 'In-Memory Engine' : 'External Database'}).`);
    return true;
  };

  try {
    if (!isLocalOrEmpty) {
      try {
        console.info('[Park Avenue DB] Attempting connection to configured MONGODB_URI...');
        return await connectWithUri(rawUri, false);
      } catch (externalErr: any) {
        console.warn('[Park Avenue DB] External MongoDB connection failed, falling back to In-Memory engine:', externalErr?.message);
      }
    }

    // In serverless environments (e.g. Vercel) without external MONGODB_URI, skip spawning MongoMemoryServer binary
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (isServerless && isLocalOrEmpty) {
      console.info('[Park Avenue DB] Running in serverless mode without external MONGODB_URI; using resilient memory ledger.');
      return false;
    }

    // Use In-Memory MongoDB Server for development, tests, or offline resilience
    if (!cache.memoryServer) {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      cache.memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: ENV.MONGODB_DB_NAME || 'park_avenue_menswear'
        }
      });
    }

    const memoryUri = cache.memoryServer.getUri();
    return await connectWithUri(memoryUri, true);
  } catch (err: any) {
    cache.conn = null;
    console.warn('[Park Avenue DB] MongoDB offline — running with graceful offline fallback:', err?.message || err);
    return false;
  } finally {
    cache.promise = null;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (cache.memoryServer) {
    try {
      await cache.memoryServer.stop();
    } catch (_) {}
    cache.memoryServer = null;
  }
  cache.conn = null;
  cache.promise = null;
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
