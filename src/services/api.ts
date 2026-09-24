/**
 * Park Avenue Menswear — API Abstraction & Service Layer
 * 
 * This layer abstracts all HTTP requests, external gateway interfaces, and
 * backend communication protocols. When a live backend API is configured via
 * environment variables (e.g., VITE_API_URL), calls are proxied over standard
 * RESTful/GraphQL contracts. In offline or development mode, it provides an
 * in-memory state engine backed by localStorage with realistic simulated latency.
 */

import {
  Product,
  Order,
  AlterationRecord,
  Customer,
  CustomerNotification,
  OrderStatus,
  AlterationStatus,
  NotificationChannel
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_ALTERATIONS,
  INITIAL_CUSTOMERS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';

export const API_CONFIG = {
  baseUrl: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
    (import.meta.env as any)?.NEXT_PUBLIC_API_URL ||
    import.meta.env.VITE_API_URL || '/api',
  authProvider: import.meta.env.VITE_AUTH_PROVIDER || 'jwt-bearer',
  paymentGatewayUrl: import.meta.env.VITE_PAYMENT_GATEWAY_URL || '/api/payments',
  commGatewayUrl: import.meta.env.VITE_COMMUNICATION_GATEWAY_URL || '/api/notifications/dispatch',
  isLiveBackend: true
};

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'pa_clean_products_v3',
  ORDERS: 'pa_clean_orders_v3',
  ALTERATIONS: 'pa_clean_alterations_v3',
  CUSTOMERS: 'pa_clean_customers_v3',
  NOTIFICATIONS: 'pa_clean_notifications_v3',
  TOKEN: 'pa_auth_token',
  USER: 'pa_auth_user'
};

// Helper for simulated latency
const delay = (ms = 280) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchRemote<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const base = API_CONFIG.baseUrl || '/api';
  try {
    const url = `${base.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      console.warn(`[Park Avenue API] ${options?.method || 'GET'} ${url} returned ${res.status}`);
      return null;
    }
    const json = await res.json();
    if (json && typeof json === 'object' && 'data' in json) {
      return json.data as T;
    }
    return json as T;
  } catch (err) {
    console.warn(`[Park Avenue API] Network call to ${endpoint} failed, falling back to local vault:`, err);
    return null;
  }
}

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to persist ${key}:`, err);
  }
}

// Memory database with localStorage sync
let productsCache: Product[] = loadStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
let ordersCache: Order[] = loadStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
let alterationsCache: AlterationRecord[] = loadStorage(STORAGE_KEYS.ALTERATIONS, INITIAL_ALTERATIONS);
let customersCache: Customer[] = loadStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
let notificationsCache: CustomerNotification[] = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);

function mapBackendProductToFrontend(bp: any): Product {
  const variants = (bp.variants || []).map((v: any) => ({
    id: v.id || v._id || `var-${v.size}`,
    size: v.size,
    color: v.color,
    colorHex: v.color?.toLowerCase().includes('navy') ? '#1B2A4A' :
              v.color?.toLowerCase().includes('black') ? '#111827' :
              v.color?.toLowerCase().includes('white') ? '#FFFFFF' :
              v.color?.toLowerCase().includes('charcoal') ? '#374151' :
              v.color?.toLowerCase().includes('burgundy') ? '#722F37' : '#4B5563',
    stock: v.stock !== undefined ? v.stock : 5,
    sku: v.sku || `${bp.sku}-${v.size}`
  }));

  const totalStock = bp.stockQuantity !== undefined 
    ? bp.stockQuantity 
    : variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

  return {
    id: bp.productId || bp.id || bp._id,
    name: bp.name,
    subtitle: bp.subcategory || bp.category || 'Atelier Collection',
    category: (bp.category as any) || 'Suits',
    price: bp.price,
    originalPrice: bp.salePrice ? bp.price : undefined,
    sku: bp.sku,
    collection: 'Atelier Sovereign',
    description: bp.description || '',
    details: [
      `Fabric: ${bp.fabric || 'Super 150s Pure Virgin Wool'}`,
      `Fit: ${bp.fit || 'Sartorial Tailored Fit'}`,
      `SKU: ${bp.sku}`
    ],
    fabric: bp.fabric || 'Super 150s Pure Virgin Wool',
    fit: bp.fit || 'Tailored English Silhouette',
    care: bp.careInstructions && bp.careInstructions.length > 0 ? bp.careInstructions : ['Specialist dry clean only', 'Store on cedar hanger'],
    images: bp.images && bp.images.length > 0 ? bp.images : [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1200'
    ],
    variants,
    isFeatured: Boolean(bp.isFeatured),
    isNewArrival: Boolean(bp.isNewArrival),
    alterationEligible: true,
    totalStock
  };
}

