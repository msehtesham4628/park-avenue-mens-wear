import mongoose from 'mongoose';
import { ProductModel, IProduct, IProductVariant } from '../models/Product.js';
import { auditService } from './auditService.js';
import { connectDB } from '../config/db.js';


const CATEGORY_ALIASES: Record<string, string[]> = {
  'Suits': ['Suits'],
  'Blazers & Jackets': ['Blazers & Jackets', 'Leather Jackets', 'Leather jackets'],
  'Shirts': ['Shirts', 'Dress Shirts', 'Dress shirts', 'Polo Shirts', 'Polo shirts'],
  'Pants': ['Pants', 'Dress Pants', 'Jeans'],
  'Outerwear': ['Outerwear', 'Coats'],
  'Sweaters & Knitwear': ['Sweaters & Knitwear', 'Sweaters'],
  'Footwear': ['Footwear', 'Shoes', 'Shoe', 'Boots', 'Loafers', 'Loofers'],
  'Accessories': ['Accessories', 'Ties'],
  'Shorts': ['Shorts']
};

export interface ProductQueryFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  availability?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'newest' | 'name_asc';
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Strips huge embedded base64 data from product responses and converts
 * PDF documents into lightweight streaming URLs to keep JSON responses
 * well within serverless function payload limits (preventing 413 errors).
 */
export function sanitizeProductPayload(prod: any, isList = false): any {
  if (!prod) return prod;
  const p = typeof prod.toObject === 'function' ? prod.toObject() : { ...prod };

  if (Array.isArray(p.pdfDocuments)) {
    p.pdfDocuments = p.pdfDocuments.map((doc: any) => {
      const docId = doc.id || doc._id || 'doc-1';
      const targetSlug = p.productId || p.slug || 'garment';
      const isDataUrl = typeof doc.url === 'string' && doc.url.startsWith('data:');
      return {
        ...doc,
        url: isDataUrl ? `/api/products/${encodeURIComponent(targetSlug)}/pdf/${encodeURIComponent(docId)}` : doc.url
      };
    });
  }

  if (isList && Array.isArray(p.images) && p.images.length > 4) {
    p.images = p.images.slice(0, 4);
  }

  return p;
}

let inMemoryStore: any[] = [];

