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
import { seoService } from './server/services/seoService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Suppress DEP0169 legacy url.parse deprecation warning emitted by Express 4 internal dependencies on Node 22
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning: any, ...args: any[]) => {
  if (typeof warning === 'string' && warning.includes('DEP0169')) return;
  if (warning && typeof warning === 'object' && warning.code === 'DEP0169') return;
  return (originalEmitWarning as any).call(process, warning, ...args);
};

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

  // Disable ETag to prevent unwanted 304 Not Modified responses on dynamic API routes
  app.set('etag', false);

  // Prevent caching for all dynamic API routes
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Secure headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  app.use(express.json({
    limit: '50mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Connect to Database & Seed initial data
  try {
    const isConnected = await connectDB();
    if (isConnected) {
      await seedInitialData();
    }
  } catch (dbErr: any) {
    console.warn('[Park Avenue Server] Database initialization warning:', dbErr?.message);
  }

  // Direct root search engine crawl endpoints for https://www.parkavenuemenswear.com
  app.get(['/sitemap.xml', '/sitemap_index.xml'], async (_req, res) => {
    try {
      const xml = await seoService.generateMainSitemapIndexXml();
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(200).send(xml);
    } catch (err: any) {
      return res.status(500).send(`<error>${err?.message}</error>`);
    }
  });

  app.get('/sitemap_pages.xml', async (_req, res) => {
    try {
      const xml = await seoService.generatePagesSitemapXml();
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(200).send(xml);
    } catch (err: any) {
      return res.status(500).send(`<error>${err?.message}</error>`);
    }
  });

  app.get('/sitemap_products_:chunk.xml', async (req, res) => {
    try {
      const chunkNum = parseInt(req.params.chunk, 10) || 1;
      const xml = await seoService.generateProductSitemapXml(chunkNum);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(200).send(xml);
    } catch (err: any) {
      return res.status(500).send(`<error>${err?.message}</error>`);
    }
  });

  app.get('/sitemap_products.xml', async (_req, res) => {
    try {
      const xml = await seoService.generateProductSitemapXml(1);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(200).send(xml);
    } catch (err: any) {
      return res.status(500).send(`<error>${err?.message}</error>`);
    }
  });

  app.get('/robots.txt', (_req, res) => {
    try {
      const txt = seoService.generateRobotsTxt();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(200).send(txt);
    } catch (err: any) {
      return res.status(500).send(`Error: ${err?.message}`);
    }
  });

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
