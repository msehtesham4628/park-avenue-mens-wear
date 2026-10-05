import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Plus, 
  Search, 
  Filter, 
  X, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Tag, 
  ArrowUpDown, 
  ShieldCheck, 
  Eye, 
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';
import { AuditLogEntry, StaffMember } from '../../types';

interface ActivityLogSectionProps {
  logs: AuditLogEntry[];
  staffList: StaffMember[];
  onRefreshLogs?: () => Promise<void>;
  onExportLogs: () => void;
  onRecordManualLog: (data: {
    action: string;
    entity: string;
    entityId?: string;
    notes: string;
    role: 'admin' | 'staff';
    operatorName: string;
  }) => Promise<void>;
}

export const ActivityLogSection: React.FC<ActivityLogSectionProps> = ({
  logs,
  staffList,
  onRefreshLogs,
  onExportLogs,
  onRecordManualLog
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff'>('all');
  const [operatorFilter, setOperatorFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Detail view modal
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Manual record modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [newLogRole, setNewLogRole] = useState<'admin' | 'staff'>('staff');
  const [newLogOperatorName, setNewLogOperatorName] = useState('');
  const [newLogAction, setNewLogAction] = useState('ORDER_STATUS_UPDATED');
  const [newLogEntity, setNewLogEntity] = useState('Order');
  const [newLogEntityId, setNewLogEntityId] = useState('');
  const [newLogNotes, setNewLogNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available unique operators from logs
  const availableOperators = useMemo(() => {
    const map = new Map<string, string>();
    logs.forEach(l => {
      const email = l.adminUser?.email || l.adminUser?.id;
      const name = l.adminUser?.name || 'Staff Member';
      if (email && !map.has(email)) {
        map.set(email, `${name} (${l.adminUser?.role?.toUpperCase() || 'STAFF'})`);
      }
    });
    staffList.forEach(s => {
      if (s.email && !map.has(s.email)) {
        map.set(s.email, `${s.name} (${s.role.toUpperCase()})`);
      }
    });
    return Array.from(map.entries()).map(([email, label]) => ({ email, label }));
  }, [logs, staffList]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter(log => {
      // Role filter
      if (roleFilter !== 'all') {
        const r = (log.adminUser?.role || '').toLowerCase();
        if (r !== roleFilter) return false;
      }

      // Operator filter
      if (operatorFilter !== 'all') {
        const email = (log.adminUser?.email || '').toLowerCase();
        const id = (log.adminUser?.id || '').toLowerCase();
        const target = operatorFilter.toLowerCase();
        if (email !== target && id !== target) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        const action = (log.action || '').toUpperCase();
        const entity = (log.entity || '').toUpperCase();
        if (categoryFilter === 'orders' && !action.includes('ORDER') && !entity.includes('ORDER')) return false;
        if (categoryFilter === 'inventory' && !action.includes('INVENTORY') && !action.includes('STOCK')) return false;
        if (categoryFilter === 'alterations' && !action.includes('ALTERATION') && !action.includes('TAILOR')) return false;
        if (categoryFilter === 'returns' && !action.includes('RETURN') && !action.includes('CLAIM')) return false;
        if (categoryFilter === 'products' && !action.includes('PRODUCT')) return false;
        if (categoryFilter === 'staff' && !action.includes('STAFF') && !action.includes('PERMISSION') && !action.includes('ROLE')) return false;
      }

      // Time filter
      if (timeFilter !== 'all') {
        const logTime = new Date(log.createdAt).getTime();
        const diffMs = now - logTime;
        if (timeFilter === 'today' && diffMs > 24 * 60 * 60 * 1000) return false;
        if (timeFilter === '7days' && diffMs > 7 * 24 * 60 * 60 * 1000) return false;
        if (timeFilter === '30days' && diffMs > 30 * 24 * 60 * 60 * 1000) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAction = (log.action || '').toLowerCase().includes(q);
        const matchEntity = (log.entity || '').toLowerCase().includes(q);
        const matchEntityId = (log.entityId || '').toLowerCase().includes(q);
        const matchName = (log.adminUser?.name || '').toLowerCase().includes(q);
        const matchEmail = (log.adminUser?.email || '').toLowerCase().includes(q);
        const matchNotes = (log.notes || '').toLowerCase().includes(q);
        if (!matchAction && !matchEntity && !matchEntityId && !matchName && !matchEmail && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [logs, roleFilter, operatorFilter, categoryFilter, timeFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: logs.length,
      staffCount: logs.filter(l => (l.adminUser?.role || '').toLowerCase() === 'staff').length,
      adminCount: logs.filter(l => (l.adminUser?.role || '').toLowerCase() === 'admin').length,
      ordersCount: logs.filter(l => (l.action || '').includes('ORDER') || (l.entity || '').includes('Order')).length,
      inventoryCount: logs.filter(l => (l.action || '').includes('INVENTORY') || (l.entity || '').includes('Inventory')).length,
      alterationsCount: logs.filter(l => (l.action || '').includes('ALTERATION') || (l.entity || '').includes('Alteration')).length
    };
  }, [logs]);

  const handleRefresh = async () => {
    if (!onRefreshLogs) return;
    setIsRefreshing(true);
    try {
      await onRefreshLogs();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogAction.trim() || !newLogEntity.trim() || !newLogNotes.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onRecordManualLog({
        action: newLogAction.trim().toUpperCase(),
        entity: newLogEntity.trim(),
        entityId: newLogEntityId.trim() || undefined,
        notes: newLogNotes.trim(),
        role: newLogRole,
        operatorName: newLogOperatorName.trim() || (newLogRole === 'admin' ? 'Executive Administrator' : 'Staff Tailor')
      });
      setIsRecordModalOpen(false);
      setNewLogNotes('');
      setNewLogEntityId('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
              OPERATIONAL AUDIT &amp; ACTIVITY TRAIL
            </span>
            <span className="text-[10px] font-mono text-gray-400">·</span>
            <span className="text-[10px] font-mono text-emerald-700 uppercase font-semibold">
              Real-Time Tracking
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] font-light mt-1">
            Staff &amp; Executive Activity Logs
          </h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5 max-w-2xl leading-relaxed">
            All atelier staff actions—including order status advancements, inventory stock reallocations, bespoke fittings updates, and returns—are recorded with immutable timestamps and verified user identifiers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onRefreshLogs && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 border border-gray-300 hover:border-[#936B34] hover:text-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 bg-white disabled:opacity-50"
              title="Refresh latest activity stream"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#936B34]' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}

          <button
            onClick={onExportLogs}
            className="px-3.5 py-2 border border-gray-300 hover:border-[#936B34] hover:text-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 bg-white"
          >
            <Download className="w-3.5 h-3.5 text-[#936B34]" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-4 py-2 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#E5C384]" />
            <span>RECORD HANDOVER LOG</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="border border-gray-200 bg-[#FAF8F5] p-3.5 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 block">TOTAL LOGS</span>
          <div className="font-serif text-2xl text-[#111827]">{metrics.total}</div>
          <span className="text-[9px] font-mono text-gray-400 block">All recorded</span>
        </div>

        <div className="border border-gray-200 bg-[#FAF8F5] p-3.5 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 block">STAFF ACTIONS</span>
          <div className="font-serif text-2xl text-indigo-900">{metrics.staffCount}</div>
          <span className="text-[9px] font-mono text-indigo-700 block">Artisan operations</span>
        </div>

        <div className="border border-gray-200 bg-[#FAF8F5] p-3.5 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 block">ADMIN ACTIONS</span>
          <div className="font-serif text-2xl text-amber-900">{metrics.adminCount}</div>
          <span className="text-[9px] font-mono text-amber-700 block">Executive clearance</span>
        </div>

        <div className="border border-gray-200 bg-[#FAF8F5] p-3.5 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 block">ORDER UPDATES</span>
          <div className="font-serif text-2xl text-[#111827]">{metrics.ordersCount}</div>
          <span className="text-[9px] font-mono text-gray-400 block">Processing &amp; dispatch</span>
        </div>

        <div className="border border-gray-200 bg-[#FAF8F5] p-3.5 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 block">INVENTORY LOGS</span>
          <div className="font-serif text-2xl text-[#111827]">{metrics.inventoryCount}</div>
          <span className="text-[9px] font-mono text-gray-400 block">Stock adjustments</span>
        </div>

        <div className="border border-gray-200 bg-[#FAF8F5] p-3.5 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 block">FITTINGS &amp; ALTS</span>
          <div className="font-serif text-2xl text-[#111827]">{metrics.alterationsCount}</div>
          <span className="text-[9px] font-mono text-gray-400 block">Tailoring benches</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-gray-200 bg-white p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by operator, action, ref ID, or note..."
              className="w-full border border-gray-300 bg-[#FAF8F5] pl-8 pr-3 py-2 text-xs font-mono outline-none focus:border-[#936B34] focus:bg-white"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="border border-gray-300 bg-[#FAF8F5] px-3 py-2 text-xs font-mono text-[#111827] outline-none focus:border-[#936B34] cursor-pointer"
          >
            <option value="all">All Roles (Admin &amp; Staff)</option>
            <option value="staff">Staff Actions Only</option>
            <option value="admin">Administrator Actions Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border border-gray-300 bg-[#FAF8F5] px-3 py-2 text-xs font-mono text-[#111827] outline-none focus:border-[#936B34] cursor-pointer"
          >
            <option value="all">All Action Categories</option>
            <option value="orders">Orders &amp; Dispatches</option>
            <option value="inventory">Inventory &amp; Stock</option>
            <option value="alterations">Alterations &amp; Fittings</option>
            <option value="returns">Returns &amp; Claims</option>
            <option value="products">Catalog &amp; Pricing</option>
            <option value="staff">Staff &amp; Permissions</option>
          </select>

          {/* Time Window */}
          <select
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value as any)}
            className="border border-gray-300 bg-[#FAF8F5] px-3 py-2 text-xs font-mono text-[#111827] outline-none focus:border-[#936B34] cursor-pointer"
          >
            <option value="all">All Recorded History</option>
            <option value="today">Past 24 Hours</option>
            <option value="7days">Past 7 Days</option>
            <option value="30days">Past 30 Days</option>
          </select>

        </div>

        {/* Specific Operator Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-[11px] uppercase tracking-wider">Filter by Operator:</span>
            <select
              value={operatorFilter}
              onChange={e => setOperatorFilter(e.target.value)}
              className="border border-gray-200 bg-white px-2.5 py-1 text-xs font-mono text-[#111827] cursor-pointer"
            >
              <option value="all">All Operators ({availableOperators.length})</option>
              {availableOperators.map(op => (
                <option key={op.email} value={op.email}>{op.label}</option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-gray-500">
            Showing <strong className="text-[#111827]">{filteredLogs.length}</strong> matching entries
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="border border-gray-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-xs font-mono">
            <thead className="bg-[#FAF8F5] border-b border-gray-200 text-gray-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Operator / Staff User</th>
                <th className="px-4 py-3">Role &amp; Title</th>
                <th className="px-4 py-3">Action Executed</th>
                <th className="px-4 py-3">Entity &amp; Target</th>
                <th className="px-4 py-3">Operational Notes</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-xs text-gray-500 font-mono">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No matching activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const isStaff = String(log.adminUser?.role).toLowerCase() === 'staff';
                  const dateObj = new Date(log.createdAt);

                  return (
                    <tr 
                      key={log.id || log.auditId} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 text-[11px]">
                          {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>

                      {/* Operator User Identifier */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-none flex items-center justify-center font-bold text-[10px] uppercase shrink-0 ${
                            !isStaff ? 'bg-[#111827] text-[#E5C384]' : 'bg-[#FAF8F5] text-[#936B34] border border-[#936B34]/30'
                          }`}>
                            {log.adminUser?.name ? log.adminUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'OP'}
                          </div>
                          <div>
                            <div className="font-bold text-[#111827] group-hover:text-[#936B34] transition-colors">
                              {log.adminUser?.name || 'Authorized Operator'}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {log.adminUser?.email || log.adminUser?.id || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Title */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider ${
                          !isStaff 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                            : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                        }`}>
                          {String(log.adminUser?.role || 'staff').toUpperCase()}
                        </span>
                        <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[140px]">
                          {log.adminUser?.staffTitle || (isStaff ? 'Staff Artisan' : 'Executive Admin')}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-[#111827] text-[11px] block">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {log.entity}
                        </span>
                      </td>

                      {/* Entity & Ref */}
                      <td className="px-4 py-3">
                        <div className="font-mono text-[11px] text-[#936B34] font-semibold">
                          {log.entityId}
                        </div>
                        {log.newValue && typeof log.newValue === 'object' && log.newValue.status && (
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            Status: <strong className="text-gray-800">{String(log.newValue.status).toUpperCase()}</strong>
                          </div>
                        )}
                      </td>

                      {/* Notes / Preview */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-[11px] text-gray-600 font-sans line-clamp-1">
                          {log.notes || 'Automated transactional log.'}
                        </p>
                      </td>

                      {/* Details Arrow */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="px-2 py-1 text-[10px] text-gray-500 hover:text-[#936B34] inline-flex items-center gap-1 group-hover:underline"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL / SLIDE-OVER */}
      {selectedLog && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-[#936B34] shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
                  AUDIT LOG INSPECTION
                </span>
                <h3 className="font-serif text-xl text-[#111827]">
                  {selectedLog.action}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)} 
                className="text-gray-400 hover:text-black p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] p-3.5 border border-gray-200">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Operator</span>
                  <div className="font-bold text-[#111827] mt-0.5">{selectedLog.adminUser?.name || 'Unknown'}</div>
                  <div className="text-[10px] text-gray-500">{selectedLog.adminUser?.email}</div>
                  <div className="text-[10px] text-[#936B34] mt-0.5">Role: {selectedLog.adminUser?.role?.toUpperCase()}</div>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Timestamp</span>
                  <div className="font-semibold text-gray-900 mt-0.5">{new Date(selectedLog.createdAt).toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">ISO: {selectedLog.createdAt}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-200 p-3">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Entity</span>
                  <div className="font-bold text-gray-800 mt-0.5">{selectedLog.entity}</div>
                </div>
                <div className="border border-gray-200 p-3">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Reference ID</span>
                  <div className="font-bold text-[#936B34] mt-0.5">{selectedLog.entityId}</div>
                </div>
              </div>

              {selectedLog.notes && (
                <div className="border border-gray-200 p-3 bg-white">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-1">Operational Notes</span>
                  <p className="text-gray-700 font-sans text-xs leading-relaxed">{selectedLog.notes}</p>
                </div>
              )}

              {/* Previous vs New Value diff if available */}
              {(selectedLog.previousValue || selectedLog.newValue) && (
                <div className="border border-gray-200 p-3 space-y-2 bg-[#FAF8F5]">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block">
                    State Transition Payload
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-gray-400 block mb-0.5 font-bold">PREVIOUS VALUE</span>
                      <pre className="bg-white p-2 border border-gray-200 overflow-x-auto text-gray-600 max-h-32">
                        {JSON.stringify(selectedLog.previousValue || { status: 'none' }, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-emerald-700 block mb-0.5 font-bold">NEW VALUE</span>
                      <pre className="bg-white p-2 border border-gray-200 overflow-x-auto text-gray-800 max-h-32">
                        {JSON.stringify(selectedLog.newValue || { status: 'updated' }, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-[10px] text-gray-400 flex items-center justify-between pt-2 border-t border-gray-100">
                <span>Terminal: {selectedLog.userAgent || 'Atelier Console'}</span>
                <span>IP: {selectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 border border-gray-300 text-xs font-mono uppercase tracking-wider hover:bg-gray-100 cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD MANUAL LOG */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#936B34] shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#936B34]">ATELIER LEDGER ENTRY</p>
                <h3 className="font-serif text-xl text-[#111827]">Record Handover / Inspection Note</h3>
              </div>
              <button 
                onClick={() => setIsRecordModalOpen(false)} 
                className="text-gray-400 hover:text-black p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-gray-500 mb-1 font-semibold">Operator Role</label>
                  <select
                    value={newLogRole}
                    onChange={e => setNewLogRole(e.target.value as any)}
                    className="w-full border border-gray-300 bg-[#FAF8F5] p-2 text-xs focus:border-[#936B34] outline-none cursor-pointer"
                  >
                    <option value="staff">Staff Artisan</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-gray-500 mb-1 font-semibold">Operator Name</label>
                  <input
                    type="text"
                    required
                    value={newLogOperatorName}
                    onChange={e => setNewLogOperatorName(e.target.value)}
                    placeholder="e.g. Giovanni Rossi"
                    className="w-full border border-gray-300 bg-[#FAF8F5] p-2 text-xs focus:border-[#936B34] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-gray-500 mb-1 font-semibold">Action Type</label>
                  <input
                    type="text"
                    required
                    value={newLogAction}
                    onChange={e => setNewLogAction(e.target.value)}
                    placeholder="e.g. FITTING_CHALK_COMPLETED"
                    className="w-full border border-gray-300 bg-[#FAF8F5] p-2 text-xs focus:border-[#936B34] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-gray-500 mb-1 font-semibold">Entity / Department</label>
                  <input
                    type="text"
                    required
                    value={newLogEntity}
                    onChange={e => setNewLogEntity(e.target.value)}
                    placeholder="e.g. Alteration or Order"
                    className="w-full border border-gray-300 bg-[#FAF8F5] p-2 text-xs focus:border-[#936B34] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1 font-semibold">Entity / Reference ID</label>
                <input
                  type="text"
                  value={newLogEntityId}
                  onChange={e => setNewLogEntityId(e.target.value)}
                  placeholder="e.g. ALT-1029 or ORD-2026-941"
                  className="w-full border border-gray-300 bg-[#FAF8F5] p-2 text-xs focus:border-[#936B34] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1 font-semibold">Operational Notes *</label>
                <textarea
                  rows={3}
                  required
                  value={newLogNotes}
                  onChange={e => setNewLogNotes(e.target.value)}
                  placeholder="Document bench status, sleeve adjustments, hand stitch inspection, or handover instructions..."
                  className="w-full border border-gray-300 bg-[#FAF8F5] p-2 text-xs focus:border-[#936B34] outline-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#111827] hover:bg-[#936B34] text-white uppercase font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Record to Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
