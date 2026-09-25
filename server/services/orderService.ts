import mongoose from 'mongoose';
import { OrderModel, IOrder, OrderStatus, PaymentStatus, IShippingInfo } from '../models/Order.js';
import { ProductModel, IProductVariant } from '../models/Product.js';
import { inventoryService } from './inventoryService.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';
import { taxService } from './taxService.js';
import { shippingService } from './shippingService.js';

export interface CreateOrderInput {
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    variantId?: string;
    size: string;
    color: string;
    quantity: number;
    alterationRequested?: boolean;
  }>;
  shippingInfo: IShippingInfo;
  shippingFee?: number;
  shippingMethod?: string;
  tax?: number;
  paymentMethod?: string;
  paymentTransactionId?: string;
  notes?: string;
  preferredNotificationChannel?: 'email' | 'sms' | 'whatsapp';
}

export const orderService = {
  /**
   * Generate human-readable order ID in exact format: PA-YYYY-XXXXXX (e.g. PA-2026-000001)
   */
  async generateOrderId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await OrderModel.countDocuments();
    const sequence = (count + 1).toString().padStart(6, '0');
    let orderId = `PA-${year}-${sequence}`;

    // Verify uniqueness
    const exists = await OrderModel.findOne({ orderId });
    if (exists) {
      orderId = `PA-${year}-${(count + Math.floor(Math.random() * 1000) + 1).toString().padStart(6, '0')}`;
    }
    return orderId;
  },

  /**
   * Create an order enforcing all business rules
   */
  async createOrder(input: CreateOrderInput): Promise<IOrder> {
    if (!input.items || input.items.length === 0) {
      throw new Error('An order must contain at least one garment.');
    }

    // STEP 1: Validate product availability and pricing server-side
    const validatedItems = [];
    let subtotal = 0;

    for (const item of input.items) {
      const product = await ProductModel.findOne({ productId: item.productId, isActive: true });
      if (!product) {
        throw new Error(`Garment ID "${item.productId}" is not available.`);
      }

      const variant = product.variants.find((v: IProductVariant) => 
        (item.variantId && v.id === item.variantId) ||
        (v.size.toLowerCase() === item.size.toLowerCase() && v.color.toLowerCase() === item.color.toLowerCase()) ||
        (v.size.toLowerCase() === item.size.toLowerCase())
      );

      const availableStock = variant ? variant.stock : product.stockQuantity;
      if (item.quantity > availableStock) {
        throw new Error(
          `Insufficient inventory: Only ${availableStock} units of "${product.name}" (${item.size}) in stock.`
        );
      }

      const authoritativePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      const itemSubtotal = authoritativePrice * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        product,
        variant,
        productId: product.productId,
        variantId: variant?.id || `var-${product.productId}-std`,
        sku: variant?.sku || product.sku,
        name: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        priceAtPurchase: authoritativePrice,
        subtotal: itemSubtotal,
        alterationRequested: Boolean(item.alterationRequested)
      });
    }

    // STEP 2: Safely reserve/deduct inventory with transactional logging
    if (input.paymentMethod !== 'stripe_checkout') {
      for (const item of validatedItems) {
        await inventoryService.adjustStock({
          productId: item.productId,
          variantId: item.variantId,
          size: item.size,
          color: item.color,
          adjustmentType: 'remove',
          quantity: item.quantity,
          reason: 'purchase',
          notes: 'Reserved for paid/manual order',
          adminUser: { id:'SYSTEM', name:'Park Avenue Order Engine', email:'system@parkavenuemenswear.com' }
        });
      }
    }

    // STEP 3 & 4: Calculate shipping, state-level destination tax, total and generate Order ID
    const destinationState = input.shippingInfo?.state || '';
    const shippingCalc = shippingService.calculate(input.shippingInfo?.shippingMethod || 'standard', subtotal, destinationState);
    const taxCalc = taxService.calculateTax(
      destinationState,
      validatedItems.map(vi => ({ price: vi.priceAtPurchase, quantity: vi.quantity })),
      subtotal,
      shippingCalc.amount
    );
    const shipping = shippingCalc.amount;
    const calculatedTax = taxCalc.taxAmount;
    const total = Math.round((subtotal + shipping + calculatedTax) * 100) / 100;

    const orderId = await this.generateOrderId();

    // STEP 5: Record initial status
    const initialStatus: OrderStatus = input.paymentMethod === 'stripe_checkout' ? 'Pending' : 'Confirmed';
    const statusHistory = [{
      previousStatus: 'None',
      newStatus: initialStatus,
      changedBy: {
        id: 'SYSTEM',
        name: 'Park Avenue Concierge Engine',
        role: 'system'
      },
      note: 'Order submitted and authorized successfully.',
      timestamp: new Date()
    }];

    const order = new OrderModel({
      orderId,
      customerId: input.customerId,
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.toLowerCase().trim(),
      customerPhone: input.customerPhone.trim(),
      items: validatedItems.map(vi => ({
        productId: vi.productId,
        variantId: vi.variantId,
        sku: vi.sku,
        name: vi.name,
        size: vi.size,
        color: vi.color,
        quantity: vi.quantity,
        priceAtPurchase: vi.priceAtPurchase,
        subtotal: vi.subtotal,
        alterationRequested: vi.alterationRequested
      })),
      subtotal,
      shipping,
      tax: calculatedTax,
      total,
      paymentStatus: (input.paymentMethod === 'stripe_checkout' ? 'Pending' : 'Paid') as PaymentStatus,
      orderStatus: initialStatus,
      paymentMethod: input.paymentMethod || 'Credit Card (Processed)',
      paymentTransactionId: input.paymentTransactionId,
      shippingInfo: input.shippingInfo,
      statusHistory,
      notes: input.notes
    });

    await order.save();

    // STEP 6: Trigger the appropriate notification
    const channel = input.preferredNotificationChannel || 'email';
    const recipient = channel === 'email' ? order.customerEmail : order.customerPhone;

    try {
      await notificationService.dispatchEvent(
        'ORDER_CONFIRMED',
        channel,
        recipient,
        {
          orderId: order.orderId,
          customerId: order.customerId,
          total: order.total
        },
        undefined,
        order.customerName
      );
    } catch (notifErr: any) {
      console.warn(`[OrderService] Notification dispatch notice: ${notifErr.message}`);
    }

    // Record audit log
    await auditService.record({
      adminUser: { id: input.customerId || 'CLIENT', name: input.customerName, email: input.customerEmail, role: 'customer' },
      action: 'ORDER_CREATED',
      entity: 'Order',
      entityId: order.orderId,
      newValue: { total: order.total, itemsCount: order.items.length }
    });

    // STEP 7: Return order information
    return order;
  },

  /**
   * Update order status with full history and notification dispatch
   */
  async updateOrderStatus(
    orderId: string, 
    newStatus: string, 
    adminUser: { id: string; name: string; email: string; role: string },
    options: {
      note?: string;
      trackingNumber?: string;
      carrier?: string;
      estimatedDelivery?: string;
      customNotificationMessage?: string;
      notificationChannel?: 'email' | 'sms' | 'whatsapp';
    } = {}
  ): Promise<IOrder> {
    const isObjectId = mongoose.isValidObjectId(orderId);
    const order = await OrderModel.findOne({
      $or: [
        { orderId },
        { orderId: { $regex: new RegExp(`^${orderId.trim()}$`, 'i') } },
        ...(isObjectId ? [{ _id: orderId }] : [])
      ]
    });
    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    const normalizedMap: Record<string, OrderStatus> = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'order confirmed': 'Confirmed',
      'processing': 'Processing',
      'packed': 'Packed',
      'shipped': 'Shipped',
      'out for delivery': 'Out for Delivery',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'canceled': 'Cancelled'
    };
    const resolvedStatus = normalizedMap[String(newStatus).toLowerCase().trim()] || (newStatus as OrderStatus);

    const previousStatus = order.orderStatus;
    order.orderStatus = resolvedStatus;

    if (options.trackingNumber !== undefined) {
      order.trackingNumber = options.trackingNumber.trim();
    }

    if (options.carrier && order.shippingInfo) {
      order.shippingInfo.carrier = options.carrier.trim();
    }
    if (options.estimatedDelivery && order.shippingInfo) {
      order.shippingInfo.estimatedDelivery = options.estimatedDelivery.trim();
    }

    order.statusHistory.push({
      previousStatus,
      newStatus: resolvedStatus,
      changedBy: {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role
      },
      note: options.note || `Status transitioned from ${previousStatus} to ${newStatus}`,
      timestamp: new Date()
    });

    await order.save();

    // Trigger Notification for the specific event
    const eventTypeMap: Record<string, string> = {
      'Confirmed': 'ORDER_CONFIRMED',
      'Processing': 'ORDER_PROCESSING',
      'Shipped': 'ORDER_SHIPPED',
      'Out for Delivery': 'ORDER_OUT_FOR_DELIVERY',
      'Delivered': 'ORDER_DELIVERED'
    };

    const eventType = eventTypeMap[newStatus];
    if (eventType) {
      const channel = options.notificationChannel || 'email';
      const recipient = channel === 'email' ? order.customerEmail : order.customerPhone;

      try {
        await notificationService.dispatchEvent(
          eventType,
          channel,
          recipient,
          {
            orderId: order.orderId,
            customerId: order.customerId,
            trackingNumber: order.trackingNumber || 'Available shortly in portal'
          },
          options.customNotificationMessage,
          order.customerName
        );
      } catch (err: any) {
        console.warn(`[OrderService] Status notification error: ${err.message}`);
      }
    }

    await auditService.record({
      adminUser,
      action: 'ORDER_STATUS_CHANGED',
      entity: 'Order',
      entityId: order.orderId,
      previousValue: { status: previousStatus },
      newValue: { status: newStatus, trackingNumber: order.trackingNumber }
    });

    return order;
  },

  async calculateCheckout(input: { items:Array<{productId:string; variantId?:string; size:string; color:string; quantity:number}>; state:string; shippingMethod:string }) {
    if (!input.items?.length) throw new Error('Your shopping bag is empty.');
    const pricedItems:any[] = [];
    let subtotal = 0;
    for (const item of input.items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new Error('Invalid quantity.');
      const product = await ProductModel.findOne({ productId:item.productId, isActive:true });
      if (!product) throw new Error(`Garment ${item.productId} is unavailable.`);
      const variant = product.variants.find((v:IProductVariant) =>
        (item.variantId && v.id === item.variantId) ||
        (v.size.toLowerCase() === item.size.toLowerCase() && v.color.toLowerCase() === item.color.toLowerCase())
      );
      const availableStock = variant ? variant.stock : product.stockQuantity;
      if (item.quantity > availableStock) throw new Error(`Insufficient inventory for ${product.name}.`);
      const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      const lineTotal = price * item.quantity;
      subtotal += lineTotal;
      pricedItems.push({ productId:product.productId, variantId:variant?.id || `var-${product.productId}-std`, size:item.size, color:item.color, quantity:item.quantity, price, name:product.name, sku:variant?.sku || product.sku });
    }
    const shippingCalc = shippingService.calculate(input.shippingMethod, subtotal, input.state);
    const taxCalc = taxService.calculateTax(input.state, pricedItems.map(i=>({price:i.price,quantity:i.quantity})), subtotal, shippingCalc.amount);
    const total = Math.round((subtotal + shippingCalc.amount + taxCalc.taxAmount) * 100) / 100;
    return { items:pricedItems, subtotal, shipping:shippingCalc, tax:taxCalc, total };
  },

  async updateShipment(orderId: string, adminUser: { id:string; name:string; email:string; role:string }, data: { carrier:string; trackingId:string; trackingUrl?:string; status:'Shipped'|'In Transit'|'Out for Delivery'|'Delivered'; estimatedDelivery?:string; notes?:string }) {
    const order = await OrderModel.findOne({ orderId });
    if (!order) throw new Error(`Order ${orderId} not found.`);
    if (!data.trackingId.trim()) throw new Error('Tracking ID is required.');
    const previousStatus = order.orderStatus;
    order.trackingNumber = data.trackingId.trim();
    if (order.shippingInfo) {
      order.shippingInfo.carrier = data.carrier.trim();
      order.shippingInfo.estimatedDelivery = data.estimatedDelivery?.trim();
    }
    const shipment = {
      ...(order.shipment || {}),
      carrier:data.carrier.trim(), trackingId:data.trackingId.trim(), trackingUrl:data.trackingUrl?.trim(),
      status:data.status, estimatedDelivery:data.estimatedDelivery?.trim(), notes:data.notes?.trim()
    };
    order.shipment = shipment;
    if (data.status === 'Shipped' || data.status === 'In Transit' || data.status === 'Out for Delivery' || data.status === 'Delivered') {
      order.orderStatus = data.status === 'Delivered' ? 'Delivered' : data.status === 'Out for Delivery' ? 'Out for Delivery' : 'Shipped';
    }
    if (data.status === 'Shipped' || data.status === 'In Transit') shipment.shippedAt = shipment.shippedAt || new Date();
    if (data.status === 'Delivered') shipment.deliveredAt = new Date();
    order.statusHistory.push({
      previousStatus,
      newStatus: order.orderStatus,
      changedBy:{ id:adminUser.id, name:adminUser.name, role:adminUser.role },
      note:data.notes || `Shipment updated: ${data.status}`,
      timestamp:new Date()
    });
    await order.save();
    await auditService.record({ adminUser, action:'ORDER_SHIPMENT_UPDATED', entity:'Order', entityId:order.orderId, previousValue:{status:previousStatus}, newValue:{shipment:order.shipment, orderStatus:order.orderStatus} });
    return order;
  },

  /**
   * Secure customer lookup by Order ID + Email or Phone
   */
  async customerLookup(orderId: string, contact: string): Promise<IOrder | null> {
    const cleanId = orderId.trim();
    const cleanContact = contact.trim().toLowerCase();
    const phoneDigits = cleanContact.replace(/\D/g, '');

    const contactOr: any[] = [{ customerEmail: cleanContact }];
    if (phoneDigits.length >= 7) {
      contactOr.push({ customerPhone: { $regex: phoneDigits } });
    }

    const order = await OrderModel.findOne({
      orderId: { $regex: new RegExp(`^${cleanId}$`, 'i') },
      $or: contactOr
    }).lean();

    return order;
  },

  /**
   * Admin order queries
   */
  async getOrders(options: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.status && options.status !== 'All') {
      query.orderStatus = options.status;
    }

    if (options.search) {
      const s = options.search.trim();
      query.$or = [
        { orderId: { $regex: s, $options: 'i' } },
        { customerName: { $regex: s, $options: 'i' } },
        { customerEmail: { $regex: s, $options: 'i' } },
        { customerPhone: { $regex: s, $options: 'i' } },
        { trackingNumber: { $regex: s, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      OrderModel.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
};
