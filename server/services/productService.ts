import { ProductModel, IProduct, IProductVariant } from '../models/Product.js';
import { auditService } from './auditService.js';


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

export const productService = {
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
          query.category = { $regex: new RegExp(`^${catNorm}import { ProductModel, IProduct, IProductVariant } from '../models/Product.js';
import { auditService } from './auditService.js';


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

export const productService = {
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
, 'i') };
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

    const [products, total] = await Promise.all([
      ProductModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      ProductModel.countDocuments(query)
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get single product by Slug or ID
   */
  async getProductBySlugOrId(identifier: string): Promise<IProduct | null> {
    return ProductModel.findOne({
      $or: [
        { slug: identifier },
        { productId: identifier },
        { sku: identifier }
      ]
    }).lean();
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
    variants: Array<{ size: string; color: string; colorHex?: string; stock: number; sku?: string }>;
    lowStockThreshold?: number;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    fabric?: string;
    fit?: string;
    careInstructions?: string[];
  }, adminUser: { id: string; name: string; email: string; role: string }): Promise<IProduct> {
    const existingSku = await ProductModel.findOne({ sku: data.sku });
    if (existingSku) {
      throw new Error(`A product with SKU ${data.sku} already exists.`);
    }

    let slug = generateSlug(data.name);
    const existingSlug = await ProductModel.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const productId = `PROD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

    const processedVariants: IProductVariant[] = data.variants.map((v, i) => ({
      id: `var-${productId}-${i}`,
      size: v.size,
      color: v.color,
      stock: Math.max(0, v.stock || 0),
      sku: v.sku || `${data.sku}-${v.size.replace(/\s+/g, '')}`
    }));

    const stockQuantity = processedVariants.reduce((sum, v) => sum + v.stock, 0);
    const sizes = Array.from(new Set(processedVariants.map(v => v.size)));
    const colors = Array.from(new Set(processedVariants.map(v => v.color)));

    const product = new ProductModel({
      productId,
      sku: data.sku,
      name: data.name,
      slug,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      price: data.price,
      salePrice: data.salePrice,
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
      careInstructions: data.careInstructions || []
    });

    await product.save();

    await auditService.record({
      adminUser,
      action: 'PRODUCT_CREATED',
      entity: 'Product',
      entityId: productId,
      newValue: { name: product.name, sku: product.sku, price: product.price, stock: stockQuantity }
    });

    return product;
  },

  /**
   * Update an existing product (admin)
   */
  async updateProduct(productId: string, updates: Partial<IProduct>, adminUser: { id: string; name: string; email: string; role: string }): Promise<IProduct | null> {
    const product = await ProductModel.findOne({ productId });
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

    const fieldsToUpdate = [
      'description', 'category', 'subcategory', 'price', 'salePrice', 
      'images', 'lowStockThreshold', 'isFeatured', 'isNewArrival', 
      'isActive', 'fabric', 'fit', 'careInstructions'
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
      entityId: productId,
      previousValue,
      newValue: product.toObject()
    });

    return product;
  },

  /**
   * Delete or deactivate product
   */
  async deactivateOrDelete(productId: string, hardDelete: boolean, adminUser: { id: string; name: string; email: string; role: string }) {
    if (hardDelete) {
      const deleted = await ProductModel.findOneAndDelete({ productId });
      if (deleted) {
        await auditService.record({
          adminUser,
          action: 'PRODUCT_HARD_DELETED',
          entity: 'Product',
          entityId: productId
        });
      }
      return deleted;
    } else {
      const updated = await ProductModel.findOneAndUpdate(
        { productId },
        { isActive: false },
        { new: true }
      );
      if (updated) {
        await auditService.record({
          adminUser,
          action: 'PRODUCT_DEACTIVATED',
          entity: 'Product',
          entityId: productId
        });
      }
      return updated;
    }
  }
};
