import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
  barcode?: string;
  priceModifier?: number;
}

export interface IProduct extends Document {
  productId: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  category: 
    | 'Suits'
    | 'Blazers & Jackets'
    | 'Shirts'
    | 'Outerwear'
    | 'Sweaters & Knitwear'
    | 'Footwear'
    | 'Dress shirts'
    | 'Dress Shirts'
    | 'Ties'
    | 'Shoe'
    | 'Shoes'
    | 'Boots'
    | 'Loofers'
    | 'Loafers'
    | 'Pants'
    | 'Dress Pants'
    | 'Jeans'
    | 'Leather jackets'
    | 'Leather Jackets'
    | 'Sweaters'
    | 'Coats'
    | 'Polo shirts'
    | 'Polo Shirts'
    | 'Shorts'
    | 'Accessories'
    | 'New Arrivals';
  subcategory?: string;
  price: number;
  salePrice?: number;
  images: string[];
  sizes: string[];
  colors: string[];
  variants: IProductVariant[];
  stockQuantity: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  fabric?: string;
  fit?: string;
  careInstructions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  id: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true, default: 0, min: 0 },
  sku: { type: String, required: true },
  barcode: { type: String },
  priceModifier: { type: Number, default: 0 }
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
  productId: { type: String, required: true, unique: true, index: true },
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: [
      'Suits',
      'Blazers & Jackets',
      'Shirts',
      'Outerwear',
      'Sweaters & Knitwear',
      'Footwear',
      'Dress shirts',
      'Dress Shirts',
      'Ties',
      'Shoe',
      'Shoes',
      'Boots',
      'Loofers',
      'Loafers',
      'Pants',
      'Dress Pants',
      'Jeans',
      'Leather jackets',
      'Leather Jackets',
      'Sweaters',
      'Coats',
      'Polo shirts',
      'Polo Shirts',
      'Shorts',
      'Accessories',
      'New Arrivals'
    ],
    index: true 
  },
  subcategory: { type: String },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  images: [{ type: String }],
  sizes: [{ type: String }],
  colors: [{ type: String }],
  variants: [ProductVariantSchema],
  stockQuantity: { type: Number, required: true, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 3, min: 0 },
  isFeatured: { type: Boolean, default: false, index: true },
  isNewArrival: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true, index: true },
  fabric: { type: String },
  fit: { type: String },
  careInstructions: [{ type: String }]
}, {
  timestamps: true
});

// Indexes for high-performance searching and filtering
ProductSchema.index({ name: 'text', description: 'text', fabric: 'text' });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ category: 1, isFeatured: 1 });
ProductSchema.index({ category: 1, isNewArrival: 1 });

export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
