import { CartModel, ICart, ICartItem } from '../models/Cart.js';
import { ProductModel, IProductVariant } from '../models/Product.js';

export const cartService = {
  /**
   * Get or initialize a cart by session/customer
   */
  async getOrCreateCart(sessionId: string, customerId?: string): Promise<ICart> {
    let cart = await CartModel.findOne({ sessionId });
    if (!cart) {
      const cartId = `CART-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
      cart = new CartModel({
        cartId,
        sessionId,
        customerId,
        items: [],
        subtotal: 0,
        itemCount: 0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
      await cart.save();
    } else if (customerId && !cart.customerId) {
      cart.customerId = customerId;
      await cart.save();
    }
    return cart;
  },

  /**
   * Add item to cart with STRICT server-side price & inventory validation
   */
  async addItem(sessionId: string, itemData: {
    productId: string;
    variantId?: string;
    size: string;
    color: string;
    quantity: number;
  }, customerId?: string): Promise<ICart> {
    if (itemData.quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }

    const cart = await this.getOrCreateCart(sessionId, customerId);

    // Fetch official authoritative product data from database (NEVER trust frontend)
    const product = await ProductModel.findOne({ productId: itemData.productId, isActive: true });
    if (!product) {
      throw new Error('Garment not found or is currently unavailable in the vault.');
    }

    // Identify variant
    let variant = product.variants.find((v: IProductVariant) => 
      (itemData.variantId && v.id === itemData.variantId) ||
      (v.size.toLowerCase() === itemData.size.toLowerCase() && v.color.toLowerCase() === itemData.color.toLowerCase()) ||
      (v.size.toLowerCase() === itemData.size.toLowerCase())
    );

    if (!variant && product.variants.length > 0) {
      variant = product.variants[0];
    }

    const availableStock = variant ? variant.stock : product.stockQuantity;

    // Check existing quantity in cart
    const existingIndex = cart.items.findIndex(i => 
      i.productId === product.productId && 
      i.size.toLowerCase() === itemData.size.toLowerCase() &&
      i.color.toLowerCase() === itemData.color.toLowerCase()
    );

    const currentQtyInCart = existingIndex > -1 ? cart.items[existingIndex].quantity : 0;
    const requestedTotalQty = currentQtyInCart + itemData.quantity;

    if (requestedTotalQty > availableStock) {
      throw new Error(
        `Insufficient inventory. Only ${availableStock} units of ${product.name} (${itemData.size} / ${itemData.color}) available in atelier stock.`
      );
    }

    // Authoritative unit price from server
    const authoritativePrice = product.salePrice && product.salePrice > 0 
      ? product.salePrice 
      : product.price;

    const variantId = variant?.id || `var-${product.productId}-std`;
    const sku = variant?.sku || product.sku;

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = requestedTotalQty;
      cart.items[existingIndex].unitPrice = authoritativePrice;
      cart.items[existingIndex].subtotal = requestedTotalQty * authoritativePrice;
    } else {
      cart.items.push({
        productId: product.productId,
        variantId,
        sku,
        name: product.name,
        size: itemData.size,
        color: itemData.color,
        quantity: itemData.quantity,
        unitPrice: authoritativePrice,
        subtotal: itemData.quantity * authoritativePrice
      });
    }

    // Recalculate totals
    this.recalculateCartTotals(cart);
    cart.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await cart.save();

    return cart;
  },

  /**
   * Update quantity of item in cart with server-side stock validation
   */
  async updateItemQuantity(sessionId: string, productId: string, variantId: string, quantity: number): Promise<ICart> {
    const cart = await CartModel.findOne({ sessionId });
    if (!cart) {
      throw new Error('Cart not found.');
    }

    const itemIndex = cart.items.findIndex((i: ICartItem) => i.productId === productId && (i.variantId === variantId || !variantId));
    if (itemIndex === -1) {
      throw new Error('Item not found in cart.');
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate inventory from database
      const product = await ProductModel.findOne({ productId });
      if (!product) {
        cart.items.splice(itemIndex, 1);
      } else {
        const variant = product.variants.find((v: IProductVariant) => v.id === variantId);
        const availableStock = variant ? variant.stock : product.stockQuantity;

        if (quantity > availableStock) {
          throw new Error(`Insufficient stock. Maximum available is ${availableStock} units.`);
        }

        const authoritativePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].unitPrice = authoritativePrice;
        cart.items[itemIndex].subtotal = quantity * authoritativePrice;
      }
    }

    this.recalculateCartTotals(cart);
    await cart.save();
    return cart;
  },

  /**
   * Remove item from cart
   */
  async removeItem(sessionId: string, productId: string, variantId?: string): Promise<ICart> {
    const cart = await CartModel.findOne({ sessionId });
    if (!cart) {
      throw new Error('Cart not found.');
    }

    cart.items = cart.items.filter((i: ICartItem) => {
      if (variantId) {
        return !(i.productId === productId && i.variantId === variantId);
      }
      return i.productId !== productId;
    });

    this.recalculateCartTotals(cart);
    await cart.save();
    return cart;
  },

  /**
   * Validate entire cart against live inventory and prices
   */
  async validateCart(cart: ICart): Promise<{ isValid: boolean; issues: string[]; recalculatedTotal: number }> {
    const issues: string[] = [];
    let recalculatedSubtotal = 0;

    for (const item of cart.items) {
      const product = await ProductModel.findOne({ productId: item.productId, isActive: true });
      if (!product) {
        issues.push(`Product "${item.name}" is no longer available.`);
        continue;
      }

      const variant = product.variants.find((v: IProductVariant) => v.id === item.variantId);
      const availableStock = variant ? variant.stock : product.stockQuantity;

      if (item.quantity > availableStock) {
        issues.push(`Only ${availableStock} units of "${item.name}" (${item.size}) remain in stock.`);
      }

      const authoritativePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      recalculatedSubtotal += item.quantity * authoritativePrice;
    }

    return {
      isValid: issues.length === 0,
      issues,
      recalculatedTotal: recalculatedSubtotal
    };
  },

  /**
   * Helper to recalculate cart totals
   */
  recalculateCartTotals(cart: ICart) {
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
};
