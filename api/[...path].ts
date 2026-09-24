import express from 'express';
import cors from 'cors';
import apiRouter from '../server/routes/index.js';
import { connectDB } from '../server/config/db.js';
import { seedInitialData } from '../server/config/seed.js';
import { errorHandler } from '../server/middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', apiRouter);
app.use('/api', errorHandler);

// API requests must never fall through to Vercel's HTML 404 page.
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

let initialization: Promise<void> | null = null;

async function initialize() {
  if (!initialization) {
    initialization = (async () => {
      await connectDB();
      await seedInitialData();
    })().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

export default async function handler(req: express.Request, res: express.Response) {
  try {
    await initialize();
    return app(req, res);
  } catch (error: any) {
    console.error('[Park Avenue API] Initialization failed:', error);
    return res.status(503).json({
      success: false,
      status: 'offline',
      database: 'disconnected',
      message: error?.message || 'Database connection failed.'
    });
  }
}