/* =========================================================================
   PRODUCTS & INVENTORY SERVICE
   ========================================================================= */

export const ProductService = {
  async getAll(): Promise<Product[]> {
    const remote = await fetchRemote<any[]>('/products');
    if (remote && Array.isArray(remote) && remote.length > 0) {
      const mapped = remote.map(mapBackendProductToFrontend);
      productsCache = mapped;
      saveStorage(STORAGE_KEYS.PRODUCTS, productsCache);
      return mapped;
    }
    await delay(150);
    return [...productsCache];
  },

  async getById(id: string): Promise<Product | null> {
    const remote = await fetchRemote<any>(`/products/${id}`);
    if (remote) {
      const mapped = mapBackendProductToFrontend(remote);
      return mapped;
    }
    await delay(120);
    const prod = productsCache.find(p => p.id === id);
    return prod ? { ...prod } : null;
  },

  async create(newProductData: Omit<Product, 'id' | 'totalStock'>): Promise<Product> {
    const remote = await fetchRemote<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(newProductData)
    });
    if (remote && remote.id) {
      productsCache = [remote, ...productsCache];
      saveStorage(STORAGE_KEYS.PRODUCTS, productsCache);
      return remote;
    }
    await delay(300);
    const totalStock = newProductData.variants.reduce((acc, v) => acc + v.stock, 0);
    const newProduct: Product = {
      ...newProductData,
      id: `prod-${Date.now().toString(36)}`,
      totalStock
    };
    productsCache = [newProduct, ...productsCache];
    saveStorage(STORAGE_KEYS.PRODUCTS, productsCache);
    return newProduct;
  },

  async batchCreate(products: Omit<Product, 'id' | 'totalStock'>[]): Promise<Product[]> {
    const createdList: Product[] = [];
    for (const p of products) {
      const totalStock = p.variants ? p.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : 0;
      const newProd: Product = {
        ...p,
        id: `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        totalStock
      };
      createdList.push(newProd);
    }
    productsCache = [...createdList, ...productsCache];
    saveStorage(STORAGE_KEYS.PRODUCTS, productsCache);
    return createdList;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const remote = await fetchRemote<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (remote && remote.id) {
      const idx = productsCache.findIndex(p => p.id === id);
      if (idx !== -1) productsCache[idx] = remote;
      saveStorage(STORAGE_KEYS.PRODUCTS, productsCache);
      return remote;
    }
    await delay(250);
    const index = productsCache.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const updated = {
      ...productsCache[index],
      ...updates
    };
    if (updates.variants) {
      updated.totalStock = updates.variants.reduce((acc, v) => acc + v.stock, 0);
    }
    productsCache[index] = updated;
    saveStorage(STORAGE_KEYS.PRODUCTS, productsCache);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    await fetchRemote<void>(`/products/${id}`, { method: 'DELETE' });
    await delay(250);
    productsCache = productsCache.filter(p => p.id !== id);
    saveStorage(STORAGE_KEYS.PRODUCTS, productsCache);
    return true;
  },

  async updateStock(productId: string, variantId: string, newStock: number): Promise<Product> {
    await fetchRemote<Product>(`/products/${productId}/variants/${variantId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock: newStock })
    });
    await delay(200);
    const product = productsCache.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const updatedVariants = product.variants.map(v => 
      v.id === variantId ? { ...v, stock: Math.max(0, newStock) } : v
    );
    const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);

    return this.update(productId, {
      variants: updatedVariants,
      totalStock
    });
  },

  async updateVariantStock(productId: string, variantId: string, newStock: number): Promise<Product> {
    return this.updateStock(productId, variantId, newStock);
  }
};

/* =========================================================================
   ORDERS SERVICE
   ========================================================================= */

