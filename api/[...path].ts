import express from 'express';
import cors from 'cors';
import apiRouter from '../server/routes/index.js';
import { connectDB } from '../server/config/db.js';
import { seedInitialData } from '../server/config/seed.js';
import { errorHandler } from '../server/middleware/errorHandler.js';

// Suppress DEP0169 legacy url.parse deprecation warning emitted by Express 4 internal dependencies on Node 22
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning: any, ...args: any[]) => {
  if (typeof warning === 'string' && warning.includes('DEP0169')) return;
  if (warning && typeof warning === 'object' && warning.code === 'DEP0169') return;
  return (originalEmitWarning as any).call(process, warning, ...args);
};

const app = express();

app.set('etag', false);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use('/api', apiRouter);
app.use('/', apiRouter);
app.use('/api', errorHandler);
app.use(errorHandler);

// API requests must never fall through to Vercel's HTML 404 page.
// Keep API failures JSON-shaped for the storefront client.
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

let initialization: Promise<void> | null = null;

async function initialize() {
  if (!initialization) {
    initialization = (async () => {
      try {
        const ok = await connectDB();
        if (ok) {
          await seedInitialData();
        }
      } catch (error) {
        console.warn('[Park Avenue API] DB initialization warning, continuing with service fallback:', error);
      }
    })();
  }
  return initialization;
}

export default async function handler(req: express.Request, res: express.Response) {
  try {
    await initialize();
    return app(req, res);
  } catch (error: any) {
    console.error('[Park Avenue API] Request handler fallback:', error);
    return app(req, res);
  }
}
