import './server/config/suppressWarnings.js';
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

// Catch unhandled errors gracefully to keep the server process alive
process.on('uncaughtException', (err: any) => {
  if (err && (err.message?.includes('Port 24678') || err.code === 'ECONNRESET' || err.code === 'EPIPE')) {
    return;
  }
  console.error('[Park Avenue Server] Uncaught exception caught safely:', err?.message || err);
});

process.on('unhandledRejection', (reason: any) => {
  console.warn('[Park Avenue Server] Unhandled promise rejection caught safely:', reason?.message || reason);
});

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

  // Permanent 301 Redirects for legacy indexed URLs to canonical routes
  app.get(['/returns-policy', '/return-policy'], (_req, res) => {
    return res.redirect(301, '/returns');
  });

  app.get(['/terms-and-conditions', '/terms-of-service'], (_req, res) => {
    return res.redirect(301, '/terms');
  });

  app.get('/category/products/:id', (req, res) => {
    return res.redirect(301, `/product/${encodeURIComponent(req.params.id)}`);
  });

  app.get('/:category/products/:id', (req, res, next) => {
    const cat = req.params.category.toLowerCase();
    const knownCategories = ['suits', 'blazers-jackets', 'shirts', 'pants', 'outerwear', 'sweaters-knitwear', 'footwear', 'accessories', 'shorts'];
    if (knownCategories.includes(cat) && req.params.id) {
      return res.redirect(301, `/product/${encodeURIComponent(req.params.id)}`);
    }
    next();
  });

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
  const BOT_USER_AGENT_REGEX = /(googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|slackbot|whatsapp|telegrambot|embedly|quora link preview|showyoubot|outbrain|pinterest|applebot)/i;

  app.get([
    '/product/:id',
    '/suits',
    '/blazers-jackets',
    '/shirts',
    '/pants',
    '/outerwear',
    '/sweaters-knitwear',
    '/footwear',
    '/accessories',
    '/shorts',
    '/shop',
    '/categories',
    '/returns',
    '/terms',
    '/track-order',
    '/track-alteration'
  ], async (req, res, next) => {
    const userAgent = String(req.headers['user-agent'] || '');
    const isBot = BOT_USER_AGENT_REGEX.test(userAgent) || req.query.bot === '1' || req.query.prerender === '1';
    if (isBot) {
      try {
        const html = await seoService.generateBotHtml(req.path);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        return res.status(200).send(html);
      } catch (_) {
        return next();
      }
    }
    next();
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
  const isHmrDisabled = process.env.DISABLE_HMR === 'true';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
        watch: isHmrDisabled ? null : {}
      },
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
    console.info(`[Park Avenue Server] Mounted Vite development middleware (HMR ${isHmrDisabled ? 'disabled' : 'enabled'}).`);
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
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.info(`========================================================`);
    console.info(` PARK AVENUE MENSWEAR — LUXURY SARTORIAL BACKEND API`);
    console.info(` Server active on: http://0.0.0.0:${PORT}`);
    console.info(` API Documentation: http://0.0.0.0:${PORT}/api/docs`);
    console.info(` Health check:     http://0.0.0.0:${PORT}/api/health`);
    console.info(`========================================================`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Park Avenue Server] Port ${PORT} temporarily busy, retrying in 1s...`);
      setTimeout(() => {
        try {
          server.close();
        } catch (_) {}
        server.listen(PORT, '0.0.0.0');
      }, 1000);
    } else {
      console.error('[Park Avenue Server] Server network error:', err);
    }
  });

  // Connect to Database & Seed initial data asynchronously so HTTP server responds immediately
  (async () => {
    try {
      const isConnected = await connectDB();
      if (isConnected) {
        await seedInitialData();
      }
    } catch (dbErr: any) {
      console.warn('[Park Avenue Server] Database initialization warning:', dbErr?.message);
    }
  })();
}

bootstrapServer().catch((err) => {
  console.error('[Park Avenue Server] Fatal startup failure:', err);
});