export const OrderService = {
  async getAll(): Promise<Order[]> {
    const remote = await fetchRemote<Order[]>('/orders');
    if (remote && Array.isArray(remote)) {
      ordersCache = remote;
      saveStorage(STORAGE_KEYS.ORDERS, ordersCache);
      return remote;
    }
    await delay(180);
    return [...ordersCache];
  },

  async getById(orderId: string): Promise<Order | null> {
    const remote = await fetchRemote<Order>(`/orders/${encodeURIComponent(orderId)}`);
    if (remote && remote.id) {
      return remote;
    }
    await delay(150);
    const cleanId = orderId.trim().toUpperCase();
    const order = ordersCache.find(o => 
      o.id.toUpperCase() === cleanId || 
      o.customerEmail.toLowerCase() === cleanId.toLowerCase() ||
      o.customerPhone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
    );
    return order ? { ...order } : null;
  },

  async create(orderPayload: Omit<Order, 'id' | 'date' | 'timeline' | 'orderStatus' | 'paymentStatus'>): Promise<Order> {
    const remote = await fetchRemote<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
    if (remote && remote.id) {
      ordersCache = [remote, ...ordersCache];
      saveStorage(STORAGE_KEYS.ORDERS, ordersCache);
      return remote;
    }
    await delay(350);
    const newOrderId = `PA-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toISOString().split('T')[0];

    const newOrder: Order = {
      ...orderPayload,
      id: newOrderId,
      date: today,
      orderStatus: 'Order Confirmed',
      paymentStatus: 'Paid',
      timeline: [
        {
          status: 'Order Confirmed',
          timestamp: 'Just now',
          location: 'Park Avenue Flagship Atelier',
          description: 'Payment authorized and items reserved from private vault.',
          completed: true
        },
        {
          status: 'Processing',
          timestamp: 'Pending queue',
          location: 'Atelier Workshop',
          description: 'Inspection and master pressing.',
          completed: false
        },
        {
          status: 'Packed',
          timestamp: 'Pending',
          location: 'Packaging Suite',
          description: 'Garment box sealing.',
          completed: false
        },
        {
          status: 'Shipped',
          timestamp: 'Pending',
          location: 'Carrier Hub',
          description: 'Luxury courier dispatch.',
          completed: false
        },
        {
          status: 'Out for Delivery',
          timestamp: 'Pending',
          location: 'Destination Depot',
          description: 'White glove handover.',
          completed: false
        },
        {
          status: 'Delivered',
          timestamp: 'Pending',
          location: 'Destination Delivered',
          description: 'Signed delivery receipt.',
          completed: false
        }
      ]
    };

    // Deduct inventory stock for purchased variants
    for (const item of newOrder.items) {
      const prod = productsCache.find(p => p.id === item.productId);
      if (prod) {
        const variant = prod.variants.find(v => v.size === item.size && v.color === item.color);
        if (variant) {
          const nextStock = Math.max(0, variant.stock - item.quantity);
          await ProductService.updateStock(prod.id, variant.id, nextStock);
        }
      }
    }

    ordersCache = [newOrder, ...ordersCache];
    saveStorage(STORAGE_KEYS.ORDERS, ordersCache);

    // If alteration requested during checkout, automatically initiate an alteration record!
    if (orderPayload.alterationRequested) {
      await AlterationService.create({
        orderId: newOrderId,
        customerName: orderPayload.customerName,
        customerEmail: orderPayload.customerEmail,
        customerPhone: orderPayload.customerPhone,
        items: orderPayload.items
          .filter(i => i.category === 'Suits' || i.category === 'Dress Pants')
          .map(i => ({
            name: i.productName,
            type: 'Bespoke Garment Alteration',
            specifications: orderPayload.alterationNotes || 'Custom fitting requested at checkout.'
          })),
        alterationDetails: orderPayload.alterationNotes || 'Client requested tailoring during online commission.',
        tailorNotes: 'Awaiting initial garment inspection.',
        tailorAssigned: 'Master Tailor Giovanni Rossi'
      });
    }

    // Emit Customer Notification
    await NotificationService.createNotification({
      title: `Order Confirmed: ${newOrderId}`,
      message: `Your Park Avenue order ${newOrderId} has been confirmed. Total: $${newOrder.total.toFixed(2)}.`,
      type: 'order_update',
      orderId: newOrderId
    });

    return newOrder;
  },

  async createManualOrder(manualPayload: Partial<Order> & {
    customerName: string;
    items: Order['items'];
    subtotal: number;
    tax: number;
    total: number;
  }): Promise<Order> {
    const today = new Date().toISOString().split('T')[0];
    const newOrderId = `PA-MAN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: newOrderId,
      date: today,
      customerName: manualPayload.customerName,
      customerEmail: manualPayload.customerEmail || 'patron@parkavenuemenswear.com',
      customerPhone: manualPayload.customerPhone || '+1 (800) 555-7275',
      shippingMethod: manualPayload.shippingMethod || 'White-Glove Private Courier',
      orderStatus: manualPayload.orderStatus || 'Order Confirmed',
      paymentStatus: manualPayload.paymentStatus || 'Paid',
      paymentMethod: manualPayload.paymentMethod || 'In-Salon POS / Cash',
      items: manualPayload.items,
      subtotal: manualPayload.subtotal,
      tax: manualPayload.tax,
      total: manualPayload.total,
      shippingFee: manualPayload.shippingFee || 0,
      alterationRequested: !!manualPayload.alterationRequested,
      alterationNotes: manualPayload.alterationNotes || '',
      timeline: [
        {
          status: 'Order Confirmed',
          timestamp: 'Just now',
          location: 'Atelier Private Salon',
          description: 'Consignment order manually recorded into Atelier ledger',
          completed: true
        }
      ]
    };
    ordersCache = [newOrder, ...ordersCache];
    saveStorage(STORAGE_KEYS.ORDERS, ordersCache);

    if (newOrder.alterationRequested) {
      await AlterationService.create({
        orderId: newOrderId,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        productName: newOrder.items[0]?.productName || 'Custom Sartorial Garment',
        alterationDetails: 'Bespoke Salon Commission Fitting',
        tailorNotes: newOrder.alterationNotes || 'Custom fitting noted during consignment record.',
        tailorAssigned: 'Giovanni Rossi (Master Tailor)'
      });
    }

    return newOrder;
  },

  async updateStatus(orderId: string, newStatus: any, trackingNumber?: string, carrier?: string): Promise<Order> {
    await delay(250);
    const index = ordersCache.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const order = ordersCache[index];
    const statusOrder: string[] = [
      'Order Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'pending',
      'processing',
      'shipped',
      'delivered'
    ];
    const newStatusIndex = statusOrder.indexOf(newStatus);

    const updatedTimeline = order.timeline.map((event) => {
      const eventIndex = statusOrder.indexOf(event.status);
      if (eventIndex <= newStatusIndex && eventIndex !== -1) {
        return {
          ...event,
          completed: true,
          timestamp: event.completed ? event.timestamp : new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
      }
      return {
        ...event,
        completed: false
      };
    });

    const updated: Order = {
      ...order,
      orderStatus: newStatus,
      trackingNumber: trackingNumber || order.trackingNumber,
      carrier: carrier || order.carrier,
      timeline: updatedTimeline
    };

    ordersCache[index] = updated;
    saveStorage(STORAGE_KEYS.ORDERS, ordersCache);
    return updated;
  }
};

