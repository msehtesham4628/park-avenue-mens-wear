import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  Scissors
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';

export const OrderTrackingPage: React.FC = () => {
  const { currentOrder, lookupOrder, setActiveView } = useShop();
  const [orderId, setOrderId] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() && !contactInfo.trim()) return;
    setIsSearching(true);
    await lookupOrder(orderId.trim() || contactInfo.trim());
    setIsSearching(false);
    setHasSearched(true);
  };

  const steps = [
    { key: 'pending', label: 'Order Received', icon: Clock },
    { key: 'processing', label: 'Atelier Tailoring & Prep', icon: Scissors },
    { key: 'shipped', label: 'In Transit with Luxury Courier', icon: Truck },
    { key: 'delivered', label: 'Delivered & Signed', icon: CheckCircle2 }
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const orderRank: Record<string, number> = {
      pending: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
      cancelled: -1
    };
    const currentRank = orderRank[currentStatus] ?? 0;
    const targetRank = orderRank[stepKey] ?? 0;

    if (currentStatus === 'cancelled') return 'cancelled';
    if (currentRank > targetRank) return 'completed';
    if (currentRank === targetRank) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] pt-10 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Exact Header Specifications */}
        <div className="py-8 text-center max-w-xl mx-auto space-y-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#936B34] block font-medium">
            PARK AVENUE MENSWEAR
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#111827] uppercase tracking-wide font-light">
            TRACK YOUR ORDER
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono leading-relaxed">
            Enter your Order ID and associated Email or Phone Number to monitor atelier handover, hand-inspection, and priority courier dispatch.
          </p>
        </div>

        {/* Dual Input Form */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16 border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-4 shadow-2xl">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-medium">
              ORDER ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. PA-ORD-8821"
              className="w-full bg-white border border-gray-200 px-4 py-3 text-sm text-[#111827] placeholder-slate-500 font-mono focus:outline-none focus:border-[#936B34]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-medium">
              EMAIL OR PHONE NUMBER
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. client@example.com or +1 (555) 234-5678"
              className="w-full bg-white border border-gray-200 px-4 py-3 text-sm text-[#111827] placeholder-slate-500 font-mono focus:outline-none focus:border-[#936B34]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-4 bg-[#936B34] hover:bg-[#7A5726] text-white font-semibold text-xs uppercase tracking-[0.25em] transition-colors disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSearching ? 'SEARCHING ARCHIVE...' : 'TRACK ORDER'}
            </button>
          </div>
        </form>

        {/* Order Details or Exact Required Empty State */}
        {currentOrder ? (
          <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-10 space-y-10 shadow-2xl">
            {/* Order Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] block mb-1 font-medium">
                  CONSIGNMENT #{currentOrder.id}
                </span>
                <h2 className="font-serif text-2xl text-[#111827] uppercase font-light">
                  Order Status: {currentOrder.status?.toUpperCase() || (currentOrder as any).orderStatus?.toUpperCase() || 'PROCESSING'}
                </h2>
              </div>
              <div className="text-right font-mono text-xs text-gray-500">
                <div>Placed: {currentOrder.createdAt ? new Date(currentOrder.createdAt).toLocaleDateString() : (currentOrder as any).date || 'Recent'}</div>
                <div className="text-[#111827] font-semibold text-sm mt-0.5">
                  Total: ${currentOrder.total?.toLocaleString() || currentOrder.subtotal?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step, idx) => {
                const stepStatus = getStepStatus(step.key, (currentOrder.status || (currentOrder as any).orderStatus || 'processing').toLowerCase());
                const Icon = step.icon;

                return (
                  <div 
                    key={step.key}
                    className={`p-4 border transition-colors ${
                      stepStatus === 'completed'
                        ? 'border-[#936B34]/60 bg-[#936B34]/15'
                        : stepStatus === 'current'
                        ? 'border-[#936B34] bg-[#F3F4F6] shadow-lg'
                        : 'border-gray-100 opacity-50 bg-white'
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

            {/* Consignment Items */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">
                GARMENTS IN THIS CONSIGNMENT
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-200 bg-white shadow-lg">
                {currentOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4">
                    <div className="w-16 h-20 shrink-0">
                      <MediaPlaceholder
                        label="PA"
                        category="SUIT"
                        aspectRatio="portrait"
                        minimal
                        className="w-full h-full p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-sm text-[#111827] uppercase font-light">
                        {item.productName || 'Park Avenue Garment'}
                      </h4>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">
                        QTY: {item.quantity} · SIZE: {item.size || 'Standard'}
                      </p>
                    </div>
                    <div className="text-right font-mono text-sm text-[#111827] font-semibold">
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier Details */}
            {currentOrder.trackingNumber && (
              <div className="p-4 bg-white border border-gray-200 flex items-center justify-between text-xs font-mono shadow-md">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#936B34]" />
                  <span className="text-gray-600">COURIER: DHL EXPRESS PRIORITY</span>
                </div>
                <span className="text-[#936B34] font-medium">TRACKING #{currentOrder.trackingNumber}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-2xl">
            <div className="w-12 h-12 mb-6 border border-[#936B34]/50 flex items-center justify-center font-serif text-base text-[#936B34] tracking-widest bg-white shadow-md">
              PA
            </div>

            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
              PARK AVENUE MENSWEAR
            </span>

            <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
              NO ORDERS FOUND
            </h3>

            <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
              {hasSearched 
                ? 'No consignment record matched the provided Order ID or contact details. Please check your purchase confirmation.' 
                : 'Enter your Order ID above or place an order via checkout to view live dispatch milestones.'}
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
