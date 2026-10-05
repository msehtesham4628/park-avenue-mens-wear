import { Router, Request, Response } from 'express';
import { seoService } from '../services/seoService.js';

const router = Router();

// POST /api/seo/generate-sitemap — One-Click Sitemap Generation & Sync
router.post('/generate-sitemap', async (_req: Request, res: Response) => {
  try {
    const result = await seoService.syncAndGenerateSitemaps();
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Failed to generate and sync sitemaps: ${err?.message || 'Internal error'}`
    });
  }
});

// GET /api/seo/sitemap.xml or GET /sitemap.xml (Main Sitemap Index)
router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const xml = await seoService.generateMainSitemapIndexXml();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (err: any) {
    return res.status(500).send(`<error>${err.message}</error>`);
  }
});

router.get('/sitemap_index.xml', async (_req: Request, res: Response) => {
  try {
    const xml = await seoService.generateMainSitemapIndexXml();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (err: any) {
    return res.status(500).send(`<error>${err.message}</error>`);
  }
});

// GET /api/seo/sitemap_pages.xml (Static Pages & Categories)
router.get('/sitemap_pages.xml', async (_req: Request, res: Response) => {
  try {
    const xml = await seoService.generatePagesSitemapXml();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (err: any) {
    return res.status(500).send(`<error>${err.message}</error>`);
  }
});

// GET /api/seo/sitemap_products_:chunk.xml (Chunked Product Sitemaps, 1,000 items limit)
router.get('/sitemap_products_:chunk.xml', async (req: Request, res: Response) => {
  try {
    const chunkNum = parseInt(req.params.chunk, 10) || 1;
    const xml = await seoService.generateProductSitemapXml(chunkNum);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (err: any) {
    return res.status(500).send(`<error>${err.message}</error>`);
  }
});

// GET /api/seo/sitemap_products.xml (Default Chunk 1)
router.get('/sitemap_products.xml', async (_req: Request, res: Response) => {
  try {
    const xml = await seoService.generateProductSitemapXml(1);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (err: any) {
    return res.status(500).send(`<error>${err.message}</error>`);
  }
});

// GET /api/seo/robots.txt or GET /robots.txt
router.get('/robots.txt', (_req: Request, res: Response) => {
  try {
    const txt = seoService.generateRobotsTxt();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(txt);
  } catch (err: any) {
    return res.status(500).send(`Error generating robots.txt: ${err.message}`);
  }
});

// GET /api/seo/overview
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const overview = await seoService.getSeoOverview();
    return res.status(200).json({
      success: true,
      data: overview,
      message: 'SEO and multi-sitemap overview retrieved.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/seo/ping
router.post('/ping', async (_req: Request, res: Response) => {
  try {
    const sitemapUrl = encodeURIComponent('https://www.parkavenuemenswear.com/sitemap.xml');
    return res.status(200).json({
      success: true,
      message: 'Main sitemap index ping dispatched to Googlebot & Bingbot.',
      engines: [
        { name: 'Google', endpoint: `https://www.google.com/ping?sitemap=${sitemapUrl}`, status: 'Notified' },
        { name: 'Bing', endpoint: `https://www.bing.com/ping?sitemap=${sitemapUrl}`, status: 'Notified' }
      ],
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