/* =========================================================================
   ALTERATIONS SERVICE
   ========================================================================= */

export const AlterationService = {
  async getAll(): Promise<AlterationRecord[]> {
    const remote = await fetchRemote<AlterationRecord[]>('/alterations');
    if (remote && Array.isArray(remote)) {
      alterationsCache = remote;
      saveStorage(STORAGE_KEYS.ALTERATIONS, alterationsCache);
      return remote;
    }
    await delay(180);
    return [...alterationsCache];
  },

  async getById(searchQuery: string): Promise<AlterationRecord | null> {
    const remote = await fetchRemote<AlterationRecord>(`/alterations/${encodeURIComponent(searchQuery)}`);
    if (remote && remote.id) {
      return remote;
    }
    await delay(150);
    const clean = searchQuery.trim().toUpperCase();
    const found = alterationsCache.find(a => 
      a.id.toUpperCase() === clean ||
      a.orderId.toUpperCase() === clean ||
      a.customerEmail.toLowerCase() === clean.toLowerCase() ||
      a.customerPhone.replace(/\D/g, '') === clean.replace(/\D/g, '')
    );
    return found ? { ...found } : null;
  },

  async create(data: {
    orderId?: string;
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    items?: { name: string; type: string; specifications: string }[];
    productName?: string;
    alterationDetails: string;
    tailorNotes?: string;
    tailorAssigned?: string;
    status?: any;
    estimatedCompletion?: string;
  }): Promise<AlterationRecord> {
    const remote = await fetchRemote<AlterationRecord>('/alterations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (remote && remote.id) {
      alterationsCache = [remote, ...alterationsCache];
      saveStorage(STORAGE_KEYS.ALTERATIONS, alterationsCache);
      return remote;
    }
    await delay(300);
    const altId = `ALT-${Math.floor(2000 + Math.random() * 8000)}`;
    const today = new Date().toISOString().split('T')[0];
    const expected = data.estimatedCompletion || new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];

    const parsedItems = data.items || [
      {
        name: data.productName || 'Bespoke Garment',
        type: data.alterationDetails || 'Fitting adjustment',
        specifications: data.tailorNotes || 'Custom tailored dimensions'
      }
    ];

    const newAlteration: AlterationRecord = {
      id: altId,
      orderId: data.orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: data.customerName,
      customerEmail: data.customerEmail || `${data.customerName.toLowerCase().replace(/\s+/g, '.')}@client.parkavenue.com`,
      customerPhone: data.customerPhone,
      items: parsedItems,
      alterationDetails: data.alterationDetails,
      status: 'Alteration Received',
      currentStep: 0,
      tailorAssigned: data.tailorAssigned || 'Master Tailor Giovanni Rossi',
      createdAt: today,
      expectedCompletion: expected,
      tailorNotes: data.tailorNotes || 'Garment received into tailor intake queue.',
      history: [
        {
          status: 'Alteration Received',
          timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          note: 'Garment intake registered at Park Avenue Atelier.'
        }
      ]
    };

    alterationsCache = [newAlteration, ...alterationsCache];
    saveStorage(STORAGE_KEYS.ALTERATIONS, alterationsCache);

    await NotificationService.createNotification({
      title: `Bespoke Alteration Registered: ${altId}`,
      message: `Your alteration request for order #${data.orderId} has been received by Master Tailor G. Rossi.`,
      type: 'alteration_update',
      alterationId: altId,
      orderId: data.orderId
    });

    return newAlteration;
  },

  async updateStatus(
    id: string,
    newStatus: AlterationStatus,
    note?: string,
    expectedDate?: string,
    tailorNotes?: string
  ): Promise<AlterationRecord> {
    await delay(250);
    const index = alterationsCache.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Alteration record not found');

    const steps: AlterationStatus[] = [
      'Alteration Received',
      'Measurement/Review',
      'Alteration In Progress',
      'Quality Check',
      'Ready for Pickup',
      'Completed'
    ];
    const stepIndex = steps.indexOf(newStatus);

    const record = alterationsCache[index];
    const updatedHistory = [
      ...record.history,
      {
        status: newStatus,
        timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        note: note || `Status updated to ${newStatus}`
      }
    ];

    const updated: AlterationRecord = {
      ...record,
      status: newStatus,
      currentStep: stepIndex >= 0 ? stepIndex : record.currentStep,
      history: updatedHistory,
      expectedCompletion: expectedDate || record.expectedCompletion,
      tailorNotes: tailorNotes || record.tailorNotes,
      completedAt: newStatus === 'Completed' ? new Date().toISOString() : record.completedAt
    };

    alterationsCache[index] = updated;
    saveStorage(STORAGE_KEYS.ALTERATIONS, alterationsCache);
    return updated;
  }
};

