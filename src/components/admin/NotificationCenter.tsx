import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Sparkles, 
  ShoppingBag, 
  Newspaper, 
  Radio, 
  Mail, 
  MessageSquare, 
  Phone, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  Check, 
  Layers, 
  ArrowRight,
  User,
  Users,
  Shield,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { NotificationService, CustomerService } from '../../services/api';
import { Product, Customer } from '../../types';

export const NotificationCenter: React.FC = () => {
  const { showToast, products, currentCustomer } = useShop();

  // Composer Form State
  const [category, setCategory] = useState<'product' | 'news' | 'announcement' | 'promotion' | 'order' | 'alteration' | 'general'>('product');
  const [target, setTarget] = useState<'all' | 'registered' | 'direct'>('all');
  const [channel, setChannel] = useState<'in_app' | 'email' | 'sms' | 'whatsapp' | 'all'>('in_app');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [priority, setPriority] = useState<'standard' | 'high' | 'urgent'>('standard');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [registeredCustomers, setRegisteredCustomers] = useState<Customer[]>([]);

  // History & Metrics State
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, broadcasts: 0, productAlerts: 0, newsDispatches: 0, promotions: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');

  useEffect(() => {
    CustomerService.getAll().then(setRegisteredCustomers).catch(() => {});
  }, []);

  useEffect(() => {
    loadHistory();
  }, [filterCategory, filterChannel]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await NotificationService.getAdminHistory({
        category: filterCategory,
        channel: filterChannel,
        search: searchQuery
      });
      if (res && res.data) {
        setHistoryLogs(res.data);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err: any) {
      console.warn('Could not load notification history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    if (!prodId) return;
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setTitle(`Atelier Drop: ${prod.name}`);
      setSubject(`Exclusive Release: ${prod.name} (${prod.category})`);
      setMessage(`Now available at Park Avenue Atelier: ${prod.name}${prod.fabric ? ` crafted from ${prod.fabric}` : ''}. Handcrafted tailoring with exquisite hand-stitched Milanese finishing.`);
      setLink(`/category/${(prod.category || 'suits').toLowerCase().replace(/[^a-z0-9]+/g, '-')}/products/${prod.sku || prod.id}`);
    }
  };

  const applyTemplate = (preset: {
    category: 'product' | 'news' | 'announcement' | 'promotion' | 'order' | 'alteration' | 'general';
    title: string;
    subject: string;
    message: string;
    link: string;
    priority?: 'standard' | 'high' | 'urgent';
  }) => {
    setCategory(preset.category);
    setTitle(preset.title);
    setSubject(preset.subject);
    setMessage(preset.message);
    setLink(preset.link);
    setPriority(preset.priority || 'standard');
    showToast(`Loaded "${preset.title}" template`, 'info');
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Please enter a message for this dispatch.', 'error');
      return;
    }

    if (target === 'direct' && !recipient.trim()) {
      showToast('Please provide a recipient email or username for direct dispatches.', 'error');
      return;
    }

    setIsSending(true);
    try {
      const selectedProd = products.find(p => p.id === selectedProductId);
      const res = await NotificationService.sendAdminNotification({
        title: title.trim() || 'Atelier Dispatch',
        subject: subject.trim() || title.trim() || 'Park Avenue Atelier Notice',
        message: message.trim(),
        category,
        channel,
        target,
        recipient: target === 'all' ? 'all' : (recipient.trim() || 'all'),
        recipientName: recipientName.trim() || (target === 'all' ? 'All Patrons' : 'Valued Patron'),
        link: link.trim() || undefined,
        productId: selectedProd?.id,
        productName: selectedProd?.name,
        priority
      });

      if (res && res.success !== false) {
        showToast(`Dispatch successfully transmitted to [${target === 'all' ? 'All Patrons' : recipient}]!`, 'success');
        // Reset message and title
        setTitle('');
        setSubject('');
        setMessage('');
        setLink('');
        setSelectedProductId('');
        setRecipient('');
        setRecipientName('');
        // Reload history
        await loadHistory();
      } else {
        showToast(res?.message || 'Failed to dispatch notification', 'error');
      }
    } catch (err: any) {
      showToast('Dispatch error: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await NotificationService.deleteNotification(id);
      setHistoryLogs(prev => prev.filter(l => l.notificationId !== id && l._id !== id));
      showToast('Notification removed from ledger', 'info');
    } catch (err: any) {
      showToast('Failed to delete notification: ' + err.message, 'error');
    }
  };

  const filteredLogs = historyLogs.filter(log => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.title || '').toLowerCase().includes(q) ||
      (log.subject || '').toLowerCase().includes(q) ||
      (log.message || '').toLowerCase().includes(q) ||
      (log.recipient || '').toLowerCase().includes(q) ||
      (log.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 mt-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
              ATELIER COMMUNICATIONS &amp; DISPATCH CENTER
            </span>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              LIVE BROADCAST ACTIVE
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] mt-1 font-light tracking-wide">
            Notifications &amp; Announcements Command Center
          </h2>
          <p className="text-xs text-gray-500 font-sans mt-1 max-w-2xl">
            Broadcast garment drops, sartorial news, boutique events, and private client privileges across in-app dispatches, email concierge, and SMS alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHistory}
          className="px-3.5 py-2 bg-[#FAF8F5] border border-gray-200 text-xs font-mono text-[#111827] hover:border-[#936B34] flex items-center gap-2 cursor-pointer transition-colors shadow-2xs self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#936B34]' : 'text-gray-500'}`} />
          <span>REFRESH LEDGER</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="border border-gray-200 bg-[#F9F9F8] p-4 shadow-2xs">
          <div className="text-[9px] font-mono uppercase tracking-widest text-gray-500">TOTAL DISPATCHES</div>
          <div className="font-serif text-2xl text-[#111827] mt-1 font-normal">{stats.total || historyLogs.length}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">Recorded in Atelier Ledger</div>
        </div>
        <div className="border border-gray-200 bg-[#F9F9F8] p-4 shadow-2xs">
          <div className="text-[9px] font-mono uppercase tracking-widest text-[#936B34]">GLOBAL BROADCASTS</div>
          <div className="font-serif text-2xl text-[#936B34] mt-1 font-normal">{stats.broadcasts || historyLogs.filter(l => l.target === 'all' || l.recipient === 'all').length}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">Visible to All Visitors</div>
        </div>
        <div className="border border-gray-200 bg-[#F9F9F8] p-4 shadow-2xs">
          <div className="text-[9px] font-mono uppercase tracking-widest text-indigo-700">PRODUCT DROPS</div>
          <div className="font-serif text-2xl text-[#111827] mt-1 font-normal">{stats.productAlerts || historyLogs.filter(l => l.category === 'product').length}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">Linked to Garment Catalog</div>
        </div>
        <div className="border border-gray-200 bg-[#F9F9F8] p-4 shadow-2xs">
          <div className="text-[9px] font-mono uppercase tracking-widest text-amber-700">EDITORIAL NEWS</div>
          <div className="font-serif text-2xl text-[#111827] mt-1 font-normal">{stats.newsDispatches || historyLogs.filter(l => l.category === 'news').length}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">Sartorial Journal Stories</div>
        </div>
        <div className="border border-gray-200 bg-[#F9F9F8] p-4 shadow-2xs">
          <div className="text-[9px] font-mono uppercase tracking-widest text-emerald-700">VIP PRIVILEGES</div>
          <div className="font-serif text-2xl text-emerald-800 mt-1 font-normal">{stats.promotions || historyLogs.filter(l => l.category === 'promotion').length}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">Tailoring Perks &amp; Events</div>
        </div>
      </div>

      {/* Main 2-Column Composer & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Dispatch Composer Form (7 cols) */}
        <div className="lg:col-span-7 border border-gray-200 bg-white p-6 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] font-semibold block">
              DISPATCH STUDIO
            </span>
            <h3 className="font-serif text-xl text-[#111827] mt-0.5 font-normal">
              Compose &amp; Transmit Notification
            </h3>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-gray-400 font-medium block">
              Quick Sartorial Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyTemplate({
                  category: 'product',
                  title: 'Spring Collection: Super 150s Virgin Wool Suiting',
                  subject: 'New Atelier Release: The Park Avenue Midnight Navy Super 150s Suit',
                  message: 'Our master tailors have completed the spring atelier drop. Pure Italian virgin wool with hand-set canvassing and Milanese lapel stitching. Reserve your garment today.',
                  link: '/category/suits',
                  priority: 'high'
                })}
                className="px-2.5 py-1 bg-[#FAF8F5] border border-gray-200 hover:border-[#936B34] text-[10px] font-mono text-gray-700 hover:text-[#936B34] transition-colors cursor-pointer"
              >
                + Italian Wool Suit Drop
              </button>
              <button
                type="button"
                onClick={() => applyTemplate({
                  category: 'news',
                  title: 'Milan Sartorial Journal: The Full-Canvas Advantage',
                  subject: 'Sartorial Insight: Why Hand-Stitched Horsehair Canvas Outlasts Fused Suits',
                  message: 'Read our creative director essay on the construction methods that define enduring luxury menswear, from natural canvas chest pieces to pure cupro lining.',
                  link: '/category/suits',
                  priority: 'standard'
                })}
                className="px-2.5 py-1 bg-[#FAF8F5] border border-gray-200 hover:border-[#936B34] text-[10px] font-mono text-gray-700 hover:text-[#936B34] transition-colors cursor-pointer"
              >
                + Milan Journal Release
              </button>
              <button
                type="button"
                onClick={() => applyTemplate({
                  category: 'promotion',
                  title: 'Complimentary Master Inseam & Sleeve Tailoring Weekend',
                  subject: 'Private Client Privilege: Complimentary Bespoke Alterations',
                  message: 'All online and atelier acquisitions this weekend include complimentary master hand alteration adjustments and personalized fitting concierge.',
                  link: '/track-alteration',
                  priority: 'high'
                })}
                className="px-2.5 py-1 bg-[#FAF8F5] border border-gray-200 hover:border-[#936B34] text-[10px] font-mono text-gray-700 hover:text-[#936B34] transition-colors cursor-pointer"
              >
                + Complimentary Alterations Offer
              </button>
            </div>
          </div>

          <form onSubmit={handleDispatch} className="space-y-4">
            {/* Category Selector Tabs */}
            <div>
              <label className="text-[10px] font-mono uppercase text-gray-500 font-medium block mb-1.5">
                Dispatch Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'product', label: 'Product Drop', icon: ShoppingBag },
                  { id: 'news', label: 'News & Journal', icon: Newspaper },
                  { id: 'announcement', label: 'Announcement', icon: Radio },
                  { id: 'promotion', label: 'VIP Privilege', icon: Sparkles }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setCategory(item.id as any)}
                      className={`p-2.5 border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#936B34] bg-[#FAF8F5] text-[#936B34] font-semibold ring-1 ring-[#936B34]' 
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#936B34]' : 'text-gray-400'}`} />
                      <span className="text-[11px] font-mono">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience & Channel Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-gray-500 font-medium block mb-1">
                  Target Audience *
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as any)}
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                >
                  <option value="all">🌐 All Patrons (Global Public Broadcast)</option>
                  <option value="registered">👥 Registered Clients &amp; VIP Members</option>
                  <option value="direct">👤 Direct Recipient (Specific Email/Phone)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-gray-500 font-medium block mb-1">
                  Primary Delivery Channel *
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                >
                  <option value="in_app">🔔 In-App Dispatches Drawer (Instant)</option>
                  <option value="all">⚡ Multi-Channel (In-App + Email Concierge)</option>
                  <option value="email">✉️ Email Concierge Gateway</option>
                  <option value="sms">📱 SMS Courier Alert Gateway</option>
                  <option value="whatsapp">💬 WhatsApp Concierge Gateway</option>
                </select>
              </div>
            </div>

            {/* Direct Recipient Inputs (if target === 'direct') */}
            {target === 'direct' && (
              <div className="space-y-3 p-3.5 bg-amber-50/40 border border-amber-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-amber-900 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#936B34]" />
                    <span>Target Specific Patron (Private Alert)</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 font-medium">
                    Strict Patron Isolation
                  </span>
                </div>

                {registeredCustomers.length > 0 && (
                  <div>
                    <label className="text-[10px] font-mono uppercase text-amber-900 font-medium block mb-1">
                      Quick Pick From Registered Clientele (Mail or Username):
                    </label>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        const cust = registeredCustomers.find(c => c.email === val || (c as any).username === val);
                        if (cust) {
                          setRecipient(cust.email || (cust as any).username || val);
                          setRecipientName(cust.name || (cust as any).username || '');
                        }
                      }}
                      className="w-full bg-white border border-amber-200 px-3 py-1.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#936B34]"
                    >
                      <option value="">-- Choose customer mail or username --</option>
                      {registeredCustomers.map(c => (
                        <option key={c.id || c.email} value={c.email}>
                          {c.name || 'Patron'} {(c as any).username ? `(@${(c as any).username})` : ''} — {c.email} {c.tier ? `[${c.tier.toUpperCase()}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-amber-900 font-medium block mb-1">
                      Recipient Mail or Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. customer@example.com or username"
                      className="w-full bg-white border border-amber-200 px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#936B34]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-amber-900 font-medium block mb-1">
                      Patron Full Name
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Lord Harrington"
                      className="w-full bg-white border border-amber-200 px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#936B34]"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-amber-800 font-sans flex items-center gap-1.5 pt-1">
                  <Shield className="w-3 h-3 text-[#936B34] shrink-0" />
                  <span>Privacy guarantee: Different patrons receive different alerts. This dispatch is strictly delivered to <strong>{recipient || 'this patron'}</strong> only.</span>
                </p>
              </div>
            )}

            {/* Product Catalog Linker (if category === 'product' or optional) */}
            <div>
              <label className="text-[10px] font-mono uppercase text-gray-500 font-medium block mb-1">
                Link to Catalog Garment (Optional Auto-Fill)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
              >
                <option value="">-- No specific garment (Custom announcement) --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.category}] {p.name} — ${p.price?.toLocaleString()} (SKU: {p.sku || p.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Title & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-gray-500 font-medium block mb-1">
                  Dispatch Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spring Double-Breasted Suit Unveiled"
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2 text-xs text-[#111827] font-sans focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-gray-500 font-medium block mb-1">
                  Subject Line / Header
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Atelier Release: Super 150s Suiting"
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2 text-xs text-[#111827] font-sans focus:outline-none focus:border-[#936B34]"
                />
              </div>
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-medium">
                  Dispatch Content &amp; Announcement Body *
                </label>
                <span className="text-[9px] font-mono text-gray-400">
                  {message.length} characters
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the announcement or description to be transmitted to patrons..."
                className="w-full bg-[#F9F9F8] border border-gray-200 p-3 text-xs text-[#111827] font-sans focus:outline-none focus:border-[#936B34] resize-y"
              />
            </div>

            {/* CTA Link & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-gray-500 font-medium block mb-1">
                  Call-to-Action Link (e.g. /category/suits)
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="e.g. /category/suits or /shop"
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-gray-500 font-medium block mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                >
                  <option value="standard">Standard Dispatch</option>
                  <option value="high">High Priority (Featured Card)</option>
                  <option value="urgent">Urgent / Critical Alert</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="w-full py-3.5 px-6 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-[0.2em] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#E5C384]" />
                    <span>TRANSMITTING DISPATCH...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#E5C384]" />
                    <span>BROADCAST DISPATCH TO PATRONS</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Live Drawer Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-gray-200 bg-[#FAF8F5] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#936B34]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#111827] font-bold">
                  LIVE PATRON PREVIEW
                </span>
              </div>
              <span className="text-[9px] font-mono uppercase text-gray-500 bg-white border border-gray-200 px-2 py-0.5">
                DISPATCHES DRAWER
              </span>
            </div>

            <p className="text-[11px] text-gray-500 font-sans mb-4">
              Here is how this announcement will appear inside the client notification drawer on mobile and desktop:
            </p>

            {/* Preview Card */}
            <div className={`p-4 border transition-all ${
              priority === 'high' || priority === 'urgent' 
                ? 'bg-[#FAF8F5] border-[#936B34]/60 shadow-sm' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest font-semibold ${
                    category === 'product' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' :
                    category === 'news' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                    category === 'promotion' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {category.toUpperCase()}
                  </span>
                  {priority === 'high' && (
                    <span className="text-[9px] font-mono text-[#936B34] font-bold uppercase tracking-wider">
                      ● FEATURED
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-gray-400">Just now</span>
              </div>

              <h4 className="font-serif text-sm text-[#111827] mt-2 font-medium">
                {title.trim() || 'Atelier Dispatch Title Preview'}
              </h4>

              <p className="text-xs text-gray-600 font-sans mt-1 leading-relaxed">
                {message.trim() || 'The notification body text will render here with elegant typography and full detail.'}
              </p>

              {link && (
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-[#936B34]">
                  <span>Action: {link}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200/80 text-[11px] font-mono text-gray-500 space-y-1">
              <div>Channel: <span className="text-gray-900 font-semibold uppercase">{channel}</span></div>
              <div>Audience: <span className="text-gray-900 font-semibold">{target === 'all' ? 'All Patrons (Public)' : target}</span></div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="border border-gray-200 bg-white p-5 shadow-2xs space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#936B34] font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>COMMUNICATION DISPATCH PROTOCOL</span>
            </h4>
            <p className="text-xs text-gray-600 font-sans leading-relaxed">
              Dispatches marked as <strong>All Patrons</strong> are permanently archived in the MongoDB ledger and automatically loaded into the client dispatches drawer for all visitors.
            </p>
          </div>
        </div>
      </div>

      {/* Dispatched History Ledger */}
      <div className="border border-gray-200 bg-white shadow-xs">
        <div className="p-5 sm:p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] font-semibold block">
              DISPATCH AUDIT &amp; BROADCAST HISTORY
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-[#111827] mt-0.5 font-light">
              Transmitted Communications Ledger ({filteredLogs.length})
            </h3>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dispatches..."
                className="bg-[#F9F9F8] border border-gray-200 pl-8 pr-3 py-1.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#936B34] w-48 sm:w-56"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#F9F9F8] border border-gray-200 px-3 py-1.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#936B34]"
            >
              <option value="all">All Categories</option>
              <option value="product">Product Drops</option>
              <option value="news">News &amp; Journal</option>
              <option value="announcement">Announcements</option>
              <option value="promotion">VIP Privileges</option>
            </select>

            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="bg-[#F9F9F8] border border-gray-200 px-3 py-1.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#936B34]"
            >
              <option value="all">All Channels</option>
              <option value="in_app">In-App</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-gray-400 uppercase tracking-widest">
              No dispatches match the specified filter criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-[#FAF8F5] text-[10px] font-mono uppercase tracking-widest text-gray-500">
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Title &amp; Message</th>
                  <th className="py-3 px-4">Target / Recipient</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-mono">
                {filteredLogs.map((log) => {
                  const id = log.notificationId || log._id;
                  const dateStr = log.createdAt 
                    ? new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'Recent';

                  return (
                    <tr key={id} className="hover:bg-[#F9F9F8] transition-colors">
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[9px] uppercase font-semibold border ${
                          log.category === 'product' ? 'bg-indigo-50 text-indigo-900 border-indigo-200' :
                          log.category === 'news' ? 'bg-amber-50 text-amber-900 border-amber-200' :
                          log.category === 'promotion' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {log.category || 'GENERAL'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[240px] max-w-md">
                        <div className="font-semibold text-gray-900 font-sans text-xs">
                          {log.title || log.subject || 'Atelier Dispatch'}
                        </div>
                        <div className="text-[11px] text-gray-600 line-clamp-1 font-sans mt-0.5">
                          {log.message}
                        </div>
                        {log.link && (
                          <div className="text-[10px] text-[#936B34] mt-0.5">
                            Link: {log.link}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-700">
                        {log.target === 'all' || log.recipient === 'all' ? (
                          <span className="text-[#936B34] font-semibold">● All Patrons</span>
                        ) : (
                          <span>{log.recipient}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap uppercase text-gray-600">
                        {log.channel || 'in_app'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold uppercase">
                          {log.status || 'Sent'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete from ledger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
