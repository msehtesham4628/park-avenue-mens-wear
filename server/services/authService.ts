import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CustomerModel, ICustomer, CustomerRole } from '../models/Customer.js';
import { ENV } from '../config/env.js';
import { auditService } from './auditService.js';

export interface TokenPayload {
  id: string;
  customerId: string;
  email: string;
  name: string;
  role: CustomerRole;
}

export const authService = {
  /**
   * Hash plain text password securely
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  },

  /**
   * Compare plain password with hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  /**
   * Sign JWT Token
   */
  generateToken(customer: ICustomer): string {
    const payload: TokenPayload = {
      id: customer._id ? customer._id.toString() : customer.customerId,
      customerId: customer.customerId,
      email: customer.email,
      name: customer.name,
      role: customer.role
    };

    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: '7d'
    });
  },

  /**
   * Verify JWT Token
   */
  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  },

  /**
   * Register a new customer
   */
  async register(data: {
    firstName: string;
    lastName: string;
    username?: string;
    email: string;
    phone?: string;
    password: string;
    role?: CustomerRole;
  }): Promise<{ customer: ICustomer; token: string }> {
    const cleanEmail = data.email.toLowerCase().trim();
    const existingEmail = await CustomerModel.findOne({ email: cleanEmail });
    if (existingEmail) {
      throw new Error('A client account with this email address already exists.');
    }

    const cleanUsername = (data.username || cleanEmail.split('@')[0]).toLowerCase().trim();
    if (data.username) {
      const existingUser = await CustomerModel.findOne({ username: cleanUsername });
      if (existingUser) {
        throw new Error('This username is already registered. Please select another username.');
      }
    }

    // Password policy check: One caps, one special character, one number
    if (!/[A-Z]/.test(data.password)) {
      throw new Error('Password must contain at least one capital letter (A-Z).');
    }
    if (!/[0-9]/.test(data.password)) {
      throw new Error('Password must contain at least one number (0-9).');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(data.password)) {
      throw new Error('Password must contain at least one special character.');
    }

    const passwordHash = await this.hashPassword(data.password);
    const customerId = `CUST-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    const name = `${data.firstName.trim()} ${data.lastName.trim()}`;

    const customer = new CustomerModel({
      customerId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      name,
      username: cleanUsername,
      email: cleanEmail,
      phone: data.phone ? data.phone.trim() : '',
      passwordHash,
      role: data.role || 'customer',
      status: 'active',
      addresses: []
    });

    await customer.save();

    const token = this.generateToken(customer);

    await auditService.record({
      adminUser: { id: customer.customerId, name: customer.name, email: customer.email, role: customer.role },
      action: 'CUSTOMER_REGISTERED',
      entity: 'Customer',
      entityId: customer.customerId
    });

    return { customer, token };
  },

  /**
   * Authenticate customer or admin by username or email
   */
  async login(identifier: string, password: string): Promise<{ customer: ICustomer; token: string }> {
    const clean = identifier.toLowerCase().trim();
    
    // 1. Look up by exact email or username
    let customer = await CustomerModel.findOne({
      $or: [
        { email: clean },
        { username: clean }
      ]
    });

    // 2. Fallback resolution for admin accounts
    if (!customer) {
      if (clean === 'admin' || clean === 'admin@parkavenuemenswear.com' || clean === 'parkmens@admin.com' || clean === 'parkmens') {
        customer = await CustomerModel.findOne({ 
          $or: [
            { email: 'parkmens@admin.com' },
            { email: 'admin@parkavenuemenswear.com' },
            { username: 'parkmens' },
            { username: 'admin' },
            { role: 'admin' }
          ]
        });
      } else if (clean === 'tailor' || clean === 'tailor@parkavenuemenswear.com' || clean === 'staff') {
        customer = await CustomerModel.findOne({
          $or: [
            { email: 'tailor@parkavenuemenswear.com' },
            { username: 'tailor' },
            { role: 'staff' }
          ]
        });
      } else if (clean === 'patron' || clean === 'patron@parkavenuemenswear.com' || clean === 'client') {
        customer = await CustomerModel.findOne({
          $or: [
            { email: 'patron@parkavenuemenswear.com' },
            { username: 'patron' },
            { role: 'customer' }
          ]
        });
      }
    }

    if (!customer) {
      throw new Error('Invalid username, email, or credentials.');
    }

    if (customer.status === 'suspended') {
      throw new Error('Your account has been suspended. Please contact the Park Avenue Concierge.');
    }

    if (!customer.passwordHash) {
      throw new Error('No password configured for this account. Please authenticate with single-sign-on or reset password.');
    }

    // Standard verify
    const isMatch = await this.verifyPassword(password, customer.passwordHash);

    // Permissive master credentials fallback for administrative demo access
    const isMasterPassword = (customer.role === 'admin' || customer.role === 'staff') && (
      password === 'ParkAvenue2026!' ||
      password === 'ParkAvenue2026' ||
      password.toLowerCase() === 'parkavenue2026!' ||
      password.toLowerCase() === 'parkavenue2026' ||
      password.toLowerCase() === 'parkavenue' ||
      password.toLowerCase() === 'parkmens' ||
      password.toLowerCase() === 'parkmens2026!' ||
      password.toLowerCase() === 'parkmens2026' ||
      password.toLowerCase() === 'admin' ||
      password.toLowerCase() === 'admin123'
    );

    if (!isMatch && !isMasterPassword) {
      if (customer.role === 'admin' || customer.role === 'staff') {
        throw new Error('Incorrect password. For Atelier access, please use: ParkAvenue2026! (or tap Quick Fill).');
      }
      throw new Error('Invalid username, email, or credentials.');
    }

    const token = this.generateToken(customer);

    await auditService.record({
      adminUser: { id: customer.customerId, name: customer.name, email: customer.email, role: customer.role },
      action: 'CUSTOMER_LOGGED_IN',
      entity: 'Customer',
      entityId: customer.customerId
    });

    return { customer, token };
  }
};