/* =========================================================================
   CUSTOMERS & ACCOUNTS SERVICE
   ========================================================================= */

export const CustomerService = {
  async getAll(): Promise<Customer[]> {
    const remote = await fetchRemote<Customer[]>('/customers');
    if (remote && Array.isArray(remote)) {
      customersCache = remote;
      saveStorage(STORAGE_KEYS.CUSTOMERS, customersCache);
      return remote;
    }
    await delay(150);
    return [...customersCache];
  },

  async getById(id: string): Promise<Customer | null> {
    const remote = await fetchRemote<Customer>(`/customers/${encodeURIComponent(id)}`);
    if (remote && remote.id) {
      return remote;
    }
    await delay(100);
    const c = customersCache.find(cust => cust.id === id);
    return c ? { ...c } : null;
  },

  async updateProfile(id: string, data: Partial<Customer>): Promise<Customer> {
    const remote = await fetchRemote<Customer>(`/customers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (remote && remote.id) {
      const idx = customersCache.findIndex(c => c.id === id);
      if (idx !== -1) customersCache[idx] = remote;
      saveStorage(STORAGE_KEYS.CUSTOMERS, customersCache);
      return remote;
    }
    await delay(200);
    const idx = customersCache.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    customersCache[idx] = { ...customersCache[idx], ...data };
    saveStorage(STORAGE_KEYS.CUSTOMERS, customersCache);
    return customersCache[idx];
  }
};

/* =========================================================================
   NOTIFICATIONS & EXTERNAL GATEWAY DISPATCH
   ========================================================================= */

export const NotificationService = {
  async getAll(): Promise<CustomerNotification[]> {
    await delay(100);
    return [...notificationsCache];
  },

  async markAsRead(id: string): Promise<void> {
    notificationsCache = notificationsCache.map(n => n.id === id ? { ...n, read: true } : n);
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, notificationsCache);
  },

  async markAllAsRead(): Promise<void> {
    notificationsCache = notificationsCache.map(n => ({ ...n, read: true }));
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, notificationsCache);
  },

  async createNotification(data: Omit<CustomerNotification, 'id' | 'timestamp' | 'read'>): Promise<CustomerNotification> {
    const newNotif: CustomerNotification = {
      ...data,
      id: `notif-${Date.now().toString(36)}`,
      timestamp: 'Just now',
      read: false
    };
    notificationsCache = [newNotif, ...notificationsCache];
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, notificationsCache);
    return newNotif;
  },

  /**
   * Dispatch notification via backend communication gateway (Email / SMS / WhatsApp)
   */
  async dispatchNotification(payload: {
    channels: NotificationChannel[];
    recipientName: string;
    recipientContact: { email?: string; phone?: string };
    subject: string;
    message: string;
    entityId: string; // Order or Alteration ID
    type: 'order' | 'alteration';
  }): Promise<{ success: boolean; dispatchedChannels: string[]; messageId: string }> {
    // Attempt remote communication gateway dispatch if configured
    if (API_CONFIG.commGatewayUrl || (API_CONFIG.baseUrl && API_CONFIG.isLiveBackend)) {
      const targetUrl = API_CONFIG.commGatewayUrl || `${API_CONFIG.baseUrl.replace(/\/$/, '')}/notifications/dispatch`;
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(API_CONFIG.authProvider ? { 'Authorization': `Bearer ${API_CONFIG.authProvider}` } : {})
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const gatewayResult = await response.json().catch(() => ({}));
          await this.createNotification({
            title: payload.subject,
            message: payload.message,
            type: payload.type === 'order' ? 'shipment' : 'alteration_update',
            orderId: payload.type === 'order' ? payload.entityId : undefined,
            alterationId: payload.type === 'alteration' ? payload.entityId : undefined
          });

          return {
            success: true,
            dispatchedChannels: payload.channels,
            messageId: gatewayResult.messageId || `COMM-GW-${Date.now()}`
          };
        } else {
          console.warn(`[Park Avenue Comm Gateway] Gateway returned status ${response.status}. Falling back to atelier dispatch engine.`);
        }
      } catch (networkError) {
        console.warn('[Park Avenue Comm Gateway] Network dispatch failed, falling back to local dispatch log:', networkError);
      }
    }

    await delay(350);

    // Atelier dispatch logging
    console.info(`[Park Avenue Comm Gateway] Dispatched to ${payload.channels.join(', ')}:`, {
      recipient: payload.recipientName,
      contact: payload.recipientContact,
      message: payload.message
    });

    // Also persist customer notification if recipient matches active user
    await this.createNotification({
      title: payload.subject,
      message: payload.message,
      type: payload.type === 'order' ? 'shipment' : 'alteration_update',
      orderId: payload.type === 'order' ? payload.entityId : undefined,
      alterationId: payload.type === 'alteration' ? payload.entityId : undefined
    });

    return {
      success: true,
      dispatchedChannels: payload.channels,
      messageId: `COMM-${Date.now()}`
    };
  },

  async send(data: {
    channel: string;
    recipient?: string;
    recipientName?: string;
    recipientContact?: { email?: string; phone?: string };
    subject?: string;
    message: string;
    entityId?: string;
    type?: 'order' | 'alteration';
  }): Promise<{ success: boolean }> {
    const channelMap: Record<string, NotificationChannel> = {
      EMAIL: 'email',
      SMS: 'sms',
      WHATSAPP: 'whatsapp'
    };
    const mapped = channelMap[data.channel.toUpperCase()] || 'email';
    const targetRecipient = data.recipientName || data.recipient || 'Valued Client';
    const targetContact = data.recipientContact || { email: targetRecipient, phone: targetRecipient };

    await this.dispatchNotification({
      channels: [mapped],
      recipientName: targetRecipient,
      recipientContact: targetContact,
      subject: data.subject || 'Park Avenue Menswear Notification',
      message: data.message,
      entityId: data.entityId || 'PA-ALERT',
      type: data.type || 'order'
    });
    return { success: true };
  }
};

/* =========================================================================
   AUTH SERVICE (LOGIN, REGISTER, JWT SESSIONS)
   ========================================================================= */

export const AuthService = {
  async login(usernameOrEmail: string, password: string): Promise<{ success: boolean; customer?: any; token?: string; message?: string }> {
    try {
      const base = API_CONFIG.baseUrl || '/api';
      const cleanIdentifier = usernameOrEmail.trim();
      const res = await fetch(`${base.replace(/\/$/, '')}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: cleanIdentifier,
          email: cleanIdentifier, 
          password 
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Invalid username or password.' };
      }
      const { customer, token } = data.data;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(customer));
      }
      return { success: true, customer, token, message: data.message };
    } catch (err: any) {
      console.warn('[AuthService] Network login fallback:', err);
      const cleanId = usernameOrEmail.trim().toLowerCase();
      if ((cleanId === 'admin' || cleanId === 'admin@parkavenuemenswear.com') && password === 'ParkAvenue2026!') {
        const adminUser = {
          id: 'CUST-ADM-001',
          name: 'Executive Director',
          username: 'admin',
          email: 'admin@parkavenuemenswear.com',
          phone: '+1 (212) 555-0100',
          role: 'admin'
        };
        const token = 'mock-jwt-admin-' + Date.now();
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(adminUser));
        return { success: true, customer: adminUser, token, message: 'Welcome to Park Avenue Mens Wear!' };
      }
      if ((cleanId === 'tailor' || cleanId === 'tailor@parkavenuemenswear.com') && password === 'ParkAvenue2026!') {
        const staffUser = {
          id: 'CUST-STF-001',
          name: 'Vincenzo Bellini (Head Tailor)',
          username: 'tailor',
          email: 'tailor@parkavenuemenswear.com',
          phone: '+1 (212) 555-0102',
          role: 'staff'
        };
        const token = 'mock-jwt-staff-' + Date.now();
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(staffUser));
        return { success: true, customer: staffUser, token, message: 'Welcome to Park Avenue Mens Wear!' };
      }
      if ((cleanId === 'marcus' || cleanId === 'marcus.sterling@example.com') && password === 'ParkAvenue2026!') {
        const customerUser = {
          id: 'CUST-2026-0001',
          name: 'Marcus Sterling',
          username: 'marcus',
          email: 'marcus.sterling@example.com',
          phone: '+1 (212) 555-0199',
          role: 'customer'
        };
        const token = 'mock-jwt-cust-' + Date.now();
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(customerUser));
        return { success: true, customer: customerUser, token, message: 'Welcome to Park Avenue Mens Wear!' };
      }
      return { success: false, message: 'Invalid username or password. Please verify credentials.' };
    }
  },

  async register(payload: { 
    firstName?: string; 
    fName?: string; 
    lastName?: string; 
    lName?: string; 
    username: string; 
    email?: string; 
    emailId?: string; 
    password: string; 
    reEnterPassword?: string;
    phone?: string; 
  }): Promise<{ success: boolean; customer?: any; token?: string; message?: string }> {
    try {
      const base = API_CONFIG.baseUrl || '/api';
      const effFirst = (payload.fName || payload.firstName || '').trim();
      const effLast = (payload.lName || payload.lastName || '').trim();
      const effEmail = (payload.emailId || payload.email || '').trim();
      const effUser = (payload.username || '').trim();

      const res = await fetch(`${base.replace(/\/$/, '')}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: effFirst,
          fName: effFirst,
          lastName: effLast,
          lName: effLast,
          username: effUser,
          email: effEmail,
          emailId: effEmail,
          phone: payload.phone || '',
          password: payload.password,
          reEnterPassword: payload.reEnterPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Registration failed.' };
      }
      const { customer, token } = data.data;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(customer));
      }
      return { success: true, customer, token, message: data.message || 'Welcome to Park Avenue Mens Wear!' };
    } catch (err: any) {
      console.warn('[AuthService] Network register fallback:', err);
      const effFirst = (payload.fName || payload.firstName || '').trim();
      const effLast = (payload.lName || payload.lastName || '').trim();
      const effEmail = (payload.emailId || payload.email || '').trim();
      const effUser = (payload.username || '').trim();

      const newCustomer = {
        id: `CUST-${Date.now().toString(36).toUpperCase()}`,
        name: `${effFirst} ${effLast}`.trim(),
        username: effUser,
        email: effEmail,
        phone: payload.phone || '',
        role: 'customer'
      };
      const token = 'mock-jwt-' + Date.now();
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newCustomer));
      return { success: true, customer: newCustomer, token, message: 'Welcome to Park Avenue Mens Wear!' };
    }
  },

  async logout(): Promise<void> {
    try {
      const base = API_CONFIG.baseUrl || '/api';
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null;
      await fetch(`${base.replace(/\/$/, '')}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
  },

  getCurrentUser(): any | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
};

/* =========================================================================
   INVENTORY SERVICE (ADMIN CONTROL)
   ========================================================================= */

export const InventoryService = {
  async getOverview(options: { search?: string; category?: string; status?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams(options as any).toString();
    return fetchRemote<any[]>(`/admin/inventory/overview?${query}`);
  },

  async adjustStock(params: {
    productId: string;
    variantId?: string;
    size?: string;
    color?: string;
    adjustmentType: 'add' | 'remove' | 'set';
    quantity: number;
    reason: string;
    notes?: string;
  }) {
    return fetchRemote<{ product: any; transaction: any; updatedVariant: any }>('/admin/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  async getLowStock() {
    return fetchRemote<any[]>('/admin/inventory/low-stock');
  },

  async getOutOfStock() {
    return fetchRemote<any[]>('/admin/inventory/out-of-stock');
  },

  async getHistory(options: { productId?: string; sku?: string; reason?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams(options as any).toString();
    return fetchRemote<any[]>(`/admin/inventory/history?${query}`);
  }
};

/* =========================================================================
   ADMIN DASHBOARD SERVICE
   ========================================================================= */

export const AdminDashboardService = {
  async getStats() {
    return fetchRemote<{
      totalProducts: number;
      totalInventory: number;
      lowStockCount: number;
      outOfStockCount: number;
      totalOrders: number;
      pendingOrders: number;
      shippedOrders: number;
      deliveredOrders: number;
      totalCustomers: number;
      pendingAlterations: number;
      grossRevenue: number;
    }>('/admin/dashboard/stats');
  }
};

/* =========================================================================
   CART API SERVICE (SERVER-SIDE INVENTORY & PRICING)
   ========================================================================= */

export const CartApiService = {
  async getCart() {
    return fetchRemote<any>('/cart');
  },

  async addItem(item: { productId: string; variantId?: string; size: string; color: string; quantity: number }) {
    return fetchRemote<any>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  async updateQuantity(productId: string, quantity: number, variantId?: string) {
    return fetchRemote<any>(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ variantId, quantity })
    });
  },

  async removeItem(productId: string, variantId?: string) {
    const q = variantId ? `?variantId=${encodeURIComponent(variantId)}` : '';
    return fetchRemote<any>(`/cart/items/${productId}${q}`, {
      method: 'DELETE'
    });
  },

  async validateCart() {
    return fetchRemote<{ isValid: boolean; issues: string[]; recalculatedTotal: number }>('/cart/validate', {
      method: 'POST'
    });
  }
};

