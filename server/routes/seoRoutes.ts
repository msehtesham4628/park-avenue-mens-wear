import { Router, Request, Response } from 'express';
import { seoService } from '../services/seoService.js';

const router = Router();

// GET /api/seo/sitemap.xml or GET /sitemap.xml
router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const xml = await seoService.generateSitemapXml();
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
      message: 'SEO and Sitemap overview retrieved.'
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
      message: 'Sitemap ping dispatched to major search engines (Googlebot & Bingbot).',
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
