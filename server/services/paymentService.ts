import Stripe from 'stripe';
import { OrderModel, PaymentStatus } from '../models/Order.js';
import { ENV } from '../config/env.js';
import { auditService } from './auditService.js';
import { inventoryService } from './inventoryService.js';
import crypto from 'crypto';

// Initialize official Stripe SDK instance if secret key is configured
const stripeClient: Stripe | null = ENV.STRIPE_SECRET_KEY
  ? new Stripe(ENV.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as any
    })
  : null;

export interface PaymentIntentResult {
  clientSecret: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: 'stripe';
  isLive: boolean;
  publishableKey?: string;
}

export const paymentService = {
  /**
   * Return current Stripe gateway configuration for clients
   */
  getConfig() {
    const isConfigured = Boolean(stripeClient && ENV.STRIPE_SECRET_KEY);
    const isLive = Boolean(ENV.STRIPE_SECRET_KEY && ENV.STRIPE_SECRET_KEY.startsWith('sk_live_'));
    return {
      provider: 'stripe' as const,
      isConfigured,
      isLive,
      testMode: !isLive,
      publishableKey: ENV.STRIPE_PUBLISHABLE_KEY || '',
      webhookConfigured: Boolean(ENV.STRIPE_WEBHOOK_SECRET)
    };
  },

  /**
   * Test connection to Stripe API
   */
  async testConnection() {
    if (!stripeClient) {
      return {
        connected: false,
        mode: 'simulation',
        message: 'Stripe Secret Key (STRIPE_SECRET_KEY) not set. Running in luxury simulator test mode.'
      };
    }

    try {
      const balance = await stripeClient.balance.retrieve();
      return {
        connected: true,
        mode: ENV.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'live' : 'test',
        livemode: balance.livemode,
        availableCurrencies: balance.available.map(b => b.currency),
        message: 'Successfully authenticated with Stripe Payment Gateway.'
      };
    } catch (err: any) {
      return {
        connected: false,
        mode: 'error',
        message: `Stripe API Authentication Failed: ${err.message}`
      };
    }
  },

  /**
   * Create payment intent with Stripe or luxury test simulation
   */
  async createPaymentIntent(
    orderId: string,
    amount: number,
    customerEmail: string,
    customerName?: string
  ): Promise<PaymentIntentResult> {
    const order = await OrderModel.findOne({ orderId });
    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    // Verify amount matches server order total exactly (never trust frontend amount)
    if (Math.abs(order.total - amount) > 0.01) {
      throw new Error(`Payment amount mismatch: Order total is $${order.total.toFixed(2)}, but requested $${amount.toFixed(2)}.`);
    }

    // If real Stripe client is configured, create live/test intent via Stripe API
    if (stripeClient) {
      try {
        const intent = await stripeClient.paymentIntents.create({
          amount: Math.round(order.total * 100), // in cents
          currency: 'usd',
          receipt_email: customerEmail,
          description: `Park Avenue Menswear Sartorial Commission #${orderId}`,
          metadata: {
            orderId: order.orderId,
            customerEmail,
            customerName: customerName || order.customerName || 'Park Avenue Patron'
          },
          automatic_payment_methods: {
            enabled: true
          }
        });

        order.paymentTransactionId = intent.id;
        order.paymentStatus = 'Authorized';
        await order.save();

        return {
          clientSecret: intent.client_secret || '',
          transactionId: intent.id,
          amount: order.total,
          currency: 'usd',
          status: 'Authorized',
          provider: 'stripe',
          isLive: Boolean(ENV.STRIPE_SECRET_KEY.startsWith('sk_live_')),
          publishableKey: ENV.STRIPE_PUBLISHABLE_KEY
        };
      } catch (err: any) {
        console.error(`[StripePaymentService] PaymentIntent creation failed:`, err);
        throw new Error(`Stripe error: ${err.message}`);
      }
    }

    // High-fidelity luxury test simulation when no external Stripe API key is provided
    const transactionId = `pi_pa_test_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const clientSecret = `${transactionId}_secret_${crypto.randomBytes(10).toString('hex')}`;

    order.paymentTransactionId = transactionId;
    order.paymentStatus = 'Authorized';
    await order.save();

    return {
      clientSecret,
      transactionId,
      amount: order.total,
      currency: 'usd',
      status: 'Authorized',
      provider: 'stripe',
      isLive: false,
      publishableKey: ENV.STRIPE_PUBLISHABLE_KEY || 'pk_test_parkavenue_simulation'
    };
  },

  async createCheckoutSession(orderId:string, customerEmail:string) {
    if (!stripeClient) throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in the deployment environment.');
    const order = await OrderModel.findOne({ orderId });
    if (!order) throw new Error(`Order ${orderId} not found.`);
    if (order.paymentStatus === 'Paid') throw new Error('Order is already paid.');
    const session = await stripeClient.checkout.sessions.create({
      mode:'payment',
      customer_email:customerEmail,
      line_items:order.items.map(item => ({
        price_data:{
          currency:'usd',
          product_data:{ name:item.name, description:`${item.size} / ${item.color}` },
          unit_amount:Math.round(item.priceAtPurchase * 100)
        },
        quantity:item.quantity
      })).concat([
        ...(order.shipping > 0 ? [{ price_data:{currency:'usd',product_data:{name:order.shippingInfo.shippingMethod || 'Shipping'},unit_amount:Math.round(order.shipping*100)},quantity:1 }] : []),
        ...(order.tax > 0 ? [{ price_data:{currency:'usd',product_data:{name:`Sales tax — ${order.taxDetails?.state || order.shippingInfo.state}`},unit_amount:Math.round(order.tax*100)},quantity:1 }] : [])
      ]),
      metadata:{ orderId:order.orderId, customerId:order.customerId || '', taxState:order.taxDetails?.state || '' },
      success_url:`${ENV.FRONTEND_URL.replace(/\/$/,'')}/checkout?payment=success&orderId=${encodeURIComponent(order.orderId)}`,
      cancel_url:`${ENV.FRONTEND_URL.replace(/\/$/,'')}/checkout?payment=cancelled&orderId=${encodeURIComponent(order.orderId)}`
    });
    order.stripeSessionId = session.id;
    await order.save();
    return session;
  },

  /**
   * Manually confirm or settle order payment (e.g. following client-side tokenization)
   */
  async confirmPayment(orderId: string, transactionId: string, paymentMethodDetails?: string) {
    throw new Error('Payment confirmation is webhook-controlled. Complete payment through Stripe Checkout.');
  },

  /**
   * Handle secure webhook from Stripe
   */
  async handleWebhook(payload: any, signatureHeader?: string, rawBody?: Buffer): Promise<{ received: boolean; orderId?: string; status?: PaymentStatus }> {
    let event: any = payload;

    // Validate Stripe webhook signature if configured
    if (stripeClient && ENV.STRIPE_WEBHOOK_SECRET && signatureHeader && rawBody) {
      try {
        event = stripeClient.webhooks.constructEvent(
          rawBody,
          signatureHeader,
          ENV.STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        console.warn(`[StripeWebhook] Webhook signature verification failed: ${err.message}`);
        throw new Error(`Stripe Webhook Signature Verification Failed: ${err.message}`);
      }
    } else if (typeof payload === 'string') {
      try {
        event = JSON.parse(payload);
      } catch (e) {
        event = payload;
      }
    }

    const eventType = event.type || event.event;
    const eventData = event.data?.object || event;
    const orderId = eventData.metadata?.orderId || eventData.orderId || eventData.client_reference_id;

    let paymentStatus: PaymentStatus = 'Pending';
    if ((eventType === 'checkout.session.completed' && eventData.payment_status === 'paid') || eventType === 'payment_intent.succeeded' || eventType === 'charge.succeeded') {
      paymentStatus = 'Paid';
    } else if (eventType === 'payment_intent.payment_failed' || eventType === 'charge.failed') {
      paymentStatus = 'Failed';
    } else if (eventType === 'charge.refunded') {
      paymentStatus = 'Refunded';
    }

    if (orderId) {
      const order = await OrderModel.findOne({ orderId });
      if (order) {
        const previousStatus = order.paymentStatus;
        order.paymentStatus = paymentStatus;
        if (eventData.id) {
          order.paymentTransactionId = eventData.id;
        }

        if (paymentStatus === 'Paid' && previousStatus !== 'Paid') {
          for (const item of order.items) {
            await inventoryService.adjustStock({
              productId:item.productId, variantId:item.variantId, size:item.size, color:item.color,
              adjustmentType:'remove', quantity:item.quantity, reason:'purchase',
              notes:`Captured by Stripe for order ${order.orderId}`,
              adminUser:{ id:'STRIPE_GATEWAY', name:'Stripe Payment Processor', email:'stripe@parkavenuemenswear.com' }
            });
          }
          order.orderStatus = order.orderStatus === 'Pending' ? 'Confirmed' : order.orderStatus;
        }
        if (paymentStatus === 'Paid') {
          order.statusHistory.push({
            previousStatus: order.orderStatus,
            newStatus: order.orderStatus,
            changedBy:{id:'STRIPE_GATEWAY',name:'Stripe Payment Processor',role:'system'},
            note:`Stripe payment settled: ${eventData.id || 'N/A'}`,
            timestamp:new Date()
          });
        }
        if (paymentStatus === 'Paid') {
          order.timeline.push({
            status: 'Processing',
            timestamp: new Date().toISOString(),
            description: `Stripe Webhook confirmed payment settlement (${eventData.id || 'N/A'}).`,
            completed: true
          });
        }

        await order.save();

        await auditService.record({
          adminUser: { id: 'STRIPE_WEBHOOK', name: 'Stripe Webhook Handler', email: 'webhook@stripe.com', role: 'system' },
          action: 'STRIPE_WEBHOOK_STATUS_UPDATED',
          entity: 'Order',
          entityId: order.orderId,
          previousValue: { paymentStatus: previousStatus },
          newValue: { paymentStatus, transactionId: eventData.id }
        });

        return { received: true, orderId, status: paymentStatus };
      }
    }

    return { received: true };
  }
};
