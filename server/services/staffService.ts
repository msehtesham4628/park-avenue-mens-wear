import { CustomerModel, ICustomer, CustomerRole, CustomerAccountStatus } from '../models/Customer.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { StaffRoleModel, StaffPermissionModel, IStaffRole, IStaffPermission } from '../models/StaffRole.js';
import { authService } from './authService.js';

export interface StaffPermissionDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  isSystem?: boolean;
}

export const SYSTEM_STAFF_PERMISSIONS: StaffPermissionDefinition[] = [
  // Orders
  { id: 'orders:view', name: 'View Orders', category: 'Orders', description: 'Review patron orders, consignment waybills, and history.', isSystem: true },
  { id: 'orders:manage', name: 'Manage Order Processing', category: 'Orders', description: 'Update order stages, tracking numbers, and shipping couriers.', isSystem: true },
  
  // Tailoring & Alterations
  { id: 'alterations:view', name: 'View Alteration Tickets', category: 'Tailoring & Alterations', description: 'Monitor salon fittings and tailoring ticket progress.', isSystem: true },
  { id: 'alterations:manage', name: 'Advance Tailoring Stages', category: 'Tailoring & Alterations', description: 'Chalk, pin, stitch, assign benches, and update completion dates.', isSystem: true },
  
  // Inventory
  { id: 'inventory:view', name: 'View Inventory Levels', category: 'Inventory', description: 'Inspect stock quantity across garment sizing variants.', isSystem: true },
  { id: 'inventory:manage', name: 'Adjust Stock & Audits', category: 'Inventory', description: 'Manually increment/decrement stock and record ledger reasons.', isSystem: true },
  
  // Garments & Catalog
  { id: 'products:view', name: 'View Product Master', category: 'Garments & Catalog', description: 'Access garment specifications, fabrication details, and pricing.', isSystem: true },
  { id: 'products:manage', name: 'Edit & Create Garments', category: 'Garments & Catalog', description: 'Publish new bespoke models, modify SKU prices, and edit imagery.', isSystem: true },
  
  // Returns & Exchanges
  { id: 'returns:manage', name: 'Process Returns & Claims', category: 'Orders', description: 'Inspect received claims, approve labels, and mark exchanges.', isSystem: true },
  
  // Clients
  { id: 'customers:view', name: 'View Client Profiles', category: 'Clients', description: 'Access patron measurement archives and verified dispatch addresses.', isSystem: true },
  
  // ERP & Financials
  { id: 'erp:access', name: 'Excel & Tally ERP Access', category: 'ERP & Reports', description: 'Export sales reports, inventory Excel ledgers, and Tally XML.', isSystem: true },
  
  // Staff & Administration
  { id: 'staff:manage', name: 'Staff Management', category: 'Staff & Security', description: 'Add, update roles, edit permissions, and remove atelier staff.', isSystem: true }
];

export const SYSTEM_ROLE_PRESETS: Array<{
  roleKey: string;
  name: string;
  description: string;
  department: string;
  staffTitle: string;
  baseRole: 'staff' | 'admin';
  permissions: string[];
  isSystem: boolean;
}> = [
  {
    roleKey: 'admin',
    name: 'Executive Administrator',
    description: 'Complete operational clearance across all ateliers, financial exports, and staff access control.',
    department: 'Executive Administration',
    staffTitle: 'Executive Administrator',
    baseRole: 'admin',
    permissions: SYSTEM_STAFF_PERMISSIONS.map(p => p.id),
    isSystem: true
  },
  {
    roleKey: 'master_tailor',
    name: 'Master Tailor',
    description: 'Oversees salon bespoke alterations, fittings, garment construction, and client measurements.',
    department: 'Tailoring & Alterations',
    staffTitle: 'Master Tailor & Cutter',
    baseRole: 'staff',
    permissions: ['alterations:view', 'alterations:manage', 'orders:view', 'products:view', 'customers:view'],
    isSystem: true
  },
  {
    roleKey: 'atelier_fitter',
    name: 'Atelier Fitter',
    description: 'Handles client garment fitting appointments, pins garments, and records alterations tickets.',
    department: 'Fitting Salon',
    staffTitle: 'Atelier Fitter',
    baseRole: 'staff',
    permissions: ['alterations:view', 'alterations:manage', 'orders:view'],
    isSystem: true
  },
  {
    roleKey: 'inventory_manager',
    name: 'Inventory Manager',
    description: 'Monitors raw fabric bolt reserves, ready-to-wear sizing matrices, and warehouse replenishments.',
    department: 'Inventory & Warehouse',
    staffTitle: 'Inventory Operations Specialist',
    baseRole: 'staff',
    permissions: ['inventory:view', 'inventory:manage', 'products:view', 'products:manage', 'orders:view', 'returns:manage', 'erp:access'],
    isSystem: true
  },
  {
    roleKey: 'order_clerk',
    name: 'Order Concierge Clerk',
    description: 'Processes online patron checkouts, tracks shipping couriers, and handles returns.',
    department: 'Customer Operations',
    staffTitle: 'Concierge Order Specialist',
    baseRole: 'staff',
    permissions: ['orders:view', 'orders:manage', 'returns:manage', 'customers:view', 'alterations:view'],
    isSystem: true
  },
  {
    roleKey: 'staff',
    name: 'Staff Artisan',
    description: 'General workshop access for tracking active orders, tailoring benches, and stock levels.',
    department: 'Atelier Workshop',
    staffTitle: 'Staff Tailor',
    baseRole: 'staff',
    permissions: ['orders:view', 'alterations:view', 'inventory:view'],
    isSystem: true
  }
];

