import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { productService } from '../services/productService.js';

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
        careInstructions
      } = req.body;

      if (!name || !sku || !category || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Please provide product name, SKU, category, and price.'
        });
      }

      const product = await productService.createProduct({
        name,
        sku,
        description: description || 'Master crafted bespoke menswear.',
        category,
        subcategory,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : undefined,
        images,
        variants: Array.isArray(variants) ? variants : [
          { size: '40R', color: 'Black', stock: 5 },
          { size: '42R', color: 'Black', stock: 5 }
        ],
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold, 10) : 3,
        isFeatured: Boolean(isFeatured),
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
        fabric,
        fit,
        careInstructions
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
  }
};
