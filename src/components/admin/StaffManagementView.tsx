import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  Scissors, 
  Package, 
  RotateCcw, 
  Lock, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertTriangle,
  KeyRound,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Building,
  Plus,
  Layers,
  Settings,
  ShieldAlert,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { StaffMember, StaffPermissionItem, StaffRoleItem } from '../../types';
import { StaffService } from '../../services/api';
import { useShop } from '../../context/ShopContext';

type ManagementSubTab = 'members' | 'roles' | 'permissions';

const DEFAULT_SYSTEM_ROLES: StaffRoleItem[] = [
  {
    id: 'admin',
    roleKey: 'admin',
    name: 'Executive Administrator',
    description: 'Complete operational clearance across all ateliers, financial exports, and staff access control.',
    department: 'Executive Administration',
    staffTitle: 'Executive Administrator',
    baseRole: 'admin',
    permissions: [
      'orders:view', 'orders:manage', 'alterations:view', 'alterations:manage',
      'inventory:view', 'inventory:manage', 'products:view', 'products:manage',
      'returns:manage', 'customers:view', 'erp:access', 'staff:manage'
    ],
    isSystem: true
  },
  {
    id: 'master-tailor',
    roleKey: 'master-tailor',
    name: 'Master Tailor & Fitter',
    description: 'Specialized bespoke fitting and alterations workflow execution and garment status updates.',
    department: 'Tailoring & Atelier',
    staffTitle: 'Master Tailor & Fitter',
    baseRole: 'staff',
    permissions: [
      'orders:view', 'alterations:view', 'alterations:manage',
      'inventory:view', 'products:view'
    ],
    isSystem: true
  },
  {
    id: 'inventory-lead',
    roleKey: 'inventory-lead',
    name: 'Inventory & Operations Lead',
    description: 'Warehouse stock counts, inventory adjustments, order shipment verification, and dispatch log management.',
    department: 'Inventory & Dispatch',
    staffTitle: 'Inventory Lead',
    baseRole: 'staff',
    permissions: [
      'orders:view', 'orders:manage', 'inventory:view', 'inventory:manage',
      'products:view', 'returns:manage'
    ],
    isSystem: true
  }
];