export const staffService = {
  /**
   * Initialize or seed default roles and permissions in MongoDB
   */
  async ensureSeeded() {
    try {
      // Seed permissions
      const permCount = await StaffPermissionModel.countDocuments();
      if (permCount === 0) {
        for (const p of SYSTEM_STAFF_PERMISSIONS) {
          await StaffPermissionModel.updateOne(
            { permissionId: p.id },
            { $set: { permissionId: p.id, name: p.name, category: p.category, description: p.description, isSystem: true } },
            { upsert: true }
          );
        }
      }

      // Seed roles
      const roleCount = await StaffRoleModel.countDocuments();
      if (roleCount === 0) {
        for (const r of SYSTEM_ROLE_PRESETS) {
          await StaffRoleModel.updateOne(
            { roleKey: r.roleKey },
            { $set: { ...r } },
            { upsert: true }
          );
        }
      }
    } catch {
      // Non-blocking if DB not connected yet
    }
  },

  /**
   * List all staff members and administrators from MongoDB
   */
  async getAllStaff(query: { search?: string; status?: string; role?: string } = {}) {
    await this.ensureSeeded();

    const filter: any = {
      role: { $in: ['staff', 'admin'] }
    };

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    if (query.role && query.role !== 'all') {
      filter.role = query.role;
    }

    if (query.search) {
      const s = query.search.trim();
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { username: { $regex: s, $options: 'i' } },
        { staffTitle: { $regex: s, $options: 'i' } },
        { department: { $regex: s, $options: 'i' } }
      ];
    }

    const docs = await CustomerModel.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc: any) => ({
      id: doc.customerId || doc._id.toString(),
      customerId: doc.customerId || doc._id.toString(),
      _id: doc._id.toString(),
      name: doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
      firstName: doc.firstName || '',
      lastName: doc.lastName || '',
      username: doc.username || '',
      email: doc.email,
      phone: doc.phone || '',
      role: doc.role,
      staffTitle: doc.staffTitle || (doc.role === 'admin' ? 'Executive Administrator' : 'Atelier Staff Tailor'),
      department: doc.department || (doc.role === 'admin' ? 'Executive Administration' : 'Master Tailoring & Fittings'),
      permissions: Array.isArray(doc.permissions) && doc.permissions.length > 0 
        ? doc.permissions 
        : (doc.role === 'admin' ? SYSTEM_STAFF_PERMISSIONS.map(p => p.id) : ['orders:view', 'alterations:view', 'inventory:view']),
      status: doc.status || 'active',
      createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString()
    }));
  },

  /**
   * Create a new staff member with hashed password and permissions in MongoDB
   */
  async createStaff(data: {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    password: string;
    phone?: string;
    role?: CustomerRole;
    staffTitle?: string;
    department?: string;
    permissions?: string[];
    status?: CustomerAccountStatus;
  }, creator?: { id: string; name: string }) {
    await this.ensureSeeded();

    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanEmail || !data.password || !data.firstName) {
      throw new Error('First name, email, and password are required to onboard a staff member.');
    }

    const existing = await CustomerModel.findOne({ email: cleanEmail });
    if (existing) {
      throw new Error(`An account with email ${cleanEmail} is already registered.`);
    }

    const passwordHash = await authService.hashPassword(data.password);
    const count = await CustomerModel.countDocuments();
    const staffId = `STF-${String(count + 101).padStart(4, '0')}`;
    const fullName = `${data.firstName.trim()} ${data.lastName?.trim() || ''}`.trim();
    const role: CustomerRole = data.role === 'admin' ? 'admin' : 'staff';
    const permissions = data.permissions && data.permissions.length > 0 
      ? data.permissions 
      : (role === 'admin' ? SYSTEM_STAFF_PERMISSIONS.map(p => p.id) : ['orders:view', 'alterations:view', 'inventory:view']);

    const doc = await CustomerModel.create({
      customerId: staffId,
      firstName: data.firstName.trim(),
      lastName: (data.lastName || '').trim(),
      name: fullName,
      username: (data.username || data.email.split('@')[0]).toLowerCase().trim(),
      email: cleanEmail,
      phone: (data.phone || '+1 (800) 555-7276').trim(),
      passwordHash,
      role,
      status: data.status || 'active',
      staffTitle: (data.staffTitle || (role === 'admin' ? 'Executive Administrator' : 'Staff Artisan')).trim(),
      department: (data.department || (role === 'admin' ? 'Executive Administration' : 'Tailoring & Atelier')).trim(),
      permissions,
      addresses: []
    });

    // Record audit log entry
    try {
      await AuditLogModel.create({
        action: 'CREATE_STAFF_MEMBER',
        userId: creator?.id || 'SYSTEM_ADMIN',
        userName: creator?.name || 'Administrator',
        userRole: 'admin',
        targetType: 'STAFF',
        targetId: staffId,
        details: {
          staffName: fullName,
          email: cleanEmail,
          role,
          staffTitle: doc.staffTitle,
          permissionsCount: permissions.length
        }
      });
    } catch {
      // audit log failure should not block creation
    }

    const resObj = doc.toObject();
    delete resObj.passwordHash;
    return {
      ...resObj,
      id: doc.customerId
    };
  },

  /**
   * Update staff member permissions, role, title, or reset password in MongoDB
   */
  async updateStaff(id: string, data: {
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    role?: CustomerRole;
    staffTitle?: string;
    department?: string;
    permissions?: string[];
    status?: CustomerAccountStatus;
    password?: string;
  }, modifier?: { id: string; name: string }) {
    await this.ensureSeeded();

    const staff = await CustomerModel.findOne({
      $or: [
        { customerId: id },
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }
      ]
    });

    if (!staff) {
      throw new Error(`Staff member ${id} not found in database.`);
    }

    if (data.firstName !== undefined) staff.firstName = data.firstName.trim();
    if (data.lastName !== undefined) staff.lastName = data.lastName.trim();
    if (data.name !== undefined) {
      staff.name = data.name.trim();
    } else if (data.firstName !== undefined || data.lastName !== undefined) {
      staff.name = `${staff.firstName} ${staff.lastName}`.trim();
    }
    if (data.phone !== undefined) staff.phone = data.phone.trim();
    if (data.role !== undefined) staff.role = data.role;
    if (data.staffTitle !== undefined) staff.staffTitle = data.staffTitle.trim();
    if (data.department !== undefined) staff.department = data.department.trim();
    if (data.status !== undefined) staff.status = data.status;
    if (Array.isArray(data.permissions)) staff.permissions = data.permissions;

    if (data.password && data.password.trim().length >= 6) {
      staff.passwordHash = await authService.hashPassword(data.password.trim());
    }

    await staff.save();

    // Record audit log entry
    try {
      await AuditLogModel.create({
        action: 'UPDATE_STAFF_MEMBER',
        userId: modifier?.id || 'SYSTEM_ADMIN',
        userName: modifier?.name || 'Administrator',
        userRole: 'admin',
        targetType: 'STAFF',
        targetId: staff.customerId,
        details: {
          staffName: staff.name,
          email: staff.email,
          role: staff.role,
          status: staff.status,
          permissionsCount: staff.permissions?.length || 0,
          passwordReset: Boolean(data.password)
        }
      });
    } catch {
      // audit log failure non-blocking
    }

    const resObj = staff.toObject();
    delete resObj.passwordHash;
    return {
      ...resObj,
      id: staff.customerId
    };
  },

  /**
   * Delete staff member from MongoDB
   */
  async deleteStaff(id: string, requesterId?: string) {
    await this.ensureSeeded();

    const staff = await CustomerModel.findOne({
      $or: [
        { customerId: id },
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }
      ]
    });

    if (!staff) {
      throw new Error(`Staff member ${id} not found in database.`);
    }

    // Safety checks
    if (requesterId && (staff.customerId === requesterId || staff.email === requesterId)) {
      throw new Error('Self-deletion restricted: You cannot delete your own active administrator account.');
    }

    if (staff.role === 'admin') {
      const adminCount = await CustomerModel.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        throw new Error('Security policy: You cannot delete the sole remaining administrator account.');
      }
    }

    await CustomerModel.deleteOne({ _id: staff._id });

    // Record audit log entry
    try {
      await AuditLogModel.create({
        action: 'DELETE_STAFF_MEMBER',
        userId: requesterId || 'SYSTEM_ADMIN',
        userName: 'Administrator',
        userRole: 'admin',
        targetType: 'STAFF',
        targetId: staff.customerId,
        details: {
          staffName: staff.name,
          email: staff.email,
          role: staff.role
        }
      });
    } catch {
      // audit log failure non-blocking
    }

    return {
      success: true,
      message: `Staff member ${staff.name} (${staff.customerId}) was deleted permanently from MongoDB.`
    };
  },

  /**
   * Get all permission definitions (System + MongoDB custom)
   */
  async getAllPermissions(): Promise<StaffPermissionDefinition[]> {
    await this.ensureSeeded();

    try {
      const customDocs = await StaffPermissionModel.find().lean();
      if (!customDocs || customDocs.length === 0) {
        return SYSTEM_STAFF_PERMISSIONS;
      }
      return customDocs.map((d: any) => ({
        id: d.permissionId,
        name: d.name,
        category: d.category,
        description: d.description || '',
        isSystem: Boolean(d.isSystem)
      }));
    } catch {
      return SYSTEM_STAFF_PERMISSIONS;
    }
  },

  /**
   * Create a new custom permission in MongoDB
   */
  async createPermission(data: { id: string; name: string; category: string; description?: string }, creator?: { id: string; name: string }) {
    await this.ensureSeeded();

    const cleanId = data.id.trim().toLowerCase().replace(/\s+/g, ':');
    if (!cleanId || !data.name.trim() || !data.category.trim()) {
      throw new Error('Permission ID, Name, and Category are required.');
    }

    const existing = await StaffPermissionModel.findOne({ permissionId: cleanId });
    if (existing) {
      throw new Error(`Permission '${cleanId}' already exists in MongoDB.`);
    }

    const doc = await StaffPermissionModel.create({
      permissionId: cleanId,
      name: data.name.trim(),
      category: data.category.trim(),
      description: (data.description || '').trim(),
      isSystem: false
    });

    try {
      await AuditLogModel.create({
        action: 'CREATE_STAFF_PERMISSION',
        userId: creator?.id || 'SYSTEM_ADMIN',
        userName: creator?.name || 'Administrator',
        userRole: 'admin',
        targetType: 'PERMISSION',
        targetId: cleanId,
        details: { permissionName: doc.name, category: doc.category }
      });
    } catch {
      // audit log failure non-blocking
    }

    return {
      id: doc.permissionId,
      name: doc.name,
      category: doc.category,
      description: doc.description,
      isSystem: false
    };
  },

  /**
   * Delete a custom permission from MongoDB
   */
  async deletePermission(id: string, deleter?: { id: string; name: string }) {
    await this.ensureSeeded();

    const perm = await StaffPermissionModel.findOne({ permissionId: id });
    if (!perm) {
      throw new Error(`Permission '${id}' not found.`);
    }

    if (perm.isSystem) {
      throw new Error(`System permission '${id}' cannot be deleted.`);
    }

    await StaffPermissionModel.deleteOne({ _id: perm._id });

    // Also remove from any staff members who had it assigned
    await CustomerModel.updateMany(
      { permissions: id },
      { $pull: { permissions: id } }
    );

    // Also remove from any custom roles
    await StaffRoleModel.updateMany(
      { permissions: id },
      { $pull: { permissions: id } }
    );

    try {
      await AuditLogModel.create({
        action: 'DELETE_STAFF_PERMISSION',
        userId: deleter?.id || 'SYSTEM_ADMIN',
        userName: deleter?.name || 'Administrator',
        userRole: 'admin',
        targetType: 'PERMISSION',
        targetId: id,
        details: { permissionName: perm.name }
      });
    } catch {
      // non-blocking
    }

    return {
      success: true,
      message: `Permission '${perm.name}' (${id}) removed from MongoDB.`
    };
  },

  /**
   * Get all staff roles (System presets + MongoDB custom)
   */
  async getAllRoles() {
    await this.ensureSeeded();

    try {
      const docs = await StaffRoleModel.find().sort({ isSystem: -1, createdAt: 1 }).lean();
      if (!docs || docs.length === 0) {
        return SYSTEM_ROLE_PRESETS;
      }
      return docs.map((d: any) => ({
        id: d.roleKey,
        roleKey: d.roleKey,
        name: d.name,
        description: d.description || '',
        department: d.department || 'Tailoring & Alterations',
        staffTitle: d.staffTitle || 'Staff Artisan',
        baseRole: d.baseRole || 'staff',
        permissions: d.permissions || [],
        isSystem: Boolean(d.isSystem)
      }));
    } catch {
      return SYSTEM_ROLE_PRESETS;
    }
  },

  /**
   * Create a new custom staff role in MongoDB
   */
  async createRole(data: {
    roleKey?: string;
    name: string;
    description?: string;
    department?: string;
    staffTitle?: string;
    baseRole?: 'staff' | 'admin';
    permissions?: string[];
  }, creator?: { id: string; name: string }) {
    await this.ensureSeeded();

    if (!data.name || !data.name.trim()) {
      throw new Error('Role name is required.');
    }

    const key = (data.roleKey || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')).trim();
    if (!key) {
      throw new Error('Valid role key is required.');
    }

    const existing = await StaffRoleModel.findOne({ roleKey: key });
    if (existing) {
      throw new Error(`Role key '${key}' already exists in MongoDB.`);
    }

    const doc = await StaffRoleModel.create({
      roleKey: key,
      name: data.name.trim(),
      description: (data.description || '').trim(),
      department: (data.department || 'Tailoring & Alterations').trim(),
      staffTitle: (data.staffTitle || data.name.trim()).trim(),
      baseRole: data.baseRole === 'admin' ? 'admin' : 'staff',
      permissions: Array.isArray(data.permissions) ? data.permissions : [],
      isSystem: false
    });

    try {
      await AuditLogModel.create({
        action: 'CREATE_STAFF_ROLE',
        userId: creator?.id || 'SYSTEM_ADMIN',
        userName: creator?.name || 'Administrator',
        userRole: 'admin',
        targetType: 'ROLE',
        targetId: key,
        details: { roleName: doc.name, permissionsCount: doc.permissions.length }
      });
    } catch {
      // non-blocking
    }

    return {
      id: doc.roleKey,
      roleKey: doc.roleKey,
      name: doc.name,
      description: doc.description,
      department: doc.department,
      staffTitle: doc.staffTitle,
      baseRole: doc.baseRole,
      permissions: doc.permissions,
      isSystem: false
    };
  },

  /**
   * Delete a custom staff role from MongoDB
   */
  async deleteRole(roleKey: string, deleter?: { id: string; name: string }) {
    await this.ensureSeeded();

    const role = await StaffRoleModel.findOne({ roleKey });
    if (!role) {
      throw new Error(`Role '${roleKey}' not found.`);
    }

    if (role.isSystem) {
      throw new Error(`System role '${roleKey}' cannot be deleted.`);
    }

    await StaffRoleModel.deleteOne({ _id: role._id });

    try {
      await AuditLogModel.create({
        action: 'DELETE_STAFF_ROLE',
        userId: deleter?.id || 'SYSTEM_ADMIN',
        userName: deleter?.name || 'Administrator',
        userRole: 'admin',
        targetType: 'ROLE',
        targetId: roleKey,
        details: { roleName: role.name }
      });
    } catch {
      // non-blocking
    }

    return {
      success: true,
      message: `Role '${role.name}' (${roleKey}) deleted from MongoDB.`
    };
  },

  /**
   * Get all permission definitions and role templates
   */
  async getPermissionDefinitions() {
    await this.ensureSeeded();

    const [perms, roles] = await Promise.all([
      this.getAllPermissions(),
      this.getAllRoles()
    ]);

    const rolePresets: Record<string, string[]> = {};
    for (const r of roles) {
      rolePresets[r.roleKey] = r.permissions;
    }

    return {
      permissions: perms,
      rolePresets,
      roles
    };
  }
};
