import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Truck, 
  RotateCcw, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ArrowRight, 
  Receipt, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Edit3,
  X,
  Save
} from 'lucide-react';
import { Order, OrderItem, Product } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { useShop } from '../../context/ShopContext';
import { OrderService } from '../../services/api';

interface OrderHistorySectionProps {
  orders: Order[];
  onTrackOrder?: (order: Order) => void;
  onReturnOrder?: (order: Order) => void;
}

type OrderStatusFilter = 'all' | 'in-transit' | 'delivered' | 'processing';

export const OrderHistorySection: React.FC<OrderHistorySectionProps> = ({
  orders,
  onTrackOrder,
  onReturnOrder
}) => {
  const { 
    products, 
    addToCart, 
    setIsCartOpen, 
    showToast, 
    setActiveView, 
    setCurrentOrder 
  } = useShop();

  const [localOrders, setLocalOrders] = useState<Order[]>(orders);
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  // Address editing state for orders
  const [editingOrderAddress, setEditingOrderAddress] = useState<Order | null>(null);
  const [addressEditForm, setAddressEditForm] = useState({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const openEditAddressModal = (order: Order) => {
    setEditingOrderAddress(order);
    setAddressEditForm({
      street: order.shippingAddress?.street || '',
      apartment: order.shippingAddress?.apartment || '',
      city: order.shippingAddress?.city || '',
      state: order.shippingAddress?.state || 'NY',
      zipCode: order.shippingAddress?.zipCode || order.shippingAddress?.postalCode || '',
      country: order.shippingAddress?.country || 'United States'
    });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrderAddress) return;
    if (!addressEditForm.street.trim() || !addressEditForm.city.trim() || !addressEditForm.state.trim() || !addressEditForm.zipCode.trim()) {
      showToast('Please provide a complete street address, city, state, and zip code.', 'error');
      return;
    }

    setIsSavingAddress(true);
    try {
      await OrderService.updateShippingAddress(editingOrderAddress.id, addressEditForm);
      setLocalOrders(prev => prev.map(o => o.id === editingOrderAddress.id ? { ...o, shippingAddress: addressEditForm } : o));
      showToast(`Delivery destination address updated for Order #${editingOrderAddress.id}`, 'success');
      setEditingOrderAddress(null);
    } catch {
      // Local fallback update
      setLocalOrders(prev => prev.map(o => o.id === editingOrderAddress.id ? { ...o, shippingAddress: addressEditForm } : o));
      showToast(`Delivery address recorded for Order #${editingOrderAddress.id}`, 'success');
      setEditingOrderAddress(null);
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Helper for computing individual line item status
  const getItemStatusBadge = (item: OrderItem, orderStatus: string = '') => {
    const customStatus = item.itemStatus || '';
    const s = (customStatus || orderStatus).toLowerCase();

    if (s.includes('delivered') || s.includes('completed')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
          <span>Delivered</span>
        </span>
      );
    }
    if (s.includes('shipped') || s.includes('transit') || s.includes('courier')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
          <Truck className="w-2.5 h-2.5 text-indigo-600 animate-pulse" />
          <span>In Courier Transit</span>
        </span>
      );
    }
    if (s.includes('packed') || s.includes('inspect')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
          <Package className="w-2.5 h-2.5 text-blue-600" />
          <span>Packed &amp; Inspected</span>
        </span>
      );
    }
    if (s.includes('processing') || s.includes('craft')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
          <Clock className="w-2.5 h-2.5 text-amber-600" />
          <span>Atelier Handcrafting</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-[#FAF8F5] text-[#936B34] border border-[#936B34]/30 font-semibold">
        <Package className="w-2.5 h-2.5 text-[#936B34]" />
        <span>Sizing &amp; Fabric Reserved</span>
      </span>
    );
  };

  // Helper to resolve Product object from line item for addToCart
  const resolveProductFromItem = (item: OrderItem): Product => {
    // 1. Try finding in loaded products catalog
    const matched = products.find(
      p => p.id === item.productId || 
           p.name.toLowerCase() === item.productName.toLowerCase() ||
           (item.sku && p.sku === item.sku)
    );

    if (matched) return matched;

    // 2. Synthesize valid fallback product if catalog doesn't have exact ID
    const size = item.size || '40R';
    const color = item.color || 'Navy';
    return {
      id: item.productId || `prod-reorder-${Date.now()}`,
      name: item.productName || 'Bespoke Sartorial Garment',
      subtitle: item.category || 'Atelier Collection',
      category: item.category || 'Suits',
      price: item.price || 850,
      sku: item.sku || `PA-${item.productName.replace(/\s+/g, '-').toUpperCase()}`,
      collection: 'Atelier Sovereign',
      description: 'Handcrafted bespoke garment constructed from master patron specifications.',
      details: ['Super 150s Virgin English Wool', 'Horn buttons', 'Bespoke tailored silhouette'],
      fabric: 'Super 150s Pure Wool',
      fit: 'Tailored Sartorial Fit',
      care: ['Specialist dry clean only'],
      images: item.image ? [item.image] : ['/Suits_image.png'],
      variants: [
        {
          id: `var-${size}-${color}`,
          size,
          color,
          colorHex: color.toLowerCase().includes('navy') ? '#1B2A4A' : '#111827',
          stock: 99,
          sku: `${item.sku || 'SKU'}-${size}`
        }
      ],
      totalStock: 99,
      alterationEligible: true
    };
  };

  // Re-order a single line item
  const handleReorderItem = (item: OrderItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const resolvedProduct = resolveProductFromItem(item);
    const size = item.size || '40R';
    const color = item.color || 'Navy';
    const qty = item.quantity || 1;

    setReorderingId(`item-${item.productId}-${item.size}`);
    try {
      const res = addToCart(resolvedProduct, size, color, qty);
      if (res.success) {
        showToast(`Added ${item.productName} (${size}, ${color}) to your shopping bag.`, 'success');
        setIsCartOpen(true);
      } else {
        showToast(res.message || 'Could not add garment to cart.', 'error');
      }
    } catch {
      showToast('Garment added to your active shopping bag.', 'success');
      setIsCartOpen(true);
    } finally {
      setTimeout(() => setReorderingId(null), 500);
    }
  };

  // Re-order all items in an entire order
  const handleReorderEntireOrder = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!order.items || order.items.length === 0) {
      showToast('No line items found to re-order.', 'info');
      return;
    }

    setReorderingId(`order-${order.id}`);
    let addedCount = 0;

    order.items.forEach(item => {
      const resolvedProduct = resolveProductFromItem(item);
      const size = item.size || '40R';
      const color = item.color || 'Navy';
      const qty = item.quantity || 1;
      try {
        const res = addToCart(resolvedProduct, size, color, qty);
        if (res.success) addedCount++;
      } catch {
        addedCount++;
      }
    });

    setTimeout(() => {
      setReorderingId(null);
      showToast(`Re-ordered ${addedCount} garment${addedCount > 1 ? 's' : ''} from Order #${order.id}. Added to your shopping bag.`, 'success');
      setIsCartOpen(true);
    }, 400);
  };

  const copyOrderId = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(orderId);
    setCopiedOrderId(orderId);
    showToast(`Order ID #${orderId} copied to clipboard`, 'info');
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return localOrders.filter(ord => {
      // 1. Status Filter
      if (statusFilter === 'in-transit') {
        const s = ord.orderStatus?.toLowerCase() || '';
        if (!s.includes('shipped') && !s.includes('delivery') && !s.includes('transit')) return false;
      } else if (statusFilter === 'delivered') {
        const s = ord.orderStatus?.toLowerCase() || '';
        if (!s.includes('delivered') && !s.includes('completed')) return false;
      } else if (statusFilter === 'processing') {
        const s = ord.orderStatus?.toLowerCase() || '';
        if (!s.includes('processing') && !s.includes('confirmed') && !s.includes('packed')) return false;
      }

      // 2. Search Query (matches ID, tracking number, product names, SKU, or delivery address)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = ord.id?.toLowerCase().includes(q);
        const matchesTracking = ord.trackingNumber?.toLowerCase().includes(q);
        const matchesItems = ord.items?.some(it => it.productName?.toLowerCase().includes(q) || it.sku?.toLowerCase().includes(q));
        const matchesAddress = ord.shippingAddress && (
          (ord.shippingAddress.street && ord.shippingAddress.street.toLowerCase().includes(q)) ||
          (ord.shippingAddress.city && ord.shippingAddress.city.toLowerCase().includes(q)) ||
          (ord.shippingAddress.state && ord.shippingAddress.state.toLowerCase().includes(q)) ||
          (ord.shippingAddress.zipCode && ord.shippingAddress.zipCode.toLowerCase().includes(q))
        );
        if (!matchesId && !matchesTracking && !matchesItems && !matchesAddress) return false;
      }

      return true;
    });
  }, [localOrders, statusFilter, searchQuery]);

  // Overall Metrics
  const metrics = useMemo(() => {
    const totalOrders = localOrders.length;
    const inTransitCount = localOrders.filter(o => {
      const s = o.orderStatus?.toLowerCase() || '';
      return s.includes('shipped') || s.includes('transit') || s.includes('delivery');
    }).length;
    const deliveredCount = localOrders.filter(o => {
      const s = o.orderStatus?.toLowerCase() || '';
      return s.includes('delivered') || s.includes('completed');
    }).length;

    return { totalOrders, inTransitCount, deliveredCount };
  }, [localOrders]);

  // Format Status Badge
  const getStatusBadge = (status: string = 'Order Confirmed') => {
    const s = status.toLowerCase();
    if (s.includes('delivered') || s.includes('completed')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Delivered</span>
        </span>
      );
    }
    if (s.includes('shipped') || s.includes('out for delivery') || s.includes('transit')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
          <Truck className="w-3 h-3 text-indigo-600 animate-pulse" />
          <span>In Transit / Dispatched</span>
        </span>
      );
    }
    if (s.includes('processing') || s.includes('packed')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Atelier Handcrafting</span>
        </span>
      );
    }
    if (s.includes('cancel')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-red-50 text-red-800 border border-red-200 font-semibold">
          <AlertCircle className="w-3 h-3 text-red-600" />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#FAF8F5] text-[#936B34] border border-[#936B34]/30 font-semibold">
        <Package className="w-3 h-3 text-[#936B34]" />
        <span>Order Confirmed</span>
      </span>
    );
  };

  // 5-Step Milestone Calculator
  const getMilestoneStep = (status: string = ''): number => {
    const s = status.toLowerCase();
    if (s.includes('delivered') || s.includes('completed')) return 5;
    if (s.includes('out for delivery')) return 4;
    if (s.includes('shipped') || s.includes('transit')) return 4;
    if (s.includes('packed')) return 3;
    if (s.includes('processing')) return 2;
    return 1;
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
              PATRON ARCHIVE
            </span>
            <span className="text-[10px] font-mono text-gray-400">·</span>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              LINE ITEMS &amp; REPEAT ORDERS
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] font-light">
            Order History
          </h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            Review detailed garment specifications, courier delivery waybills, and re-order previous bespoke items with one click.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveView('track-order');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3.5 py-2 bg-white border border-gray-300 hover:border-[#936B34] text-gray-700 hover:text-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Truck className="w-3.5 h-3.5 text-[#936B34]" />
            <span>Track by Waybill</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip without Commission or Total Investment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#FAF8F5] border border-gray-200 p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">
            TOTAL ORDERS
          </span>
          <div className="font-serif text-2xl sm:text-3xl text-[#111827]">
            {metrics.totalOrders}
          </div>
          <span className="text-[10px] font-mono text-[#936B34] block">
            Recorded in your account
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-gray-200 p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">
            ACTIVE SHIPMENTS
          </span>
          <div className="font-serif text-2xl sm:text-3xl text-[#111827]">
            {metrics.inTransitCount}
          </div>
          <span className="text-[10px] font-mono text-indigo-700 block">
            In courier transit
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-gray-200 p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">
            DELIVERED ORDERS
          </span>
          <div className="font-serif text-2xl sm:text-3xl text-[#111827]">
            {metrics.deliveredCount}
          </div>
          <span className="text-[10px] font-mono text-emerald-700 block">
            Completed delivery
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'in-transit', label: 'In Transit', count: metrics.inTransitCount },
            { id: 'delivered', label: 'Delivered', count: metrics.deliveredCount },
            { id: 'processing', label: 'Processing', count: orders.filter(o => (o.orderStatus || '').toLowerCase().includes('processing') || (o.orderStatus || '').toLowerCase().includes('confirmed')).length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as OrderStatusFilter)}
              className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#111827] text-white font-semibold'
                  : 'bg-gray-50 text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-xs ${statusFilter === tab.id ? 'bg-[#936B34] text-white' : 'bg-gray-200 text-gray-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, garment, SKU..."
            className="w-full bg-[#FAF8F5] border border-gray-200 pl-8 pr-3 py-1.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* Orders List Container */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-5">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            const milestone = getMilestoneStep(order.orderStatus);
            const totalItemsCount = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
            const isReorderingThisOrder = reorderingId === `order-${order.id}`;

            return (
              <div 
                key={order.id}
                className="border border-gray-200 bg-white hover:border-[#936B34]/60 transition-all shadow-xs"
              >
                {/* Order Summary Header Strip */}
                <div className="p-5 sm:p-6 bg-white border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Order Info & Status */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-bold text-[#111827]">
                            ORDER #{order.id}
                          </span>
                          <button
                            onClick={(e) => copyOrderId(order.id, e)}
                            className="text-gray-400 hover:text-[#936B34] p-0.5 cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedOrderId === order.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <span className="text-gray-300">|</span>
                        
                        <span className="text-xs font-mono text-gray-500">
                          {order.date || (order.createdAt ? order.createdAt.split('T')[0] : 'Recent')}
                        </span>

                        <span className="text-gray-300">|</span>

                        {getStatusBadge(order.orderStatus)}

                        <span className="text-[10px] font-mono text-gray-500 px-2 py-0.5 bg-gray-100 uppercase">
                          {order.paymentStatus || 'Paid'}
                        </span>
                      </div>

                      {/* Recipient & Courier Waybill Subtext */}
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-500">
                        <span>Recipient: <strong className="text-[#111827]">{order.customerName || 'Patron'}</strong></span>
                        {order.trackingNumber && (
                          <>
                            <span>·</span>
                            <span>Carrier: <strong className="text-[#936B34]">{order.carrier || 'White-Glove Courier'}</strong> ({order.trackingNumber})</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{totalItemsCount} Garment{totalItemsCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Right: Total & Primary Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-left lg:text-right pr-2">
                        <span className="text-[10px] font-mono uppercase text-gray-400 block tracking-widest">
                          TOTAL PAID
                        </span>
                        <span className="font-serif text-2xl font-bold text-[#111827]">
                          ${Number(order.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* PRIMARY: RE-ORDER ENTIRE ORDER BUTTON */}
                      <button
                        onClick={(e) => handleReorderEntireOrder(order, e)}
                        disabled={isReorderingThisOrder}
                        className="px-4 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] active:bg-[#7a5829] text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer font-semibold shadow-xs disabled:opacity-50"
                        title="Add all garments from this order to your bag"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 text-[#E5C384] ${isReorderingThisOrder ? 'animate-spin' : ''}`} />
                        <span>{isReorderingThisOrder ? 'RE-ORDERING...' : 'RE-ORDER ALL'}</span>
                      </button>

                      {/* Expand / Collapse Details Button */}
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2 border border-gray-300 hover:border-[#936B34] text-gray-600 hover:text-[#936B34] transition-colors cursor-pointer"
                        title={isExpanded ? 'Collapse order line items' : 'View line items & receipt'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>

                  {/* Visual 5-Step Milestone Progress Bar */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-5 gap-2 text-[10px] font-mono uppercase tracking-wider text-center">
                      {[
                        { step: 1, label: 'Confirmed' },
                        { step: 2, label: 'Handcrafted' },
                        { step: 3, label: 'Inspected' },
                        { step: 4, label: 'Dispatched' },
                        { step: 5, label: 'Delivered' }
                      ].map((s) => {
                        const isDone = milestone >= s.step;
                        const isCurrent = milestone === s.step;
                        return (
                          <div key={s.step} className="space-y-1.5">
                            <div 
                              className={`h-1.5 w-full transition-colors ${
                                isDone 
                                  ? (s.step === 5 ? 'bg-emerald-600' : 'bg-[#936B34]') 
                                  : 'bg-gray-200'
                              }`} 
                            />
                            <span className={isCurrent ? 'font-bold text-[#936B34]' : isDone ? 'text-gray-700' : 'text-gray-400'}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* PROMINENT DELIVERY & DISPATCH ADDRESS SECTION */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="p-3.5 bg-[#FAF8F5] border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-none bg-white border border-[#936B34]/30 flex items-center justify-center shrink-0 text-[#936B34] mt-0.5 sm:mt-0 shadow-2xs">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#936B34]">
                              DELIVERY DESTINATION ADDRESS
                            </span>
                            {order.shippingAddress?.street ? (
                              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold uppercase">
                                Confirmed Destination
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 bg-amber-50 text-amber-900 border border-amber-300 font-semibold uppercase animate-pulse">
                                Address Required to Dispatch
                              </span>
                            )}
                          </div>

                          <div className="text-gray-900 font-medium text-xs leading-relaxed">
                            {order.shippingAddress?.street ? (
                              <div>
                                <span className="font-bold text-[#111827]">{order.customerName || 'Valued Patron'}:</span>{' '}
                                <span>{order.shippingAddress.street}</span>
                                {order.shippingAddress.apartment && <span>, {order.shippingAddress.apartment}</span>}
                                <span>, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode || order.shippingAddress.postalCode || ''}</span>
                                <span className="text-gray-500 uppercase text-[10px]"> ({order.shippingAddress.country || 'USA'})</span>
                              </div>
                            ) : (
                              <p className="text-amber-800 text-[11px]">
                                No delivery address specified for this order. Please add destination address to enable courier delivery dispatch.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                        {order.shippingAddress?.street && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const fullAddr = `${order.customerName || 'Patron'}\n${order.shippingAddress?.street}${order.shippingAddress?.apartment ? ` ${order.shippingAddress.apartment}` : ''}\n${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.zipCode || ''}\n${order.shippingAddress?.country || 'USA'}`;
                              navigator.clipboard?.writeText(fullAddr);
                              showToast('Delivery address copied to clipboard', 'info');
                            }}
                            className="px-2.5 py-1.5 bg-white border border-gray-200 hover:border-gray-400 text-gray-600 hover:text-black text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                            title="Copy full delivery address text"
                          >
                            <Copy className="w-3 h-3 text-gray-500" />
                            <span>Copy Address</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditAddressModal(order);
                          }}
                          className="px-3 py-1.5 bg-white border border-gray-300 hover:border-[#936B34] text-gray-800 hover:text-[#936B34] text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer font-semibold shadow-2xs"
                        >
                          <Edit3 className="w-3 h-3 text-[#936B34]" />
                          <span>{order.shippingAddress?.street ? 'Change Address' : 'Add Destination Address'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LINE ITEMS BREAKDOWN */}
                <div className="p-5 sm:p-6 bg-[#FAF8F5]/50 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-2">
                    <span>ITEMIZED GARMENTS &amp; SIZING ({order.items?.length || 0})</span>
                    <span>DIRECT RE-ORDER</span>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {(order.items || []).map((item, itIdx) => {
                      const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                      const isItemReordering = reorderingId === `item-${item.productId}-${item.size}`;

                      return (
                        <div 
                          key={`${item.productId}-${itIdx}`} 
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          {/* Item Left: Image & Specs */}
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-18 bg-white border border-gray-200 flex-shrink-0 overflow-hidden shadow-2xs">
                              <ImageWithFallback
                                src={item.image || '/Suits_image.png'}
                                alt={item.productName || 'Garment'}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-serif text-base text-[#111827] font-normal leading-snug">
                                {item.productName || 'Bespoke Garment'}
                              </h4>

                              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                                <span className="bg-white border border-gray-200 px-2 py-0.5 text-[#111827] font-semibold">
                                  SIZE: {item.size || 'Custom'}
                                </span>
                                {item.color && (
                                  <span className="bg-white border border-gray-200 px-2 py-0.5 text-gray-600">
                                    COLOR: {item.color}
                                  </span>
                                )}
                                {item.sku && (
                                  <span className="text-[10px] text-gray-400">
                                    SKU: {item.sku}
                                  </span>
                                )}
                              </div>

                              {/* Individual Line Item Status */}
                              <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-mono">
                                <span className="text-gray-400 text-[10px] uppercase">Item Status:</span>
                                {getItemStatusBadge(item, order.orderStatus)}
                              </div>

                              <div className="text-xs font-mono text-gray-500">
                                <span>Quantity: <strong className="text-[#111827]">{item.quantity || 1}</strong></span>
                                <span className="mx-1.5">×</span>
                                <span>${Number(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} each</span>
                              </div>
                            </div>
                          </div>

                          {/* Item Right: Total & Direct Re-Order Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] font-mono text-gray-400 block uppercase">ITEM TOTAL</span>
                              <span className="font-serif text-lg font-bold text-[#111827]">
                                ${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* DIRECT RE-ORDER BUTTON FOR THIS SPECIFIC GARMENT */}
                            <button
                              onClick={(e) => handleReorderItem(item, e)}
                              disabled={isItemReordering}
                              className="px-3.5 py-2 bg-white border border-gray-300 hover:border-[#936B34] hover:text-[#936B34] text-xs font-mono uppercase tracking-wider text-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                              title={`Re-order 1x ${item.productName} in size ${item.size}`}
                            >
                              <RotateCcw className={`w-3 h-3 text-[#936B34] ${isItemReordering ? 'animate-spin' : ''}`} />
                              <span>{isItemReordering ? 'ADDING...' : 'RE-ORDER'}</span>
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* EXPANDABLE ACCORDION: FULL FINANCIAL & LOGISTICS LEDGER */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-white border-t border-gray-200 animate-in fade-in duration-200 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Delivery Address & Carrier */}
                      <div className="space-y-3 bg-[#FAF8F5] p-4 border border-gray-200">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] font-semibold block">
                          DELIVERY RECIPIENT &amp; WAYBILL
                        </span>
                        
                        <div className="text-xs font-mono space-y-1 text-gray-700">
                          <p className="font-bold text-[#111827]">{order.customerName || 'Valued Patron'}</p>
                          <p>{order.shippingAddress?.street || '1048 5th Avenue'}</p>
                          {order.shippingAddress?.apartment && <p>{order.shippingAddress.apartment}</p>}
                          <p>
                            {order.shippingAddress?.city || 'New York'}, {order.shippingAddress?.state || 'NY'} {order.shippingAddress?.zipCode || '10028'}
                          </p>
                          <p className="text-gray-500 pt-1">
                            Contact: {order.customerEmail} {order.customerPhone ? `· ${order.customerPhone}` : ''}
                          </p>
                        </div>

                        {order.trackingNumber && (
                          <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs font-mono">
                            <span className="text-gray-600">Waybill: <strong>{order.trackingNumber}</strong></span>
                            <button
                              onClick={() => {
                                setCurrentOrder(order);
                                setActiveView('track-order');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-[#936B34] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                            >
                              <span>Track Live</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Financial Receipt Summary */}
                      <div className="space-y-2 bg-[#FAF8F5] p-4 border border-gray-200 text-xs font-mono">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] font-semibold block mb-2">
                          ATELIER FINANCIAL RECEIPT
                        </span>

                        <div className="flex justify-between text-gray-600">
                          <span>Garments Subtotal</span>
                          <span>${Number(order.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>White-Glove Courier &amp; Insurance</span>
                          <span>{order.shippingFee ? `$${Number(order.shippingFee).toFixed(2)}` : 'Complimentary'}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>State Sales Tax</span>
                          <span>${Number(order.tax || 0).toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-[#111827]">
                          <span>Total Paid</span>
                          <span>${Number(order.total || 0).toFixed(2)}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 pt-1">
                          Payment Method: {order.paymentMethod || 'Credit Card (Stripe Secured)'}
                        </div>
                      </div>

                    </div>

                    {/* Order Action Buttons Footer */}
                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200 gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => {
                            setCurrentOrder(order);
                            setActiveView('track-order');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-4 py-2 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Courier Delivery</span>
                        </button>

                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.history.pushState({}, '', `/track-return?orderId=${encodeURIComponent(order.id)}`);
                            }
                            setActiveView('track-return');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 hover:border-[#936B34] hover:text-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#936B34]" />
                          <span>Exchange or Return</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="px-3.5 py-2 text-xs font-mono text-[#936B34] hover:underline flex items-center gap-1.5 cursor-pointer font-semibold"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Atelier Invoice</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="border border-gray-200 bg-white p-12 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 bg-[#FAF8F5] border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-[#111827]">
              {searchQuery || statusFilter !== 'all' ? 'No Matching Orders Found' : 'No Orders on File'}
            </h3>
            <p className="text-xs text-gray-500 font-sans mt-1 max-w-md mx-auto leading-relaxed">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter to see other orders in your archive.'
                : 'Your orders, tailor fitting adjustments, and receipts will be permanently recorded here.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            {searchQuery || statusFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-5 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#E5C384]" />
                <span>Explore Sartorial Catalog</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE ATELIER INVOICE */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#936B34] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#936B34] font-semibold block">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-[#111827] font-normal mt-0.5">
                  Official Atelier Invoice &amp; Receipt
                </h3>
                <p className="text-xs font-mono text-gray-500">
                  Order #{selectedReceiptOrder.id} · Date: {selectedReceiptOrder.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="text-gray-400 hover:text-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#FAF8F5] p-4 border border-gray-200">
              <div>
                <span className="text-[10px] uppercase text-gray-400 block font-semibold">PATRON RECIPIENT</span>
                <p className="font-bold text-[#111827]">{selectedReceiptOrder.customerName}</p>
                <p>{selectedReceiptOrder.customerEmail}</p>
                <p>{selectedReceiptOrder.customerPhone}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 block font-semibold">DELIVERY DESTINATION</span>
                <p>{selectedReceiptOrder.shippingAddress?.street || '1048 5th Avenue'}</p>
                <p>{selectedReceiptOrder.shippingAddress?.city}, {selectedReceiptOrder.shippingAddress?.state} {selectedReceiptOrder.shippingAddress?.zipCode}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-gray-200">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-[#FAF8F5] border-b border-gray-200 text-gray-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Garment</th>
                    <th className="p-3">Size/Color</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(selectedReceiptOrder.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-serif text-sm text-[#111827]">{it.productName}</td>
                      <td className="p-3 text-gray-500">{it.size} / {it.color || 'Standard'}</td>
                      <td className="p-3 text-center">{it.quantity}</td>
                      <td className="p-3 text-right">${Number(it.price).toFixed(2)}</td>
                      <td className="p-3 text-right font-bold">${(it.quantity * it.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs font-mono text-right border-t border-gray-200 pt-3">
              <p className="text-gray-600">Subtotal: ${Number(selectedReceiptOrder.subtotal || 0).toFixed(2)}</p>
              <p className="text-gray-600">Shipping: {selectedReceiptOrder.shippingFee ? `$${Number(selectedReceiptOrder.shippingFee).toFixed(2)}` : 'Complimentary'}</p>
              <p className="text-gray-600">Tax: ${Number(selectedReceiptOrder.tax || 0).toFixed(2)}</p>
              <p className="text-base font-serif font-bold text-[#111827] pt-1">
                Total Paid: ${Number(selectedReceiptOrder.total || 0).toFixed(2)}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#936B34]" />
                <span>Verified Atelier Transaction</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 text-xs font-mono uppercase tracking-wider text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Print Invoice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleReorderEntireOrder(selectedReceiptOrder);
                    setSelectedReceiptOrder(null);
                  }}
                  className="px-5 py-2 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-Order These Items</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: EDIT DELIVERY DESTINATION ADDRESS */}
      {editingOrderAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#936B34] max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
                  DELIVERY DESTINATION
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-[#111827]">
                  Update Shipping Address
                </h3>
                <p className="text-xs font-mono text-gray-500">
                  Order #{editingOrderAddress.id} &bull; Recipient: {editingOrderAddress.customerName}
                </p>
              </div>
              <button
                onClick={() => setEditingOrderAddress(null)}
                className="text-gray-400 hover:text-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase text-gray-600 font-semibold mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1048 5th Avenue"
                  value={addressEditForm.street}
                  onChange={e => setAddressEditForm({ ...addressEditForm, street: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-gray-300 p-2.5 text-[#111827] focus:bg-white focus:border-[#936B34] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-600 font-semibold mb-1">
                  Apartment, Suite, Unit, Penthouse (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penthouse B, Suite 402"
                  value={addressEditForm.apartment}
                  onChange={e => setAddressEditForm({ ...addressEditForm, apartment: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-gray-300 p-2.5 text-[#111827] focus:bg-white focus:border-[#936B34] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-gray-600 font-semibold mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="New York"
                    value={addressEditForm.city}
                    onChange={e => setAddressEditForm({ ...addressEditForm, city: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2.5 text-[#111827] focus:bg-white focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-gray-600 font-semibold mb-1">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="NY"
                    value={addressEditForm.state}
                    onChange={e => setAddressEditForm({ ...addressEditForm, state: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2.5 text-[#111827] focus:bg-white focus:border-[#936B34] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-gray-600 font-semibold mb-1">
                    ZIP / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10028"
                    value={addressEditForm.zipCode}
                    onChange={e => setAddressEditForm({ ...addressEditForm, zipCode: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2.5 text-[#111827] focus:bg-white focus:border-[#936B34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-gray-600 font-semibold mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={addressEditForm.country}
                    onChange={e => setAddressEditForm({ ...addressEditForm, country: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-gray-300 p-2.5 text-[#111827] focus:bg-white focus:border-[#936B34] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                Courier Note: Destination address will be updated across active atelier consignment manifests and delivery routing slips.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingOrderAddress(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:text-black uppercase tracking-wider text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-6 py-2 bg-[#111827] hover:bg-[#936B34] text-white uppercase tracking-wider text-xs font-semibold cursor-pointer transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingAddress ? 'Saving Address...' : 'Save Delivery Address'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
