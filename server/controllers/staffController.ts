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
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to onboard staff member.'
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