export const StaffManagementView: React.FC = () => {
  const { showToast, currentCustomer } = useShop();

  const [activeSubTab, setActiveSubTab] = useState<ManagementSubTab>('members');

  // Staff members state
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [permissionDefs, setPermissionDefs] = useState<StaffPermissionItem[]>([]);
  const [rolesList, setRolesList] = useState<StaffRoleItem[]>(DEFAULT_SYSTEM_ROLES);
  const [rolePresets, setRolePresets] = useState<Record<string, string[]>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Modals state
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isAddPermissionModalOpen, setIsAddPermissionModalOpen] = useState(false);

  // Dedicated Reset Password Modal state
  const [resetPasswordStaff, setResetPasswordStaff] = useState<StaffMember | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [confirmPasswordVal, setConfirmPasswordVal] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [showResetConfirmPass, setShowResetConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [copiedGenPassword, setCopiedGenPassword] = useState(false);
  const [showEditPass, setShowEditPass] = useState(false);

  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
  const [deletingRole, setDeletingRole] = useState<StaffRoleItem | null>(null);
  const [deletingPermission, setDeletingPermission] = useState<StaffPermissionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New staff form state
  const [newStaffForm, setNewStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    role: 'staff' as 'staff' | 'admin',
    staffTitle: 'Staff Tailor',
    department: 'Tailoring & Alterations',
    permissions: [] as string[],
    status: 'active' as 'active' | 'suspended'
  });

  // Edit staff form state
  const [editStaffForm, setEditStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'staff' as 'staff' | 'admin',
    staffTitle: '',
    department: '',
    permissions: [] as string[],
    status: 'active' as 'active' | 'suspended',
    newPassword: '',
    confirmPassword: ''
  });

  // New Role form state
  const [newRoleForm, setNewRoleForm] = useState({
    roleKey: '',
    name: '',
    description: '',
    department: 'Tailoring & Alterations',
    staffTitle: 'Specialist Artisan',
    baseRole: 'staff' as 'staff' | 'admin',
    permissions: [] as string[]
  });

  // New Permission form state
  const [newPermissionForm, setNewPermissionForm] = useState({
    id: '',
    name: '',
    category: 'Tailoring & Alterations',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [members, permData, customRoles] = await Promise.all([
        StaffService.getAll().catch(() => []),
        StaffService.getPermissions().catch(() => ({ permissions: [], rolePresets: {}, roles: [] })),
        StaffService.getRoles().catch(() => [])
      ]);

      setStaffList(members || []);
      if (permData?.permissions && permData.permissions.length > 0) {
        setPermissionDefs(permData.permissions);
        setRolePresets(permData.rolePresets || {});
      }
      if (customRoles && customRoles.length > 0) {
        setRolesList(customRoles.map(r => ({
          ...r,
          permissions: Array.isArray(r.permissions) ? r.permissions : []
        })));
      } else if (permData?.roles && permData.roles.length > 0) {
        setRolesList(permData.roles.map(r => ({
          ...r,
          permissions: Array.isArray(r.permissions) ? r.permissions : []
        })));
      } else {
        setRolesList(DEFAULT_SYSTEM_ROLES);
      }
    } catch {
      showToast('Error loading staff directory and permissions from MongoDB.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Group permissions by category for clear UI presentation
  const groupedPermissions = useMemo(() => {
    const map: Record<string, StaffPermissionItem[]> = {};
    permissionDefs.forEach(p => {
      const cat = p.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, [permissionDefs]);

  // Unique categories list
  const availableCategories = useMemo(() => {
    const defaultCats = [
      'Orders',
      'Tailoring & Alterations',
      'Inventory',
      'Garments & Catalog',
      'Clients',
      'ERP & Reports',
      'Staff & Security'
    ];
    const customCats = Array.from(new Set(permissionDefs.map(p => p.category)));
    return Array.from(new Set([...defaultCats, ...customCats]));
  }, [permissionDefs]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      if (roleFilter !== 'all' && s.role !== roleFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (s.name || '').toLowerCase().includes(q);
        const matchesEmail = (s.email || '').toLowerCase().includes(q);
        const matchesTitle = (s.staffTitle || '').toLowerCase().includes(q);
        const matchesDept = (s.department || '').toLowerCase().includes(q);
        const matchesId = (s.customerId || s.id || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesTitle && !matchesDept && !matchesId) return false;
      }
      return true;
    });
  }, [staffList, roleFilter, statusFilter, searchQuery]);

  // Preset role selection helper
  const applyPresetToNewForm = (presetKey: string) => {
    const roleDef = rolesList.find(r => r.roleKey === presetKey);
    if (roleDef) {
      setNewStaffForm(prev => ({
        ...prev,
        role: roleDef.baseRole || 'staff',
        staffTitle: roleDef.staffTitle || roleDef.name,
        department: roleDef.department || 'Tailoring & Alterations',
        permissions: roleDef.permissions || []
      }));
      return;
    }

    if (presetKey === 'admin') {
      setNewStaffForm(prev => ({
        ...prev,
        role: 'admin',
        staffTitle: 'Executive Administrator',
        department: 'Executive Administration',
        permissions: permissionDefs.map(p => p.id)
      }));
    } else if (presetKey === 'master_tailor') {
      setNewStaffForm(prev => ({
        ...prev,
        role: 'staff',
        staffTitle: 'Master Tailor',
        department: 'Tailoring & Alterations',
        permissions: rolePresets.master_tailor || ['alterations:view', 'alterations:manage', 'orders:view', 'products:view']
      }));
    } else if (presetKey === 'atelier_fitter') {
      setNewStaffForm(prev => ({
        ...prev,
        role: 'staff',
        staffTitle: 'Atelier Fitter',
        department: 'Fitting Salon',
        permissions: rolePresets.atelier_fitter || ['alterations:view', 'alterations:manage', 'orders:view']
      }));
    } else if (presetKey === 'inventory_manager') {
      setNewStaffForm(prev => ({
        ...prev,
        role: 'staff',
        staffTitle: 'Inventory Specialist',
        department: 'Inventory & Warehouse',
        permissions: rolePresets.inventory_manager || ['inventory:view', 'inventory:manage', 'products:view', 'products:manage', 'orders:view', 'returns:manage']
      }));
    } else if (presetKey === 'order_clerk') {
      setNewStaffForm(prev => ({
        ...prev,
        role: 'staff',
        staffTitle: 'Order Concierge Clerk',
        department: 'Customer Operations',
        permissions: rolePresets.order_clerk || ['orders:view', 'orders:manage', 'returns:manage', 'customers:view']
      }));
    }
  };

  const applyPresetToEditForm = (presetKey: string) => {
    const roleDef = rolesList.find(r => r.roleKey === presetKey);
    if (roleDef) {
      setEditStaffForm(prev => ({
        ...prev,
        role: roleDef.baseRole || 'staff',
        staffTitle: roleDef.staffTitle || roleDef.name,
        department: roleDef.department || prev.department,
        permissions: roleDef.permissions || []
      }));
      return;
    }
    const perms = rolePresets[presetKey];
    if (perms) {
      setEditStaffForm(prev => ({
        ...prev,
        permissions: perms
      }));
    }
  };

  /* ----------------------------------------------------
   * Staff Member Handlers (Create, Update, Delete)
   * ---------------------------------------------------- */
  const handleCreateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.firstName.trim() || !newStaffForm.email.trim() || !newStaffForm.password) {
      showToast('First name, email, and password are required.', 'error');
      return;
    }
    if (newStaffForm.password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await StaffService.create({
        firstName: newStaffForm.firstName.trim(),
        lastName: newStaffForm.lastName.trim(),
        email: newStaffForm.email.trim().toLowerCase(),
        username: newStaffForm.username.trim() || undefined,
        password: newStaffForm.password,
        phone: newStaffForm.phone.trim(),
        role: newStaffForm.role,
        staffTitle: newStaffForm.staffTitle.trim(),
        department: newStaffForm.department.trim(),
        permissions: newStaffForm.permissions,
        status: newStaffForm.status
      });

      showToast(`Staff member ${created.name} (${created.customerId}) added to MongoDB!`, 'success');
      setStaffList(prev => [created, ...prev]);
      setIsAddStaffModalOpen(false);
      setNewStaffForm({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        phone: '',
        role: 'staff',
        staffTitle: 'Staff Tailor',
        department: 'Tailoring & Alterations',
        permissions: rolePresets.staff || ['orders:view', 'alterations:view', 'inventory:view'],
        status: 'active'
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to onboard staff member.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    const names = (staff.name || '').split(' ');
    setEditStaffForm({
      firstName: staff.firstName || names[0] || '',
      lastName: staff.lastName || names.slice(1).join(' ') || '',
      email: staff.email,
      phone: staff.phone || '',
      role: staff.role || 'staff',
      staffTitle: staff.staffTitle || '',
      department: staff.department || '',
      permissions: staff.permissions || [],
      status: (staff.status as any) || 'active',
      newPassword: '',
      confirmPassword: ''
    });
    setShowEditPass(false);
    setIsEditStaffModalOpen(true);
  };

  const handleUpdateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    if (editStaffForm.newPassword) {
      if (editStaffForm.newPassword.length < 6) {
        showToast('New password must be at least 6 characters.', 'error');
        return;
      }
      if (editStaffForm.newPassword !== editStaffForm.confirmPassword) {
        showToast('New passwords do not match. Please verify confirmation.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        firstName: editStaffForm.firstName.trim(),
        lastName: editStaffForm.lastName.trim(),
        name: `${editStaffForm.firstName.trim()} ${editStaffForm.lastName.trim()}`.trim(),
        phone: editStaffForm.phone.trim(),
        role: editStaffForm.role,
        staffTitle: editStaffForm.staffTitle.trim(),
        department: editStaffForm.department.trim(),
        permissions: editStaffForm.permissions || [],
        status: editStaffForm.status
      };
      if (editStaffForm.newPassword && editStaffForm.newPassword.trim().length >= 6) {
        payload.password = editStaffForm.newPassword.trim();
      }

      const updated = await StaffService.update(editingStaff.customerId || editingStaff.id, payload);
      showToast(`Updated credentials & permissions for ${updated.name} in MongoDB!`, 'success');
      setStaffList(prev => prev.map(s => (s.customerId === updated.customerId || s.id === updated.id) ? updated : s));
      setIsEditStaffModalOpen(false);
      setEditingStaff(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update staff member.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let pass = 'PA-';
    for (let i = 0; i < 9; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordVal(pass);
    setConfirmPasswordVal(pass);
    setPasswordError('');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pass);
      setCopiedGenPassword(true);
      setTimeout(() => setCopiedGenPassword(false), 2500);
      showToast('Generated secure password copied to clipboard!', 'info');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordStaff) return;

    if (!newPasswordVal || newPasswordVal.trim().length < 6) {
      setPasswordError('New password must be at least 6 characters in length.');
      return;
    }
    if (newPasswordVal.trim() !== confirmPasswordVal.trim()) {
      setPasswordError('Passwords do not match. Please verify confirmation.');
      return;
    }

    setIsSubmitting(true);
    setPasswordError('');
    try {
      const staffId = resetPasswordStaff.customerId || resetPasswordStaff.id;
      const updated = await StaffService.resetPassword(staffId, newPasswordVal.trim());
      showToast(`Password for ${updated.name || resetPasswordStaff.name} reset successfully in MongoDB!`, 'success');
      setResetPasswordStaff(null);
      setNewPasswordVal('');
      setConfirmPasswordVal('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to reset password.');
      showToast(err.message || 'Failed to reset password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaffConfirm = async () => {
    if (!deletingStaff) return;
    setIsSubmitting(true);
    try {
      const staffId = deletingStaff.customerId || deletingStaff.id;
      const ok = await StaffService.delete(staffId);
      if (ok) {
        showToast(`Staff member ${deletingStaff.name} removed from MongoDB.`, 'success');
        setStaffList(prev => prev.filter(s => s.customerId !== staffId && s.id !== staffId));
      } else {
        showToast('Failed to delete staff member.', 'error');
      }
      setDeletingStaff(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete staff member.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatusDirect = async (staff: StaffMember) => {
    const nextStatus = staff.status === 'active' ? 'suspended' : 'active';
    try {
      const staffId = staff.customerId || staff.id;
      const updated = await StaffService.update(staffId, { status: nextStatus });
      setStaffList(prev => prev.map(s => (s.customerId === staffId || s.id === staffId) ? updated : s));
      showToast(`Staff status updated to ${nextStatus.toUpperCase()} in MongoDB.`, 'info');
    } catch {
      showToast('Failed to toggle status.', 'error');
    }
  };

  /* ----------------------------------------------------
   * Custom Role Handlers (Create, Delete)
   * ---------------------------------------------------- */
  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) {
      showToast('Role name is required.', 'error');
      return;
    }

    const key = newRoleForm.roleKey.trim() || newRoleForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setIsSubmitting(true);
    try {
      const created = await StaffService.createRole({
        roleKey: key,
        name: newRoleForm.name.trim(),
        description: newRoleForm.description.trim(),
        department: newRoleForm.department.trim(),
        staffTitle: newRoleForm.staffTitle.trim(),
        baseRole: newRoleForm.baseRole,
        permissions: newRoleForm.permissions
      });

      showToast(`Custom role '${created.name}' saved to MongoDB!`, 'success');
      setRolesList(prev => [...prev, created]);
      setRolePresets(prev => ({ ...prev, [created.roleKey]: created.permissions }));
      setIsAddRoleModalOpen(false);
      setNewRoleForm({
        roleKey: '',
        name: '',
        description: '',
        department: 'Tailoring & Alterations',
        staffTitle: 'Specialist Artisan',
        baseRole: 'staff',
        permissions: []
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to create role.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoleConfirm = async () => {
    if (!deletingRole) return;
    setIsSubmitting(true);
    try {
      const ok = await StaffService.deleteRole(deletingRole.roleKey);
      if (ok) {
        showToast(`Role '${deletingRole.name}' deleted from MongoDB.`, 'success');
        setRolesList(prev => prev.filter(r => r.roleKey !== deletingRole.roleKey));
        setRolePresets(prev => {
          const next = { ...prev };
          delete next[deletingRole.roleKey];
          return next;
        });
      } else {
        showToast('Failed to delete role.', 'error');
      }
      setDeletingRole(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete role.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ----------------------------------------------------
   * Custom Permission Handlers (Create, Delete)
   * ---------------------------------------------------- */
  const handleCreatePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermissionForm.name.trim() || !newPermissionForm.category.trim()) {
      showToast('Permission name and category are required.', 'error');
      return;
    }

    const permId = newPermissionForm.id.trim() || `${newPermissionForm.category.toLowerCase().replace(/[^a-z0-9]+/g, '_')}:${newPermissionForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

    setIsSubmitting(true);
    try {
      const created = await StaffService.createPermission({
        id: permId,
        name: newPermissionForm.name.trim(),
        category: newPermissionForm.category.trim(),
        description: newPermissionForm.description.trim()
      });

      showToast(`Permission '${created.name}' created in MongoDB!`, 'success');
      setPermissionDefs(prev => [...prev, created]);
      setIsAddPermissionModalOpen(false);
      setNewPermissionForm({
        id: '',
        name: '',
        category: 'Tailoring & Alterations',
        description: ''
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to create permission.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePermissionConfirm = async () => {
    if (!deletingPermission) return;
    setIsSubmitting(true);
    try {
      const ok = await StaffService.deletePermission(deletingPermission.id);
      if (ok) {
        showToast(`Permission '${deletingPermission.name}' removed from MongoDB.`, 'success');
        setPermissionDefs(prev => prev.filter(p => p.id !== deletingPermission.id));
      } else {
        showToast('Failed to delete permission.', 'error');
      }
      setDeletingPermission(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete permission.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle permission helper for checklists
  const togglePermission = (list: string[], permId: string): string[] => {
    if (list.includes(permId)) {
      return list.filter(p => p !== permId);
    } else {
      return [...list, permId];
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
              ATELIER ACCESS &amp; RBAC CONTROL
            </span>
            <span className="text-[10px] font-mono text-gray-400">·</span>
            <span className="text-[10px] font-mono text-emerald-700 uppercase font-semibold">
              MongoDB Persistent
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] font-light">
            Staff &amp; Role Permissions Management
          </h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5 max-w-2xl leading-relaxed">
            Create authorized staff members, configure custom roles and granular permissions linked directly to MongoDB. Strict password authentication enforced with no one-tap bypass.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              applyPresetToNewForm('master_tailor');
              setIsAddStaffModalOpen(true);
            }}
            className="px-3.5 py-2 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer font-semibold shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-[#E5C384]" />
            <span>ADD STAFF MEMBER</span>
          </button>

          <button
            onClick={() => setIsAddRoleModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-[#111827] border border-gray-300 hover:border-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-[#936B34]" />
            <span>CREATE ROLE</span>
          </button>

          <button
            onClick={() => setIsAddPermissionModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-[#111827] border border-gray-300 hover:border-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
          >
            <Shield className="w-3.5 h-3.5 text-[#936B34]" />
            <span>CREATE PERMISSION</span>
          </button>
        </div>
      </div>

      {/* Security Compliance Notice */}
      <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-mono flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Security Protocol Enforced: One-tap login removed. All administrators and staff authenticate via salted bcrypt password hashes in MongoDB.
          </span>
        </div>
        <span className="text-[10px] text-amber-700 uppercase tracking-widest font-semibold shrink-0">
          RBAC LEVEL 3
        </span>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#FAF8F5] border border-gray-200 p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">
            TOTAL ATELIER STAFF
          </span>
          <div className="font-serif text-2xl sm:text-3xl text-[#111827]">
            {staffList.length}
          </div>
          <span className="text-[10px] font-mono text-[#936B34] block">
            Registered on MongoDB
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-gray-200 p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">
            ACTIVE ACCOUNTS
          </span>
          <div className="font-serif text-2xl sm:text-3xl text-[#111827]">
            {staffList.filter(s => s.status === 'active').length}
          </div>
          <span className="text-[10px] font-mono text-emerald-700 block">
            Cleared for console login
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-gray-200 p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">
            STAFF ROLES DEFINED
          </span>
          <div className="font-serif text-2xl sm:text-3xl text-[#111827]">
            {rolesList.length || Object.keys(rolePresets).length}
          </div>
          <span className="text-[10px] font-mono text-indigo-700 block">
            Custom presets &amp; templates
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-gray-200 p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">
            PERMISSIONS MATRIX
          </span>
          <div className="font-serif text-2xl sm:text-3xl text-[#111827]">
            {permissionDefs.length}
          </div>
          <span className="text-[10px] font-mono text-amber-700 block">
            Granular access controls
          </span>
        </div>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex border-b border-gray-200 gap-1 text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('members')}
          className={`py-2.5 px-4 font-semibold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'members'
              ? 'border-[#936B34] text-[#111827] bg-white'
              : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff Members ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`py-2.5 px-4 font-semibold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'roles'
              ? 'border-[#936B34] text-[#111827] bg-white'
              : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Staff Roles ({rolesList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('permissions')}
          className={`py-2.5 px-4 font-semibold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'permissions'
              ? 'border-[#936B34] text-[#111827] bg-white'
              : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Permissions Matrix ({permissionDefs.length})</span>
        </button>
      </div>

      {/* ----------------------------------------------------
       * SUBTAB 1: STAFF MEMBERS DIRECTORY
       * ---------------------------------------------------- */}
      {activeSubTab === 'members' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white border border-gray-200 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[240px] sm:min-w-[280px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff by name, email, department, or title..."
                  className="w-full bg-[#FAF8F5] border border-gray-300 pl-8 pr-3 py-1.5 text-xs text-[#111827] font-mono focus:border-[#936B34] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="bg-[#FAF8F5] border border-gray-300 px-3 py-1.5 text-xs font-mono text-[#111827] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="staff">Staff Members</option>
                  <option value="admin">Administrators</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-[#FAF8F5] border border-gray-300 px-3 py-1.5 text-xs font-mono text-[#111827] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] font-mono text-gray-500">
              Showing <span className="font-semibold text-[#111827]">{filteredStaff.length}</span> of {staffList.length} staff records
            </div>
          </div>

          {/* Staff Table / Directory */}
          <div className="border border-gray-200 bg-white overflow-hidden shadow-xs">
            {isLoading ? (
              <div className="p-12 text-center text-xs font-mono text-gray-500">
                Connecting to MongoDB and loading atelier staff directory...
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users className="w-8 h-8 text-gray-400 mx-auto" />
                <h3 className="font-serif text-xl text-[#111827]">No Staff Members Found</h3>
                <p className="text-xs text-gray-500 font-mono max-w-sm mx-auto">
                  No staff records match your current search or status filter. Click below to onboard a new staff member.
                </p>
                <button
                  onClick={() => {
                    applyPresetToNewForm('master_tailor');
                    setIsAddStaffModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Onboard Staff Member
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAF8F5] border-b border-gray-200 text-gray-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Role &amp; Title</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Permissions ({permissionDefs.length})</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStaff.map((staff) => {
                      const isCurrentLoggedUser = Boolean(
                        currentCustomer && 
                        (currentCustomer.email?.toLowerCase() === staff.email?.toLowerCase() ||
                         (currentCustomer as any).customerId === staff.customerId)
                      );

                      return (
                        <tr key={staff.customerId || staff.id} className="hover:bg-gray-50/70 transition-colors">
                          
                          {/* Name & Contact */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 flex items-center justify-center font-bold text-xs uppercase ${
                                staff.role === 'admin' ? 'bg-[#111827] text-[#D4AF37]' : 'bg-[#FAF8F5] text-[#936B34] border border-[#936B34]/30'
                              }`}>
                                {staff.name ? staff.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'ST'}
                              </div>
                              <div>
                                <div className="font-bold text-[#111827] flex items-center gap-1.5">
                                  <span>{staff.name}</span>
                                  {isCurrentLoggedUser && (
                                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] uppercase font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-500 font-normal flex items-center gap-2">
                                  <span>{staff.email}</span>
                                  {staff.phone && (
                                    <>
                                      <span>·</span>
                                      <span>{staff.phone}</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-[9px] text-gray-400">
                                  ID: {staff.customerId || staff.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role & Title */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider ${
                                staff.role === 'admin'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              }`}>
                                {staff.role === 'admin' ? 'ADMINISTRATOR' : 'STAFF MEMBER'}
                              </span>
                              <div className="text-gray-700 font-medium">
                                {staff.staffTitle || (staff.role === 'admin' ? 'Executive Administrator' : 'Staff Artisan')}
                              </div>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-3 px-4 text-gray-600">
                            {staff.department || 'Atelier Workshop'}
                          </td>

                          {/* Permissions Summary Badges */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900">
                                  {staff.permissions?.length || 0}
                                </span>
                                <span className="text-gray-400 text-[10px]">of {permissionDefs.length} granted</span>
                              </div>
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {(staff.permissions || []).slice(0, 3).map(p => (
                                  <span key={p} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[9px] border border-gray-200 truncate">
                                    {p.replace(':', ' ')}
                                  </span>
                                ))}
                                {(staff.permissions?.length || 0) > 3 && (
                                  <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[9px] border border-gray-200">
                                    +{(staff.permissions?.length || 0) - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleStatusDirect(staff)}
                              disabled={isCurrentLoggedUser}
                              title={isCurrentLoggedUser ? 'Cannot suspend own active session' : 'Click to toggle status'}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider cursor-pointer border ${
                                staff.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                              } ${isCurrentLoggedUser ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'active' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                              <span>{staff.status}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setResetPasswordStaff(staff);
                                  setNewPasswordVal('');
                                  setConfirmPasswordVal('');
                                  setPasswordError('');
                                  setShowResetPass(false);
                                  setShowResetConfirmPass(false);
                                }}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-mono tracking-wider transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                                title="Reset Security Password"
                              >
                                <Key className="w-3 h-3 text-[#936B34]" />
                                <span>Reset Password</span>
                              </button>

                              <button
                                onClick={() => openEditModal(staff)}
                                className="px-2.5 py-1.5 bg-white border border-gray-300 hover:border-[#936B34] text-gray-700 hover:text-[#936B34] text-[11px] font-mono tracking-wider transition-colors cursor-pointer flex items-center gap-1 font-medium"
                                title="Edit Role and Granular Permissions"
                              >
                                <Edit3 className="w-3 h-3 text-[#936B34]" />
                                <span>Edit Role &amp; Permissions</span>
                              </button>

                              {!isCurrentLoggedUser && (
                                <button
                                  onClick={() => setDeletingStaff(staff)}
                                  className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                                  title="Delete Staff Member from MongoDB"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * SUBTAB 2: ROLES & PRESETS MANAGEMENT
       * ---------------------------------------------------- */}
      {activeSubTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-mono">
              Staff roles group tailored permission packages to quickly onboard tailors, fitters, warehouse specialists, or administrators.
            </p>
            <button
              onClick={() => setIsAddRoleModalOpen(true)}
              className="px-3 py-1.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>CREATE CUSTOM ROLE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolesList.map(role => (
              <div key={role.roleKey} className="bg-white border border-gray-200 p-5 space-y-3 shadow-xs relative flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider ${
                          role.baseRole === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-indigo-50 text-indigo-800'
                        }`}>
                          {role.baseRole.toUpperCase()} CLEARANCE
                        </span>
                        {role.isSystem ? (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] uppercase font-mono">
                            SYSTEM
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] uppercase font-mono border border-emerald-200">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif text-lg text-[#111827] font-medium">
                        {role.name}
                      </h4>
                      <div className="text-[10px] font-mono text-gray-400">
                        Key: <code>{role.roleKey}</code>
                      </div>
                    </div>

                    {!role.isSystem && (
                      <button
                        onClick={() => setDeletingRole(role)}
                        className="text-gray-400 hover:text-red-700 p-1 cursor-pointer"
                        title="Delete custom role from MongoDB"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 font-sans mt-2 line-clamp-2">
                    {role.description || 'Custom atelier operational role.'}
                  </p>

                  <div className="mt-3 text-[11px] font-mono text-gray-600 space-y-0.5">
                    <div>Dept: <span className="font-semibold text-gray-800">{role.department || 'Atelier'}</span></div>
                    <div>Default Title: <span className="font-semibold text-gray-800">{role.staffTitle || role.name}</span></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-500">Granted Permissions:</span>
                    <span className="font-bold text-[#111827]">{(role.permissions || []).length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(role.permissions || []).slice(0, 4).map(p => (
                      <span key={p} className="px-1.5 py-0.5 bg-[#FAF8F5] text-gray-700 text-[9px] border border-gray-200 font-mono">
                        {p.split(':')[1] || p}
                      </span>
                    ))}
                    {(role.permissions || []).length > 4 && (
                      <span className="px-1.5 py-0.5 bg-gray-50 text-gray-400 text-[9px] font-mono">
                        +{(role.permissions || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * SUBTAB 3: PERMISSIONS MATRIX
       * ---------------------------------------------------- */}
      {activeSubTab === 'permissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-mono">
              Granular permission tags protecting specific endpoints, tailoring steps, inventory adjustments, and ERP ledger operations.
            </p>
            <button
              onClick={() => setIsAddPermissionModalOpen(true)}
              className="px-3 py-1.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>CREATE CUSTOM PERMISSION</span>
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, items]) => (
              <div key={category} className="bg-white border border-gray-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h4 className="font-serif text-base text-[#111827] flex items-center gap-2">
                    <span>{category}</span>
                    <span className="text-xs font-mono text-gray-400">({items.length} controls)</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(perm => (
                    <div key={perm.id} className="p-3 bg-[#FAF8F5] border border-gray-200 space-y-1 relative">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[#111827] text-xs font-mono block">
                          {perm.name}
                        </span>
                        {!perm.isSystem && (
                          <button
                            onClick={() => setDeletingPermission(perm)}
                            className="text-gray-400 hover:text-red-700 cursor-pointer p-0.5"
                            title="Delete custom permission from MongoDB"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <code className="text-[10px] text-[#936B34] font-mono block">
                        {perm.id}
                      </code>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                        {perm.description || 'Atelier operation clearance.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * MODAL: ONBOARD NEW STAFF MEMBER
       * ---------------------------------------------------- */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white border border-[#936B34] max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
                  MONGODB STAFF ONBOARDING
                </span>
                <h3 className="font-serif text-2xl text-[#111827]">
                  Onboard Atelier Staff Member
                </h3>
              </div>
              <button
                onClick={() => setIsAddStaffModalOpen(false)}
                className="text-gray-400 hover:text-black text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Role Preset Pills */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-2 font-medium">
                QUICK ROLE PRESET (AUTO-FILLS PERMISSIONS):
              </span>
              <div className="flex flex-wrap gap-2">
                {rolesList.map(preset => (
                  <button
                    key={preset.roleKey}
                    type="button"
                    onClick={() => applyPresetToNewForm(preset.roleKey)}
                    className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#FAF8F5] border border-gray-300 hover:border-[#936B34] hover:bg-[#111827] hover:text-white transition-colors cursor-pointer"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateStaffSubmit} className="space-y-5 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaffForm.firstName}
                    onChange={(e) => setNewStaffForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="e.g. Matteo"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newStaffForm.lastName}
                    onChange={(e) => setNewStaffForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="e.g. Bellini"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Staff Email (Login ID) *
                  </label>
                  <input
                    type="email"
                    required
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. matteo@parkavenuemenswear.com"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block uppercase text-[10px] text-gray-600 font-semibold">
                      Username (Optional)
                    </label>
                    <span className="text-[9px] font-mono text-gray-400">
                      Auto-generated & collision-safe if blank
                    </span>
                  </div>
                  <input
                    type="text"
                    value={newStaffForm.username}
                    onChange={(e) => setNewStaffForm(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') }))}
                    placeholder={newStaffForm.email ? newStaffForm.email.split('@')[0] : 'e.g. dev_01'}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Login Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    value={newStaffForm.password}
                    onChange={(e) => setNewStaffForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••••••"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Staff Title / Designation
                  </label>
                  <input
                    type="text"
                    value={newStaffForm.staffTitle}
                    onChange={(e) => setNewStaffForm(prev => ({ ...prev, staffTitle: e.target.value }))}
                    placeholder="e.g. Master Tailor &amp; Cutter"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newStaffForm.department}
                    onChange={(e) => setNewStaffForm(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="e.g. Tailoring &amp; Alterations"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. +1 (800) 555-7276"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Access Clearance Level
                  </label>
                  <select
                    value={newStaffForm.role}
                    onChange={(e) => {
                      const r = e.target.value as 'staff' | 'admin';
                      setNewStaffForm(prev => ({
                        ...prev,
                        role: r,
                        permissions: r === 'admin' ? permissionDefs.map(p => p.id) : prev.permissions
                      }));
                    }}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none cursor-pointer"
                  >
                    <option value="staff">Staff Member (Granular Permissions)</option>
                    <option value="admin">Administrator (Full Executive Clearance)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Checklist */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="uppercase text-[10px] text-gray-600 font-semibold block">
                    Assigned Granular Permissions ({(newStaffForm.permissions || []).length} of {(permissionDefs || []).length})
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setNewStaffForm(prev => ({ ...prev, permissions: permissionDefs.map(p => p.id) }))}
                      className="text-[#936B34] hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setNewStaffForm(prev => ({ ...prev, permissions: [] }))}
                      className="text-gray-400 hover:text-black cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-1 border border-gray-200 p-3 bg-[#FAF8F5]">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="space-y-1.5">
                      <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider pb-1 border-b border-gray-200">
                        {category}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map(p => {
                          const isChecked = newStaffForm.permissions.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`flex items-start gap-2 p-1.5 border transition-colors cursor-pointer text-[11px] ${
                                isChecked ? 'bg-white border-[#936B34] shadow-xs' : 'bg-transparent border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setNewStaffForm(prev => ({
                                    ...prev,
                                    permissions: togglePermission(prev.permissions, p.id)
                                  }));
                                }}
                                className="mt-0.5 accent-[#936B34]"
                              />
                              <div className="leading-tight">
                                <span className="font-semibold text-gray-900 block">{p.name}</span>
                                <span className="text-[9px] text-gray-500 font-mono">{p.id}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-mono uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to MongoDB...' : 'Onboard Staff Member'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * MODAL: EDIT STAFF ROLE & PERMISSIONS
       * ---------------------------------------------------- */}
      {isEditStaffModalOpen && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white border border-[#936B34] max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
                  STAFF PERMISSION &amp; ROLE OVERHAUL
                </span>
                <h3 className="font-serif text-2xl text-[#111827]">
                  Edit Staff: {editingStaff.name} ({editingStaff.customerId || editingStaff.id})
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditStaffModalOpen(false);
                  setEditingStaff(null);
                }}
                className="text-gray-400 hover:text-black text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Role Quick Preset Selector */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-2 font-medium">
                APPLY ROLE PRESET PERMISSIONS:
              </span>
              <div className="flex flex-wrap gap-2">
                {rolesList.map(preset => (
                  <button
                    key={preset.roleKey}
                    type="button"
                    onClick={() => applyPresetToEditForm(preset.roleKey)}
                    className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#FAF8F5] border border-gray-300 hover:border-[#936B34] hover:bg-[#111827] hover:text-white transition-colors cursor-pointer"
                  >
                    Set as {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleUpdateStaffSubmit} className="space-y-5 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffForm.firstName}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editStaffForm.lastName}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Email Address (Read-Only)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editStaffForm.email}
                    className="w-full bg-gray-100 border border-gray-300 p-2 text-xs text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editStaffForm.phone}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Staff Title / Designation
                  </label>
                  <input
                    type="text"
                    value={editStaffForm.staffTitle}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, staffTitle: e.target.value }))}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editStaffForm.department}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Role Clearance Level
                  </label>
                  <select
                    value={editStaffForm.role}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none cursor-pointer"
                  >
                    <option value="staff">Staff Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Account Status
                  </label>
                  <select
                    value={editStaffForm.status}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none cursor-pointer"
                  >
                    <option value="active">Active (Permitted to Log In)</option>
                    <option value="suspended">Suspended (Access Revoked)</option>
                  </select>
                </div>
              </div>

              {/* Password Reset Section */}
              <div className="p-4 bg-amber-50/60 border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-[11px] uppercase tracking-wider">
                    <Key className="w-3.5 h-3.5 text-[#936B34]" />
                    <span>Reset Staff Password (Optional)</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-mono">
                    Leave blank to retain current password
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[9px] text-gray-700 mb-1 font-semibold">
                      New Password (Min 6 Characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showEditPass ? "text" : "password"}
                        value={editStaffForm.newPassword}
                        onChange={(e) => setEditStaffForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className="w-full bg-white border border-gray-300 p-2 pr-8 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPass(prev => !prev)}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title={showEditPass ? "Hide password" : "Show password"}
                      >
                        {showEditPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase text-[9px] text-gray-700 mb-1 font-semibold">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showEditPass ? "text" : "password"}
                        value={editStaffForm.confirmPassword}
                        onChange={(e) => setEditStaffForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Re-enter new password"
                        className="w-full bg-white border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                {editStaffForm.newPassword && editStaffForm.newPassword.length < 6 && (
                  <p className="text-[10px] text-red-600 font-mono">Password must be at least 6 characters long.</p>
                )}
                {editStaffForm.newPassword && editStaffForm.confirmPassword && editStaffForm.newPassword !== editStaffForm.confirmPassword && (
                  <p className="text-[10px] text-red-600 font-mono">Passwords do not match.</p>
                )}
              </div>

              {/* Granular Permissions Checklist */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="uppercase text-[10px] text-gray-600 font-semibold block">
                    Granular Permissions ({(editStaffForm.permissions || []).length} of {(permissionDefs || []).length})
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setEditStaffForm(prev => ({ ...prev, permissions: permissionDefs.map(p => p.id) }))}
                      className="text-[#936B34] hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setEditStaffForm(prev => ({ ...prev, permissions: [] }))}
                      className="text-gray-400 hover:text-black cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-1 border border-gray-200 p-3 bg-[#FAF8F5]">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="space-y-1.5">
                      <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider pb-1 border-b border-gray-200">
                        {category}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map(p => {
                          const isChecked = editStaffForm.permissions.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`flex items-start gap-2 p-1.5 border transition-colors cursor-pointer text-[11px] ${
                                isChecked ? 'bg-white border-[#936B34] shadow-xs' : 'bg-transparent border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setEditStaffForm(prev => ({
                                    ...prev,
                                    permissions: togglePermission(prev.permissions, p.id)
                                  }));
                                }}
                                className="mt-0.5 accent-[#936B34]"
                              />
                              <div className="leading-tight">
                                <span className="font-semibold text-gray-900 block">{p.name}</span>
                                <span className="text-[9px] text-gray-500 font-mono">{p.id}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditStaffModalOpen(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-mono uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating MongoDB...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * MODAL: CREATE CUSTOM ROLE
       * ---------------------------------------------------- */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white border border-[#936B34] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
                  MONGODB ROLE CREATOR
                </span>
                <h3 className="font-serif text-2xl text-[#111827]">
                  Create Staff Role
                </h3>
              </div>
              <button
                onClick={() => setIsAddRoleModalOpen(false)}
                className="text-gray-400 hover:text-black text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleForm.name}
                    onChange={(e) => setNewRoleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Bespoke Stylist"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Role Key (slug / identifier)
                  </label>
                  <input
                    type="text"
                    value={newRoleForm.roleKey}
                    onChange={(e) => setNewRoleForm(prev => ({ ...prev, roleKey: e.target.value }))}
                    placeholder="e.g. bespoke_stylist (auto-generated if empty)"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newRoleForm.department}
                    onChange={(e) => setNewRoleForm(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="e.g. Client Fittings Salon"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                    Default Staff Title
                  </label>
                  <input
                    type="text"
                    value={newRoleForm.staffTitle}
                    onChange={(e) => setNewRoleForm(prev => ({ ...prev, staffTitle: e.target.value }))}
                    placeholder="e.g. Senior Bespoke Stylist"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                  Role Description
                </label>
                <textarea
                  rows={2}
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe operational responsibilities for this role..."
                  className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                />
              </div>

              {/* Permissions Checklist for Role */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="uppercase text-[10px] text-gray-600 font-semibold block">
                    Permissions Included in Role ({(newRoleForm.permissions || []).length} selected)
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setNewRoleForm(prev => ({ ...prev, permissions: permissionDefs.map(p => p.id) }))}
                      className="text-[#936B34] hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setNewRoleForm(prev => ({ ...prev, permissions: [] }))}
                      className="text-gray-400 hover:text-black cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-52 overflow-y-auto pr-1 border border-gray-200 p-3 bg-[#FAF8F5]">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="space-y-1">
                      <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                        {category}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {perms.map(p => {
                          const isChecked = newRoleForm.permissions.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`flex items-start gap-2 p-1 border cursor-pointer text-[10px] ${
                                isChecked ? 'bg-white border-[#936B34]' : 'bg-transparent border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setNewRoleForm(prev => ({
                                    ...prev,
                                    permissions: togglePermission(prev.permissions, p.id)
                                  }));
                                }}
                                className="mt-0.5 accent-[#936B34]"
                              />
                              <div className="leading-tight">
                                <span className="font-semibold text-gray-800">{p.name}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-mono uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating in MongoDB...' : 'Save Role to MongoDB'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * MODAL: CREATE CUSTOM PERMISSION
       * ---------------------------------------------------- */}
      {isAddPermissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#936B34] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
                  MONGODB PERMISSION CREATOR
                </span>
                <h3 className="font-serif text-2xl text-[#111827]">
                  Create Granular Permission
                </h3>
              </div>
              <button
                onClick={() => setIsAddPermissionModalOpen(false)}
                className="text-gray-400 hover:text-black text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePermissionSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                  Permission Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPermissionForm.name}
                  onChange={(e) => setNewPermissionForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Export VIP Fitting Measurement Sheet"
                  className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                  Permission Identifier / Key (optional, auto-generated)
                </label>
                <input
                  type="text"
                  value={newPermissionForm.id}
                  onChange={(e) => setNewPermissionForm(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="e.g. alterations:export_measurements"
                  className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                  Category *
                </label>
                <select
                  value={newPermissionForm.category}
                  onChange={(e) => setNewPermissionForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none cursor-pointer"
                >
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Custom Operations">Custom Operations</option>
                  <option value="VIP Client Relations">VIP Client Relations</option>
                  <option value="Fabric & Mill Logistics">Fabric &amp; Mill Logistics</option>
                </select>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newPermissionForm.description}
                  onChange={(e) => setNewPermissionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What operations does this permission allow?"
                  className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddPermissionModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-mono uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Create Permission'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * MODAL: CONFIRM DELETE STAFF MEMBER
       * ---------------------------------------------------- */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-red-300 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-xl text-[#111827]">
                Remove Staff Member from MongoDB?
              </h3>
            </div>

            <p className="text-xs text-gray-600 font-mono leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-[#111827]">{deletingStaff.name}</span> ({deletingStaff.email}) from MongoDB? All access permissions and authentication credentials will be revoked immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteStaffConfirm}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white uppercase font-semibold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete from MongoDB'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * MODAL: CONFIRM DELETE ROLE
       * ---------------------------------------------------- */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-red-300 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-xl text-[#111827]">
                Delete Custom Role?
              </h3>
            </div>

            <p className="text-xs text-gray-600 font-mono leading-relaxed">
              Are you sure you want to delete custom role <span className="font-bold text-[#111827]">{deletingRole.name}</span> (<code>{deletingRole.roleKey}</code>) from MongoDB?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteRoleConfirm}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white uppercase font-semibold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * MODAL: CONFIRM DELETE PERMISSION
       * ---------------------------------------------------- */}
      {deletingPermission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-red-300 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-xl text-[#111827]">
                Delete Custom Permission?
              </h3>
            </div>

            <p className="text-xs text-gray-600 font-mono leading-relaxed">
              Are you sure you want to delete custom permission <span className="font-bold text-[#111827]">{deletingPermission.name}</span> (<code>{deletingPermission.id}</code>) from MongoDB? It will be removed from all staff and role definitions.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDeletingPermission(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeletePermissionConfirm}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white uppercase font-semibold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Permission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * MODAL: DEDICATED RESET PASSWORD FOR STAFF MEMBER
       * ---------------------------------------------------- */}
      {resetPasswordStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#936B34] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => {
                setResetPasswordStaff(null);
                setPasswordError('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#111827] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[9px] uppercase font-bold tracking-wider font-mono">
                  CREDENTIAL RESET
                </span>
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                  {resetPasswordStaff.role} CLEARANCE
                </span>
              </div>
              <h3 className="font-serif text-2xl text-[#111827]">
                Reset Staff Password
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-1">
                Assign a new authentication password for <span className="font-semibold text-gray-900">{resetPasswordStaff.name}</span> ({resetPasswordStaff.email}).
              </p>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showResetPass ? 'text' : 'password'}
                    required
                    value={newPasswordVal}
                    onChange={(e) => {
                      setNewPasswordVal(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2.5 pr-10 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPass(prev => !prev)}
                    className="absolute right-2.5 top-3 text-gray-400 hover:text-gray-700 cursor-pointer"
                    title={showResetPass ? 'Hide password' : 'Show password'}
                  >
                    {showResetPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-gray-600 mb-1 font-semibold">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showResetConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPasswordVal}
                    onChange={(e) => {
                      setConfirmPasswordVal(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Re-enter new password to verify"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2.5 pr-10 text-xs text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmPass(prev => !prev)}
                    className="absolute right-2.5 top-3 text-gray-400 hover:text-gray-700 cursor-pointer"
                    title={showResetConfirmPass ? 'Hide password' : 'Show password'}
                  >
                    {showResetConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Generator Helper */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] border border-gray-300 hover:border-[#936B34] text-gray-800 text-[11px] font-mono tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>Generate Secure Temporary Password</span>
                </button>

                {copiedGenPassword && (
                  <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3" />
                    Copied!
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordStaff(null);
                    setPasswordError('');
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-mono uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Updating MongoDB...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
