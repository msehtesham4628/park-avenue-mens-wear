import { ProductModel, IProductVariant } from '../models/Product.js';
import { 
  InventoryTransactionModel, 
  IInventoryTransaction, 
  InventoryTransactionReason 
} from '../models/InventoryTransaction.js';
import { auditService } from './auditService.js';

export interface StockAdjustmentInput {
  productId: string;
  variantId?: string;
  size?: string;
  color?: string;
  adjustmentType: 'add' | 'remove' | 'set';
  quantity: number;
  reason: InventoryTransactionReason;
  notes?: string;
  adminUser: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export const inventoryService = {
  /**
   * Adjust inventory at the variant or product level safely (preventing negative stock)
   */
  async adjustStock(input: StockAdjustmentInput): Promise<{
    product: any;
    transaction: IInventoryTransaction;
    updatedVariant?: IProductVariant;
  }> {
    const product = await ProductModel.findOne({ productId: input.productId });
    if (!product) {
      throw new Error(`Product ${input.productId} not found.`);
    }

    // Locate target variant if variantId or size/color provided
    let targetVariantIndex = -1;
    if (input.variantId) {
      targetVariantIndex = product.variants.findIndex((v: IProductVariant) => v.id === input.variantId);
    } else if (input.size && input.color) {
      targetVariantIndex = product.variants.findIndex(
        (v: IProductVariant) => v.size.toLowerCase() === input.size?.toLowerCase() && 
             v.color.toLowerCase() === input.color?.toLowerCase()
      );
    } else if (input.size) {
      targetVariantIndex = product.variants.findIndex(
        (v: IProductVariant) => v.size.toLowerCase() === input.size?.toLowerCase()
      );
    }

    let previousQuantity: number;
    let newQuantity: number;
    let quantityChanged: number;
    let targetVariant: IProductVariant | undefined;

    if (targetVariantIndex !== -1) {
      // Variant-level stock update
      targetVariant = product.variants[targetVariantIndex];
      previousQuantity = targetVariant ? targetVariant.stock : 0;

      if (input.adjustmentType === 'add') {
        quantityChanged = Math.abs(input.quantity);
        newQuantity = previousQuantity + quantityChanged;
      } else if (input.adjustmentType === 'remove') {
        quantityChanged = -Math.abs(input.quantity);
        newQuantity = previousQuantity + quantityChanged;
      } else {
        // 'set'
        newQuantity = Math.max(0, input.quantity);
        quantityChanged = newQuantity - previousQuantity;
      }

      // CRITICAL BUSINESS RULE: Prevent inventory from becoming negative
      if (newQuantity < 0) {
        throw new Error(
          `Insufficient stock: Variant (${targetVariant?.size} / ${targetVariant?.color}) has only ${previousQuantity} units available. Cannot deduct ${Math.abs(input.quantity)} units.`
        );
      }

      product.variants[targetVariantIndex].stock = newQuantity;
      // Recalculate total product stock
      product.stockQuantity = product.variants.reduce((sum: number, v: IProductVariant) => sum + v.stock, 0);
    } else {
      // Product-level stock update
      previousQuantity = product.stockQuantity;

      if (input.adjustmentType === 'add') {
        quantityChanged = Math.abs(input.quantity);
        newQuantity = previousQuantity + quantityChanged;
      } else if (input.adjustmentType === 'remove') {
        quantityChanged = -Math.abs(input.quantity);
        newQuantity = previousQuantity + quantityChanged;
      } else {
        newQuantity = Math.max(0, input.quantity);
        quantityChanged = newQuantity - previousQuantity;
      }

      if (newQuantity < 0) {
        throw new Error(
          `Insufficient stock: Product has only ${previousQuantity} units available. Cannot deduct ${Math.abs(input.quantity)} units.`
        );
      }

      product.stockQuantity = newQuantity;
      // If there are variants, distribute or synchronize proportionally
      if (product.variants.length > 0 && input.adjustmentType === 'set') {
        product.variants[0].stock = newQuantity;
      }
    }

    await product.save();

    // Create persistent inventory transaction record
    const transactionId = `INV-TX-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const transaction = new InventoryTransactionModel({
      transactionId,
      productId: product.productId,
      productName: product.name,
      sku: targetVariant ? targetVariant.sku : product.sku,
      variantId: targetVariant?.id,
      variantDetails: targetVariant ? { size: targetVariant.size, color: targetVariant.color } : undefined,
      previousQuantity,
      newQuantity,
      quantityChanged,
      reason: input.reason,
      adminUser: {
        id: input.adminUser.id,
        name: input.adminUser.name,
        email: input.adminUser.email
      },
      notes: input.notes
    });

    await transaction.save();

    await auditService.record({
      adminUser: {
        id: input.adminUser.id,
        name: input.adminUser.name,
        email: input.adminUser.email,
        role: input.adminUser.role || 'staff'
      },
      action: 'INVENTORY_ADJUSTED',
      entity: 'Inventory',
      entityId: product.productId,
      previousValue: { stock: previousQuantity },
      newValue: { stock: newQuantity, reason: input.reason }
    });

    return {
      product,
      transaction,
      updatedVariant: targetVariant
    };
  },

  /**
   * Get all products with inventory status
   */
  async getInventoryOverview(options: { 
    search?: string; 
    category?: string; 
    status?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    limit?: number;
    page?: number;
  } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 25));
    const skip = (page - 1) * limit;

    const query: any = { isActive: true };

    if (options.category && options.category !== 'All') {
      query.category = options.category;
    }

    if (options.search) {
      query.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { sku: { $regex: options.search, $options: 'i' } }
      ];
    }

    if (options.status === 'in_stock') {
      query.stockQuantity = { $gt: 0 };
    } else if (options.status === 'out_of_stock') {
      query.stockQuantity = { $lte: 0 };
    } else if (options.status === 'low_stock') {
      query.$expr = { $and: [{ $gt: ['$stockQuantity', 0] }, { $lte: ['$stockQuantity', '$lowStockThreshold'] }] };
    }

    const [items, total] = await Promise.all([
      ProductModel.find(query)
        .select('productId sku name category price variants stockQuantity lowStockThreshold updatedAt')
        .sort({ stockQuantity: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(query)
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * View low-stock products
   */
  async getLowStockProducts() {
    return ProductModel.find({
      isActive: true,
      $expr: { $and: [{ $gt: ['$stockQuantity', 0] }, { $lte: ['$stockQuantity', '$lowStockThreshold'] }] }
    }).sort({ stockQuantity: 1 }).lean();
  },

  /**
   * View out-of-stock products
   */
  async getOutOfStockProducts() {
    return ProductModel.find({
      isActive: true,
      stockQuantity: { $lte: 0 }
    }).sort({ updatedAt: -1 }).lean();
  },

  /**
   * View inventory transaction history
   */
  async getInventoryHistory(options: { 
    productId?: string; 
    sku?: string; 
    reason?: string; 
    limit?: number; 
    page?: number 
  } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 50));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.productId) query.productId = options.productId;
    if (options.sku) query.sku = options.sku;
    if (options.reason) query.reason = options.reason;

    const [transactions, total] = await Promise.all([
      InventoryTransactionModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      InventoryTransactionModel.countDocuments(query)
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
};
