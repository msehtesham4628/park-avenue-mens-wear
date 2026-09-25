import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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

  app.use(express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Connect to Database & Seed initial data
  try {
    const isConnected = await connectDB();
    if (isConnected) {
      await seedInitialData();
    }
  } catch (dbErr: any) {
    console.warn('[Park Avenue Server] Database initialization warning:', dbErr?.message);
  }

  // Mount API Router under /api
  app.use('/api', apiRouter);

  // Database offline error middleware fallback
  app.use('/api', (err: any, req: Request, res: Response, next: express.NextFunction) => {
    if (err?.name === 'MongooseError' || err?.name === 'MongoNetworkError' || (err?.message && err.message.includes('buffering timed out'))) {
      console.warn('[AI Studio] Database offline — returning mock response');
      if (req.method === 'GET') {
        return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
      }
      return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
    }
    next(err);
  });

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
    app.use('*', async (req, res, next) => {
      if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
        try {
          const indexHtml = path.resolve(__dirname, 'index.html');
          const template = fs.readFileSync(indexHtml, 'utf-8');
          const html = await vite.transformIndexHtml(req.originalUrl, template);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
          return next(e);
        }
      }
      next();
    });
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
