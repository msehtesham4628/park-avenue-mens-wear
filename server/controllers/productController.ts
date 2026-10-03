import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { productService } from '../services/productService.js';
import { skuService } from '../services/skuService.js';
import { descriptionService } from '../services/descriptionService.js';
import { titleService } from '../services/titleService.js';

export const productController = {
  /**
   * GET /api/products
   */
  async getProducts(req: Request, res: Response) {
    try {
      const {
        category,
        subcategory,
        search,
        minPrice,
        maxPrice,
        size,
        color,
        isFeatured,
        isNewArrival,
        availability,
        sortBy,
        page,
        limit,
        includeInactive
      } = req.query;

      const result = await productService.getProducts({
        category: category as string,
        subcategory: subcategory as string,
        search: search as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        size: size as string,
        color: color as string,
        isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
        isNewArrival: isNewArrival === 'true' ? true : isNewArrival === 'false' ? false : undefined,
        availability: availability as any,
        sortBy: sortBy as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 24,
        includeInactive: includeInactive === 'true'
      });

      return res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
        message: 'Products retrieved successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/products/:slug
   */
  async getProductBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const product = await productService.getProductBySlugOrId(slug);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${slug}" not found in catalogue.`
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
        message: 'Product retrieved successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/admin/products
   */
  async createProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user || { id: 'ADMIN', name: 'Admin', email: 'admin@parkavenuemenswear.com', role: 'admin' };
      const {
        name,
        sku,
        description,
        category,
        subcategory,
        price,
        salePrice,
        images,
        variants,
        lowStockThreshold,
        isFeatured,
        isNewArrival,
        fabric,
        fit,
        careInstructions,
        shippingCharge,
        productViews,
        pdfDocuments,
        colors
      } = req.body;

      if (!name || !category || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Please provide product name, category, and price.'
        });
      }

      // Ensure valid structured SKU
      let resolvedSku = (sku || '').trim();
      if (!resolvedSku) {
        resolvedSku = `PA-${(category || 'GAR').slice(0, 4).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
      }

      const parsedColors = Array.isArray(colors) ? colors : (typeof colors === 'string' ? colors.split(',').map((c: string) => c.trim()).filter(Boolean) : undefined);

      const product = await productService.createProduct({
        name,
        sku: resolvedSku,
        description: description || 'Master crafted bespoke menswear.',
        category,
        subcategory,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : undefined,
        images: Array.isArray(images) ? images : [],
        variants: Array.isArray(variants) ? variants : [
          { size: '40R', color: 'Black', stock: 5 },
          { size: '42R', color: 'Black', stock: 5 }
        ],
        colors: parsedColors,
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold, 10) : 3,
        isFeatured: Boolean(isFeatured),
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
        fabric,
        fit,
        shippingCharge: shippingCharge !== undefined ? parseFloat(shippingCharge) : 15,
        careInstructions,
        productViews: productViews || undefined,
        pdfDocuments: Array.isArray(pdfDocuments) ? pdfDocuments : []
      }, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      return res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/admin/products/batch
   * Creates already-grouped Excel products in MongoDB as one document per garment.
   */
  async batchCreateProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user || { id: 'ADMIN', name: 'Admin', email: 'admin@parkavenuemenswear.com', role: 'admin' };
      const products = Array.isArray(req.body?.products) ? req.body.products : [];
      if (products.length === 0) return res.status(400).json({ success: false, message: 'No products supplied.' });
      if (products.length > 500) return res.status(400).json({ success: false, message: 'Maximum 500 products per import.' });

      const created = [];
      for (const item of products) {
        created.push(await productService.createProduct({
          name: item.name,
          sku: item.sku,
          description: item.description || 'Master crafted bespoke menswear.',
          category: item.category,
          subcategory: item.subcategory,
          price: Number(item.price),
          salePrice: item.salePrice !== undefined ? Number(item.salePrice) : undefined,
          images: Array.isArray(item.images) ? item.images : [],
          colorImages: item.colorImages && typeof item.colorImages === 'object' ? item.colorImages : {},
          variants: Array.isArray(item.variants) ? item.variants : [],
          lowStockThreshold: item.lowStockThreshold !== undefined ? Number(item.lowStockThreshold) : 3,
          isFeatured: Boolean(item.isFeatured),
          isNewArrival: item.isNewArrival !== undefined ? Boolean(item.isNewArrival) : true,
          fabric: item.fabric,
          fit: item.fit,
          careInstructions: Array.isArray(item.care) ? item.care : (Array.isArray(item.careInstructions) ? item.careInstructions : [])
        }, { id: user.id, name: user.name, email: user.email, role: user.role }));
      }

      return res.status(201).json({ success: true, data: created, message: `${created.length} products imported into MongoDB.` });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Batch import failed.' });
    }
  },

  /**
   * PUT /api/admin/products/:id
   */
  async updateProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user || { id: 'ADMIN', name: 'Admin', email: 'admin@parkavenuemenswear.com', role: 'admin' };
      const { id } = req.params;

      const updated = await productService.updateProduct(id, req.body, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: `Product ${id} not found.` });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Product updated successfully.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  /**
   * DELETE /api/admin/products/:id
   */
  async deleteProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user || { id: 'ADMIN', name: 'Admin', email: 'admin@parkavenuemenswear.com', role: 'admin' };
      const { id } = req.params;
      const hardDelete = req.query.hard === 'true';

      const result = await productService.deactivateOrDelete(id, hardDelete, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      if (!result) {
        return res.status(404).json({ success: false, message: `Product ${id} not found.` });
      }

      return res.status(200).json({
        success: true,
        data: null,
        message: hardDelete ? 'Product permanently removed.' : 'Product deactivated successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/products/generate-sku
   */
  async generateSku(req: Request, res: Response) {
    try {
      const { name, category, fabric, color } = req.body;
      if (!name && !category) {
        return res.status(400).json({ success: false, message: 'Garment name or category is required.' });
      }
      const result = await skuService.generateSku({ name: name || 'Garment', category: category || 'Suits', fabric, color });
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Auto SKU generated successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/products/generate-description
   */
  async generateDescription(req: Request, res: Response) {
    try {
      const { name, category, fabric, fit, price, tone, additionalNotes } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Garment name is required.' });
      }
      const result = await descriptionService.generateProductDescription({
        name,
        category: category || 'Suits',
        fabric,
        fit,
        price: price ? parseFloat(price) : undefined,
        tone: tone || 'editorial',
        additionalNotes
      });
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Sartorial luxury description generated successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/products/batch-auto-sku
   */
  async batchAutoSku(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await skuService.batchAssignMissingSkus();
      return res.status(200).json({
        success: true,
        data: result,
        message: `Auto-assigned SKUs to ${result.updatedCount} products.`
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/products/generate-title
   */
  async generateTitle(req: Request, res: Response) {
    try {
      const { text, rawText, category, fabric, fit, provider, imageBase64, imageMimeType } = req.body;
      const result = await titleService.generateProductTitle({
        rawText: (rawText || text || '').trim(),
        category,
        fabric,
        fit,
        provider,
        imageBase64,
        imageMimeType
      });
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Luxury sartorial title synthesized successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

