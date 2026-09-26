import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  Scissors,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { OrderService } from '../../services/api';
import { Order } from '../../types';

export const OrderTrackingPage: React.FC = () => {
  const { currentOrder, setCurrentOrder, lookupOrder, setActiveView, currentCustomer } = useShop();
  const [orderId, setOrderId] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    OrderService.getAll().then(orders => {
      if (currentCustomer) {
        const userOrders = orders.filter(o => 
          (o.customerEmail && o.customerEmail.toLowerCase() === currentCustomer.email.toLowerCase()) ||
          (o.customerName && currentCustomer.name && o.customerName.toLowerCase().includes(currentCustomer.name.toLowerCase()))
        );
        setRecentOrders(userOrders.length > 0 ? userOrders : orders.slice(0, 3));
      } else {
        setRecentOrders(orders.slice(0, 3));
      }
    });
  }, [currentCustomer]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() && !contactInfo.trim()) return;
    setIsSearching(true);
    await lookupOrder(orderId.trim() || contactInfo.trim());
    setIsSearching(false);
    setHasSearched(true);
  };

  const steps = [
    { key: 'pending', label: 'Order Confirmed', icon: Clock },
    { key: 'processing', label: 'Atelier Tailoring & Prep', icon: Scissors },
    { key: 'shipped', label: 'In Transit with Luxury Courier', icon: Truck },
    { key: 'delivered', label: 'Delivered & Signed', icon: CheckCircle2 }
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const orderRank: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      'order confirmed': 0,
      processing: 1,
      packed: 1,
      shipped: 2,
      'in transit': 2,
      'out for delivery': 2,
      out_for_delivery: 2,
      delivered: 3,
      cancelled: -1,
      canceled: -1
    };
    const norm = (currentStatus || '').toLowerCase().trim();
    const currentRank = orderRank[norm] ?? 0;
    const targetRank = orderRank[stepKey] ?? 0;

    if (currentStatus === 'cancelled') return 'cancelled';
    if (currentRank > targetRank) return 'completed';
    if (currentRank === targetRank) return 'current';
    return 'upcoming';
  };

  const displayOrder = currentOrder;

  return (
    <div className="min-h-screen bg-white text-[#111827] pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="py-6 text-center max-w-xl mx-auto space-y-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#936B34] block font-semibold">
            PARK AVENUE MENSWEAR ATELIER
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] uppercase tracking-wide font-light">
            TRACK YOUR CONSIGNMENT
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono leading-relaxed">
            Enter your Order ID (e.g. PA-ORD-88210) to monitor master tailoring, hand inspection, and priority courier handover.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1.5 font-medium">
                ORDER ID *
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. PA-ORD-88210"
                className="w-full bg-white border border-gray-300 px-4 py-3 text-sm text-[#111827] placeholder-slate-400 font-mono focus:outline-none focus:border-[#936B34]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1.5 font-medium">
                PATRON EMAIL OR PHONE
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. patron@example.com"
                className="w-full bg-white border border-gray-300 px-4 py-3 text-sm text-[#111827] placeholder-slate-400 font-mono focus:outline-none focus:border-[#936B34]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-3.5 bg-[#111827] hover:bg-[#936B34] text-white font-semibold text-xs uppercase tracking-[0.25em] transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            {isSearching ? 'LOOKING UP CONSIGNMENT...' : 'TRACK ORDER'}
          </button>
        </form>

        {/* Quick Select from Recent Orders if any */}
        {recentOrders.length > 0 && (
          <div className="max-w-2xl mx-auto mb-10 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <span className="text-gray-500 uppercase text-[10px] tracking-wider">Quick Select:</span>
            {recentOrders.map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setCurrentOrder(o);
                  setOrderId(o.id);
                  setHasSearched(true);
                }}
                className={`px-3 py-1.5 border uppercase text-[11px] transition-colors cursor-pointer ${
                  displayOrder?.id === o.id
                    ? 'border-[#936B34] bg-[#936B34] text-white font-bold'
                    : 'border-gray-200 bg-white hover:border-[#936B34] text-[#111827]'
                }`}
              >
                #{o.id} ({o.orderStatus || 'Confirmed'})
              </button>
            ))}
          </div>
        )}

        {/* Complete Order Details */}
        {displayOrder ? (
          <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-10 space-y-8 shadow-2xl">
            {/* Order Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] block mb-1 font-semibold">
                  CONSIGNMENT #{displayOrder.id}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase font-light">
                  STATUS: {displayOrder.status?.toUpperCase() || (displayOrder as any).orderStatus?.toUpperCase() || 'ORDER CONFIRMED'}
                </h2>
              </div>
              <div className="text-left sm:text-right font-mono text-xs text-gray-500">
                <div>Placed: {displayOrder.createdAt ? new Date(displayOrder.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : (displayOrder as any).date || 'Recent'}</div>
                <div className="text-[#111827] font-semibold text-base mt-0.5">
                  Total Paid: ${displayOrder.total?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || displayOrder.subtotal?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step, idx) => {
                const stepStatus = getStepStatus(step.key, (displayOrder.status || (displayOrder as any).orderStatus || 'confirmed').toLowerCase());
                const Icon = step.icon;

                return (
                  <div 
                    key={step.key}
                    className={`p-4 border transition-colors ${
                      stepStatus === 'completed'
                        ? 'border-[#936B34]/60 bg-[#936B34]/15'
                        : stepStatus === 'current'
                        ? 'border-[#936B34] bg-white shadow-md'
                        : 'border-gray-100 opacity-60 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-gray-500">0{idx + 1}</span>
                      <Icon className={`w-4 h-4 ${stepStatus === 'completed' || stepStatus === 'current' ? 'text-[#936B34]' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-xs uppercase font-serif tracking-wider text-[#111827]">
                      {step.label}
                    </div>
                    <div className="text-[10px] font-mono text-[#936B34] mt-1 uppercase font-semibold">
                      {stepStatus}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Destination & Courier Tracking Card */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Recipient & Destination */}
              <div className="p-5 bg-white border border-gray-200 text-xs font-mono space-y-2 shadow-xs">
                <div className="flex items-center gap-1.5 text-[10px] text-[#936B34] uppercase font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>SHIPPING DESTINATION</span>
                </div>
                <div className="font-semibold text-sm text-[#111827]">
                  {displayOrder.customerName || 'Valued Patron'}
                </div>
                {displayOrder.shippingAddress && (
                  <div className="text-gray-700 leading-relaxed font-sans">
                    <div>{displayOrder.shippingAddress.street} {displayOrder.shippingAddress.apartment}</div>
                    <div>{displayOrder.shippingAddress.city}, {displayOrder.shippingAddress.state} {displayOrder.shippingAddress.postalCode || displayOrder.shippingAddress.zipCode}</div>
                  </div>
                )}
                <div className="text-gray-500 text-[11px] pt-1">
                  Contact: {displayOrder.customerEmail} {displayOrder.customerPhone ? `· ${displayOrder.customerPhone}` : ''}
                </div>
              </div>

              {/* Courier & Tracking ID */}
              {(() => {
                const carrier = displayOrder.carrier || displayOrder.shipment?.carrier || (displayOrder as any)?.shippingInfo?.shippingCarrier || 'FedEx Priority';
                const trackingId = displayOrder.trackingNumber || displayOrder.shipment?.trackingId;
                const directTrackingUrl = displayOrder.trackingUrl || displayOrder.shipment?.trackingUrl || 
                  (trackingId ? (
                    carrier.toLowerCase().includes('fedex') ? `https://www.fedex.com/fedextrack/?trknbr=${trackingId}` :
                    carrier.toLowerCase().includes('ups') ? `https://www.ups.com/track?tracknum=${trackingId}` :
                    carrier.toLowerCase().includes('dhl') ? `https://www.dhl.com/en/express/tracking.html?AWB=${trackingId}` :
                    carrier.toLowerCase().includes('usps') ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingId}` :
                    undefined
                  ) : undefined);

                return (
                  <div className="p-5 bg-white border border-gray-200 text-xs font-mono space-y-2 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#936B34] uppercase font-semibold">
                      <Truck className="w-3.5 h-3.5" />
                      <span>COURIER &amp; TRACKING ID</span>
                    </div>
                    <div className="font-semibold text-sm text-[#111827]">
                      {carrier}
                    </div>

                    {trackingId ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-[11px] uppercase">Tracking Number:</span>
                          <span className="font-semibold text-[#111827] text-sm tabular-nums bg-gray-50 px-2 py-0.5 border border-gray-300">
                            {trackingId}
                          </span>
                        </div>
                        {directTrackingUrl && (
                          <a
                            href={directTrackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#936B34] text-white text-[11px] font-semibold uppercase hover:bg-[#7A5726] transition-colors"
                          >
                            <span>Live Tracking on {carrier}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                        <strong>Tracking ID Pending Dispatch:</strong> Your Tracking ID will be assigned and updated directly from the atelier dashboard by our dispatch team once your garments pass final quality inspection.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Consignment Items */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-gray-600 mb-3 font-semibold">
                GARMENTS IN THIS CONSIGNMENT ({displayOrder.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0})
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-200 bg-white shadow-xs">
                {displayOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.productName} 
                          className="w-16 h-20 object-cover border border-gray-200 shrink-0" 
                        />
                      ) : (
                        <div className="w-16 h-20 bg-gray-100 flex items-center justify-center text-xs font-serif text-[#936B34] shrink-0 border border-gray-200">
                          PA
                        </div>
                      )}
                      <div>
                        <h4 className="font-serif text-base text-[#111827] uppercase font-light">
                          {item.productName || 'Park Avenue Garment'}
                        </h4>
                        <p className="text-xs font-mono text-gray-500 mt-0.5">
                          Size: <strong>{item.size || 'Standard'}</strong> · Color: <strong>{item.color || 'Classic'}</strong> · Qty: <strong>{item.quantity}</strong>
                        </p>
                        {item.sku && (
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-mono text-sm text-[#111827] font-semibold shrink-0">
                      ${((item.price || 0) * (item.quantity || 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Financial Breakdown */}
            <div className="p-6 bg-white border border-gray-200 text-xs font-mono space-y-3 shadow-xs">
              <div className="flex justify-between text-gray-600">
                <span>GARMENT SUBTOTAL</span>
                <span className="font-semibold text-[#111827]">${displayOrder.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SHIPPING &amp; COURIER FEE ({displayOrder.shippingMethod || 'Standard Delivery'})</span>
                <span className="font-semibold text-[#111827]">${displayOrder.shippingFee?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '15.00'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>STATE SALES TAX</span>
                <span className="font-semibold text-[#111827]">${displayOrder.tax?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline text-sm">
                <span className="font-serif text-base font-semibold text-[#111827]">TOTAL AMOUNT PAID</span>
                <span className="font-serif text-xl font-bold text-[#936B34]">
                  ${displayOrder.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            {/* Alteration Notes */}
            {displayOrder.alterationNotes && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 text-xs font-mono space-y-1">
                <span className="font-semibold text-amber-900 uppercase">
                  ATELIER ALTERATION &amp; BREAK SPECIFICATIONS:
                </span>
                <p className="text-amber-950 font-sans">{displayOrder.alterationNotes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-xl">
            <div className="w-12 h-12 mb-6 border border-[#936B34]/50 flex items-center justify-center font-serif text-base text-[#936B34] tracking-widest bg-white shadow-md">
              PA
            </div>

            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
              PARK AVENUE MENSWEAR
            </span>

            <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
              NO CONSIGNMENT LOADED
            </h3>

            <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
              {hasSearched 
                ? 'No consignment record matched the provided Order ID or contact details. Please verify your Order ID.' 
                : 'Enter your Order ID above or select one of your recent consignments to view live dispatch milestones.'}
            </p>

            <button
              onClick={() => setActiveView('shop')}
              className="px-8 py-3.5 bg-[#111827] text-white font-semibold text-xs uppercase tracking-[0.2em] hover:bg-[#7A5726] transition-colors cursor-pointer shadow-md"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
