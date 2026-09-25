import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { orderService } from '../services/orderService.js';
import { taxService } from '../services/taxService.js';
import { shippingService } from '../services/shippingService.js';
import { paymentService } from '../services/paymentService.js';

export const checkoutController = {
  async calculate(req: AuthenticatedRequest, res: Response) {
    try {
      const { items, state, shippingMethod } = req.body;
      if (!Array.isArray(items) || !state || !shippingMethod) return res.status(400).json({ success:false, message:'Items, shipping state and shipping method are required.' });
      const result = await orderService.calculateCheckout({ items, state, shippingMethod });
      return res.status(200).json({ success:true, data:result });
    } catch(err:any) { return res.status(400).json({ success:false, message:err.message }); }
  },

  async options(_req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({ success:true, data:{ states:taxService.getStateOptions(), shippingMethods:shippingService.getOptions() } });
  },

  async createSession(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success:false, message:'Please sign in before payment.' });
      const { contact, shippingAddress, shippingMethod, items } = req.body;
      if (!contact?.firstName || !contact?.lastName || !contact?.email || !contact?.phone) return res.status(400).json({ success:false, message:'Complete contact information is required.' });
      if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.postalCode) return res.status(400).json({ success:false, message:'Complete shipping address is required.' });
      const calc = await orderService.calculateCheckout({ items, state:shippingAddress.state, shippingMethod });
      const order = await orderService.createOrder({
        customerId:req.user.customerId,
        customerName:`${contact.firstName} ${contact.lastName}`,
        customerEmail:req.user.email || contact.email,
        customerPhone:contact.phone,
        items,
        shippingInfo:{
          recipientName:`${contact.firstName} ${contact.lastName}`,
          email:req.user.email || contact.email,
          phone:contact.phone,
          street:shippingAddress.street,
          apartment:shippingAddress.apartment,
          city:shippingAddress.city,
          state:shippingAddress.state,
          postalCode:shippingAddress.postalCode,
          country:'United States',
          shippingMethod:calc.shipping.id,
          estimatedDelivery:calc.shipping.estimatedDelivery
        },
        paymentMethod:'stripe_checkout'
      });
      const session = await paymentService.createCheckoutSession(order.orderId, req.user.email || contact.email);
      return res.status(200).json({ success:true, data:{ orderId:order.orderId, checkoutUrl:session.url, sessionId:session.id, calculation:calc } });
    } catch(err:any) { return res.status(400).json({ success:false, message:err.message }); }
  }
};
