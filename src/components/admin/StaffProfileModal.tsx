import React, { useState, useMemo } from 'react';
import { 
  User, 
  Shield, 
  ShieldCheck, 
  KeyRound, 
  Clock, 
  Check, 
  X, 
  Mail, 
  Phone, 
  Building, 
  FileText, 
  Lock, 
  Activity,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Customer, StaffPermissionItem, AuditLogEntry } from '../../types';
import { StaffService } from '../../services/api';
import { useShop } from '../../context/ShopContext';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    staffTitle?: string;
    department?: string;
    permissions?: string[];
  };
  permissionDefs: StaffPermissionItem[];
  recentLogs: AuditLogEntry[];
  onStaffUpdated?: (updated: any) => void;
}

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  isOpen,
  onClose,
  staffUser,
  permissionDefs,
  recentLogs,
  onStaffUpdated
}) => {
  const { showToast } = useShop();

  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'activity' | 'security'>('overview');

  // Form states for profile & password update
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState(staffUser.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filter logs for this specific staff user
  const personalLogs = useMemo(() => {
    const staffId = staffUser.id?.toLowerCase();
    const staffEmail = staffUser.email?.toLowerCase();
    return recentLogs.filter(l => {
      const logUserId = l.adminUser?.id?.toLowerCase();
      const logEmail = l.adminUser?.email?.toLowerCase();
      return (staffId && logUserId === staffId) || (staffEmail && logEmail === staffEmail);
    });
  }, [recentLogs, staffUser]);

  // Group permissions by category
  const categorizedPermissions = useMemo(() => {
    const userPermIds = staffUser.permissions || [];
    const isFullAdmin = staffUser.role === 'admin' || userPermIds.includes('*');

    const map: Record<string, { item: StaffPermissionItem; granted: boolean }[]> = {};
    permissionDefs.forEach(p => {
      const cat = p.category || 'General';
      if (!map[cat]) map[cat] = [];
      const granted = isFullAdmin || userPermIds.includes(p.id);
      map[cat].push({ item: p, granted });
    });
    return map;
  }, [permissionDefs, staffUser]);

  const grantedCount = useMemo(() => {
    if (staffUser.role === 'admin' || (staffUser.permissions || []).includes('*')) {
      return permissionDefs.length;
    }
    return (staffUser.permissions || []).length;
  }, [permissionDefs, staffUser]);

  if (!isOpen) return null;

  const initials = staffUser.name
    ? staffUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = {
        name: displayName.trim()
      };
      if (phone.trim()) payload.phone = phone.trim();

      const updated = await StaffService.update(staffUser.id, payload);
      showToast('Staff credentials updated in MongoDB.', 'success');
      if (onStaffUpdated) onStaffUpdated(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to update credentials.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await StaffService.update(staffUser.id, { password: newPassword });
      showToast('Security password updated successfully in MongoDB.', 'success');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('overview');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white border border-[#936B34] shadow-2xl relative my-8 overflow-hidden">
        
        {/* Modal Top Header Bar */}
        <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between border-b border-[#262F40]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E5C384]">
              ATELIER SECURITY &amp; SARTORIAL CREDENTIALS
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity Hero Banner */}
        <div className="p-6 bg-[#FAF8F5] border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Monogram Badge */}
              <div className={`w-14 h-14 flex items-center justify-center font-bold text-base uppercase shrink-0 ${
                staffUser.role === 'admin' 
                  ? 'bg-[#111827] text-[#E5C384] ring-2 ring-[#936B34]' 
                  : 'bg-white text-[#936B34] border-2 border-[#936B34]'
              }`}>
                {initials}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl text-[#111827] font-light">
                    {staffUser.name}
                  </h2>
                  <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold tracking-wider ${
                    staffUser.role === 'admin'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                  }`}>
                    {staffUser.role === 'admin' ? 'EXECUTIVE ADMINISTRATOR' : 'STAFF MEMBER'}
                  </span>
                </div>

                <div className="text-xs text-[#936B34] font-medium mt-0.5">
                  {staffUser.staffTitle || (staffUser.role === 'admin' ? 'Executive Administrator' : 'Staff Artisan')}
                  <span className="text-gray-400 mx-1.5">·</span>
                  <span className="text-gray-600">{staffUser.department || 'Atelier'}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {staffUser.email}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-gray-400" />
                    ID: {staffUser.id}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Active Clearance
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-white border border-gray-200 p-3 sm:text-right shrink-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 block">
                GRANTED CLEARANCE
              </span>
              <div className="font-serif text-xl text-[#111827] mt-0.5">
                {grantedCount} <span className="text-xs text-gray-400 font-sans">/ {permissionDefs.length}</span>
              </div>
              <span className="text-[10px] font-mono text-[#936B34] block">
                {personalLogs.length} logged actions
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white px-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 font-semibold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#936B34] text-[#111827]'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-3 px-4 font-semibold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'border-[#936B34] text-[#111827]'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Permissions Matrix ({grantedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 px-4 font-semibold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'border-[#936B34] text-[#111827]'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>My Activity Stream ({personalLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 font-semibold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-[#936B34] text-[#111827]'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FAF8F5] border border-gray-200 p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
                    OPERATIONAL DEPARTMENT
                  </span>
                  <div className="font-serif text-lg text-[#111827]">
                    {staffUser.department || 'Bespoke Tailoring & Alterations'}
                  </div>
                  <p className="text-xs text-gray-500 font-sans">
                    Responsible for artisan craftsmanship, consignment preparation, and salon appointments.
                  </p>
                </div>

                <div className="bg-[#FAF8F5] border border-gray-200 p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
                    AUTHENTICATION STATUS
                  </span>
                  <div className="font-serif text-lg text-[#111827]">
                    Bcrypt Salted Encryption
                  </div>
                  <p className="text-xs text-gray-500 font-sans">
                    Credentials persisted in MongoDB. Strictly authentic email &amp; password required (one-tap login disabled).
                  </p>
                </div>
              </div>

              {/* Quick Update Display Name Form */}
              <div className="bg-white border border-gray-200 p-4 space-y-3">
                <h4 className="font-serif text-base text-[#111827]">Update Personal Details</h4>
                <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs focus:border-[#936B34] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (800) 555-7276"
                        className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs focus:border-[#936B34] focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Updating...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: PERMISSIONS MATRIX */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <p className="text-xs text-gray-500 font-mono">
                  The following granular privileges determine which tabs, status controls, and ledger exports you are authorized to operate.
                </p>
              </div>

              <div className="space-y-4">
                {Object.entries(categorizedPermissions).map(([category, items]) => (
                  <div key={category} className="border border-gray-200 p-4 space-y-2 bg-[#FAF8F5]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-gray-700">
                        {category}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {items.filter(i => i.granted).length} of {items.length} granted
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {items.map(({ item, granted }) => (
                        <div
                          key={item.id}
                          className={`p-2 border text-xs font-mono flex items-start gap-2 ${
                            granted 
                              ? 'bg-white border-emerald-300 shadow-2xs' 
                              : 'bg-gray-100/70 border-gray-200 opacity-60'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            granted ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-400'
                          }`}>
                            {granted ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block">{item.name}</span>
                            <span className="text-[9px] text-[#936B34]">{item.id}</span>
                            <p className="text-[10px] text-gray-500 font-sans mt-0.5">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PERSONAL ACTIVITY STREAM */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <p className="text-xs text-gray-500 font-mono">
                  Audit trail of actions executed by your account (<span className="text-[#936B34] font-semibold">{staffUser.email}</span>).
                </p>
                <span className="text-[11px] font-mono text-gray-400">
                  {personalLogs.length} total recorded entries
                </span>
              </div>

              {personalLogs.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF8F5] border border-gray-200 space-y-2">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="font-serif text-lg text-gray-700">No actions recorded for this account yet</p>
                  <p className="text-xs text-gray-500 font-mono">
                    Actions like advancing order statuses, adjusting stock, or updating alterations will appear here with timestamps.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 border border-gray-200">
                  {personalLogs.map(log => (
                    <div key={log.id || log.auditId} className="p-3.5 hover:bg-[#FAF8F5] transition-colors text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#111827]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 flex items-center gap-2">
                        <span>Entity: <strong className="text-gray-900">{log.entity}</strong></span>
                        <span>·</span>
                        <span>Ref: <strong className="text-[#936B34]">{log.entityId}</strong></span>
                      </div>
                      {log.notes && (
                        <p className="text-[11px] text-gray-500 font-sans italic bg-white p-1.5 border border-gray-100">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-4 max-w-lg">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Update Atelier Password</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Password changes are encrypted using salted bcrypt and stored directly in MongoDB. Ensure your password is at least 6 characters.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-[10px] uppercase text-gray-600 mb-1 font-semibold">New Password *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-gray-600 mb-1 font-semibold">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2 text-xs focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-semibold disabled:opacity-50"
                  >
                    {isSaving ? 'Encrypting & Updating...' : 'Update Password in MongoDB'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] text-gray-400">
            PARK AVENUE MENS WEAR · ATELIER ACCESS LEDGER
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 uppercase cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