export const productService = {
  /**
   * Synchronize seed data to memory store
   */
  syncMemoryStore(items: any[]) {
    if (Array.isArray(items)) {
      const map = new Map<string, any>();
      inMemoryStore.forEach(i => map.set(i.productId || i.sku, i));
      items.forEach(i => map.set(i.productId || i.sku, i));
      inMemoryStore = Array.from(map.values());
    }
  },

  /**
   * Query products with robust filtering, sorting and pagination
   */
  async getProducts(filters: ProductQueryFilters = {}) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (!filters.includeInactive) {
      query.isActive = true;
    }

    if (filters.category && filters.category !== 'All') {
      if (filters.category === 'New Arrivals') {
        query.isNewArrival = true;
      } else {
        const catNorm = filters.category.trim();
        const aliases = CATEGORY_ALIASES[catNorm];
        if (aliases) {
          query.category = { $in: aliases };
        } else if (catNorm.toLowerCase() === 'shoe' || catNorm.toLowerCase() === 'shoes') {
          query.category = { $regex: /^shoe/i };
        } else if (catNorm.toLowerCase() === 'loofers' || catNorm.toLowerCase() === 'loafers') {
          query.category = { $regex: /^lo[oa]fer/i };
        } else if (catNorm.toLowerCase() === 'pants') {
          query.category = { $regex: /pants/i };
        } else {
          const escapedCategory = catNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          query.category = { $regex: new RegExp('^' + escapedCategory, 'i') };
        }
      }
    }
    if (filters.subcategory) {
      query.subcategory = filters.subcategory;
    }

    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }

    if (filters.isNewArrival !== undefined) {
      query.isNewArrival = filters.isNewArrival;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.size) {
      query['variants.size'] = filters.size;
    }

    if (filters.color) {
      query['variants.color'] = filters.color;
    }

    if (filters.availability === 'in_stock') {
      query.stockQuantity = { $gt: 0 };
    } else if (filters.availability === 'out_of_stock') {
      query.stockQuantity = { $lte: 0 };
    } else if (filters.availability === 'low_stock') {
      query.$expr = { $and: [{ $gt: ['$stockQuantity', 0] }, { $lte: ['$stockQuantity', '$lowStockThreshold'] }] };
    }

    if (filters.search && filters.search.trim()) {
      const s = filters.search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { sku: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { fabric: { $regex: s, $options: 'i' } }
      ];
    }

    let sort: any = { createdAt: -1 };
    if (filters.sortBy === 'price_asc') sort = { price: 1 };
    else if (filters.sortBy === 'price_desc') sort = { price: -1 };
    else if (filters.sortBy === 'newest') sort = { isNewArrival: -1, createdAt: -1 };
    else if (filters.sortBy === 'name_asc') sort = { name: 1 };
    else if (filters.sortBy === 'featured') sort = { isFeatured: -1, createdAt: -1 };

    let products: any[] = [];
    let total = 0;

    try {
      if (mongoose.connection.readyState === 1) {
        [products, total] = await Promise.all([
          ProductModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
          ProductModel.countDocuments(query)
        ]);
      }
    } catch (queryErr) {
      console.warn('[ProductService] Database query fallback:', queryErr);
    }

    if (products.length === 0 && inMemoryStore.length > 0) {
      const filtered = filters.includeInactive 
        ? inMemoryStore 
        : inMemoryStore.filter(p => p.isActive !== false);
      products = filtered.slice(skip, skip + limit);
      total = filtered.length;
    }

    return {
      products: products.map(p => sanitizeProductPayload(p, true)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Retrieve raw product document with full base64 data for binary streaming
   */
  async getProductRawBySlugOrId(identifier: string): Promise<any | null> {
    const clean = (identifier || '').trim();
    if (!clean) return null;

    const isObjectId = mongoose.isValidObjectId(clean);
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escaped}$`, 'i');

    try {
      if (mongoose.connection.readyState === 1) {
        const product = await ProductModel.findOne({
          $or: [
            { id: regex },
            { slug: regex },
            { productId: regex },
            { sku: regex },
            ...(isObjectId ? [{ _id: clean }] : [])
          ]
        }).lean();

        if (product) return product;

        const byName = await ProductModel.findOne({ name: regex }).lean();
        if (byName) return byName;
      }
    } catch (dbErr) {
      console.warn('[ProductService] Database lookup warning:', dbErr);
    }

    // Check in-memory store fallback
    if (inMemoryStore.length > 0) {
      const lower = clean.toLowerCase();
      const found = inMemoryStore.find(p => 
        (p.slug && String(p.slug).toLowerCase() === lower) ||
        (p.productId && String(p.productId).toLowerCase() === lower) ||
        (p.sku && String(p.sku).toLowerCase() === lower) ||
        (p._id && String(p._id).toLowerCase() === lower) ||
        (p.id && String(p.id).toLowerCase() === lower) ||
        (p.name && generateSlug(p.name) === lower)
      );
      if (found) return found;
    }

    return null;
  },

  /**
   * Get single product by Slug or ID with sanitized payload
   */
  async getProductBySlugOrId(identifier: string): Promise<IProduct | null> {
    const raw = await this.getProductRawBySlugOrId(identifier);
    if (!raw) return null;
    return sanitizeProductPayload(raw, false) as IProduct;
  },

  /**
   * Create a new product (admin)
   */
  async createProduct(data: {
    name: string;
    sku: string;
    description: string;
    category: any;
    subcategory?: string;
    price: number;
    salePrice?: number;
    images?: string[];
    colorImages?: Record<string, string[]>;
    colors?: string[];
    variants: Array<{ size: string; color: string; colorHex?: string; stock: number; sku?: string }>;
    lowStockThreshold?: number;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    fabric?: string;
    fit?: string;
    shippingCharge?: number;
    careInstructions?: string[];
    productViews?: { front?: string; back?: string; left?: string; right?: string; detail?: string };
    pdfDocuments?: any[];
  }, adminUser: { id: string; name: string; email: string; role: string }): Promise<IProduct> {
    if (Number(mongoose.connection.readyState) !== 1) {
      await connectDB();
    }

    let finalSku = (data.sku || '').trim();
    if (!finalSku) {
      finalSku = `PA-${(data.category || 'GAR').slice(0, 4).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    }
    try {
      const existingSku = await ProductModel.findOne({ sku: finalSku });
      if (existingSku) {
        finalSku = `${finalSku}-${Math.floor(100 + Math.random() * 900)}`;
      }
    } catch (_) {}

    let slug = generateSlug(data.name);
    try {
      const existingSlug = await ProductModel.findOne({ slug });
      if (existingSlug) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } catch (_) {}

    const productId = `PROD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

    const rawVariants = Array.isArray(data.variants) && data.variants.length > 0 ? data.variants : [
      { size: '40R', color: 'Black', stock: 5 }
    ];

    const processedVariants: IProductVariant[] = rawVariants.map((v: any, i) => {
      const size = String(v.size || 'Standard').trim();
      const color = String(v.color || 'Standard').trim();
      const stock = typeof v.stock === 'number' && !isNaN(v.stock) ? Math.max(0, v.stock) : (parseInt(String(v.stock || 0), 10) || 0);
      return {
        id: v.id || `var-${productId}-${i}`,
        size,
        color,
        colorHex: v.colorHex || '#111827',
        stock,
        sku: v.sku || `${finalSku}-${size.replace(/\s+/g, '')}`
      };
    });

    const stockQuantity = processedVariants.reduce((sum, v) => sum + v.stock, 0);
    const sizes = Array.from(new Set(processedVariants.map(v => v.size)));
    const colors = Array.from(new Set([
      ...(data.colors || []),
      ...processedVariants.map(v => v.color)
    ].filter(Boolean)));

    const cleanCategory = String(data.category || 'Suits').trim();
    const cleanPrice = typeof data.price === 'number' ? data.price : parseFloat(String(data.price).replace(/[^0-9.]/g, '')) || 0;

    const product = new ProductModel({
      productId,
      sku: finalSku,
      name: data.name.trim(),
      slug,
      description: data.description || 'Master crafted bespoke menswear.',
      category: cleanCategory,
      subcategory: data.subcategory,
      price: cleanPrice,
      salePrice: data.salePrice !== undefined ? Number(data.salePrice) : undefined,
      images: data.images || [],
      colorImages: data.colorImages || {},
      sizes,
      colors,
      variants: processedVariants,
      stockQuantity,
      lowStockThreshold: data.lowStockThreshold || 3,
      isFeatured: data.isFeatured || false,
      isNewArrival: data.isNewArrival !== undefined ? data.isNewArrival : true,
      isActive: true,
      fabric: data.fabric,
      fit: data.fit,
      shippingCharge: data.shippingCharge !== undefined ? data.shippingCharge : 15,
      careInstructions: data.careInstructions || [],
      productViews: data.productViews,
      pdfDocuments: data.pdfDocuments || []
    });

    try {
      if (Number(mongoose.connection.readyState) === 1) {
        await product.save();
      } else {
        await connectDB();
        await product.save();
      }
    } catch (saveErr: any) {
      console.warn('[ProductService] Initial save failure, checking duplicate key:', saveErr?.message);
      if (saveErr?.code === 11000) {
        product.sku = `${product.sku}-${Date.now().toString(36).slice(-3).toUpperCase()}`;
        product.slug = `${product.slug}-${Date.now().toString(36).slice(-3)}`;
        await product.save();
      } else {
        throw new Error(saveErr?.message || 'Failed to save product in database.');
      }
    }

    const plainProduct = product.toObject ? product.toObject() : product;
    inMemoryStore = [plainProduct, ...inMemoryStore.filter(p => p.sku !== plainProduct.sku && p.productId !== plainProduct.productId)];

    try {
      await auditService.record({
        adminUser,
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: productId,
        newValue: { name: product.name, sku: product.sku, price: product.price, stock: stockQuantity }
      });
    } catch (_) {}

    return sanitizeProductPayload(plainProduct);
  },

  /**
   * Update an existing product (admin)
   */
  async updateProduct(productId: string, updates: Partial<IProduct>, adminUser: { id: string; name: string; email: string; role: string }): Promise<IProduct | null> {
    const isObjectId = mongoose.isValidObjectId(productId);
    const product = await ProductModel.findOne({
      $or: [
        { productId },
        { productId: { $regex: new RegExp(`^${productId.trim()}$`, 'i') } },
        { sku: { $regex: new RegExp(`^${productId.trim()}$`, 'i') } },
        ...(isObjectId ? [{ _id: productId }] : [])
      ]
    });
    if (!product) return null;

    const previousValue = product.toObject();

    if (updates.name && updates.name !== product.name) {
      product.name = updates.name;
      product.slug = generateSlug(updates.name);
    }

    if (updates.variants) {
      product.variants = updates.variants;
      product.stockQuantity = updates.variants.reduce((sum: number, v: IProductVariant) => sum + (v.stock || 0), 0);
      product.sizes = Array.from(new Set(updates.variants.map((v: IProductVariant) => v.size)));
      product.colors = Array.from(new Set(updates.variants.map((v: IProductVariant) => v.color)));
    }

    // Merge pdfDocuments safely: do not overwrite raw base64 data with streaming endpoint URLs
    if (updates.pdfDocuments && Array.isArray(updates.pdfDocuments)) {
      const existingDocs = product.pdfDocuments || [];
      product.pdfDocuments = updates.pdfDocuments.map((doc: any) => {
        if (typeof doc.url === 'string' && doc.url.startsWith('/api/products/')) {
          const match = existingDocs.find((ed: any) => (ed.id && ed.id === doc.id) || ed.fileName === doc.fileName);
          if (match && match.url) {
            return { ...doc, url: match.url };
          }
        }
        return doc;
      });
    }

    const fieldsToUpdate = [
      'description', 'category', 'subcategory', 'price', 'salePrice', 
      'images', 'colorImages', 'colors', 'lowStockThreshold', 'isFeatured', 'isNewArrival', 
      'isActive', 'fabric', 'fit', 'careInstructions', 'shippingCharge',
      'productViews'
    ];

    fieldsToUpdate.forEach(field => {
      if ((updates as any)[field] !== undefined) {
        (product as any)[field] = (updates as any)[field];
      }
    });

    await product.save();

    await auditService.record({
      adminUser,
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entityId: product.productId,
      previousValue,
      newValue: product.toObject()
    });

    const plain = product.toObject ? product.toObject() : product;
    return sanitizeProductPayload(plain);
  },

  /**
   * Delete or deactivate product
   */
  async deactivateOrDelete(productId: string, hardDelete: boolean, adminUser: { id: string; name: string; email: string; role: string }) {
    const isObjectId = mongoose.isValidObjectId(productId);
    const product = await ProductModel.findOne({
      $or: [
        { productId },
        { productId: { $regex: new RegExp(`^${productId.trim()}$`, 'i') } },
        { sku: { $regex: new RegExp(`^${productId.trim()}$`, 'i') } },
        ...(isObjectId ? [{ _id: productId }] : [])
      ]
    });
    if (!product) return false;

    if (hardDelete) {
      await ProductModel.deleteOne({ _id: product._id });
      await auditService.record({
        adminUser,
        action: 'PRODUCT_HARD_DELETED',
        entity: 'Product',
        entityId: product.productId
      });
      return true;
    } else {
      product.isActive = false;
      await product.save();
      await auditService.record({
        adminUser,
        action: 'PRODUCT_DEACTIVATED',
        entity: 'Product',
        entityId: product.productId
      });
      return true;
    }
  }
};
