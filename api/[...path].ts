import express from 'express';
import cors from 'cors';
import apiRouter from '../server/routes/index.js';
import { connectDB } from '../server/config/db.js';
import { seedInitialData } from '../server/config/seed.js';
import { errorHandler } from '../server/middleware/errorHandler.js';
import { seoService } from '../server/services/seoService.js';

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

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

app.get(['/sitemap.xml', '/sitemap_index.xml'], async (_req, res) => {
  try {
    const xml = await seoService.generateMainSitemapIndexXml();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (_) {
    return res.status(500).type('application/xml').send('<error>Sitemap generation failed</error>');
  }
});

app.get('/sitemap_pages.xml', async (_req, res) => {
  try {
    const xml = await seoService.generatePagesSitemapXml();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (_) {
    return res.status(500).type('application/xml').send('<error>Sitemap generation failed</error>');
  }
});

app.get('/sitemap_products_:chunk.xml', async (req, res) => {
  try {
    const chunk = Number.parseInt(req.params.chunk, 10);
    if (!Number.isInteger(chunk) || chunk < 1) {
      return res.status(400).type('application/xml').send('<error>Invalid sitemap chunk</error>');
    }
    const xml = await seoService.generateProductSitemapXml(chunk);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (_) {
    return res.status(500).type('application/xml').send('<error>Sitemap generation failed</error>');
  }
});

app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(200).send(seoService.generateRobotsTxt());
});

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

import mongoose from 'mongoose';

let isSeeded = false;

async function initialize() {
  if (Number(mongoose.connection.readyState) !== 1) {
    try {
      const connected = await connectDB();
      if (connected && !isSeeded) {
        await seedInitialData();
        isSeeded = true;
      }
    } catch (error) {
      console.warn('[Park Avenue API] DB initialization warning, continuing with service fallback:', error);
    }
  }
}

export default async function handler(req: express.Request, res: express.Response) {
  // SEO endpoints must never wait for the database/app initialization.
  // Googlebot can fetch the sitemap even while MongoDB is unavailable.
  const requestPath = String(req.path || req.url || '').split('?')[0];
  const isSeoRequest =
    requestPath === '/sitemap.xml' ||
    requestPath === '/sitemap_index.xml' ||
    requestPath === '/sitemap_pages.xml' ||
    requestPath === '/robots.txt' ||
    /^\/sitemap_products_\d+\.xml$/.test(requestPath);

  try {
    if (!isSeoRequest) {
      await initialize();
    }
    return app(req, res);
  } catch (error: any) {
    console.error('[Park Avenue API] Request handler fallback:', error);
    return app(req, res);
  }
}
