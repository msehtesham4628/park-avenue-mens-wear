import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { productService } from '../services/productService.js';
import { skuService } from '../services/skuService.js';
import { descriptionService } from '../services/descriptionService.js';
import { titleService } from '../services/titleService.js';

export const productController = {
  /**
   * GET /api/products/template (.xlsx or .csv)
   * Serves pre-built standardized template for batch upload
   */
  async getProductExcelTemplate(req: Request, res: Response) {
    try {
      const format = (req.query.format as string)?.toLowerCase() === 'csv' || req.path.endsWith('.csv') ? 'csv' : 'xlsx';
      const templateRows = [
        {
          'Product Group': 'PA-SUIT-001',
          'SKU': 'PA-SUIT-001-NAVY-38R',
          'Garment Name': 'Park Avenue Modern Tailored Suit',
          'Category': 'Suits',
          'Subcategory': 'Two-Piece Suits',
          'Price ($)': 2850,
          'Color': 'Navy',
          'Color Hex': '#1E2A44',
          'Size': '38R',
          'Stock': 5,
          'Image URL': '/Suits_image.png',
          'Fabric': 'Super 150s Tasmanian Wool',
          'Fit': 'Modern Tailored',
          'Description': 'Handcrafted Park Avenue two-piece wool suit with full canvas construction.'
        },
        {
          'Product Group': 'PA-SUIT-001',
          'SKU': 'PA-SUIT-001-NAVY-40R',
          'Garment Name': 'Park Avenue Modern Tailored Suit',
          'Category': 'Suits',
          'Subcategory': 'Two-Piece Suits',
          'Price ($)': 2850,
          'Color': 'Navy',
          'Color Hex': '#1E2A44',
          'Size': '40R',
          'Stock': 6,
          'Image URL': '/Suits_image.png',
          'Fabric': 'Super 150s Tasmanian Wool',
          'Fit': 'Modern Tailored',
          'Description': 'Handcrafted Park Avenue two-piece wool suit with full canvas construction.'
        },
        {
          'Product Group': 'PA-SUIT-001',
          'SKU': 'PA-SUIT-001-BLACK-38R',
          'Garment Name': 'Park Avenue Modern Tailored Suit',
          'Category': 'Suits',
          'Subcategory': 'Two-Piece Suits',
          'Price ($)': 2850,
          'Color': 'Black',
          'Color Hex': '#111111',
          'Size': '38R',
          'Stock': 4,
          'Image URL': '/Suits_image.png',
          'Fabric': 'Super 150s Tasmanian Wool',
          'Fit': 'Modern Tailored',
          'Description': 'Handcrafted Park Avenue two-piece wool suit with full canvas construction.'
        },
        {
          'Product Group': 'PA-SHIRT-002',
          'SKU': 'PA-SHIRT-002-WHITE-15.5',
          'Garment Name': 'Egyptian Cotton Royal Twill Shirt',
          'Category': 'Shirts',
          'Subcategory': 'Formal Dress Shirts',
          'Price ($)': 320,
          'Color': 'White',
          'Color Hex': '#FFFFFF',
          'Size': '15.5',
          'Stock': 10,
          'Image URL': '/Shirts_image.png',
          'Fabric': '100% Egyptian Giza Cotton',
          'Fit': 'Contemporary Slim',
          'Description': 'Fine 120s two-ply Egyptian cotton dress shirt with mother-of-pearl buttons.'
        },
        {
          'Product Group': 'PA-BLAZER-003',
          'SKU': 'PA-BLAZER-003-CAMEL-40R',
          'Garment Name': 'Italian Cashmere Blend Sport Coat',
          'Category': 'Blazers & Jackets',
          'Subcategory': 'Sport Coats',
          'Price ($)': 1650,
          'Color': 'Camel',
          'Color Hex': '#C19A6B',
          'Size': '40R',
          'Stock': 4,
          'Image URL': '/Blazers_jackets_image.png',
          'Fabric': '90% Wool / 10% Cashmere',
          'Fit': 'Tailored',
          'Description': 'Unstructured Italian wool-cashmere sport coat with horn buttons.'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(templateRows);

      if (format === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(ws);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="park_avenue_products_upload_template.csv"');
        return res.status(200).send(csv);
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Product_Template');
      ws['!cols'] = [
        { wch: 18 }, { wch: 28 }, { wch: 38 }, { wch: 22 }, { wch: 24 },
        { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 10 },
        { wch: 35 }, { wch: 30 }, { wch: 20 }, { wch: 55 }
      ];

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="park_avenue_products_upload_template.xlsx"');
      return res.status(200).send(buffer);
    } catch (err: any) {
      console.error('[getProductExcelTemplate] Generation error:', err);
      return res.status(500).json({ success: false, message: 'Failed to generate product template.' });
    }
  },
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

      if (!name || !category || price === undefined || price === null || price === '') {
        return res.status(400).json({
          success: false,
          message: 'Please provide product name, category, and price.'
        });
      }

      const cleanPrice = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.]/g, ''));
      if (isNaN(cleanPrice) || cleanPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid non-negative product price.'
        });
      }

      const cleanSalePrice = salePrice !== undefined && salePrice !== null && salePrice !== ''
        ? (typeof salePrice === 'number' ? salePrice : parseFloat(String(salePrice).replace(/[^0-9.]/g, '')))
        : undefined;

      // Ensure valid structured SKU
      let resolvedSku = (sku || '').trim();
      if (!resolvedSku) {
        resolvedSku = `PA-${String(category || 'GAR').slice(0, 4).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
      }

      const parsedColors = Array.isArray(colors) ? colors : (typeof colors === 'string' ? colors.split(',').map((c: string) => c.trim()).filter(Boolean) : undefined);

      const product = await productService.createProduct({
        name: String(name).trim(),
        sku: resolvedSku,
        description: description || 'Master crafted bespoke menswear.',
        category: String(category).trim(),
        subcategory,
        price: cleanPrice,
        salePrice: cleanSalePrice !== undefined && !isNaN(cleanSalePrice) ? cleanSalePrice : undefined,
        images: Array.isArray(images) ? images : [],
        variants: Array.isArray(variants) ? variants : [
          { size: '40R', color: 'Black', stock: 5 },
          { size: '42R', color: 'Black', stock: 5 }
        ],
        colors: parsedColors,
        lowStockThreshold: lowStockThreshold ? parseInt(String(lowStockThreshold), 10) : 3,
        isFeatured: Boolean(isFeatured),
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
        fabric,
        fit,
        shippingCharge: shippingCharge !== undefined ? parseFloat(String(shippingCharge)) : 15,
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
      console.error('[ProductController] Create product failure:', err);
      return res.status(400).json({ success: false, message: err?.message || 'Failed to save product in database.' });
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

      const results = [];
      let createdCount = 0;
      let updatedCount = 0;
      const rowErrors: string[] = [];

      for (let i = 0; i < products.length; i++) {
        const item = products[i];
        try {
          const resUpsert = await productService.upsertProduct({
            name: item.name,
            sku: item.sku,
            productId: item.productId || item.id,
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
          }, { id: user.id, name: user.name, email: user.email, role: user.role });

          results.push(resUpsert.product);
          if (resUpsert.isNew) createdCount++;
          else updatedCount++;
        } catch (itemErr: any) {
          console.error(`[Batch Product Import] Error processing row ${i + 1} (${item.name}):`, itemErr);
          rowErrors.push(`Item "${item.name || `Row ${i + 1}`}": ${itemErr.message || 'Error saving garment'}`);
        }
      }

      return res.status(200).json({
        success: true,
        data: results,
        summary: {
          total: products.length,
          created: createdCount,
          updated: updatedCount,
          failed: rowErrors.length,
          errors: rowErrors
        },
        message: `Catalogue vault updated: ${createdCount} garments created, ${updatedCount} garments updated${rowErrors.length > 0 ? ` (${rowErrors.length} notices)` : ''}.`
      });
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
      const { name, category, fabric, color, existingSkus, currentSku, customSequence, categoryCount, totalCatalogCount } = req.body;
      if (!name && !category) {
        return res.status(400).json({ success: false, message: 'Garment name or category is required.' });
      }
      const result = await skuService.generateSku({
        name: name || 'Garment',
        category: category || 'Suits',
        fabric,
        color,
        existingSkus,
        currentSku,
        customSequence,
        categoryCount,
        totalCatalogCount
      });
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
      const { text, rawText, category, fabric, fit } = req.body;
      const result = await titleService.generateProductTitle({
        rawText: (rawText || text || '').trim(),
        category,
        fabric,
        fit
      });
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Luxury sartorial title synthesized successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/products/:slug/pdf/:pdfId
   * Stream raw PDF binary from stored base64 or redirect to external PDF
   */
  async getProductPdf(req: Request, res: Response) {
    try {
      const { slug, pdfId } = req.params;
      const targetPdfId = pdfId || req.query.pdfId as string;
      const targetSlug = slug || req.query.slug as string;
      if (!targetSlug) {
        return res.status(400).json({ success: false, message: 'Garment identifier required.' });
      }

      const product = await productService.getProductRawBySlugOrId(targetSlug);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Garment not found.' });
      }

      const pdfDocs = (product as any).pdfDocuments || [];
      const doc = pdfDocs.find((d: any) => (d.id && d.id === targetPdfId) || (d._id && String(d._id) === targetPdfId)) || pdfDocs[0];
      if (!doc || !doc.url) {
        return res.status(404).json({ success: false, message: 'PDF document not found for this garment.' });
      }

      const docUrl: string = doc.url;
      if (docUrl.startsWith('data:')) {
        const matches = docUrl.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const contentType = matches[1] || 'application/pdf';
          const buffer = Buffer.from(matches[2], 'base64');
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.fileName || 'garment-specification.pdf')}"`);
          res.setHeader('Content-Length', buffer.length);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.status(200).send(buffer);
        }
      }

      if (docUrl.startsWith('http://') || docUrl.startsWith('https://')) {
        return res.redirect(docUrl);
      }

      return res.status(400).json({ success: false, message: 'Invalid PDF document encoding.' });
    } catch (err: any) {
      console.error('[ProductController] PDF streaming error:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving PDF document.' });
    }
  },

  /**
   * GET /api/products/:slug/image/:index
   * Stream raw product image binary from stored base64 or redirect to external URL
   */
  async getProductImage(req: Request, res: Response) {
    try {
      const { slug, index } = req.params;
      const targetSlug = slug || (req.query.slug as string);
      const targetIndex = index !== undefined ? String(index) : (req.query.index as string) || '0';
      if (!targetSlug) {
        return res.status(400).json({ success: false, message: 'Garment identifier required.' });
      }

      const product = await productService.getProductRawBySlugOrId(targetSlug);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Garment not found.' });
      }

      let imgUrl = '';
      if (targetIndex.startsWith('view-')) {
        const viewKey = targetIndex.replace('view-', '');
        imgUrl = (product as any).productViews?.[viewKey] || '';
      } else {
        const num = parseInt(targetIndex, 10);
        const images = Array.isArray((product as any).images) ? (product as any).images : [];
        imgUrl = !isNaN(num) && images[num] ? images[num] : images[0] || '';
      }

      if (!imgUrl) {
        // Fallback transparent 1x1 pixel PNG
        const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(200).send(transparentPng);
      }

      if (imgUrl.startsWith('data:')) {
        const matches = imgUrl.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const contentType = matches[1] || 'image/jpeg';
          const buffer = Buffer.from(matches[2], 'base64');
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', buffer.length);
          res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400, immutable');
          res.setHeader('ETag', `"${targetSlug}-img-${targetIndex}"`);
          return res.status(200).send(buffer);
        }
      }

      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('/')) {
        return res.redirect(imgUrl);
      }

      return res.status(400).json({ success: false, message: 'Invalid image encoding.' });
    } catch (err: any) {
      console.error('[ProductController] Image streaming error:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving product image.' });
    }
  },

  /**
   * GET /api/products/:slug/color-image/:color/:index
   * Stream color-specific image binary
   */
  async getProductColorImage(req: Request, res: Response) {
    try {
      const { slug, color, index } = req.params;
      const targetSlug = slug || (req.query.slug as string);
      const targetColor = color || (req.query.color as string);
      const targetIndex = parseInt(index || (req.query.index as string) || '0', 10);

      if (!targetSlug || !targetColor) {
        return res.status(400).json({ success: false, message: 'Garment identifier and color required.' });
      }

      const product = await productService.getProductRawBySlugOrId(targetSlug);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Garment not found.' });
      }

      const colorImages = (product as any).colorImages || {};
      const imgList = colorImages[targetColor] || colorImages[decodeURIComponent(targetColor)] || [];
      const imgUrl = Array.isArray(imgList) && imgList[targetIndex] ? imgList[targetIndex] : (imgList[0] || (product as any).images?.[0] || '');

      if (!imgUrl) {
        const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(200).send(transparentPng);
      }

      if (imgUrl.startsWith('data:')) {
        const matches = imgUrl.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const contentType = matches[1] || 'image/jpeg';
          const buffer = Buffer.from(matches[2], 'base64');
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', buffer.length);
          res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400, immutable');
          res.setHeader('ETag', `"${targetSlug}-${targetColor}-img-${targetIndex}"`);
          return res.status(200).send(buffer);
        }
      }

      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('/')) {
        return res.redirect(imgUrl);
      }

      return res.status(400).json({ success: false, message: 'Invalid image encoding.' });
    } catch (err: any) {
      console.error('[ProductController] Color image streaming error:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving product color image.' });
    }
  }
};


