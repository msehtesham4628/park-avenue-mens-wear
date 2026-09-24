import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { authService } from '../services/authService.js';
import { CustomerModel } from '../models/Customer.js';
import { customerService } from '../services/customerService.js';

export const authController = {
  async register(req: AuthenticatedRequest, res: Response) {
    try {
      const { 
        firstName, 
        fName, 
        lastName, 
        lName, 
        username, 
        email, 
        emailId, 
        phone, 
        password, 
        reEnterPassword,
        role 
      } = req.body;

      const effectiveFirstName = (fName || firstName || '').trim();
      const effectiveLastName = (lName || lastName || '').trim();
      const effectiveUsername = (username || '').trim();
      const effectiveEmail = (emailId || email || '').trim();
      const effectivePhone = (phone || '').trim();

      if (!effectiveFirstName || !effectiveLastName) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both F name and L name.'
        });
      }

      if (!effectiveUsername) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a Username.'
        });
      }

      if (!effectiveEmail) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid Email id.'
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a Password.'
        });
      }

      if (reEnterPassword !== undefined && password !== reEnterPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password and Re-enter password do not match.'
        });
      }

      if (password.length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 5 characters long.'
        });
      }

      // Logic: One caps, one special character, and one number
      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least one capital letter (A-Z).'
        });
      }

      if (!/[0-9]/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least one number (0-9).'
        });
      }

      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least one special character.'
        });
      }

      const { customer, token } = await authService.register({
        firstName: effectiveFirstName,
        lastName: effectiveLastName,
        username: effectiveUsername,
        email: effectiveEmail,
        phone: effectivePhone,
        password,
        role: role === 'admin' && req.user?.role === 'admin' ? 'admin' : 'customer'
      });

      const customerObj = customer.toObject();
      delete customerObj.passwordHash;

      return res.status(201).json({
        success: true,
        data: {
          customer: customerObj,
          token
        },
        message: 'Account successfully registered. Welcome to Park Avenue Mens Wear!'
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { identifier: bodyIdentifier, username, email, password } = req.body;
      const identifier = (bodyIdentifier || username || email || '').trim();

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide Username and Password.'
        });
      }

      const { customer, token } = await authService.login(identifier, password);

      const customerObj = customer.toObject();
      delete customerObj.passwordHash;

      return res.status(200).json({
        success: true,
        data: {
          customer: customerObj,
          token
        },
        message: 'Authentication successful. Welcome to Park Avenue Mens Wear!'
      });
    } catch (err: any) {
      return res.status(401).json({
        success: false,
        message: err.message
      });
    }
  },

  async logout(_req: AuthenticatedRequest, res: Response) {
    // JWT is stateless on client side; we return a confirmed response
    return res.status(200).json({
      success: true,
      data: null,
      message: 'Signed out successfully.'
    });
  },

  async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
      }

      const profile = await customerService.getCustomerProfile(req.user.customerId);
      if (!profile) {
        return res.status(404).json({ success: false, message: 'User profile not found.' });
      }

      const copy: any = { ...profile.customer };
      delete copy.passwordHash;

      return res.status(200).json({
        success: true,
        data: {
          customer: copy,
          orders: profile.orders,
          alterations: profile.alterations
        },
        message: 'Profile retrieved successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
