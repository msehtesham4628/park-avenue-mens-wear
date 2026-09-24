import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './server/config/env.js';
import { connectDB } from './server/config/db.js';
import { seedInitialData } from './server/config/seed.js';
import apiRouter from './server/routes/index.js';
import { errorHandler } from './server/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrapServer() {
  const app = express();

  // Security & standard middlewares
  app.use(cors({
    origin: (origin, callback) => {
      // Allow localhost, dev previews, or defined FRONTEND_URL
      callback(null, true);
    },
    credentials: true
  }));

  // Secure headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Connect to Database & Seed initial data
  await connectDB();
  await seedInitialData();

  // Mount API Router under /api
  app.use('/api', apiRouter);

  // Error handling middleware for all API routes
  app.use('/api', errorHandler);

  // API requests must always receive JSON, including unmatched routes.
  app.use('/api', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Vite development middleware or production static serving
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.info('[Park Avenue Server] Mounted Vite development middleware with HMR.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.info(`[Park Avenue Server] Serving production static bundle from ${distPath}.`);
  }

  // Fallback error handler
  app.use(errorHandler);

  const PORT = ENV.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.info(`========================================================`);
    console.info(` PARK AVENUE MENSWEAR — LUXURY SARTORIAL BACKEND API`);
    console.info(` Server active on: http://0.0.0.0:${PORT}`);
    console.info(` API Documentation: http://0.0.0.0:${PORT}/api/docs`);
    console.info(` Health check:     http://0.0.0.0:${PORT}/api/health`);
    console.info(`========================================================`);
  });
}

bootstrapServer().catch((err) => {
  console.error('[Park Avenue Server] Fatal startup failure:', err);
  process.exit(1);
});
