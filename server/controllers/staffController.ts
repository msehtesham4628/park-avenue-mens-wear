import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { staffService } from '../services/staffService.js';

export const staffController = {
  /**
   * GET /api/staff (List all staff members)
   */
  async getStaff(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, status, role } = req.query;
      const staff = await staffService.getAllStaff({
        search: search as string,
        status: status as string,
        role: role as string
      });

      return res.status(200).json({
        success: true,
        data: staff,
        count: staff.length
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve staff records from MongoDB.'
      });
    }
  },

  /**
   * POST /api/staff (Create new staff member)
   */
  async createStaff(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        firstName,
        lastName,
        email,
        username,
        password,
        phone,
        role,
        staffTitle,
        department,
        permissions,
        status
      } = req.body;

      if (!firstName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'First name, email, and security password are required.'
        });
      }

      const creator = req.user ? { id: req.user.id || req.user.customerId, name: req.user.name } : undefined;
      const created = await staffService.createStaff({
        firstName,
        lastName,
        email,
        username,
        password,
        phone,
        role,
        staffTitle,
        department,
        permissions,
        status
      }, creator);

      return res.status(201).json({
        success: true,
        data: created,
        message: `Staff member ${created.name} (${created.customerId}) successfully added to MongoDB.`
      });
    } catch (err: any) {
      let message = err?.message || 'Failed to onboard staff member.';
      let statusCode = 400;

      if (err?.code === 11000 || (err?.message && err.message.includes('E11000'))) {
        statusCode = 409;
        if (err.message.includes('email') || err?.keyPattern?.email) {
          message = 'An account with this email address is already registered.';
        } else if (err.message.includes('username') || err?.keyPattern?.username) {
          message = 'This username is already taken. Please choose another username.';
        } else if (err.message.includes('customerId') || err?.keyPattern?.customerId) {
          message = 'A staff identifier collision occurred. Please submit again.';
        } else {
          message = 'A record with duplicate details already exists in the database.';
        }
      }

      return res.status(statusCode).json({
        success: false,
        message
      });
    }
  },

  /**
   * PUT /api/staff/:id (Update staff member role, permissions, status, password)
   */
  async updateStaff(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const modifier = req.user ? { id: req.user.id || req.user.customerId, name: req.user.name } : undefined;
      const updated = await staffService.updateStaff(id, req.body, modifier);

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Staff member ${updated.name} updated successfully in MongoDB.`
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to update staff member.'
      });
    }
  },

  /**
   * PUT /api/staff/:id/password or POST /api/staff/:id/reset-password
   */
  async resetPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const passwordToSet = req.body.password || req.body.newPassword;

      if (!passwordToSet || typeof passwordToSet !== 'string' || passwordToSet.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters in length.'
        });
      }

      const modifier = req.user ? { id: req.user.id || req.user.customerId, name: req.user.name } : undefined;
      const updated = await staffService.resetStaffPassword(id, passwordToSet.trim(), modifier);

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Security password for ${updated.name} reset successfully.`
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to reset password.'
      });
    }
  },

  /**
   * DELETE /api/staff/:id (Remove staff member)
   */
  async deleteStaff(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const requesterId = req.user?.customerId || req.user?.id || req.user?.email;
      const result = await staffService.deleteStaff(id, requesterId);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to delete staff member.'
      });
    }
  },

  /**
   * GET /api/staff/permissions (Get all permission options and role presets)
   */
  async getPermissions(_req: AuthenticatedRequest, res: Response) {
    try {
      const definitions = await staffService.getPermissionDefinitions();
      return res.status(200).json({
        success: true,
        data: definitions
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to load permission definitions.'
      });
    }
  },

  /**
   * POST /api/staff/permissions (Create new custom permission in MongoDB)
   */
  async createPermission(req: AuthenticatedRequest, res: Response) {
    try {
      const { id, name, category, description } = req.body;
      const creator = req.user ? { id: req.user.id || req.user.customerId, name: req.user.name } : undefined;
      const created = await staffService.createPermission({ id, name, category, description }, creator);

      return res.status(201).json({
        success: true,
        data: created,
        message: `Permission '${created.name}' created in MongoDB.`
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to create permission.'
      });
    }
  },

  /**
   * DELETE /api/staff/permissions/:id (Delete custom permission from MongoDB)
   */
  async deletePermission(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const deleter = req.user ? { id: req.user.id || req.user.customerId, name: req.user.name } : undefined;
      const result = await staffService.deletePermission(id, deleter);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to delete permission.'
      });
    }
  },

  /**
   * GET /api/staff/roles (Get all staff roles from MongoDB)
   */
  async getRoles(_req: AuthenticatedRequest, res: Response) {
    try {
      const roles = await staffService.getAllRoles();
      return res.status(200).json({
        success: true,
        data: roles
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to load staff roles.'
      });
    }
  },

  /**
   * POST /api/staff/roles (Create custom staff role in MongoDB)
   */
  async createRole(req: AuthenticatedRequest, res: Response) {
    try {
      const creator = req.user ? { id: req.user.id || req.user.customerId, name: req.user.name } : undefined;
      const created = await staffService.createRole(req.body, creator);

      return res.status(201).json({
        success: true,
        data: created,
        message: `Role '${created.name}' created successfully in MongoDB.`
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to create role.'
      });
    }
  },

  /**
   * DELETE /api/staff/roles/:roleKey (Delete custom staff role from MongoDB)
   */
  async deleteRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { roleKey } = req.params;
      const deleter = req.user ? { id: req.user.id || req.user.customerId, name: req.user.name } : undefined;
      const result = await staffService.deleteRole(roleKey, deleter);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to delete role.'
      });
    }
  }
};
