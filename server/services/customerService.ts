import { CustomerModel, ICustomer } from '../models/Customer.js';
import { OrderModel } from '../models/Order.js';
import { AlterationModel } from '../models/Alteration.js';
import { ReturnModel } from '../models/Return.js';
import { auditService } from './auditService.js';

export const customerService = {
  /**
   * Search customers by Email, Phone, or Order ID
   */
  async searchCustomers(queryStr: string) {
    const clean = queryStr.trim();
    if (!clean) return [];

    // Check if query is an Order ID
    if (clean.toUpperCase().startsWith('PA-')) {
      const order = await OrderModel.findOne({ orderId: { $regex: clean, $options: 'i' } });
      if (order) {
        if (order.customerId) {
          const cust = await CustomerModel.findOne({ customerId: order.customerId }).lean();
          if (cust) return [cust];
        }
        // Match customer by email or phone from order
        const cust = await CustomerModel.findOne({
          $or: [
            { email: order.customerEmail.toLowerCase() },
            { phone: order.customerPhone }
          ]
        }).lean();
        if (cust) return [cust];

        // Return customer profile associated with this order
        return [{
          customerId: `CLIENT-${order.orderId}`,
          name: order.customerName,
          firstName: order.customerName.split(' ')[0],
          lastName: order.customerName.split(' ').slice(1).join(' ') || '',
          email: order.customerEmail,
          phone: order.customerPhone,
          role: 'customer' as any,
          status: 'active' as any,
          addresses: [order.shippingInfo],
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }];
      }
    }

    // Match by email, phone, or name
    return CustomerModel.find({
      $or: [
        { email: { $regex: clean, $options: 'i' } },
        { phone: { $regex: clean.replace(/\D/g, '') } },
        { name: { $regex: clean, $options: 'i' } }
      ]
    }).limit(20).lean();
  },

  /**
   * Get single customer with their orders and alterations
   */
  async getCustomerProfile(customerId: string) {
    const clean = (customerId || '').trim();
    if (!clean) return null;

    const customer = await CustomerModel.findOne({
      $or: [
        { customerId: clean },
        { customerId: clean.toUpperCase() },
        { email: clean.toLowerCase() },
        { username: clean.toLowerCase() }
      ]
    }).lean();

    if (!customer) return null;

    const [orders, alterations, returns] = await Promise.all([
      OrderModel.find({
        $or: [
          { customerId: customer.customerId },
          { customerEmail: customer.email }
        ]
      }).sort({ createdAt: -1 }).lean(),
      AlterationModel.find({
        $or: [
          { customerId: customer.customerId },
          { customerEmail: customer.email }
        ]
      }).sort({ createdAt: -1 }).lean(),
      ReturnModel.find({
        $or: [
          { customerId: customer.customerId },
          { customerEmail: customer.email }
        ]
      }).sort({ createdAt: -1 }).lean()
    ]);

    return {
      customer,
      orders,
      alterations,
      returns
    };
  },

  /**
   * Admin customer list with pagination
   */
  async getCustomers(options: { search?: string; status?: string; page?: number; limit?: number } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.status) query.status = options.status;
    if (options.search) {
      const s = options.search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } }
      ];
    }

    const [customers, total] = await Promise.all([
      CustomerModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CustomerModel.countDocuments(query)
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Update customer profile
   */
  async updateCustomer(customerId: string, updates: Partial<ICustomer>, adminUser?: { id: string; name: string; email: string; role: string }) {
    const customer = await CustomerModel.findOne({ customerId });
    if (!customer) throw new Error('Customer not found.');

    const previousValue = customer.toObject();

    if (updates.firstName && updates.lastName) {
      customer.firstName = updates.firstName;
      customer.lastName = updates.lastName;
      customer.name = `${updates.firstName} ${updates.lastName}`;
    }
    if (updates.phone) customer.phone = updates.phone;
    if (updates.addresses) customer.addresses = updates.addresses;
    if (updates.status) customer.status = updates.status;
    if (updates.suitSizePreference) customer.suitSizePreference = updates.suitSizePreference;
    if (updates.shirtSizePreference) customer.shirtSizePreference = updates.shirtSizePreference;
    if (updates.inseamPreference) customer.inseamPreference = updates.inseamPreference;
    if (updates.notes) customer.notes = updates.notes;

    await customer.save();

    if (adminUser) {
      await auditService.record({
        adminUser,
        action: 'CUSTOMER_INFORMATION_CHANGED',
        entity: 'Customer',
        entityId: customer.customerId,
        previousValue,
        newValue: customer.toObject()
      });
    }

    return customer;
  }
};
